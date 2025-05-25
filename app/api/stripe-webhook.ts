import Stripe from 'stripe';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Webhook signing secret from Stripe dashboard
const endpointSecret = process.env.EXPO_PUBLIC_STRIPE_WEBHOOK_SECRET;

export default async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !endpointSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe signature or webhook secret' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let event: Stripe.Event;
  
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.paid':
      const invoicePaid = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoicePaid);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // Get customer metadata
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const { userId, planId } = subscription.metadata;

  if (!userId || !planId) return;

  // Update subscription in Supabase
  try {
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        stripe_subscription_id: subscription.id,
        status: 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .match({ user_id: userId });

    // Log invoice in the invoices table
    await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userId,
        stripe_invoice_id: invoice.id,
        amount_paid: invoice.amount_paid / 100, // Convert from cents
        invoice_pdf: invoice.invoice_pdf,
        period_start: new Date(invoice.period_start * 1000).toISOString(),
        period_end: new Date(invoice.period_end * 1000).toISOString(),
        status: invoice.status,
      });
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;

  if (!userId) return;

  try {
    // Update subscription status to canceled
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .match({ 
        user_id: userId,
        stripe_subscription_id: subscription.id
      });
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
} 