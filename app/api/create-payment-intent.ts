import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // Type cast to avoid version compatibility issues
});

// Get plan data from Supabase or use static data
const PLANS = {
  hobbyist: {
    id: 'price_hobbyist',
    amount: 499, // $4.99
    currency: 'usd',
    name: 'Hobbyist',
  },
  commercial: {
    id: 'price_commercial',
    amount: 1999, // $19.99
    currency: 'usd',
    name: 'Commercial',
  },
  enterprise: {
    id: 'price_enterprise',
    amount: 4999, // $49.99
    currency: 'usd',
    name: 'Enterprise',
  },
};

export default async function createPaymentIntent(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    if (!planId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing planId or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the plan details
    const plan = PLANS[planId as keyof typeof PLANS];
    
    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.amount,
      currency: plan.currency,
      metadata: {
        userId,
        planId,
        planName: plan.name,
      },
    });

    // Return the client secret to the client
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create payment intent' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 