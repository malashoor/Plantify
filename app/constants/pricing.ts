export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic plant identification (5/month)',
      'Basic care instructions',
      'Community access (read-only)',
      'Ad-supported experience',
    ],
  },
  premium: {
    name: 'Premium',
    price: {
      monthly: 4.99,
      yearly: 49.99, // ~17% discount
    },
    features: [
      'Unlimited plant identifications',
      'Advanced disease detection',
      'Detailed care guides',
      'Ad-free experience',
      'Offline mode',
      'Priority support',
      'Exclusive content',
    ],
    trial: {
      duration: 7, // days
      features: 'all',
    },
  },
};

export const PRODUCT_IDS = {
  ios: {
    premium_monthly: 'com.plantify.app.premium.monthly',
    premium_yearly: 'com.plantify.app.premium.yearly',
  },
  android: {
    premium_monthly: 'premium_monthly_subscription',
    premium_yearly: 'premium_yearly_subscription',
  },
};

export const AD_CONFIG = {
  banner: {
    refreshInterval: 60, // seconds
    unitId: {
      ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
      android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
    },
  },
  interstitial: {
    frequency: 5, // Show every X actions
    unitId: {
      ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
      android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
    },
  },
};
