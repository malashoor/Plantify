import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { usePayment } from '../hooks/usePayment';
import { formatCurrency } from '../utils/currency';

interface OneTimePurchaseScreenProps {
  productId: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const OneTimePurchaseScreen: React.FC<OneTimePurchaseScreenProps> = ({
  productId,
  title,
  description,
  imageUrl,
}) => {
  const { products, loading, processing, purchaseProduct } = usePayment({
    autoInit: true,
    showErrorDialog: true,
    onSuccess: result => {
      Alert.alert('Success!', 'Thank you for your purchase!', [{ text: 'OK' }]);
    },
  });

  const product = products.find(p => p.productId === productId);

  const handlePurchase = useCallback(async () => {
    if (product) {
      await purchaseProduct(product.productId);
    }
  }, [product, purchaseProduct]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(product.price, product.currency)}</Text>
          <Text style={styles.priceSubtext}>One-time purchase</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included</Text>
          <View style={styles.featuresList}>
            <FeatureItem text="Lifetime access" />
            <FeatureItem text="High-resolution images" />
            <FeatureItem text="Detailed analysis" />
            <FeatureItem text="Export functionality" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, processing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={processing}
        >
          <Text style={styles.purchaseButtonText}>
            {processing ? 'Processing...' : 'Purchase Now'}
          </Text>
          {processing && <ActivityIndicator style={styles.processingIndicator} color="#fff" />}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureText}>✓ {text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 24,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8,
  },
  purchaseButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  processingIndicator: {
    marginLeft: 12,
  },
});
