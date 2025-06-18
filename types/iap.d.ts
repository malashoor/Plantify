import { Purchase, SubscriptionPurchase, ProductPurchase } from 'react-native-iap';

export type IAPProduct = {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
};

export type IAPPurchaseResult = {
  transactionId: string;
  productId: string;
  transactionDate: number;
};

export type IAPError = {
  code: string;
  message: string;
  details?: any;
};

export type IAPState = {
  products: IAPProduct[];
  purchases: Purchase[];
  loading: boolean;
  error: IAPError | null;
};

export type IAPContextType = {
  state: IAPState;
  initializeIAP: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<IAPPurchaseResult>;
  restorePurchases: () => Promise<Purchase[]>;
  isPremium: boolean;
};

export type PaymentProcessorConfig = {
  productIds: string[];
  onPurchaseComplete?: (purchase: Purchase) => void;
  onPurchaseError?: (error: IAPError) => void;
  onRestoreComplete?: (purchases: Purchase[]) => void;
  onRestoreError?: (error: IAPError) => void;
};
