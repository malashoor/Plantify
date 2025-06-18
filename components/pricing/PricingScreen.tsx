import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    accent: '#45B36B',
  }
});

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  icon: string;
  color: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0',
    period: 'forever',
    icon: 'leaf-outline',
    color: '#4CAF50',
    features: [
      'Basic plant care reminders',
      'Plant identification (5/month)',
      'Basic growth tracking',
      'Community access',
      'Basic care guides',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$9.99',
    period: 'month',
    icon: 'flower',
    color: '#45B36B',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited plant identification',
      'Advanced growth analytics',
      'Hydroponic system monitoring',
      'Custom care schedules',
      'Disease detection & diagnosis',
      'Expert plant advice',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$29.99',
    period: 'month',
    icon: 'business',
    color: '#2196F3',
    features: [
      'Everything in Pro',
      'Team dashboard & collaboration',
      'Advanced analytics & reports',
      'Multiple location management',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'SLA guarantee',
    ],
  },
];

const PricingCard: React.FC<{
  plan: PricingPlan;
  theme: any;
  onSelect: () => void;
}> = ({ plan, theme, onSelect }) => (
  <View
    style={[
      styles.card,
      {
        backgroundColor: theme.colors.surface,
        borderColor: plan.popular ? plan.color : theme.colors.border,
        borderWidth: plan.popular ? 2 : 1,
      },
    ]}
  >
    {plan.popular && (
      <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
        <Text style={styles.popularText}>Most Popular</Text>
      </View>
    )}

    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: plan.color + '20' }]}>
        <Ionicons name={plan.icon as any} size={32} color={plan.color} />
      </View>
      <Text style={[styles.planName, { color: theme.colors.text }]}>{plan.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
        <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
          /{plan.period}
        </Text>
      </View>
    </View>

    <View style={styles.featuresContainer}>
      {plan.features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={plan.color} />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>
            {feature}
          </Text>
        </View>
      ))}
    </View>

    <TouchableOpacity
      style={[
        styles.selectButton,
        {
          backgroundColor: plan.popular ? plan.color : 'transparent',
          borderColor: plan.color,
          borderWidth: plan.popular ? 0 : 1,
        },
      ]}
      onPress={onSelect}
    >
      <Text
        style={[
          styles.selectButtonText,
          {
            color: plan.popular ? '#FFFFFF' : plan.color,
          },
        ]}
      >
        {plan.id === 'free' ? 'Current Plan' : 'Select Plan'}
      </Text>
    </TouchableOpacity>
  </View>
);

export const PricingScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId);
    // TODO: Implement subscription logic
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Choose Your Plan
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Unlock the full potential of PlantAI with advanced features and expert guidance
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            theme={theme}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.guaranteeContainer}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.accent} />
          <Text style={[styles.guaranteeText, { color: theme.colors.text }]}>
            30-day money-back guarantee
          </Text>
        </View>
        
        <Text style={[styles.footerNote, { color: theme.colors.textSecondary }]}>
          Cancel anytime. No hidden fees. Secure payment with Stripe.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
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
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  plansContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: 20,
    right: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  guaranteeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 