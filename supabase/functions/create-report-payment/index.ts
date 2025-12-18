import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-REPORT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { reportId, userEmail } = await req.json();
    logStep("Request data", { reportId, userEmail });

    if (!reportId) throw new Error("Report ID is required");

    // Fetch report details
    const { data: report, error: reportError } = await supabaseClient
      .from("purchasable_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      throw new Error("Report not found");
    }
    logStep("Report found", { title: report.title, price: report.price_cents });

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerId = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      user = userData.user;
      logStep("User authenticated", { userId: user?.id, email: user?.email });
    }

    const customerEmail = user?.email || userEmail;
    if (!customerEmail) throw new Error("Email is required for purchase");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ...(customerId ? { customer: customerId } : { customer_email: customerEmail }),
      line_items: [
        {
          price_data: {
            currency: report.currency.toLowerCase(),
            product_data: {
              name: report.title,
              description: report.description || "Premium Report",
            },
            unit_amount: report.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/reports?purchased=${reportId}`,
      cancel_url: `${req.headers.get("origin")}/reports`,
      metadata: {
        report_id: reportId,
        user_id: user?.id || "",
        user_email: customerEmail,
      },
    });
    logStep("Checkout session created", { sessionId: session.id });

    // Create pending purchase record
    const { error: purchaseError } = await supabaseClient
      .from("report_purchases")
      .insert({
        user_id: user?.id || null,
        report_id: reportId,
        stripe_checkout_session_id: session.id,
        amount_paid: report.price_cents,
        currency: report.currency,
        status: "pending",
        email: customerEmail,
      });

    if (purchaseError) {
      logStep("Error creating purchase record", { error: purchaseError });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
