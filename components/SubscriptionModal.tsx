import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check } from 'lucide-react-native';
import React, { useState } from 'react';

import { SUBSCRIPTION_PLANS } from '@/constants/pricing';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';


interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (interval: 'monthly' | 'yearly') => void;
}

export default function SubscriptionModal({
  visible,
  onClose,
  onSubscribe,
}: Props) {
  const [selectedInterval, setSelectedInterval] = useState<
    'monthly' | 'yearly'
  >('yearly');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Crown size={32} color="#FFD700" />
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock all features and take your gardening to the next level
            </Text>
          </LinearGradient>

          <View style={styles.planSelector}>
            <TouchableOpacity
              style={[
                styles.planOption,
                selectedInterval === 'monthly' && styles.selectedPlan,
              ]}
              onPress={() => setSelectedInterval('monthly')}
            >
              <Text style={styles.planTitle}>Monthly</Text>
              <Text style={styles.planPrice}>
                ${SUBSCRIPTION_PLANS.premium.price.monthly}
              </Text>
              <Text style={styles.planPeriod}>per month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planOption,
                selectedInterval === 'yearly' && styles.selectedPlan,
              ]}
              onPress={() => setSelectedInterval('yearly')}
            >
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 17%</Text>
              </View>
              <Text style={styles.planTitle}>Yearly</Text>
              <Text style={styles.planPrice}>
                ${SUBSCRIPTION_PLANS.premium.price.yearly}
              </Text>
              <Text style={styles.planPeriod}>per year</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            {SUBSCRIPTION_PLANS.premium.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => onSubscribe(selectedInterval)}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  planSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  planOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedPlan: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  planPeriod: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  features: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    fontFamily: 'Poppins-Regular',
  },
  subscribeButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});
