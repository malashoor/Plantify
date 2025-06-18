import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { 
  PaymentError, 
  PaymentResult, 
  PaymentMetadata,
  RetryConfig,
  ProductId,
  PaymentProduct
} from '../../types/payment';
import { validateReceipt, prepareReceiptData } from './receiptValidator';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
  maxBackoffMs: 10000
};

export class PaymentProcessor {
  private static instance: PaymentProcessor;
  private retryConfig: RetryConfig;
  private initialized: boolean = false;

  private constructor(config?: Partial<RetryConfig>) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  static getInstance(config?: Partial<RetryConfig>): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor(config);
    }
    return PaymentProcessor.instance;
  }

  async initConnection(): Promise<void> {
    if (this.initialized) return;

    try {
      await RNIap.initConnection();
      await this.handlePendingTransactions();
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize payment processor:', error);
      throw new Error('Payment initialization failed');
    }
  }

  async getProducts(productIds: string[]): Promise<PaymentProduct[]> {
    if (!this.initialized) {
      await this.initConnection();
    }

    try {
      const products = await RNIap.getProducts(productIds);
      return products.map(product => ({
        ...product,
        type: product.productId.includes('sub_') ? 'subscription' : 'inapp'
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getSubscriptions(subscriptionIds: ProductId[]): Promise<RNIap.Subscription[]> {
    try {
      return await RNIap.getSubscriptions({ skus: subscriptionIds });
    } catch (error) {
      Sentry.captureException(error, {
        extra: { context: 'get_subscriptions', subscriptionIds }
      });
      throw this.mapError(error);
    }
  }

  async purchaseProduct(
    productId: ProductId,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    return this.processPayment(async () => {
      const purchase = await RNIap.requestPurchase({
        sku: productId
      });
      return this.handlePurchaseResult(purchase as RNIap.Purchase, metadata);
    }, metadata);
  }

  async purchaseSubscription(
    subscriptionId: ProductId,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    return this.processPayment(async () => {
      const purchase = await RNIap.requestSubscription({
        sku: subscriptionId
      });
      return this.handlePurchaseResult(purchase as RNIap.Purchase, metadata);
    }, metadata);
  }

  private async handlePurchaseResult(
    purchase: RNIap.Purchase,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    try {
      // Log purchase attempt
      await analytics().logEvent('purchase_attempt', {
        productId: metadata.productId,
        platform: Platform.OS
      });

      // Validate receipt with backend
      const receiptData = prepareReceiptData(purchase, metadata);
      await validateReceipt(receiptData);

      // Finish the transaction
      if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase });
      } else {
        await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken || '' });
      }

      // Log successful purchase
      await analytics().logEvent('purchase_success', {
        productId: metadata.productId,
        platform: Platform.OS,
        transactionId: purchase.transactionId || 'unknown'
      });

      return {
        success: true,
        transactionId: purchase.transactionId || 'unknown',
        receipt: purchase.transactionReceipt || '',
        timestamp: Date.now()
      };
    } catch (error) {
      // Log purchase failure
      await analytics().logEvent('purchase_failure', {
        productId: metadata.productId,
        platform: Platform.OS,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // If validation fails, we should still finish the transaction
      // to prevent the user from being charged without receiving the product
      try {
        if (Platform.OS === 'ios') {
          await RNIap.finishTransaction({ purchase });
        } else {
          await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken || '' });
        }
      } catch (finishError) {
        Sentry.captureException(finishError, {
          extra: { context: 'finish_transaction_after_validation_error' }
        });
      }

      throw error;
    }
  }

  private async handlePendingTransactions(): Promise<void> {
    try {
      const purchases = await RNIap.getPendingPurchasesIOS();
      
      for (const purchase of purchases) {
        try {
          if (Platform.OS === 'ios') {
            await RNIap.finishTransaction({ purchase });
          } else {
            await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken || '' });
          }
        } catch (error) {
          Sentry.captureException(error, {
            extra: { context: 'handle_pending_transaction' }
          });
        }
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: { context: 'get_pending_purchases' }
      });
    }
  }

  private async processPayment(
    paymentFn: () => Promise<PaymentResult>,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    let lastError: Error | null = null;
    let attempt = 1;

    while (attempt <= this.retryConfig.maxAttempts) {
      try {
        metadata.attempt = attempt;
        metadata.timestamp = Date.now();
        return await paymentFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry user cancellations or invalid products
        if (
          error instanceof Error &&
          (error.message.includes('USER_CANCELLED') ||
           error.message.includes('ITEM_UNAVAILABLE'))
        ) {
          break;
        }

        // Calculate backoff delay
        const backoffDelay = Math.min(
          this.retryConfig.backoffMs * Math.pow(2, attempt - 1),
          this.retryConfig.maxBackoffMs
        );

        // Log retry attempt
        await analytics().logEvent('payment_retry', {
          productId: metadata.productId,
          platform: Platform.OS,
          attempt,
          error: lastError.message
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        attempt++;
      }
    }

    // If we get here, all retries failed
    const mappedError = this.mapError(lastError!);
    
    return {
      success: false,
      error: mappedError,
      timestamp: Date.now(),
      retryCount: attempt - 1
    };
  }

  private mapError(error: unknown): PaymentError {
    if (error instanceof Error) {
      // Map common error messages to error types
      if (error.message.includes('USER_CANCELLED')) {
        return {
          type: 'user_cancelled',
          code: 'E_USER_CANCELLED',
          message: 'Purchase was cancelled by the user.',
          originalError: error
        };
      }
      if (error.message.includes('ITEM_UNAVAILABLE')) {
        return {
          type: 'product_not_found',
          code: 'E_ITEM_UNAVAILABLE',
          message: 'The requested product is not available.',
          originalError: error
        };
      }
      if (error.message.includes('NETWORK_ERROR')) {
        return {
          type: 'network_error',
          code: 'E_NETWORK_ERROR',
          message: 'Network connection error. Please try again.',
          originalError: error
        };
      }
      return {
        type: 'billing_error',
        code: 'E_UNKNOWN',
        message: error.message || 'An error occurred with the payment system.',
        originalError: error
      };
    }

    return {
      type: 'unknown_error',
      code: 'E_UNKNOWN',
      message: 'An unexpected error occurred.',
      originalError: error
    };
  }

  async endConnection(): Promise<void> {
    if (this.initialized) {
      await RNIap.endConnection();
      this.initialized = false;
    }
  }
}

// Helper function to create payment metadata
export const createPaymentMetadata = (
  userId: string,
  productId: string,
  amount: number,
  currency: string
): PaymentMetadata => ({
  userId,
  productId,
  amount,
  currency,
  platform: Platform.OS as 'ios' | 'android',
  attempt: 1
});

export const paymentProcessor = new PaymentProcessor(); 