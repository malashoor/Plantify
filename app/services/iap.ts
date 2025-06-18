import {
  Platform,
  initConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ProductPurchase,
  PurchaseError,
  finishTransaction,
  validateReceiptIos,
  validateReceiptAndroid,
  getAvailablePurchases,
  SubscriptionPurchase,
  Purchase,
} from 'react-native-iap';
import { Alert } from 'react-native';

// Your backend validation server URL
const VALIDATION_SERVER_URL = 'https://your-server.vercel.app';

// Product IDs for both platforms
export const PRODUCT_IDS = {
  ios: {
    premium: 'com.yourapp.premium',
    subscription: 'com.yourapp.subscription'
  },
  android: {
    premium: 'com.yourapp.premium',
    subscription: 'com.yourapp.subscription'
  }
} as const;

class IAPService {
  private purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
  private purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;
  private userId: string | null = null;

  constructor() {
    this.setupIAP();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async setupIAP() {
    try {
      await initConnection();
      
      // Listen to purchase updates
      this.purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: ProductPurchase) => {
          if (purchase.transactionReceipt) {
            // Validate the purchase
            await this.validatePurchase(purchase);
            // Finish the transaction
            await finishTransaction({ purchase });
          }
        }
      );

      // Listen to purchase errors
      this.purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          console.error('Purchase error:', error);
          Alert.alert('Purchase Error', 'There was an error processing your purchase. Please try again.');
        }
      );

    } catch (err) {
      console.error('Error setting up IAP:', err);
      Alert.alert('Error', 'Failed to initialize in-app purchases. Please try again later.');
    }
  }

  async getAvailableProducts() {
    try {
      const productIds = Platform.select({
        ios: [PRODUCT_IDS.ios.premium, PRODUCT_IDS.ios.subscription],
        android: [PRODUCT_IDS.android.premium, PRODUCT_IDS.android.subscription],
        default: [PRODUCT_IDS.ios.premium, PRODUCT_IDS.ios.subscription], // Default to iOS
      });

      const products = await getProducts({ skus: productIds });
      return products;

    } catch (err) {
      console.error('Error getting products:', err);
      throw err;
    }
  }

  async purchaseProduct(productId: string) {
    try {
      const purchase = await requestPurchase({ sku: productId });
      return purchase;
    } catch (err) {
      console.error('Error purchasing product:', err);
      throw err;
    }
  }

  private async validatePurchase(purchase: ProductPurchase) {
    try {
      let validationData;

      if (Platform.OS === 'ios') {
        // For iOS, get the receipt data
        const receipt = await validateReceiptIos({
          receiptBody: {
            'receipt-data': purchase.transactionReceipt || '',
            'password': '', // Your shared secret will be added on the server
          },
        });
        
        validationData = {
          platform: 'ios',
          receipt: purchase.transactionReceipt || '',
          productId: purchase.productId,
          userId: this.userId
        };

      } else {
        // For Android, validate the purchase token
        const receipt = await validateReceiptAndroid({
          packageName: purchase.packageNameAndroid || '',
          productId: purchase.productId,
          productToken: purchase.purchaseToken || '',
          accessToken: purchase.signatureAndroid || '',
        });

        validationData = {
          platform: 'android',
          receipt: purchase.purchaseToken || '',
          productId: purchase.productId,
          signature: purchase.signatureAndroid || '',
          userId: this.userId
        };
      }

      // Send to your validation server
      const response = await fetch(`${VALIDATION_SERVER_URL}/api/validate-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationData),
      });

      const result = await response.json();

      if (!result.valid) {
        throw new Error(result.error || 'Purchase validation failed');
      }

      return result;

    } catch (err) {
      console.error('Error validating purchase:', err);
      throw err;
    }
  }

  async checkSubscriptionStatus() {
    try {
      const purchases = await getAvailablePurchases();
      
      // Filter for active subscriptions
      const subscriptions = purchases.filter((purchase: Purchase) => {
        const subscription = purchase as SubscriptionPurchase;
        
        // For iOS
        if (Platform.OS === 'ios') {
          return subscription.originalTransactionDateIOS && 
                 new Date(subscription.originalTransactionDateIOS).getTime() > Date.now();
        }
        
        // For Android
        if (Platform.OS === 'android') {
          return subscription.autoRenewingAndroid || false;
        }
        
        return false;
      });

      return subscriptions.length > 0;

    } catch (err) {
      console.error('Error checking subscription status:', err);
      throw err;
    }
  }

  cleanup() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }
}

export const iapService = new IAPService(); 