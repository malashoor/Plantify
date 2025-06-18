import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { PaymentError, PaymentMetadata } from '../types/payment';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

// Error type mapping
const ERROR_TYPES = {
  NETWORK: 'network_error',
  BILLING: 'billing_error',
  USER_CANCELLED: 'user_cancelled',
  PRODUCT_NOT_FOUND: 'product_not_found',
  RECEIPT_VALIDATION: 'receipt_validation_error',
  UNKNOWN: 'unknown_error'
} as const;

// Error codes mapping
const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'E_NETWORK_ERROR',
  TIMEOUT: 'E_TIMEOUT',
  
  // Billing errors
  BILLING_UNAVAILABLE: 'E_BILLING_UNAVAILABLE',
  DEVELOPER_ERROR: 'E_DEVELOPER_ERROR',
  ITEM_UNAVAILABLE: 'E_ITEM_UNAVAILABLE',
  ITEM_ALREADY_OWNED: 'E_ITEM_ALREADY_OWNED',
  
  // User actions
  USER_CANCELLED: 'E_USER_CANCELLED',
  DEFERRED_PAYMENT: 'E_DEFERRED',
  
  // Product errors
  PRODUCT_NOT_FOUND: 'E_PRODUCT_NOT_FOUND',
  
  // Receipt validation
  RECEIPT_INVALID: 'E_RECEIPT_INVALID',
  RECEIPT_REQUEST_FAILED: 'E_RECEIPT_REQUEST_FAILED',
  
  // Unknown
  UNKNOWN: 'E_UNKNOWN'
} as const;

const DEFAULT_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection error. Please check your internet connection and try again.',
  [ERROR_TYPES.BILLING]: 'There was an error with your subscription. Please contact support.',
  [ERROR_TYPES.USER_CANCELLED]: 'Purchase was cancelled.',
  [ERROR_TYPES.PRODUCT_NOT_FOUND]: 'This item is no longer available for purchase.',
  [ERROR_TYPES.RECEIPT_VALIDATION]: 'Failed to validate purchase receipt.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

export function mapPlatformError(error: any): PaymentError {
  // Handle react-native-iap specific errors
  if (error instanceof RNIap.IAPError) {
    return mapIAPError(error);
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
    return {
      type: ERROR_TYPES.NETWORK,
      code: error.name === 'TimeoutError' ? ERROR_CODES.TIMEOUT : ERROR_CODES.NETWORK_ERROR,
      message: DEFAULT_MESSAGES[ERROR_TYPES.NETWORK],
      originalError: error
    };
  }

  // Handle receipt validation errors
  if (error.name === 'ReceiptValidationError') {
    return {
      type: ERROR_TYPES.RECEIPT_VALIDATION,
      code: ERROR_CODES.RECEIPT_INVALID,
      message: error.message || DEFAULT_MESSAGES[ERROR_TYPES.RECEIPT_VALIDATION],
      originalError: error
    };
  }

  // Default unknown error
  return {
    type: ERROR_TYPES.UNKNOWN,
    code: ERROR_CODES.UNKNOWN,
    message: DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN],
    originalError: error
  };
}

function mapIAPError(error: RNIap.IAPError): PaymentError {
  switch (error.code) {
    case RNIap.IAPErrorCode.E_USER_CANCELLED:
      return {
        type: ERROR_TYPES.USER_CANCELLED,
        code: ERROR_CODES.USER_CANCELLED,
        message: DEFAULT_MESSAGES[ERROR_TYPES.USER_CANCELLED],
        originalError: error
      };

    case RNIap.IAPErrorCode.E_ITEM_UNAVAILABLE:
      return {
        type: ERROR_TYPES.BILLING,
        code: ERROR_CODES.ITEM_UNAVAILABLE,
        message: DEFAULT_MESSAGES[ERROR_TYPES.BILLING],
        originalError: error
      };

    case RNIap.IAPErrorCode.E_ALREADY_OWNED:
      return {
        type: ERROR_TYPES.BILLING,
        code: ERROR_CODES.ITEM_ALREADY_OWNED,
        message: 'You already own this item.',
        originalError: error
      };

    case RNIap.IAPErrorCode.E_NETWORK_ERROR:
      return {
        type: ERROR_TYPES.NETWORK,
        code: ERROR_CODES.NETWORK_ERROR,
        message: DEFAULT_MESSAGES[ERROR_TYPES.NETWORK],
        originalError: error
      };

    case RNIap.IAPErrorCode.E_DEVELOPER_ERROR:
      return {
        type: ERROR_TYPES.BILLING,
        code: ERROR_CODES.DEVELOPER_ERROR,
        message: 'An internal error occurred. Please try again later.',
        originalError: error
      };

    case RNIap.IAPErrorCode.E_BILLING_RESPONSE_JSON_PARSE_ERROR:
    case RNIap.IAPErrorCode.E_UNKNOWN:
    default:
      return {
        type: ERROR_TYPES.UNKNOWN,
        code: ERROR_CODES.UNKNOWN,
        message: DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN],
        originalError: error
      };
  }
}

export function shouldRetryPayment(
  error: PaymentError,
  attempt: number,
  maxAttempts: number
): boolean {
  // Don't retry if we've hit the max attempts
  if (attempt >= maxAttempts) {
    return false;
  }

  // Don't retry user cancellations
  if (error.type === ERROR_TYPES.USER_CANCELLED) {
    return false;
  }

  // Don't retry if the item is unavailable or already owned
  if (error.code === ERROR_CODES.ITEM_UNAVAILABLE ||
      error.code === ERROR_CODES.ITEM_ALREADY_OWNED) {
    return false;
  }

  // Retry network errors and unknown errors
  return error.type === ERROR_TYPES.NETWORK ||
         error.type === ERROR_TYPES.UNKNOWN;
}

export function getBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
}

export async function logPaymentError(
  error: PaymentError,
  metadata: PaymentMetadata
): Promise<void> {
  console.error('Payment Error:', {
    type: error.type,
    code: error.code,
    message: error.message,
    platform: Platform.OS,
    ...metadata,
    timestamp: new Date().toISOString()
  });

  // Log to analytics
  await analytics().logEvent('payment_error', {
    error_type: error.type,
    error_code: error.code,
    product_id: metadata.productId,
    platform: metadata.platform,
    attempt: metadata.attempt
  });

  // Log to error reporting
  Sentry.captureException(error.originalError || error, {
    extra: {
      ...metadata,
      errorType: error.type,
      errorCode: error.code
    }
  });
} 