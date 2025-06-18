declare module 'react-native-iap' {
  export interface Product {
    productId: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    localizedPrice: string;
    introductoryPrice?: string;
    introductoryPricePaymentModeIOS?: string;
    introductoryPriceNumberOfPeriodsIOS?: number;
    introductoryPriceSubscriptionPeriodIOS?: string;
    subscriptionPeriodNumberIOS?: number;
    subscriptionPeriodUnitIOS?: string;
    introductoryPriceAsAmountIOS?: string;
    introductoryPricePaymentModeAndroid?: string;
    introductoryPriceNumberOfPeriodsAndroid?: number;
    introductoryPriceSubscriptionPeriodAndroid?: string;
    subscriptionPeriodAndroid?: string;
    freeTrialPeriodAndroid?: string;
  }

  export interface Purchase {
    productId: string;
    transactionId?: string;
    transactionDate: number;
    transactionReceipt: string;
    purchaseToken?: string;
    dataAndroid?: string;
    signatureAndroid?: string;
    autoRenewingAndroid?: boolean;
    packageNameAndroid?: string;
    purchaseStateAndroid?: number;
    isAcknowledgedAndroid?: boolean;
    originalTransactionDateIOS?: string;
    originalTransactionIdentifierIOS?: string;
  }

  export interface PurchaseError {
    code: string;
    message: string;
    debugMessage?: string;
    stack?: string;
  }

  export interface SubscriptionPurchase extends Purchase {
    autoRenewingAndroid: boolean;
    originalTransactionDateIOS: string;
    originalTransactionIdentifierIOS: string;
  }

  export interface ProductPurchase extends Purchase {
    type: 'iap' | 'subs';
  }

  export type ProductType = 'iap' | 'subs';

  export interface GetProductsOptions {
    skus: string[];
  }

  export interface RequestPurchaseOptions {
    sku: string;
    andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
  }

  export interface FinishTransactionOptions {
    purchase: Purchase;
    isConsumable?: boolean;
    developerPayloadAndroid?: string;
  }

  export function initConnection(): Promise<void>;
  export function endConnection(): Promise<void>;
  export function getProducts(options: GetProductsOptions): Promise<Product[]>;
  export function requestPurchase(options: RequestPurchaseOptions): Promise<Purchase>;
  export function finishTransaction(options: FinishTransactionOptions): Promise<void>;
  export function getAvailablePurchases(): Promise<Purchase[]>;
  export function getPendingPurchasesIOS(): Promise<Purchase[]>;
  export function acknowledgePurchaseAndroid(options: { token: string }): Promise<void>;
  export function consumePurchaseAndroid(options: { token: string }): Promise<void>;
  export function validateReceiptIos(options: {
    receiptBody: { 'receipt-data': string; password?: string };
  }): Promise<any>;
  export function validateReceiptAndroid(options: {
    packageName: string;
    productId: string;
    productToken: string;
    accessToken: string;
  }): Promise<any>;
  export function clearTransactionIOS(): Promise<void>;
  export function clearProductsIOS(): Promise<void>;
  export function flushFailedPurchasesCachedAsPendingAndroid(): Promise<void>;

  export function purchaseUpdatedListener(listener: (purchase: ProductPurchase) => void): {
    remove: () => void;
  };

  export function purchaseErrorListener(listener: (error: PurchaseError) => void): {
    remove: () => void;
  };
}
