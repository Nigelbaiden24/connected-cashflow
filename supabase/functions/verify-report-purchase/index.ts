import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-REPORT-PURCHASE] ${step}${detailsStr}`);
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

    const { reportId, sessionId } = await req.json();
    logStep("Request data", { reportId, sessionId });

    if (!reportId) throw new Error("Report ID is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // If sessionId provided, verify it
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      logStep("Session retrieved", { status: session.payment_status });

      if (session.payment_status === "paid") {
        // Update purchase record
        const { error: updateError } = await supabaseClient
          .from("report_purchases")
          .update({ status: "completed", stripe_payment_intent_id: session.payment_intent as string })
          .eq("stripe_checkout_session_id", sessionId);

        if (updateError) {
          logStep("Error updating purchase", { error: updateError });
        }

        // Increment download count
        await supabaseClient.rpc("increment_report_downloads", { report_id: reportId });

        // Get report file path
        const { data: report } = await supabaseClient
          .from("purchasable_reports")
          .select("file_path, title")
          .eq("id", reportId)
          .single();

        if (report?.file_path) {
          // Generate signed URL for download
          const { data: signedUrl } = await supabaseClient.storage
            .from("reports")
            .createSignedUrl(report.file_path, 3600); // 1 hour expiry

          return new Response(JSON.stringify({ 
            verified: true, 
            downloadUrl: signedUrl?.signedUrl,
            title: report.title 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // Check if user has purchased this report
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      const user = userData.user;

      if (user) {
        const { data: purchase } = await supabaseClient
          .from("report_purchases")
          .select("*")
          .eq("report_id", reportId)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .single();

        if (purchase) {
          const { data: report } = await supabaseClient
            .from("purchasable_reports")
            .select("file_path, title")
            .eq("id", reportId)
            .single();

          if (report?.file_path) {
            const { data: signedUrl } = await supabaseClient.storage
              .from("reports")
              .createSignedUrl(report.file_path, 3600);

            return new Response(JSON.stringify({ 
              verified: true, 
              downloadUrl: signedUrl?.signedUrl,
              title: report.title 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ verified: false }), {
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
