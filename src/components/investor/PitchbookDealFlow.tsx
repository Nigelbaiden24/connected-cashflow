import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, MapPin, ArrowUpRight, Briefcase, Shield, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

interface Deal {
  id: string;
  title: string;
  category: string;
  sub_category: string;
  price: number | null;
  price_currency: string | null;
  location: string | null;
  overall_conviction_score: number | null;
  analyst_rating: string | null;
  thumbnail_url: string | null;
  short_description: string | null;
  strengths: string | null;
  risk_score: number | null;
  value_score: number | null;
  quality_score: number | null;
}

interface PitchbookDealFlowProps {
  deals: Deal[];
  loading: boolean;
}

const ratingConfig: Record<string, { color: string; bg: string }> = {
  Gold: { color: "text-amber-500", bg: "bg-amber-500/15 border-amber-500/30" },
  Silver: { color: "text-slate-400", bg: "bg-slate-400/15 border-slate-400/30" },
  Bronze: { color: "text-orange-500", bg: "bg-orange-500/15 border-orange-500/30" },
};

export function PitchbookDealFlow({ deals, loading }: PitchbookDealFlowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/finance") ? "/finance/opportunities" : "/investor/opportunities";

  const topDeals = deals
    .filter(d => d.overall_conviction_score != null)
    .sort((a, b) => (b.overall_conviction_score || 0) - (a.overall_conviction_score || 0))
    .slice(0, 6);

  const scoreChartData = topDeals.map(d => ({
    name: d.title.length > 12 ? d.title.slice(0, 12) + "…" : d.title,
    conviction: d.overall_conviction_score || 0,
    risk: d.risk_score || 0,
    value: d.value_score || 0,
  }));

  if (loading || deals.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 px-1">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">Pitchbook Deal Flow</h3>
          <p className="text-xs text-muted-foreground">Top-rated investment opportunities — conviction scores & analytics</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Deal Cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topDeals.map((deal) => (
            <Card
              key={deal.id}
              className="group border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => navigate(`${basePath}/${deal.id}`)}
            >
              {/* Header gradient */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
              <CardContent className="p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{deal.title}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1">{deal.sub_category}</Badge>
                      {deal.location && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />{deal.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {deal.analyst_rating && (
                    <Badge className={`text-[8px] h-4 px-1.5 border ${ratingConfig[deal.analyst_rating]?.bg || "bg-muted"}`}>
                      <Star className={`h-2.5 w-2.5 mr-0.5 ${ratingConfig[deal.analyst_rating]?.color || ""}`} />
                      {deal.analyst_rating}
                    </Badge>
                  )}
                </div>

                {/* Score bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Conviction</span>
                    <span className="font-bold text-primary">{deal.overall_conviction_score}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
                      style={{ width: `${(deal.overall_conviction_score || 0) * 10}%` }}
                    />
                  </div>
                </div>

                {/* Mini metrics */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[
                    { label: "Value", val: deal.value_score },
                    { label: "Quality", val: deal.quality_score },
                    { label: "Risk", val: deal.risk_score },
                  ].map((m, i) => (
                    <div key={i} className="p-1 rounded bg-muted/40 text-[9px]">
                      <p className="text-muted-foreground">{m.label}</p>
                      <p className="font-bold">{m.val ?? "—"}/10</p>
                    </div>
                  ))}
                </div>

                {deal.price != null && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <span className="text-xs font-bold">
                      {deal.price_currency || "£"}{deal.price.toLocaleString()}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score comparison chart */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Deal Score Comparison</CardTitle>
            <CardDescription className="text-xs">Conviction vs Risk vs Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChartData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-35} textAnchor="end" interval={0}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 10]} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-xs font-bold mb-1">{label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} className="text-xs" style={{ color: p.fill }}>
                              {p.name}: {p.value}/10
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="conviction" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={10} animationDuration={1200} name="Conviction" />
                  <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} barSize={10} animationDuration={1400} name="Value" />
                  <Bar dataKey="risk" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={10} animationDuration={1600} name="Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Conviction</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Value</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Risk</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
