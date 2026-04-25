import {
  Users, MessageSquare, Calendar, FileText, Newspaper, TrendingUp, BookOpen,
  Video, List, Shield, Bell, ShoppingBag, Star, Lightbulb, Bitcoin, FlaskConical,
  Sparkles, Bot, Contact, ClipboardList, Globe, Settings, Radar, Calculator,
  Zap, Briefcase, Database, Building2, Activity, Crosshair, Archive,
} from "lucide-react";

export type AdminPlatform = "finance" | "investor";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  platforms: AdminPlatform[]; // which platform(s) this module belongs to
}

/**
 * Admin modules grouped by platform relevance.
 * - "finance": filings, advice, planning, content delivery
 * - "investor": deal flow, signals, discovery, intelligence
 * - both: shared operational tools (Planner, Settings, Security, etc.)
 */
export const adminNavItems: AdminNavItem[] = [
  // ── Shared (operational) ──────────────────────────────────────────────
  { id: "planner", label: "Planner", icon: ClipboardList, gradient: "from-indigo-500 to-purple-600", platforms: ["finance", "investor"] },
  { id: "flowpulse-scraper", label: "FlowPulse Scraper", icon: Crosshair, gradient: "from-fuchsia-500 to-rose-600", platforms: ["finance", "investor"] },
  { id: "saved-scrapes", label: "Saved Scrapes", icon: Archive, gradient: "from-rose-500 to-pink-600", platforms: ["finance", "investor"] },
  { id: "users", label: "Users", icon: Users, gradient: "from-blue-500 to-blue-600", platforms: ["finance", "investor"] },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare, gradient: "from-orange-500 to-orange-600", platforms: ["finance", "investor"] },
  { id: "demo-requests", label: "Demo Requests", icon: Calendar, gradient: "from-slate-500 to-slate-600", platforms: ["finance", "investor"] },
  { id: "news", label: "News", icon: Newspaper, gradient: "from-emerald-500 to-emerald-600", platforms: ["finance", "investor"] },
  { id: "calendar", label: "Calendar", icon: Calendar, gradient: "from-blue-500 to-cyan-600", platforms: ["finance", "investor"] },
  { id: "security", label: "Security", icon: Shield, gradient: "from-red-500 to-red-600", platforms: ["finance", "investor"] },
  { id: "automation-center", label: "Automation Center", icon: Zap, gradient: "from-violet-500 to-purple-600", platforms: ["finance", "investor"] },
  { id: "api-management", label: "API Management", icon: Globe, gradient: "from-emerald-500 to-teal-600", platforms: ["finance", "investor"] },
  { id: "push-notifications", label: "Push Notifications", icon: Bell, gradient: "from-rose-500 to-orange-600", platforms: ["finance", "investor"] },
  { id: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-700", platforms: ["finance", "investor"] },

  // ── FlowPulse Finance ─────────────────────────────────────────────────
  { id: "featured-picks", label: "Featured Picks", icon: Star, gradient: "from-amber-500 to-orange-600", platforms: ["finance"] },
  { id: "pdf-generator", label: "PDF Generator", icon: FileText, gradient: "from-rose-500 to-pink-600", platforms: ["finance"] },
  { id: "reports", label: "Reports", icon: FileText, gradient: "from-indigo-500 to-indigo-600", platforms: ["finance"] },
  { id: "newsletters", label: "Newsletters", icon: Newspaper, gradient: "from-emerald-500 to-emerald-600", platforms: ["finance"] },
  { id: "portfolios", label: "Portfolios", icon: TrendingUp, gradient: "from-cyan-500 to-cyan-600", platforms: ["finance"] },
  { id: "commentary", label: "Commentary", icon: FileText, gradient: "from-violet-500 to-violet-600", platforms: ["finance"] },
  { id: "learning", label: "Learning", icon: BookOpen, gradient: "from-pink-500 to-pink-600", platforms: ["finance"] },
  { id: "videos", label: "Videos", icon: Video, gradient: "from-red-500 to-red-600", platforms: ["finance"] },
  { id: "watchlists", label: "Watchlists", icon: List, gradient: "from-teal-500 to-teal-600", platforms: ["finance"] },
  { id: "compliance", label: "Compliance Management", icon: Shield, gradient: "from-emerald-500 to-emerald-600", platforms: ["finance"] },
  { id: "risk-compliance", label: "Risk & Compliance", icon: Shield, gradient: "from-amber-500 to-amber-600", platforms: ["finance"] },
  { id: "market-trends", label: "Market Trends", icon: TrendingUp, gradient: "from-lime-500 to-lime-600", platforms: ["finance"] },
  { id: "purchasable-reports", label: "Lead Magnet Reports", icon: ShoppingBag, gradient: "from-emerald-500 to-emerald-600", platforms: ["finance"] },
  { id: "insights-requests", label: "Insights Access Requests", icon: Sparkles, gradient: "from-indigo-500 to-blue-600", platforms: ["finance"] },
  { id: "fund-scoring", label: "Fund Scoring", icon: Star, gradient: "from-amber-500 to-amber-600", platforms: ["finance"] },
  { id: "fund-analyst", label: "Fund Analyst", icon: TrendingUp, gradient: "from-teal-500 to-teal-600", platforms: ["finance"] },
  { id: "document-generator", label: "Document Generator", icon: Sparkles, gradient: "from-violet-500 to-violet-600", platforms: ["finance"] },
  { id: "crm", label: "CRM", icon: Contact, gradient: "from-blue-500 to-blue-600", platforms: ["finance"] },
  { id: "payroll", label: "Payroll", icon: Calculator, gradient: "from-teal-500 to-teal-600", platforms: ["finance"] },
  { id: "company-intelligence", label: "Company Intelligence", icon: Briefcase, gradient: "from-teal-500 to-teal-600", platforms: ["finance"] },

  // ── FlowPulse Investor ────────────────────────────────────────────────
  { id: "opportunities", label: "Opportunities", icon: Lightbulb, gradient: "from-purple-500 to-purple-600", platforms: ["finance", "investor"] },
  { id: "ai-scanner", label: "AI Scanner", icon: Radar, gradient: "from-indigo-500 to-purple-700", platforms: ["investor"] },
  { id: "stocks-crypto", label: "Stocks & Crypto", icon: Bitcoin, gradient: "from-cyan-500 to-cyan-600", platforms: ["investor"] },
  { id: "research-engine", label: "Research Engine", icon: FlaskConical, gradient: "from-indigo-500 to-indigo-600", platforms: ["investor"] },
  { id: "research-ai", label: "Research AI", icon: Bot, gradient: "from-rose-500 to-pink-600", platforms: ["investor"] },
  { id: "research-scraper", label: "Research Scraper", icon: Globe, gradient: "from-sky-500 to-blue-600", platforms: ["investor"] },
  { id: "alerts", label: "Signals & Alerts", icon: Bell, gradient: "from-rose-500 to-rose-600", platforms: ["investor"] },
  { id: "investor-finder", label: "Investor Finder", icon: Users, gradient: "from-violet-500 to-purple-600", platforms: ["investor"] },
  { id: "startup-discovery", label: "Startup Discovery", icon: Sparkles, gradient: "from-emerald-500 to-emerald-600", platforms: ["investor"] },
  // New Phase 5 modules (UI placeholders surface in Phase 5)
  { id: "deal-flow", label: "Deal Flow Intelligence", icon: Activity, gradient: "from-fuchsia-500 to-pink-600", platforms: ["investor"] },
  { id: "company-registry", label: "Company Registry", icon: Building2, gradient: "from-blue-500 to-indigo-600", platforms: ["investor"] },
  { id: "funding-signals", label: "Funding Signals", icon: Database, gradient: "from-amber-500 to-rose-600", platforms: ["investor"] },
];

export const platformMeta: Record<AdminPlatform, { label: string; tagline: string; gradient: string }> = {
  finance: {
    label: "FlowPulse Finance",
    tagline: "Advisor & client operations",
    gradient: "from-blue-600 to-cyan-600",
  },
  investor: {
    label: "FlowPulse Investor",
    tagline: "Deal flow & market intelligence",
    gradient: "from-violet-600 to-fuchsia-600",
  },
};

export const filterNavByPlatform = (platform: AdminPlatform): AdminNavItem[] =>
  adminNavItems.filter((item) => item.platforms.includes(platform));
