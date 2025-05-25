import Stripe from 'stripe';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export default async function cancelSubscription(req: Request) {
  try {
    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Get the user ID from the subscription metadata
    const { userId } = subscription.metadata;

    if (userId) {
      // Update the subscription status in Supabase
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .match({ 
          user_id: userId,
          stripe_subscription_id: subscriptionId
        });
    }

    // Return success
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to cancel subscription' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 