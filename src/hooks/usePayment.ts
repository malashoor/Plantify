import { useEffect, useState, useCallback } from 'react';
import { paymentProcessor } from '../services/payment/processor';
import type { PaymentProduct, PaymentResult, PaymentError } from '../types/payment';

interface UsePaymentReturn {
  loading: boolean;
  products: PaymentProduct[];
  error: PaymentError | null;
  loadProducts: (ids: string[]) => Promise<void>;
  purchase: (productId: string) => Promise<PaymentResult>;
  resetError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [error, setError] = useState<PaymentError | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await paymentProcessor.initConnection();
      } catch (err) {
        setError(err as PaymentError);
      }
    })();

    return () => {
      paymentProcessor.endConnection();
    };
  }, []);

  const loadProducts = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentProcessor.getProducts(ids);
      setProducts(result);
    } catch (err) {
      setError(err as PaymentError);
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const purchase = useCallback(async (productId: string): Promise<PaymentResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await paymentProcessor.requestPurchase(productId);
      if (!result.success) {
        setError(result.error || null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    products,
    error,
    loadProducts,
    purchase,
    resetError,
  };
}; 