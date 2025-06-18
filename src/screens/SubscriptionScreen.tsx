import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { usePayment } from '../hooks/usePayment';
import { formatCurrency } from '../utils/currency';

export const SubscriptionScreen: React.FC = () => {
  const {
    subscriptions,
    loading,
    processing,
    purchaseSubscription,
    restorePurchases
  } = usePayment({
    autoInit: true,
    showErrorDialog: true,
    onSuccess: (result) => {
      Alert.alert(
        'Success!',
        'Thank you for subscribing to GreensAI Premium!',
        [{ text: 'OK' }]
      );
    }
  });

  const handleSubscribe = useCallback(async (subscriptionId: string) => {
    await purchaseSubscription(subscriptionId);
  }, [purchaseSubscription]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GreensAI Premium</Text>
        <Text style={styles.subtitle}>
          Unlock all features and get personalized plant care
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {subscriptions.map((subscription) => (
          <TouchableOpacity
            key={subscription.productId}
            style={[styles.planCard, processing && styles.planCardDisabled]}
            onPress={() => handleSubscribe(subscription.productId)}
            disabled={processing}
          >
            <Text style={styles.planTitle}>{subscription.title}</Text>
            <Text style={styles.planPrice}>
              {formatCurrency(subscription.price, subscription.currency)}
            </Text>
            <Text style={styles.planDescription}>
              {subscription.description}
            </Text>
            {processing && (
              <ActivityIndicator
                style={styles.processingIndicator}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Premium Features</Text>
        <View style={styles.featuresList}>
          <FeatureItem text="Unlimited plant identification" />
          <FeatureItem text="Detailed care guides" />
          <FeatureItem text="Disease detection" />
          <FeatureItem text="Custom care reminders" />
          <FeatureItem text="Expert consultation" />
          <FeatureItem text="Priority support" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={restorePurchases}
        disabled={processing}
      >
        <Text style={styles.restoreButtonText}>
          Restore Previous Purchases
        </Text>
      </TouchableOpacity>
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
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    padding: 24,
    backgroundColor: '#2ecc71',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center'
  },
  plansContainer: {
    padding: 16
  },
  planCard: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center'
  },
  planCardDisabled: {
    opacity: 0.7
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  planDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center'
  },
  processingIndicator: {
    marginTop: 12
  },
  featuresContainer: {
    padding: 24,
    backgroundColor: '#f9f9f9'
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50'
  },
  featuresList: {
    marginBottom: 16
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  featureText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 8
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center'
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#2ecc71',
    textDecorationLine: 'underline'
  }
}); 