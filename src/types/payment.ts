import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import type {
  ProductPurchase,
  SubscriptionPurchase,
  Product,
  ProductType,
  PurchaseError,
} from 'react-native-iap';

export type PaymentErrorType =
  | 'network_error'
  | 'billing_error'
  | 'user_cancelled'
  | 'product_not_found'
  | 'receipt_validation_error'
  | 'unknown_error';

export interface PaymentError {
  type: PaymentErrorType;
  code: string;
  message: string;
  originalError?: any;
}

export interface PaymentMetadata {
  userId: string;
  productId: string;
  platform: typeof Platform.OS;
  attempt?: number;
  timestamp?: number;
}

export type PurchaseType = ProductType;

export interface PaymentResult {
  success: boolean;
  message?: string;
  purchase?: ProductPurchase | SubscriptionPurchase;
  error?: PurchaseError;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
}

export interface ReceiptValidationResult {
  isValid: boolean;
  transactionId?: string;
  purchaseDate?: string;
  expiryDate?: string;
  error?: string;
}

export interface IAPProduct extends RNIap.Product {
  productType: 'subscription' | 'consumable' | 'non_consumable';
}

export const PRODUCT_IDS = {
  premiumMonthly: 'premium_monthly_subscription',
  premiumYearly: 'premium_yearly_subscription',
  proAccess: 'pro_access_lifetime',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

export interface PaymentHookOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: PaymentError) => void;
  showErrorDialog?: boolean;
  autoInit?: boolean;
}

export interface PaymentHookReturn {
  products: IAPProduct[];
  subscriptions: IAPProduct[];
  loading: boolean;
  processing: boolean;
  error: PaymentError | null;
  purchaseProduct: (productId: string) => Promise<PaymentResult>;
  purchaseSubscription: (subscriptionId: string) => Promise<PaymentResult>;
  restorePurchases: () => Promise<void>;
  resetError: () => void;
}

export interface PaymentProduct extends Product {
  type: PurchaseType;
}

export interface PaymentState {
  loading: boolean;
  products: PaymentProduct[];
  error: PaymentError | null;
}
