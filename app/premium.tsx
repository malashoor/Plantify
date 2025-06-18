import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Button } from '@components/themed';
import { useIAP } from '@hooks/useIAP';
import { usePremiumAccess } from '@hooks/usePremiumAccess';
import { useThemeColor, ThemeColors } from '@hooks/useThemeColor';
import { PremiumFeatureList } from '@components/premium/PremiumFeatureList';
import { Stack } from 'expo-router';
import { useTranslation } from '@hooks/useTranslation';

export default function PremiumScreen() {
  const { t } = useTranslation();
  const { products, loading, error, purchaseProduct, restorePurchases } = useIAP();
  const { isPremium } = usePremiumAccess();
  const backgroundColor = useThemeColor({}, ThemeColors.background);
  const tintColor = useThemeColor({}, ThemeColors.tint);

  const handlePurchase = async (productId: string) => {
    const success = await purchaseProduct(productId);
    if (success) {
      Alert.alert(
        t('premium.purchaseSuccess.title'),
        t('premium.purchaseSuccess.message'),
      );
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    Alert.alert(
      restored 
        ? t('premium.restoreSuccess.title')
        : t('premium.restoreFailed.title'),
      restored 
        ? t('premium.restoreSuccess.message')
        : t('premium.restoreFailed.message'),
    );
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: t('premium.title') }} />
        <View style={styles.content}>
          <Text style={styles.title}>{t('premium.alreadyPremium.title')}</Text>
          <Text style={styles.description}>
            {t('premium.alreadyPremium.message')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen options={{ title: t('premium.title') }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{t('premium.title')}</Text>
        <Text style={styles.description}>{t('premium.description')}</Text>

        <PremiumFeatureList />

        {loading ? (
          <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.subscriptionOptions}>
            {products.map((product) => (
              <View key={product.productId} style={styles.subscriptionCard}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.price}>{product.price}</Text>
                <Button
                  onPress={() => handlePurchase(product.productId)}
                  style={styles.subscribeButton}
                >
                  {t('premium.subscribe')}
                </Button>
              </View>
            ))}
          </View>
        )}

        <Button
          onPress={handleRestore}
          style={styles.restoreButton}
          textStyle={styles.restoreButtonText}
        >
          {t('premium.restorePurchases')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  subscriptionOptions: {
    width: '100%',
    gap: 20,
  },
  subscriptionCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    textAlign: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subscribeButton: {
    width: '100%',
    paddingVertical: 12,
  },
  restoreButton: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  restoreButtonText: {
    fontSize: 14,
  },
}); 