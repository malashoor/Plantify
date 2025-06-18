import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';
import { ReceiptValidationResult, PaymentMetadata } from '../../types/payment';

// In a real app, this would come from environment variables
const API_BASE_URL = 'https://api.plantai.app';

interface ReceiptValidationRequest {
  platform: typeof Platform.OS;
  receipt: string;
  productId: string;
  userId: string;
  // Google-specific fields
  packageName?: string;
  purchaseToken?: string;
  // Apple-specific fields
  transactionId?: string;
  originalTransactionId?: string;
}

export class ReceiptValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ReceiptValidationError';
  }
}

export async function validateReceipt(
  request: ReceiptValidationRequest
): Promise<ReceiptValidationResult> {
  try {
    // Log validation attempt
    await analytics().logEvent('receipt_validation_attempt', {
      platform: request.platform,
      productId: request.productId
    });

    const response = await fetch(`${API_BASE_URL}/validate-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...request,
        // Add additional platform-specific data
        ...(Platform.OS === 'android' ? {
          packageName: request.packageName,
          purchaseToken: request.purchaseToken
        } : {
          transactionId: request.transactionId,
          originalTransactionId: request.originalTransactionId
        })
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ReceiptValidationError(
        error.message || 'Receipt validation failed',
        error.code || 'VALIDATION_FAILED'
      );
    }

    const result = await response.json();
    
    if (!result.isValid) {
      // Log validation failure
      await analytics().logEvent('receipt_validation_failed', {
        platform: request.platform,
        productId: request.productId,
        error: result.error
      });

      throw new ReceiptValidationError(
        result.error || 'Invalid receipt',
        'INVALID_RECEIPT'
      );
    }

    // Log successful validation
    await analytics().logEvent('receipt_validation_success', {
      platform: request.platform,
      productId: request.productId
    });

    return result;
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error, {
      extra: {
        platform: request.platform,
        productId: request.productId,
        userId: request.userId
      }
    });

    if (error instanceof ReceiptValidationError) {
      throw error;
    }
    
    throw new ReceiptValidationError(
      'Failed to validate receipt with server',
      'SERVER_ERROR'
    );
  }
}

// Helper function to prepare receipt data based on platform
export function prepareReceiptData(
  purchase: any,
  metadata: PaymentMetadata
): ReceiptValidationRequest {
  const baseData = {
    platform: Platform.OS,
    receipt: purchase.transactionReceipt,
    productId: metadata.productId,
    userId: metadata.userId
  };

  if (Platform.OS === 'android') {
    return {
      ...baseData,
      packageName: purchase.packageNameAndroid,
      purchaseToken: purchase.purchaseToken
    };
  }

  return {
    ...baseData,
    transactionId: purchase.transactionId,
    originalTransactionId: purchase.originalTransactionIdentifierIOS
  };
} 