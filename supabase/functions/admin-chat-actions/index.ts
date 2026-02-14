import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, params } = await req.json();

    // Extract auth user from request
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log(`Admin chat action: ${action}`, params);

    let result: any;

    switch (action) {
      case "post_newsletter": {
        const { title, content, platform, target_user_id } = params;
        const { data, error } = await supabase.from("newsletters").insert({
          title,
          preview: content.slice(0, 200),
          content,
          category: "sector",
          edition: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          read_time: `${Math.max(1, Math.ceil(content.length / 1000))} min read`,
          published_date: new Date().toISOString(),
          uploaded_by: userId,
          target_platform: platform || null,
          target_user_id: target_user_id || null,
        }).select().single();

        if (error) throw error;
        result = { success: true, type: "newsletter", id: data.id, title };
        break;
      }

      case "post_alert": {
        const { title, description, severity, alert_type, platform, target_user_id } = params;
        const { data, error } = await supabase.from("investor_alerts").insert({
          alert_type: alert_type || "market_update",
          title,
          description,
          severity: severity || "info",
          published_date: new Date().toISOString(),
          metadata: { posted_via: "ai_chatbot", platform },
        }).select().single();

        if (error) throw error;

        // Create notification entries
        if (target_user_id) {
          await supabase.from("investor_alert_notifications").insert({
            user_id: target_user_id,
            alert_id: data.id,
            delivery_method: "platform",
            delivered_at: new Date().toISOString(),
          });
        } else {
          const { data: profiles } = await supabase.from("user_profiles").select("user_id");
          if (profiles?.length) {
            await supabase.from("investor_alert_notifications").insert(
              profiles.map((p: any) => ({
                user_id: p.user_id,
                alert_id: data.id,
                delivery_method: "platform",
                delivered_at: new Date().toISOString(),
              }))
            );
          }
        }

        result = { success: true, type: "alert", id: data.id, title };
        break;
      }

      case "post_learning_content": {
        const { title, description, content, category, difficulty_level, target_user_id } = params;
        const { data, error } = await supabase.from("learning_content").insert({
          title,
          description: description || content.slice(0, 200),
          content,
          category: category || "investing_basics",
          difficulty_level: difficulty_level || "beginner",
          is_published: true,
          uploaded_by: userId,
          target_user_id: target_user_id || null,
        }).select().single();

        if (error) throw error;
        result = { success: true, type: "learning_content", id: data.id, title };
        break;
      }

      case "post_market_commentary": {
        const { title, description, target_user_id } = params;
        const { data, error } = await supabase.from("market_commentary").insert({
          title,
          description,
          uploaded_by: userId,
          target_user_id: target_user_id || null,
        }).select().single();

        if (error) throw error;
        result = { success: true, type: "market_commentary", id: data.id, title };
        break;
      }

      case "post_market_trend": {
        const { title, description, trend_type, impact_level } = params;
        const { data, error } = await supabase.from("market_trends").insert({
          title,
          description,
          trend_type: trend_type || "market_analysis",
          impact_level: impact_level || "medium",
          published_date: new Date().toISOString(),
          uploaded_by: userId,
        }).select().single();

        if (error) throw error;
        result = { success: true, type: "market_trend", id: data.id, title };
        break;
      }

      case "list_users": {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("user_id, email, full_name")
          .limit(50);

        if (error) throw error;
        result = { success: true, users: data };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin chat action error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Action failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
