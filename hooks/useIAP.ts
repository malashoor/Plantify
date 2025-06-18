import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { PaymentProcessor } from '../services/PaymentProcessor';
import { IAPState, IAPProduct, IAPError, IAPPurchaseResult } from '../types/iap';
import { Purchase } from 'react-native-iap';

const PRODUCT_IDS =
  Platform.select({
    ios: ['com.greensai.premium'],
    android: ['com.greensai.premium'],
  }) || [];

const initialState: IAPState = {
  products: [],
  purchases: [],
  loading: false,
  error: null,
};

export function useIAP() {
  const [state, setState] = useState<IAPState>(initialState);
  const [processor, setProcessor] = useState<PaymentProcessor | null>(null);

  useEffect(() => {
    const initializeProcessor = async () => {
      const newProcessor = new PaymentProcessor({
        productIds: PRODUCT_IDS,
        onPurchaseComplete: purchase => {
          setState(prev => ({
            ...prev,
            purchases: [...prev.purchases, purchase],
            loading: false,
            error: null,
          }));
        },
        onPurchaseError: error => {
          setState(prev => ({
            ...prev,
            loading: false,
            error,
          }));
        },
        onRestoreComplete: purchases => {
          setState(prev => ({
            ...prev,
            purchases,
            loading: false,
            error: null,
          }));
        },
        onRestoreError: error => {
          setState(prev => ({
            ...prev,
            loading: false,
            error,
          }));
        },
      });

      try {
        await newProcessor.initialize();
        setProcessor(newProcessor);

        const products = await newProcessor.getAvailableProducts();
        setState(prev => ({
          ...prev,
          products,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as IAPError,
        }));
      }
    };

    initializeProcessor();

    return () => {
      setProcessor(null);
      setState(initialState);
    };
  }, []);

  const purchaseProduct = useCallback(
    async (productId: string): Promise<IAPPurchaseResult> => {
      if (!processor) throw new Error('IAP not initialized');

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const purchase = await processor.purchaseProduct(productId);
        if (!purchase.transactionId) {
          throw new Error('Invalid purchase: missing transaction ID');
        }
        return {
          transactionId: purchase.transactionId,
          productId: purchase.productId,
          transactionDate: purchase.transactionDate,
        };
      } catch (error) {
        throw error as IAPError;
      }
    },
    [processor]
  );

  const restorePurchases = useCallback(async (): Promise<Purchase[]> => {
    if (!processor) throw new Error('IAP not initialized');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      return await processor.restorePurchases();
    } catch (error) {
      throw error as IAPError;
    }
  }, [processor]);

  const isPremium = state.purchases.some(purchase => PRODUCT_IDS.includes(purchase.productId));

  return {
    ...state,
    purchaseProduct,
    restorePurchases,
    isPremium,
  };
}
