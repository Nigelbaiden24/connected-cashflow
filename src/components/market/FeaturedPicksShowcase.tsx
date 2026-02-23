import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentShowcase, ShowcaseItem } from "@/components/showcase/ContentShowcase";
import { Sparkles, TrendingUp, BarChart3, Bitcoin, Building2, Loader2 } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturedPicksShowcase() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('featured_analyst_picks')
          .select('*')
          .eq('is_active', true)
          .gte('week_end_date', currentWeekStart)
          .order('display_order', { ascending: true })
          .limit(5);
        if (error) throw error;
        setPicks(data || []);
      } catch (error) {
        console.error('Error fetching picks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPicks();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'fund': return <BarChart3 className="h-10 w-10" />;
      case 'stock': return <TrendingUp className="h-10 w-10" />;
      case 'crypto': return <Bitcoin className="h-10 w-10" />;
      case 'alternative': return <Building2 className="h-10 w-10" />;
      default: return <Sparkles className="h-10 w-10" />;
    }
  };

  const getRatingLabel = (rating: string) => rating.replace('_', ' ').toUpperCase();

  const items: ShowcaseItem[] = picks.map((pick) => ({
    id: pick.id,
    title: pick.asset_name,
    subtitle: pick.asset_symbol || pick.sector,
    description: pick.investment_thesis || `${getRatingLabel(pick.analyst_rating)} | Conviction: ${pick.conviction_score}/10`,
    icon: getAssetIcon(pick.asset_type),
    badges: [
      { label: getRatingLabel(pick.analyst_rating), className: "bg-primary text-primary-foreground" },
      ...(pick.sector ? [{ label: pick.sector }] : []),
    ],
    stats: [
      { label: "Conviction", value: `${pick.conviction_score}/10`, className: "text-primary" },
      ...(pick.current_price ? [{ label: "Price", value: `$${pick.current_price.toFixed(2)}` }] : []),
      ...(pick.upside_potential ? [{ label: "Upside", value: `${pick.upside_potential.toFixed(1)}%`, className: "text-green-600" }] : []),
    ],
  }));

  return (
    <ContentShowcase
      items={items}
      emptyMessage="No analyst picks available this week"
    />
  );
}
