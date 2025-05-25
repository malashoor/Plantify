import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';

import { Platform } from 'react-native';

// Types
export interface ReferralInfo {
  code: string;
  points: number;
  referrals: number;
  rewards: Reward[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'premium' | 'coins' | 'feature';
}

export interface InfluencerCampaign {
  id: string;
  influencer: string;
  code: string;
  discount: number;
  validUntil: string;
}

// App Store Optimization
export const requestAppReview = async () => {
  try {
    if ((await StoreReview.hasAction()) && (await StoreReview.isAvailable())) {
      await StoreReview.requestReview();
    }
  } catch (error) {
    console.error('Error requesting app review:', error);
  }
};

// Referral Program
export const generateReferralCode = async (userId: string): Promise<string> => {
  // Generate unique referral code
  const code = `PLT${userId.substring(0, 6)}`;
  await AsyncStorage.setItem(`referral_code_${userId}`, code);
  return code;
};

export const getReferralInfo = async (
  userId: string,
): Promise<ReferralInfo> => {
  try {
    const code =
      (await AsyncStorage.getItem(`referral_code_${userId}`)) ||
      (await generateReferralCode(userId));
    const points = parseInt(
      (await AsyncStorage.getItem(`referral_points_${userId}`)) || '0',
      10,
    );
    const referrals = parseInt(
      (await AsyncStorage.getItem(`referral_count_${userId}`)) || '0',
      10,
    );

    return {
      code,
      points,
      referrals,
      rewards: getAvailableRewards(points),
    };
  } catch (error) {
    console.error('Error getting referral info:', error);
    return { code: '', points: 0, referrals: 0, rewards: [] };
  }
};

export const shareReferralCode = async (code: string) => {
  try {
    if (await Sharing.isAvailable()) {
      await Sharing.shareAsync(
        Platform.select({
          web: `https://plantify.app/refer/${code}`,
          default: `plantify://refer/${code}`,
        }),
        {
          dialogTitle: 'Share Your Referral Code',
          mimeType: 'text/plain',
          UTI: 'public.plain-text',
        },
      );
    }
  } catch (error) {
    console.error('Error sharing referral code:', error);
  }
};

// Rewards System
const getAvailableRewards = (points: number): Reward[] => {
  const allRewards: Reward[] = [
    {
      id: 'premium_month',
      name: '1 Month Premium',
      description: 'Get one month of Premium features free',
      pointsCost: 1000,
      type: 'premium',
    },
    {
      id: 'unlimited_id',
      name: 'Unlimited Identifications',
      description: '24-hour unlimited plant identifications',
      pointsCost: 500,
      type: 'feature',
    },
    {
      id: 'coins_500',
      name: '500 Coins',
      description: 'Get 500 coins to use in the app',
      pointsCost: 250,
      type: 'coins',
    },
  ];

  return allRewards.filter((reward) => reward.pointsCost <= points);
};

// Push Notifications
export const setupNotifications = async () => {
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const scheduleEngagementNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'engagement' },
      },
      trigger,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Influencer Partnerships
export const getActiveInfluencerCampaigns = async (): Promise<
  InfluencerCampaign[]
> => {
  // In a real app, fetch from API
  return [
    {
      id: '1',
      influencer: 'GardenGuru',
      code: 'GURU20',
      discount: 20,
      validUntil: '2024-12-31',
    },
    {
      id: '2',
      influencer: 'PlantLover',
      code: 'PLANT15',
      discount: 15,
      validUntil: '2024-12-31',
    },
  ];
};

export const applyInfluencerCode = async (
  code: string,
): Promise<number | null> => {
  const campaigns = await getActiveInfluencerCampaigns();
  const campaign = campaigns.find((c) => c.code === code);
  return campaign?.discount || null;
};

// Engagement Tracking
export const trackEngagement = async (userId: string, action: string) => {
  try {
    const key = `engagement_${action}_${userId}`;
    const count = parseInt((await AsyncStorage.getItem(key)) || '0', 10);
    await AsyncStorage.setItem(key, (count + 1).toString());

    // Schedule re-engagement notification if needed
    if (action === 'plant_identification' && count === 5) {
      await scheduleEngagementNotification(
        'Keep Growing Your Garden!',
        'Identify more plants and earn rewards points.',
        { seconds: 86400 }, // 24 hours
      );
    }
  } catch (error) {
    console.error('Error tracking engagement:', error);
  }
};

// ASO Keywords
export const asoKeywords = {
  primary: [
    'plant identification',
    'garden planner',
    'plant care',
    'hydroponic gardening',
    'plant disease detection',
  ],
  secondary: [
    'plant scanner',
    'leaf identifier',
    'garden helper',
    'plant watering reminder',
    'plant growing guide',
  ],
  localized: {
    ar: [
      'تحديد النباتات',
      'العناية بالنباتات',
      'حديقة منزلية',
      'زراعة مائية',
      'دليل النباتات',
    ],
  },
};
