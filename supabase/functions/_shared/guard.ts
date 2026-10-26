// Access guard for edge functions that spend AI or Firecrawl credits.
// These functions run with verify_jwt = false, so without this check anyone
// holding the public anon key could trigger them.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export type Caller =
  | { kind: "internal" }                 // another edge function, using the service key
  | { kind: "admin"; userId: string }
  | { kind: "user"; userId: string }
  | { kind: "anonymous" };               // pg_cron and the public

function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const m = h?.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function identify(req: Request): Promise<Caller> {
  const token = bearer(req);
  if (!token) return { kind: "anonymous" };
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && token === serviceKey) return { kind: "internal" };

  const url = Deno.env.get("SUPABASE_URL");
  if (!url || !serviceKey) return { kind: "anonymous" };
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return { kind: "anonymous" };
  const { data: role } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return role ? { kind: "admin", userId: data.user.id } : { kind: "user", userId: data.user.id };
}

function deny(status: number, message: string, cors: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Returns a 401/403 Response to send back, or null when an admin (or another
// edge function) is calling.
export async function requireAdmin(req: Request, cors: Record<string, string>): Promise<Response | null> {
  const caller = await identify(req);
  if (caller.kind === "admin" || caller.kind === "internal") return null;
  if (caller.kind === "user") return deny(403, "Admin access required", cors);
  return deny(401, "Sign in as an admin to run this", cors);
}

// Headers for one edge function calling another with the service key.
export function internalHeaders(): Record<string, string> {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" };
}
