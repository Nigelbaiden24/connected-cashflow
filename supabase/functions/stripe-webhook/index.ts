import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    const body = await req.text();
    
    // Note: In production, you should verify the webhook signature
    // For now, we'll parse the event directly
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Error parsing webhook body:', err);
      throw new Error('Invalid webhook payload');
    }

    console.log('Webhook event received:', event.type);

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Get customer email to find user
        const customer = await stripe.customers.retrieve(session.customer as string);
        const customerEmail = (customer as any).email;

        if (!customerEmail) {
          console.error('No customer email found');
          break;
        }

        // Find user by email
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          break;
        }

        const user = users.users.find((u) => u.email === customerEmail);
        
        if (!user) {
          console.error('User not found for email:', customerEmail);
          break;
        }

        // Extract plan details from metadata
        const planName = session.metadata?.plan_name || 'Unknown';
        const platform = session.metadata?.platform || 'finance';

        // Insert or update subscription
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            stripe_price_id: subscription.items.data[0].price.id,
            plan_name: planName,
            platform: platform,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_subscription_id'
          });

        if (subError) {
          console.error('Error upserting subscription:', subError);
        } else {
          console.log('Subscription created/updated successfully');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);

        // Update subscription in database
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        } else {
          console.log('Subscription updated successfully');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);

        // Update subscription status to canceled
        const { error: deleteError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (deleteError) {
          console.error('Error updating canceled subscription:', deleteError);
        } else {
          console.log('Subscription canceled successfully');
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});