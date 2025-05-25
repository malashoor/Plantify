import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { usePlans, FALLBACK_PLANS, Plan } from '../../hooks/usePlans';
import { CheckoutModal } from './CheckoutModal';
import { useAuth } from '../../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export function PricingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const { data: plans, isLoading, error } = usePlans();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const displayPlans = plans || FALLBACK_PLANS;
  
  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      // Handle not logged in state
      // e.g., navigate to login screen
      alert('Please log in to subscribe to a plan');
      return;
    }
    
    setSelectedPlan(plan);
    setCheckoutVisible(true);
  };
  
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
          Error loading plans. Please try again.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Choose Your Plan
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        Select the plan that best fits your needs
      </Text>
      
      <ScrollView style={styles.plansContainer}>
        {displayPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={handleSelectPlan}
            isPopular={plan.is_popular}
            isDark={isDark}
          />
        ))}
      </ScrollView>
      
      {selectedPlan && (
        <CheckoutModal
          visible={checkoutVisible}
          onClose={() => setCheckoutVisible(false)}
          plan={selectedPlan}
          userId={user?.id || ''}
        />
      )}
    </View>
  );
}

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular: boolean;
  isDark: boolean;
}

function PlanCard({ plan, onSelect, isPopular, isDark }: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF' },
        isPopular && styles.popularCard,
      ]}
      onPress={() => onSelect(plan)}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <Text style={[styles.planName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        {plan.name}
      </Text>
      
      <Text style={[styles.planPrice, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        ${plan.price}
        <Text style={styles.perMonth}> /month</Text>
      </Text>
      
      <Text style={[styles.planDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
        {plan.description}
      </Text>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialIcons
              name="check-circle"
              size={18}
              color={isPopular ? '#85BB65' : (isDark ? '#A0A0A0' : '#666666')}
            />
            <Text
              style={[
                styles.featureText,
                { color: isDark ? '#CCCCCC' : '#666666' },
              ]}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isPopular ? '#85BB65' : (isDark ? '#555555' : '#EEEEEE') },
        ]}
        onPress={() => onSelect(plan)}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: isPopular
                ? '#FFFFFF'
                : isDark
                ? '#FFFFFF'
                : '#333333',
            },
          ]}
        >
          Select Plan
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  plansContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#85BB65',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#85BB65',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 