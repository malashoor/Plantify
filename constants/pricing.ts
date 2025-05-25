export interface SubscriptionPlan {
  id: string;
  price: number;
  features: string[];
}

export interface SubscriptionPlans {
  free: SubscriptionPlan;
  monthly: SubscriptionPlan;
  yearly: SubscriptionPlan;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlans = {
  free: {
    id: 'free',
    price: 0,
    features: [
      'Basic plant identification',
      'Limited care recommendations',
      'Community access',
    ],
  },
  monthly: {
    id: 'monthly',
    price: 9.99,
    features: [
      'Unlimited plant identifications',
      'Advanced care recommendations',
      'Hydroponic system monitoring',
      'Priority support',
    ],
  },
  yearly: {
    id: 'yearly',
    price: 79.99,
    features: [
      'All monthly features',
      '33% discount',
      'Early access to new features',
      'Exclusive content',
    ],
  },
};

export const AD_CONFIG = {
  bannerUnitId: __DEV__
    ? 'ca-app-pub-3940256099942544/6300978111' // Test ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Production ID
  refreshInterval: 60000, // 1 minute
}; 