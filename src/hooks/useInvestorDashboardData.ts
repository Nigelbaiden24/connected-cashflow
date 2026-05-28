import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchDashboardData() {
  const [resRes, comRes, portRes, newsRes, learnRes, repRes, oppRes] = await Promise.all([
    supabase
      .from("asset_research_reports")
      .select("id, asset_name, asset_symbol, asset_type, overall_quality_score, created_at, confidence_level")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("market_commentary")
      .select("id, title, description, thumbnail_url, published_date, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("model_portfolios")
      .select("id, title, description, thumbnail_url, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("newsletters")
      .select("id, title, category, preview, published_date, created_at, read_time, edition")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("learning_content")
      .select("id, title, description, category, thumbnail_url, difficulty_level, duration, view_count, created_at, is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("purchasable_reports")
      .select("id, title, description, thumbnail_url, category, price_cents, currency, download_count, featured, author_name, reading_time, created_at, tags, is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20),
    // Fetch a wider set so analytics reflect ALL active promoted products, not just top 20 by score.
    supabase
      .from("opportunity_products")
      .select("id, title, short_description, category, sub_category, price, price_currency, location, overall_conviction_score, analyst_rating, thumbnail_url, strengths, risk_score, value_score, quality_score, status, source, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return {
    researchReports: resRes.data || [],
    commentary: comRes.data || [],
    portfolios: portRes.data || [],
    newsletters: newsRes.data || [],
    learningContent: learnRes.data || [],
    purchasableReports: repRes.data || [],
    opportunities: oppRes.data || [],
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function useInvestorDashboardData() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["investor-dashboard-data"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
  });

  const researchReports = data?.researchReports ?? [];
  const commentary = data?.commentary ?? [];
  const portfolios = data?.portfolios ?? [];
  const newsletters = data?.newsletters ?? [];
  const learningContent = data?.learningContent ?? [];
  const purchasableReports = data?.purchasableReports ?? [];
  const opportunities = data?.opportunities ?? [];

  // High-conviction subset for legacy "Pitchbook deal flow" widget — keeps prior visual ordering.
  const topConvictionOpportunities = useMemo(
    () =>
      [...opportunities]
        .sort((a: any, b: any) => (b.overall_conviction_score ?? 0) - (a.overall_conviction_score ?? 0))
        .slice(0, 20),
    [opportunities]
  );

  // Recently promoted = pushed via Data Pipeline (source='pipeline'), newest first.
  const recentlyPromoted = useMemo(
    () => opportunities.filter((o: any) => o.source === "pipeline").slice(0, 24),
    [opportunities]
  );

  const analytics = useMemo(() => {
    const now = Date.now();
    const last7dCutoff = now - 7 * DAY_MS;
    const last30dCutoff = now - 30 * DAY_MS;

    const contentCounts = [
      { name: "Research", value: researchReports.length, color: "#3b82f6" },
      { name: "Commentary", value: commentary.length, color: "#10b981" },
      { name: "Portfolios", value: portfolios.length, color: "#8b5cf6" },
      { name: "Newsletters", value: newsletters.length, color: "#f59e0b" },
      { name: "Learning", value: learningContent.length, color: "#06b6d4" },
      { name: "Reports", value: purchasableReports.length, color: "#ec4899" },
      { name: "Opportunities", value: opportunities.length, color: "#22d3ee" },
    ].filter((c) => c.value > 0);

    // Category breakdown across ALL active opportunities (promoted + curated).
    const categoryBreakdown = opportunities.reduce<Record<string, number>>((acc, o: any) => {
      const cat = o.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const categoryChartData = Object.entries(categoryBreakdown)
      .map(([name, count]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Promotion timeline — new opportunities per day for last 14 days.
    const timelineMap = new Map<string, { promoted: number; curated: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      timelineMap.set(key, { promoted: 0, curated: 0 });
    }
    opportunities.forEach((o: any) => {
      if (!o.created_at) return;
      const key = o.created_at.slice(0, 10);
      const bucket = timelineMap.get(key);
      if (!bucket) return;
      if (o.source === "pipeline") bucket.promoted += 1;
      else bucket.curated += 1;
    });
    const promotionTimeline = Array.from(timelineMap.entries()).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      promoted: v.promoted,
      curated: v.curated,
    }));

    // Promoted product KPIs.
    const promoted = opportunities.filter((o: any) => o.source === "pipeline");
    const promoted7d = promoted.filter(
      (o: any) => o.created_at && new Date(o.created_at).getTime() >= last7dCutoff
    );
    const promoted30d = promoted.filter(
      (o: any) => o.created_at && new Date(o.created_at).getTime() >= last30dCutoff
    );
    const convictionScores = promoted
      .map((o: any) => Number(o.overall_conviction_score))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    const avgConviction = convictionScores.length
      ? convictionScores.reduce((s, n) => s + n, 0) / convictionScores.length
      : 0;
    const promotedCategories = new Set(promoted.map((o: any) => o.category).filter(Boolean));

    const promotedKpis = {
      total: promoted.length,
      last7d: promoted7d.length,
      last30d: promoted30d.length,
      avgConviction: Number(avgConviction.toFixed(2)),
      categoriesCovered: promotedCategories.size,
      curatedTotal: opportunities.length - promoted.length,
    };

    // Rating distribution among promoted products.
    const ratingOrder = ["Gold", "Silver", "Bronze", "Neutral", "Negative"];
    const ratingCounts: Record<string, number> = {};
    promoted.forEach((o: any) => {
      const r = (o.analyst_rating as string) || "Neutral";
      ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    });
    const ratingColors: Record<string, string> = {
      Gold: "#f5b301",
      Silver: "#9ca3af",
      Bronze: "#b45309",
      Neutral: "#6b7280",
      Negative: "#ef4444",
    };
    const ratingDistribution = ratingOrder
      .filter((r) => ratingCounts[r])
      .map((r) => ({ name: r, value: ratingCounts[r], fill: ratingColors[r] }));

    const totalViews = learningContent.reduce((s: number, l: any) => s + (l.view_count || 0), 0);
    const totalDownloads = purchasableReports.reduce(
      (s: number, r: any) => s + (r.download_count || 0),
      0
    );
    const totalContent = contentCounts.reduce((s, c) => s + c.value, 0);

    const engagementData = [
      { name: "Content Views", value: totalViews, fill: "#3b82f6" },
      { name: "Downloads", value: totalDownloads, fill: "#10b981" },
      { name: "Promoted (30d)", value: promoted30d.length, fill: "#f59e0b" },
      { name: "Active Opps", value: opportunities.length, fill: "#8b5cf6" },
    ];

    return {
      contentCounts,
      categoryBreakdown: categoryChartData,
      engagementData,
      totalContent,
      promotionTimeline,
      promotedKpis,
      ratingDistribution,
    };
  }, [researchReports, commentary, portfolios, newsletters, learningContent, purchasableReports, opportunities]);

  return {
    researchReports,
    commentary,
    portfolios,
    newsletters,
    learningContent,
    purchasableReports,
    opportunities: topConvictionOpportunities,
    recentlyPromoted,
    loading,
    analytics,
  };
}
