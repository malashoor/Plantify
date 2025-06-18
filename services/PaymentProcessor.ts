import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  type Purchase,
  type ProductPurchase,
  type SubscriptionPurchase,
  type GetProductsOptions,
  type RequestPurchaseOptions,
} from 'react-native-iap';
import { Platform } from 'react-native';
import { IAPError, PaymentProcessorConfig } from '../types/iap';

export class PaymentProcessor {
  private config: PaymentProcessorConfig;
  private isInitialized = false;

  constructor(config: PaymentProcessorConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      await initConnection();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw this.formatError(error);
    }
  }

  async getAvailableProducts() {
    try {
      await this.ensureInitialized();
      const products = await getProducts({
        skus: this.config.productIds,
      });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw this.formatError(error);
    }
  }

  async purchaseProduct(productId: string): Promise<Purchase> {
    try {
      await this.ensureInitialized();

      const purchase = await requestPurchase({
        sku: productId,
      });
      await finishTransaction({ purchase });

      if (this.config.onPurchaseComplete) {
        this.config.onPurchaseComplete(purchase);
      }

      return purchase;
    } catch (error) {
      console.error('Purchase failed:', error);
      if (this.config.onPurchaseError) {
        this.config.onPurchaseError(this.formatError(error));
      }
      throw this.formatError(error);
    }
  }

  async restorePurchases(): Promise<Purchase[]> {
    try {
      await this.ensureInitialized();

      const purchases = await getAvailablePurchases();

      if (this.config.onRestoreComplete) {
        this.config.onRestoreComplete(purchases);
      }

      return purchases;
    } catch (error) {
      console.error('Restore failed:', error);
      if (this.config.onRestoreError) {
        this.config.onRestoreError(this.formatError(error));
      }
      throw this.formatError(error);
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private formatError(error: any): IAPError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
    };
  }
}
