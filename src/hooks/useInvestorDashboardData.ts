import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchDashboardData() {
  const [resRes, comRes, portRes, newsRes, learnRes, repRes, oppRes] = await Promise.all([
    supabase.from("asset_research_reports").select("id, asset_name, asset_symbol, asset_type, overall_quality_score, created_at, confidence_level").order("created_at", { ascending: false }).limit(20),
    supabase.from("market_commentary").select("id, title, description, thumbnail_url, published_date, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("model_portfolios").select("id, title, description, thumbnail_url, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("newsletters").select("id, title, category, preview, published_date, created_at, read_time, edition").order("created_at", { ascending: false }).limit(20),
    supabase.from("learning_content").select("id, title, description, category, thumbnail_url, difficulty_level, duration, view_count, created_at, is_published").eq("is_published", true).order("created_at", { ascending: false }).limit(20),
    supabase.from("purchasable_reports").select("id, title, description, thumbnail_url, category, price_cents, currency, download_count, featured, author_name, reading_time, created_at, tags, is_published").eq("is_published", true).order("created_at", { ascending: false }).limit(20),
    supabase.from("opportunity_products").select("id, title, short_description, category, sub_category, price, price_currency, location, overall_conviction_score, analyst_rating, thumbnail_url, strengths, risk_score, value_score, quality_score, status").eq("status", "active").order("overall_conviction_score", { ascending: false }).limit(20),
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

  const analytics = useMemo(() => {
    const contentCounts = [
      { name: "Research", value: researchReports.length, color: "#3b82f6" },
      { name: "Commentary", value: commentary.length, color: "#10b981" },
      { name: "Portfolios", value: portfolios.length, color: "#8b5cf6" },
      { name: "Newsletters", value: newsletters.length, color: "#f59e0b" },
      { name: "Learning", value: learningContent.length, color: "#06b6d4" },
      { name: "Reports", value: purchasableReports.length, color: "#ec4899" },
    ].filter(c => c.value > 0);

    const categoryBreakdown = opportunities.reduce<Record<string, number>>((acc, o: any) => {
      const cat = o.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const categoryChartData = Object.entries(categoryBreakdown)
      .map(([name, count]) => ({ name: name.replace(/_/g, " "), count }))
      .sort((a, b) => b.count - a.count);

    const totalViews = learningContent.reduce((s: number, l: any) => s + (l.view_count || 0), 0);
    const totalDownloads = purchasableReports.reduce((s: number, r: any) => s + (r.download_count || 0), 0);
    const totalContent = contentCounts.reduce((s, c) => s + c.value, 0);
    const totalDeals = opportunities.length;

    const engagementData = [
      { name: "Content Views", value: totalViews, fill: "#3b82f6" },
      { name: "Downloads", value: totalDownloads, fill: "#10b981" },
      { name: "Active Deals", value: totalDeals, fill: "#f59e0b" },
      { name: "Total Content", value: totalContent, fill: "#8b5cf6" },
    ];

    return { contentCounts, categoryBreakdown: categoryChartData, engagementData, totalContent };
  }, [researchReports, commentary, portfolios, newsletters, learningContent, purchasableReports, opportunities]);

  return {
    researchReports,
    commentary,
    portfolios,
    newsletters,
    learningContent,
    purchasableReports,
    opportunities,
    loading,
    analytics,
  };
}
