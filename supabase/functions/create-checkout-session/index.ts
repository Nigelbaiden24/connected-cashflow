import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side pricing source of truth (mirrors Pricing.tsx)
const FINANCE = {
  ANNUAL_SEAT_MONTHLY: 89,
  MONTHLY_SEAT_MONTHLY: Math.ceil(89 * 1.2), // 107
  INCLUDED_PRODUCTS: 3,
  ADDON_ANNUAL: 1200,
  ADDON_MONTHLY: Math.ceil((1200 / 12) * 1.2), // 120
};

const INVESTOR = {
  MONTHLY: 50,
  ANNUAL_MONTHLY: 40,
  INCLUDED_PRODUCTS: 3,
  ADDON_MONTHLY: 10,
  ADDON_ANNUAL: 8,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('Stripe secret key not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    const body = await req.json();
    const {
      platform,
      planName,
      billingAnnual,
      productCount = 0,
      seatCount = 1,
    } = body as {
      platform: 'finance' | 'investor';
      planName: string;
      billingAnnual: boolean;
      productCount: number;
      seatCount?: number;
    };

    if (!platform || !['finance', 'investor'].includes(platform)) {
      throw new Error('Invalid platform');
    }

    let unitAmount = 0; // in pence
    let interval: 'month' | 'year' = billingAnnual ? 'year' : 'month';
    let productLabel = planName;

    if (platform === 'finance') {
      const seatPrice = billingAnnual ? FINANCE.ANNUAL_SEAT_MONTHLY : FINANCE.MONTHLY_SEAT_MONTHLY;
      const minSeats = billingAnnual ? 1 : 3;
      const seats = Math.max(minSeats, seatCount);
      const addonCount = Math.max(0, productCount - FINANCE.INCLUDED_PRODUCTS);
      const addonPrice = billingAnnual ? FINANCE.ADDON_ANNUAL : FINANCE.ADDON_MONTHLY;
      const seatTotal = billingAnnual ? seats * seatPrice * 12 : seats * seatPrice;
      const addonTotal = addonCount * addonPrice;
      unitAmount = Math.round((seatTotal + addonTotal) * 100);
      productLabel = `FlowPulse Finance — ${seats} seat${seats > 1 ? 's' : ''}, ${productCount} product${productCount !== 1 ? 's' : ''}`;
    } else {
      const base = billingAnnual ? INVESTOR.ANNUAL_MONTHLY : INVESTOR.MONTHLY;
      const addonCount = Math.max(0, productCount - INVESTOR.INCLUDED_PRODUCTS);
      const addonPrice = billingAnnual ? INVESTOR.ADDON_ANNUAL : INVESTOR.ADDON_MONTHLY;
      const monthlyTotal = base + addonCount * addonPrice;
      const total = billingAnnual ? monthlyTotal * 12 : monthlyTotal;
      unitAmount = Math.round(total * 100);
      productLabel = `FlowPulse Investor — ${productCount} product${productCount !== 1 ? 's' : ''}`;
    }

    if (unitAmount <= 0) throw new Error('Invalid pricing computed');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: productLabel },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        plan_name: planName,
        platform,
        billing: billingAnnual ? 'annual' : 'monthly',
        product_count: String(productCount),
        seat_count: String(seatCount),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
