import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Fetch recent audit logs for analysis
    const { data: auditLogs, error: auditError } = await supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(500);

    if (auditError) throw auditError;

    // Fetch recent user activity patterns
    const { data: userProfiles } = await supabase
      .from("user_profiles")
      .select("user_id, email, full_name");

    // Aggregate patterns for AI analysis
    const userActivityMap: Record<string, { email: string; actions: any[]; count: number }> = {};
    for (const log of auditLogs || []) {
      const uid = log.user_id || "unknown";
      if (!userActivityMap[uid]) {
        const profile = userProfiles?.find(p => p.user_id === uid);
        userActivityMap[uid] = {
          email: profile?.email || "unknown",
          actions: [],
          count: 0,
        };
      }
      userActivityMap[uid].actions.push({
        action: log.action,
        resource_type: log.resource_type,
        severity: log.severity,
        timestamp: log.timestamp,
        ip: log.ip_address,
      });
      userActivityMap[uid].count++;
    }

    // Build analysis summary for AI
    const activitySummary = Object.entries(userActivityMap).map(([userId, data]) => ({
      userId,
      email: data.email,
      totalActions: data.count,
      actionTypes: [...new Set(data.actions.map(a => a.action))],
      severities: data.actions.map(a => a.severity).filter(Boolean),
      ipAddresses: [...new Set(data.actions.map(a => a.ip).filter(Boolean))],
      timeRange: data.actions.length > 0 ? {
        earliest: data.actions[data.actions.length - 1].timestamp,
        latest: data.actions[0].timestamp,
      } : null,
    }));

    const scanId = crypto.randomUUID();

    // Call Lovable AI for anomaly analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity anomaly detection AI. Analyze user activity patterns from audit logs and identify suspicious behaviors. Look for:
1. Unusual login times or frequency spikes
2. Rapid successive actions (potential automation/bots)
3. Access to sensitive resources from multiple IPs
4. Privilege escalation attempts
5. Bulk data access patterns
6. Failed authentication patterns
7. Unusual resource access patterns (accessing areas outside normal scope)
8. Geographic anomalies (multiple IP regions)

Return your analysis using the provided tool.`
          },
          {
            role: "user",
            content: `Analyze these user activity patterns from the last 500 audit logs. Total unique users: ${activitySummary.length}. Total logs: ${auditLogs?.length || 0}.

Activity Summary:
${JSON.stringify(activitySummary, null, 2)}

Identify any anomalies, suspicious patterns, or security concerns. If no real anomalies exist, still provide a risk assessment. Always return at least one finding (even if it's just a general observation).`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_anomalies",
              description: "Report detected security anomalies and suspicious patterns",
              parameters: {
                type: "object",
                properties: {
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        user_email: { type: "string", description: "Email of the user involved, or 'system' for general findings" },
                        anomaly_type: { type: "string", enum: ["unusual_login", "rapid_actions", "multi_ip", "privilege_escalation", "bulk_access", "auth_failure", "scope_violation", "geo_anomaly", "general_observation"] },
                        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        title: { type: "string", description: "Short title of the anomaly" },
                        description: { type: "string", description: "Detailed explanation of the anomaly and why it's suspicious" },
                        recommendation: { type: "string", description: "Suggested action to take" }
                      },
                      required: ["user_email", "anomaly_type", "severity", "title", "description", "recommendation"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Overall security posture summary"
                  },
                  risk_score: {
                    type: "number",
                    description: "Overall risk score from 0-100 (0 = no risk, 100 = critical)"
                  }
                },
                required: ["anomalies", "summary", "risk_score"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "report_anomalies" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis returned from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Store anomalies in database
    const anomaliesToInsert = analysis.anomalies.map((a: any) => ({
      user_email: a.user_email,
      anomaly_type: a.anomaly_type,
      severity: a.severity,
      title: a.title,
      description: `${a.description}\n\nRecommendation: ${a.recommendation}`,
      details: { recommendation: a.recommendation },
      status: 'open',
      scan_id: scanId,
    }));

    if (anomaliesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("security_anomalies")
        .insert(anomaliesToInsert);
      
      if (insertError) console.error("Error storing anomalies:", insertError);
    }

    return new Response(JSON.stringify({
      scan_id: scanId,
      anomalies: analysis.anomalies,
      summary: analysis.summary,
      risk_score: analysis.risk_score,
      logs_analyzed: auditLogs?.length || 0,
      users_analyzed: activitySummary.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Anomaly detection error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
