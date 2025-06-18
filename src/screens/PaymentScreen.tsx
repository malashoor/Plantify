import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Text, Button } from '@components/themed';
import { usePayment } from '@hooks/usePayment';
import { IAPProduct, PRODUCT_IDS } from '@/types/payment';
import { useAuth } from '@hooks/useAuth';
import { formatCurrency } from '@utils/currency';

type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export default function PaymentScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [selectedProduct, setSelectedProduct] = useState<IAPProduct | null>(null);
  
  const {
    products,
    subscriptions,
    loading,
    processing,
    error,
    purchaseProduct,
    purchaseSubscription,
    restorePurchases,
    resetError,
    loadProducts,
    purchase
  } = usePayment({
    autoInit: true,
    showErrorDialog: true,
    onSuccess: () => {
      setStatus('success');
      Alert.alert(
        'Purchase Successful',
        'Thank you for your purchase! Your premium features are now available.'
      );
    },
    onError: () => setStatus('error')
  });

  useEffect(() => {
    setStatus(loading ? 'loading' : 'idle');
  }, [loading]);

  useEffect(() => {
    setStatus(processing ? 'processing' : 'idle');
  }, [processing]);

  useEffect(() => {
    if (error) {
      setStatus('error');
      Alert.alert(
        'Purchase Failed',
        error.message,
        [
          { text: 'Try Again', onPress: resetError },
          { text: 'Cancel', onPress: () => {} }
        ]
      );
    }
  }, [error, resetError]);

  useEffect(() => {
    loadProducts(['one_time_product_id', 'subscription_id']);
  }, []);

  const handlePurchase = async (productId: string) => {
    const result = await purchase(productId);
    if (result.success) {
      alert('Purchase successful!');
    } else {
      alert('Purchase failed: ' + result.message);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      Alert.alert('Please sign in to restore purchases');
      return;
    }

    setStatus('processing');
    try {
      await restorePurchases();
    } catch (err) {
      setStatus('error');
    }
  };

  const renderProduct = (product: IAPProduct) => (
    <View key={product.productId} style={styles.productCard}>
      <Text style={styles.productTitle}>{product.title}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      <Text style={styles.productPrice}>
        {formatCurrency(product.price, product.currency)}
      </Text>
      <View style={styles.purchaseButton}>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => handlePurchase(product.productId)}
        >
          <Text style={styles.purchaseButtonText}>Purchase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Available Products</Text>
        
        {/* One-time purchases */}
        {products.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>One-Time Purchase</Text>
            {products.map(product => renderProduct(product))}
          </>
        )}

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Subscriptions</Text>
            {subscriptions.map(product => renderProduct(product))}
          </>
        )}

        {/* Restore purchases button */}
        <View style={styles.restoreButton}>
          <Button onPress={handleRestore} disabled={status === 'processing'}>
            {status === 'processing' ? 'Processing...' : 'Restore Purchases'}
          </Button>
        </View>

        {/* Error state */}
        {status === 'error' && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error.message}
            </Text>
            <Button onPress={resetError}>
              Try Again
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  purchaseButton: {
    marginTop: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    marginTop: 24,
  },
  errorContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    marginBottom: 12,
  },
}); 