import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useIAP } from '@hooks/useIAP';
import { Button, SafeAreaView } from '@components';
import { Colors } from '@constants/Colors';

export default function PremiumScreen() {
  const router = useRouter();
  const { products, loading, error, purchaseProduct, restorePurchases, isPremium } = useIAP();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePurchase = async () => {
    try {
      const productId = Platform.select({
        ios: 'com.greensai.premium',
        android: 'com.greensai.premium',
      });

      if (!productId) {
        Alert.alert('Error', 'Platform not supported');
        return;
      }

      await purchaseProduct(productId);
      Alert.alert('Success', 'Thank you for your purchase!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete purchase');
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      if (isPremium) {
        Alert.alert('Success', 'Your purchases have been restored!');
        router.back();
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Something went wrong. Please try again later.
        </Text>
        <Button onPress={() => router.back()} title="Go Back" />
      </SafeAreaView>
    );
  }

  const product = products[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Upgrade to Premium</Text>

        <View style={[styles.featuresContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Premium Features:</Text>
          <Text style={[styles.feature, { color: colors.text }]}>
            • Unlimited plant identifications
          </Text>
          <Text style={[styles.feature, { color: colors.text }]}>• Detailed care instructions</Text>
          <Text style={[styles.feature, { color: colors.text }]}>• Disease detection</Text>
          <Text style={[styles.feature, { color: colors.text }]}>• Priority support</Text>
        </View>

        {product && (
          <Text style={[styles.price, { color: colors.primary }]}>{product.localizedPrice}</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Purchase Premium" onPress={handlePurchase} style={styles.purchaseButton} />
          <Button
            title="Restore Purchases"
            onPress={handleRestore}
            variant="secondary"
            style={styles.restoreButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  purchaseButton: {
    width: '100%',
  },
  restoreButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
