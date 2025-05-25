
import { SUBSCRIPTION_PLANS } from '@/constants/pricing';
import { supabase } from '@/utils/supabase';
import { Platform } from 'react-native';

// Types
export interface PurchaseConfig {
  productId: string;
  offeringId?: string;
  promotionalOfferId?: string;
}

// Platform-specific product IDs
export const PRODUCT_IDS = {
  ios: {
    premium_monthly: 'com.plantify.app.premium.monthly',
    premium_yearly: 'com.plantify.app.premium.yearly',
    professional_monthly: 'com.plantify.app.professional.monthly',
    professional_yearly: 'com.plantify.app.professional.yearly',
  },
  android: {
    premium_monthly: 'premium_monthly_subscription',
    premium_yearly: 'premium_yearly_subscription',
    professional_monthly: 'professional_monthly_subscription',
    professional_yearly: 'professional_yearly_subscription',
  },
} as const;

// Get product ID for current platform
export function getProductId(tier: string, interval: string): string {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const key = `${tier}_${interval}`;
  return PRODUCT_IDS[platform][key as keyof (typeof PRODUCT_IDS)['ios']];
}

// Purchase validation
export async function validatePurchase(
  receipt: string,
  productId: string,
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Send to backend for validation
    const response = await fetch('/api/validate-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt,
        productId,
        userId: user.id,
        platform: Platform.OS,
      }),
    });

    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Error validating purchase:', error);
    return false;
  }
}

// Receipt refresh for subscription status
export async function refreshReceipt(): Promise<string | null> {
  try {
    // Platform-specific receipt refresh logic
    if (Platform.OS === 'ios') {
      // Implement iOS receipt refresh
      return null;
    } else if (Platform.OS === 'android') {
      // Implement Android receipt refresh
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing receipt:', error);
    return null;
  }
}

// Purchase restoration
export async function restorePurchases(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Platform-specific restore logic
    if (Platform.OS === 'ios') {
      // Implement iOS restore
      return false;
    } else if (Platform.OS === 'android') {
      // Implement Android restore
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
}
