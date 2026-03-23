import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OneSignal credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { title, message, url, icon, segment, filters, target_user_ids, schedule } = body;

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: "title and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      ...(url && { url }),
      ...(icon && { chrome_web_icon: icon }),
      ...(schedule && { send_after: schedule }),
    };

    // Priority: individual users > filters > segment > all subscribed
    if (target_user_ids && Array.isArray(target_user_ids) && target_user_ids.length > 0) {
      // Send to specific users by their external_user_id (Supabase auth.uid)
      payload.include_aliases = { external_id: target_user_ids };
      payload.target_channel = "push";
    } else if (filters && filters.length > 0) {
      payload.filters = filters;
    } else if (segment) {
      payload.included_segments = [segment];
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OneSignal API error:", result);
      return new Response(
        JSON.stringify({ error: "OneSignal API error", details: result }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log notification to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("push_notification_logs").insert({
        onesignal_id: result.id || null,
        title,
        message,
        url: url || null,
        notification_type: body.notification_type || "general",
        target_type: target_user_ids?.length ? "individual" : segment ? "segment" : "all",
        target_user_ids: target_user_ids || null,
        recipients_count: result.recipients || 0,
        sent_by: body.sent_by || null,
      });
    } catch (logErr) {
      console.error("Failed to log notification:", logErr);
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id, recipients: result.recipients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
