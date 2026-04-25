import { supabase } from "@/integrations/supabase/client";

export type ScrapeSource =
  | "financial-research"
  | "companies-house"
  | "uk-investors"
  | "opportunity-engine"
  | "ai-scanner"
  | "investor-research"
  | "elite-analyst"
  | "opportunity-upload";

export interface SaveScrapeArgs {
  source: ScrapeSource;
  platform?: "finance" | "investor" | null;
  title: string;
  category?: string;
  subCategory?: string | null;
  customQuery?: string | null;
  payload: unknown;
  sources?: unknown;
  opportunities?: unknown;
  opportunitiesCount?: number;
  rawOutput?: string | null;
  marketContext?: string | null;
}

/**
 * Auto-save a scrape result to admin_scrape_history.
 * Silent — never throws into the UI; logs failures to console.
 */
export async function saveScrapeResult(args: SaveScrapeArgs): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("admin_scrape_history").insert({
      user_id: user?.id ?? null,
      source: args.source,
      platform: args.platform ?? null,
      title: args.title.slice(0, 240),
      category: args.category ?? args.source,
      sub_category: args.subCategory ?? null,
      custom_query: args.customQuery ?? null,
      payload: (args.payload ?? null) as never,
      sources: (args.sources ?? null) as never,
      opportunities: (args.opportunities ?? null) as never,
      opportunities_count: args.opportunitiesCount ?? null,
      raw_output: args.rawOutput ?? null,
      market_context: args.marketContext ?? null,
      research_date: new Date().toISOString(),
      status: "saved",
    });
    if (error) console.warn("[saveScrapeResult] insert failed:", error.message);
  } catch (e) {
    console.warn("[saveScrapeResult] unexpected:", e);
  }
}
