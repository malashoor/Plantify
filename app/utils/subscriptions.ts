import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import * as StoreReview from 'expo-store-review';


import { SUBSCRIPTION_PLANS } from '@/constants/pricing';
import { supabase } from '@/utils/supabase';
import { Platform } from 'react-native';

// Types
export interface SubscriptionStatus {
  tier: keyof typeof SUBSCRIPTION_PLANS;
  validUntil: string | null;
  trialUsed: boolean;
  features: string[];
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

// Initialize payment providers
export async function initializePayments(): Promise<void> {
  if (Platform.OS === 'web') return;

  // Initialize Stripe for web fallback
  await initStripe({
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_KEY || '',
  });
}

// Get current subscription status
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return getDefaultStatus();
    }

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return getDefaultStatus();
    }

    return {
      tier: subscription.tier as keyof typeof SUBSCRIPTION_PLANS,
      validUntil: subscription.valid_until,
      trialUsed: subscription.trial_used,
      features: SUBSCRIPTION_PLANS[subscription.tier as keyof typeof SUBSCRIPTION_PLANS].features
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return getDefaultStatus();
  }
}

// Get default free status
function getDefaultStatus(): SubscriptionStatus {
  return {
    tier: 'free',
    validUntil: null,
    trialUsed: false,
    features: SUBSCRIPTION_PLANS.free.features
  };
}

// Start free trial
export async function startFreeTrial(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: existingTrial } = await supabase
      .from('user_subscriptions')
      .select('trial_used')
      .eq('user_id', user.id)
      .single();

    if (existingTrial?.trial_used) return false;

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        tier: 'premium',
        trial_used: true,
        valid_until: trialEndDate.toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Error starting free trial:', error);
    return false;
  }
}

// Purchase subscription
export async function purchaseSubscription(tier: SubscriptionTier): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    // Here you would integrate with your payment provider (Stripe, RevenueCat, etc.)
    // For now, we'll just create a subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.user.id,
        tier,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        auto_renew: true,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  }
}

// Get current subscription
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

// Get subscription price
export function getSubscriptionPrice(tier: SubscriptionTier): number {
  if (tier === 'free') return 0;
  return SUBSCRIPTION_PLANS[tier]?.price || 0;
}

// Is subscription feature available
export function isSubscriptionFeatureAvailable(feature: string): boolean {
  // Implement feature gating logic here
  return true;
}

// Request app review
export async function requestAppReview(): Promise<void> {
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
  }
}

// Validate receipts
export async function validateReceipt(receipt: string): Promise<boolean> {
  try {
    const response = await fetch('/api/validate-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receipt }),
    });

    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Error validating receipt:', error);
    return false;
  }
}
