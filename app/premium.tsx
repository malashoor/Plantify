import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text, Button } from '@components/themed';
import { useIAP, PRODUCT_IDS } from '@hooks/useIAP';
import { usePremiumAccess } from '@hooks/usePremiumAccess';
import { useThemeColor } from '@hooks/useThemeColor';
import { PremiumFeatureList } from '@components/premium/PremiumFeatureList';
import { Stack } from 'expo-router';
import { useTranslation } from '@hooks/useTranslation';
import { ProductId } from '@/types/payment';

export default function PremiumScreen() {
  const { t } = useTranslation();
  const { products, loading, error, purchaseProduct, restorePurchases } = useIAP();
  const { isPremium } = usePremiumAccess();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handlePurchase = async (productId: ProductId) => {
    const success = await purchaseProduct(productId);
    if (success) {
      Alert.alert(t('premium.purchaseSuccess.title'), t('premium.purchaseSuccess.message'));
    } else if (error) {
      Alert.alert(t('premium.purchaseError.title'), error);
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    Alert.alert(
      restored ? t('premium.restoreSuccess.title') : t('premium.restoreFailed.title'),
      restored ? t('premium.restoreSuccess.message') : t('premium.restoreFailed.message')
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: t('premium.title') }} />
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: t('premium.title') }} />
        <Text style={styles.error}>{error}</Text>
        <Button onPress={() => window.location.reload()}>{t('common.retry')}</Button>
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: t('premium.title') }} />
        <View style={styles.content}>
          <Text style={styles.title}>{t('premium.alreadyPremium.title')}</Text>
          <Text style={styles.description}>{t('premium.alreadyPremium.message')}</Text>
        </View>
      </View>
    );
  }

  const productIds = Platform.select({
    ios: [PRODUCT_IDS.ios.premiumMonthly, PRODUCT_IDS.ios.premiumYearly],
    android: [PRODUCT_IDS.android.premiumMonthly, PRODUCT_IDS.android.premiumYearly],
    default: [],
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: t('premium.title') }} />
      <View style={styles.content}>
        <Text style={styles.title}>{t('premium.title')}</Text>
        <Text style={styles.description}>{t('premium.description')}</Text>

        <PremiumFeatureList />

        <View style={styles.productsContainer}>
          {products.map(product => (
            <View key={product.productId} style={styles.productCard}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>{product.localizedPrice}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <Button onPress={() => handlePurchase(product.productId as ProductId)}>
                {t('premium.subscribe')}
              </Button>
            </View>
          ))}
        </View>

        <Button onPress={handleRestore} style={styles.restoreButton}>
          {t('premium.restore')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  productsContainer: {
    marginVertical: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  restoreButton: {
    backgroundColor: 'transparent',
  },
});
