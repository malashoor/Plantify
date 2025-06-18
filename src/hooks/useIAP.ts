import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { PaymentProcessor } from '../services/payment/processor';
import { PaymentError, PaymentProduct, ProductId } from '../types/payment';

// Product IDs for both platforms
export const PRODUCT_IDS = {
  ios: {
    premiumMonthly: 'com.greensai.premium.monthly' as ProductId,
    premiumYearly: 'com.greensai.premium.yearly' as ProductId,
  },
  android: {
    premiumMonthly: 'com.greensai.premium.monthly' as ProductId,
    premiumYearly: 'com.greensai.premium.yearly' as ProductId,
  },
} as const;

export function useIAP() {
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const processor = PaymentProcessor.getInstance();

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        await processor.initConnection();

        const productIds = Platform.select({
          ios: [PRODUCT_IDS.ios.premiumMonthly, PRODUCT_IDS.ios.premiumYearly],
          android: [PRODUCT_IDS.android.premiumMonthly, PRODUCT_IDS.android.premiumYearly],
          default: [],
        }) as ProductId[];

        const products = await RNIap.getProducts({ skus: productIds });
        setProducts(products as PaymentProduct[]);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize in-app purchases';
        setError(errorMessage);
        console.error('IAP initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeIAP();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  const purchaseProduct = useCallback(async (productId: ProductId) => {
    try {
      setError(null);
      const result = await processor.purchaseProduct(productId, {
        userId: 'user_id', // Replace with actual user ID from auth context
        productId,
        platform: Platform.OS,
      });
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete purchase';
      setError(errorMessage);
      console.error('IAP purchase error:', err);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      setError(null);
      const purchases = await RNIap.getAvailablePurchases();
      return purchases.length > 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore purchases';
      setError(errorMessage);
      console.error('IAP restore error:', err);
      return false;
    }
  }, []);

  return {
    products,
    loading,
    error,
    purchaseProduct,
    restorePurchases,
  };
}
