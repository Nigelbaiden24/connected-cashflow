import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alertId, userId } = await req.json();

    if (!alertId) {
      return new Response(JSON.stringify({ error: "Alert ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get alert details
    const { data: alert, error: alertError } = await supabase
      .from("investor_alerts")
      .select("*")
      .eq("id", alertId)
      .single();

    if (alertError || !alert) {
      console.error("Error fetching alert:", alertError);
      return new Response(JSON.stringify({ error: "Alert not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users to notify (either specific user or all users with preferences for this alert type)
    let usersToNotify = [];
    
    if (userId) {
      const { data: user } = await supabase
        .from("investor_alert_preferences")
        .select("*")
        .eq("user_id", userId)
        .eq("alert_type", alert.alert_type)
        .single();
      
      if (user) usersToNotify = [user];
    } else {
      const { data: users } = await supabase
        .from("investor_alert_preferences")
        .select("*")
        .eq("alert_type", alert.alert_type)
        .or("email_enabled.eq.true,platform_enabled.eq.true,sms_enabled.eq.true");
      
      usersToNotify = users || [];
    }

    const notifications = [];
    const errors = [];

    for (const userPref of usersToNotify) {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(userPref.user_id);
      
      if (!userData?.user?.email) continue;

      // Platform notification (always create)
      if (userPref.platform_enabled) {
        const { error: notifError } = await supabase
          .from("investor_alert_notifications")
          .insert({
            user_id: userPref.user_id,
            alert_id: alertId,
            delivery_method: "platform",
          });

        if (notifError) {
          errors.push({ user: userPref.user_id, method: "platform", error: notifError });
        } else {
          notifications.push({ user: userPref.user_id, method: "platform" });
        }
      }

      // Email notification
      if (userPref.email_enabled) {
        try {
          // In production, integrate with email service like SendGrid, AWS SES, etc.
          // For now, log the email attempt
          console.log(`Sending email to ${userData.user.email}:`, {
            subject: `FlowPulse Alert: ${alert.title}`,
            body: alert.description,
          });

          const { error: notifError } = await supabase
            .from("investor_alert_notifications")
            .insert({
              user_id: userPref.user_id,
              alert_id: alertId,
              delivery_method: "email",
            });

          if (notifError) {
            errors.push({ user: userPref.user_id, method: "email", error: notifError });
          } else {
            notifications.push({ user: userPref.user_id, method: "email" });
          }
        } catch (error) {
          errors.push({ user: userPref.user_id, method: "email", error });
        }
      }

      // SMS notification
      if (userPref.sms_enabled && userPref.phone_number) {
        try {
          // In production, integrate with SMS service like Twilio, AWS SNS, etc.
          // For now, log the SMS attempt
          console.log(`Sending SMS to ${userPref.phone_number}:`, {
            message: `${alert.title}: ${alert.description}`,
          });

          const { error: notifError } = await supabase
            .from("investor_alert_notifications")
            .insert({
              user_id: userPref.user_id,
              alert_id: alertId,
              delivery_method: "sms",
            });

          if (notifError) {
            errors.push({ user: userPref.user_id, method: "sms", error: notifError });
          } else {
            notifications.push({ user: userPref.user_id, method: "sms" });
          }
        } catch (error) {
          errors.push({ user: userPref.user_id, method: "sms", error });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications,
        errors: errors.length > 0 ? errors : undefined,
        message: `Alert sent to ${notifications.length} delivery method(s)`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-investor-alert function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
