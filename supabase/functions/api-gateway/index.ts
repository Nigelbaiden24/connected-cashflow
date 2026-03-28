import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Endpoint definitions grouped by product
const ENDPOINT_GROUPS: Record<string, string[]> = {
  "deal-flow": ["deals", "opportunities"],
  "investor-intelligence": ["investors", "clients", "crm-contacts"],
  "market-insights": ["market-commentary", "stocks-crypto", "insights"],
  "reports": ["reports", "research-reports"],
  "companies": ["companies", "scraped-companies"],
};

const PLAN_LIMITS: Record<string, { per_minute: number; per_day: number }> = {
  free: { per_minute: 10, per_day: 100 },
  pro: { per_minute: 60, per_day: 5000 },
  enterprise: { per_minute: 300, per_day: 50000 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  // Path after /api-gateway/ e.g. /api-gateway/deals -> "deals"
  const pathParts = url.pathname.split("/").filter(Boolean);
  // The edge function name is the first part, resource is the rest
  const resource = pathParts.slice(1).join("/") || pathParts[0] || "";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Extract API key
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing API key. Use Authorization: Bearer {api_key}" }),
      { status: 401, headers: corsHeaders }
    );
  }

  // Validate API key using DB function
  const { data: validation, error: valError } = await supabase.rpc("validate_api_key", { _api_key: apiKey });

  if (valError || !validation?.valid) {
    const errorMsg = validation?.error || valError?.message || "Invalid API key";
    const status = errorMsg.includes("Rate limit") ? 429 : 401;

    // Log failed attempt
    if (validation?.client_id) {
      await supabase.from("api_usage_logs").insert({
        api_client_id: validation.client_id,
        api_key: apiKey.substring(0, 8) + "...",
        endpoint: resource,
        method: req.method,
        response_status: status,
        response_time_ms: Date.now() - startTime,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });
    }

    return new Response(JSON.stringify({ error: errorMsg }), { status, headers: corsHeaders });
  }

  const clientId = validation.client_id;

  // Check endpoint permission
  const { data: hasPermission } = await supabase.rpc("check_api_permission", {
    _client_id: clientId,
    _endpoint: resource,
  });

  if (!hasPermission) {
    await logUsage(supabase, clientId, apiKey, resource, req, 403, startTime);
    return new Response(
      JSON.stringify({ error: `No access to endpoint: ${resource}. Contact admin to enable.` }),
      { status: 403, headers: corsHeaders }
    );
  }

  // Parse query params
  const params = Object.fromEntries(url.searchParams.entries());
  const page = parseInt(params.page || "1", 10);
  const limit = Math.min(parseInt(params.limit || "50", 10), 100);
  const offset = (page - 1) * limit;
  const sortBy = params.sort_by || "created_at";
  const sortOrder = params.sort_order === "asc" ? true : false;

  try {
    let result: any;

    switch (resource) {
      case "deals":
      case "opportunities":
        result = await queryOpportunities(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "investors":
      case "clients":
        result = await queryClients(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "crm-contacts":
        result = await queryCrmContacts(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "market-commentary":
      case "insights":
        result = await queryMarketCommentary(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "stocks-crypto":
        result = await queryStocksCrypto(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "reports":
      case "research-reports":
        result = await queryReports(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "companies":
      case "scraped-companies":
        result = await queryCompanies(supabase, params, offset, limit, sortBy, sortOrder);
        break;
      case "endpoints":
        result = {
          data: Object.entries(ENDPOINT_GROUPS).map(([group, endpoints]) => ({
            group,
            endpoints,
          })),
          meta: { total: Object.keys(ENDPOINT_GROUPS).length },
        };
        break;
      default:
        await logUsage(supabase, clientId, apiKey, resource, req, 404, startTime);
        return new Response(
          JSON.stringify({
            error: `Unknown endpoint: ${resource}`,
            available_endpoints: Object.values(ENDPOINT_GROUPS).flat(),
          }),
          { status: 404, headers: corsHeaders }
        );
    }

    await logUsage(supabase, clientId, apiKey, resource, req, 200, startTime);

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        meta: {
          page,
          limit,
          total: result.count || result.data?.length || 0,
          endpoint: resource,
          plan: validation.plan,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    await logUsage(supabase, clientId, apiKey, resource, req, 500, startTime);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function logUsage(
  supabase: any, clientId: string, apiKey: string,
  endpoint: string, req: Request, status: number, startTime: number
) {
  await supabase.from("api_usage_logs").insert({
    api_client_id: clientId,
    api_key: apiKey.substring(0, 8) + "...",
    endpoint,
    method: req.method,
    response_status: status,
    response_time_ms: Date.now() - startTime,
    ip_address: req.headers.get("x-forwarded-for") || "unknown",
    user_agent: req.headers.get("user-agent") || "unknown",
  });
}

async function queryOpportunities(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("opportunities").select("*", { count: "exact" });
  if (params.sector) query = query.ilike("sector", `%${params.sector}%`);
  if (params.stage) query = query.ilike("stage", `%${params.stage}%`);
  if (params.category) query = query.eq("category", params.category);
  if (params.status) query = query.eq("status", params.status);
  if (params.min_value) query = query.gte("target_raise", parseFloat(params.min_value));
  if (params.max_value) query = query.lte("target_raise", parseFloat(params.max_value));
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryClients(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("clients").select("id, name, email, status, risk_profile, aum, occupation, investment_experience, created_at, updated_at", { count: "exact" });
  if (params.status) query = query.eq("status", params.status);
  if (params.risk_profile) query = query.eq("risk_profile", params.risk_profile);
  if (params.min_aum) query = query.gte("aum", parseFloat(params.min_aum));
  if (params.search) query = query.ilike("name", `%${params.search}%`);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryCrmContacts(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("crm_contacts").select("id, first_name, last_name, email, company, status, lead_score, tags, created_at, updated_at", { count: "exact" });
  if (params.status) query = query.eq("status", params.status);
  if (params.company) query = query.ilike("company", `%${params.company}%`);
  if (params.min_score) query = query.gte("lead_score", parseInt(params.min_score));
  if (params.search) query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryMarketCommentary(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("market_commentary").select("*", { count: "exact" });
  if (params.category) query = query.eq("category", params.category);
  if (params.status) query = query.eq("status", params.status);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryStocksCrypto(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("stocks_crypto").select("*", { count: "exact" });
  if (params.symbol) query = query.ilike("symbol", `%${params.symbol}%`);
  if (params.asset_type) query = query.eq("asset_type", params.asset_type);
  if (params.sector) query = query.ilike("sector", `%${params.sector}%`);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryReports(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("reports").select("id, title, report_type, status, created_at, updated_at", { count: "exact" });
  if (params.report_type) query = query.eq("report_type", params.report_type);
  if (params.status) query = query.eq("status", params.status);
  if (params.search) query = query.ilike("title", `%${params.search}%`);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

async function queryCompanies(supabase: any, params: any, offset: number, limit: number, sortBy: string, asc: boolean) {
  let query = supabase.from("scraped_companies").select("*", { count: "exact" });
  if (params.search) query = query.ilike("company_name", `%${params.search}%`);
  if (params.status) query = query.ilike("company_status", `%${params.status}%`);
  query = query.order(sortBy, { ascending: asc }).range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}
