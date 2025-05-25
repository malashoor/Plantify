import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { Plan } from '../../hooks/usePlans';
import { useStripe } from '@stripe/stripe-react-native';
import Colors from '../../constants/Colors';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan;
  userId: string;
}

export function CheckoutModal({ visible, onClose, plan, userId }: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch the payment intent from your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // 2. Initialize the Payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Plantify',
        style: isDark ? 'dark' : 'light',
        returnURL: 'plantify://payment-complete',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          // User canceled the payment
          setIsLoading(false);
          return;
        }
        throw new Error(paymentError.message);
      }

      // 4. Payment successful
      Alert.alert(
        'Payment Successful',
        `Thank you for subscribing to the ${plan.name} plan!`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Complete Your Purchase
          </Text>

          <View style={styles.planInfoContainer}>
            <Text style={[
              styles.planName,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {plan.name} Plan
            </Text>
            <Text style={[
              styles.planPrice,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              ${plan.price}/month
            </Text>
            <Text style={[
              styles.planDescription,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              {plan.description}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: '#85BB65' },
              isLoading && styles.disabledButton,
            ]}
            onPress={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={[
              styles.cancelButtonText,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  planInfoContainer: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  payButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
}); 