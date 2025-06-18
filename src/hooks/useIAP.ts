import { useState, useEffect, useCallback } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Product IDs must match exactly in both App Store and Play Store
export const PRODUCT_IDS = {
  premiumMonthly: 'premium_monthly_subscription',
  premiumYearly: 'premium_yearly_subscription',
} as const;

export type ProductId = keyof typeof PRODUCT_IDS;

interface IAPProduct {
  productId: string;
  price: string;
  title: string;
  description: string;
}

interface UseIAPReturn {
  products: IAPProduct[];
  loading: boolean;
  error: string | null;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export function useIAP(): UseIAPReturn {
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize IAP connection
  useEffect(() => {
    const initializeIAP = async () => {
      try {
        await InAppPurchases.connectAsync();
        
        // Get product details
        const { responseCode, results } = await InAppPurchases.getProductsAsync([
          PRODUCT_IDS.premiumMonthly,
          PRODUCT_IDS.premiumYearly,
        ]);

        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setProducts(results);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        console.error('Failed to initialize IAP:', err);
        setError('Failed to initialize in-app purchases');
      } finally {
        setLoading(false);
      }
    };

    initializeIAP();

    // Set up purchase listener
    const subscription = InAppPurchases.setPurchaseListener(
      async ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          // Handle successful purchase
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              // Acknowledge the purchase
              await InAppPurchases.finishTransactionAsync(purchase, true);

              // Update Supabase with premium status
              try {
                const userId = supabase.auth.session()?.user?.id;
                if (!userId) throw new Error('User not authenticated');

                const expiryDate = new Date();
                // Set expiry based on product (1 month or 1 year)
                expiryDate.setMonth(
                  expiryDate.getMonth() + 
                  (purchase.productId === PRODUCT_IDS.premiumYearly ? 12 : 1)
                );

                const { error: dbError } = await supabase
                  .from('user_promotions')
                  .insert([
                    {
                      user_id: userId,
                      code: `iap_${purchase.productId}`,
                      is_active: true,
                      expires_at: expiryDate.toISOString(),
                    },
                  ]);

                if (dbError) throw dbError;
              } catch (error) {
                console.error('Failed to update premium status:', error);
                setError('Purchase successful but failed to activate premium');
              }
            }
          }
        } else if (errorCode) {
          setError(`Purchase failed: ${errorCode}`);
        }
      }
    );

    return () => {
      subscription.remove();
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      setError(null);
      const { responseCode, results } = await InAppPurchases.purchaseItemAsync(productId);
      return responseCode === InAppPurchases.IAPResponseCode.OK;
    } catch (err) {
      console.error('Purchase failed:', err);
      setError('Failed to complete purchase');
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
        // Handle restored purchases similar to new purchases
        const userId = supabase.auth.session()?.user?.id;
        if (!userId) throw new Error('User not authenticated');

        const latestPurchase = results[0];
        const expiryDate = new Date();
        expiryDate.setMonth(
          expiryDate.getMonth() + 
          (latestPurchase.productId === PRODUCT_IDS.premiumYearly ? 12 : 1)
        );

        const { error: dbError } = await supabase
          .from('user_promotions')
          .insert([
            {
              user_id: userId,
              code: `iap_restored_${latestPurchase.productId}`,
              is_active: true,
              expires_at: expiryDate.toISOString(),
            },
          ]);

        if (dbError) throw dbError;
        return true;
      }
      return false;
    } catch (err) {
      console.error('Restore failed:', err);
      setError('Failed to restore purchases');
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