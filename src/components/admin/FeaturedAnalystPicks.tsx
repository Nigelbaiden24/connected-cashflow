import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  Calendar,
  Target,
  AlertTriangle,
  Sparkles,
  Bitcoin,
  Building2,
  BarChart3
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

interface AnalystPick {
  id: string;
  asset_type: 'fund' | 'stock' | 'crypto' | 'alternative';
  asset_id: string;
  asset_name: string;
  asset_symbol?: string;
  analyst_rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  conviction_score: number;
  price_target?: number;
  current_price?: number;
  upside_potential?: number;
  investment_thesis?: string;
  key_catalysts?: string[];
  risk_factors?: string[];
  time_horizon: 'short_term' | 'medium_term' | 'long_term';
  sector?: string;
  market_cap?: string;
  week_start_date: string;
  week_end_date: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const emptyPick: Omit<AnalystPick, 'id' | 'created_at'> = {
  asset_type: 'stock',
  asset_id: '',
  asset_name: '',
  asset_symbol: '',
  analyst_rating: 'buy',
  conviction_score: 7,
  price_target: undefined,
  current_price: undefined,
  upside_potential: undefined,
  investment_thesis: '',
  key_catalysts: [],
  risk_factors: [],
  time_horizon: 'medium_term',
  sector: '',
  market_cap: '',
  week_start_date: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  week_end_date: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  display_order: 1,
  is_active: true,
};

export function FeaturedAnalystPicks() {
  const [picks, setPicks] = useState<AnalystPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPick, setEditingPick] = useState<Partial<AnalystPick> | null>(null);
  const [catalystsInput, setCatalystsInput] = useState('');
  const [risksInput, setRisksInput] = useState('');
  const [activeAssetType, setActiveAssetType] = useState<string>('all');

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_analyst_picks')
        .select('*')
        .order('week_start_date', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPicks((data || []) as AnalystPick[]);
    } catch (error) {
      console.error('Error fetching picks:', error);
      toast.error('Failed to load analyst picks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPick({ ...emptyPick });
    setCatalystsInput('');
    setRisksInput('');
    setDialogOpen(true);
  };

  const handleEdit = (pick: AnalystPick) => {
    setEditingPick(pick);
    setCatalystsInput(pick.key_catalysts?.join(', ') || '');
    setRisksInput(pick.risk_factors?.join(', ') || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pick?')) return;

    try {
      const { error } = await supabase
        .from('featured_analyst_picks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Pick deleted successfully');
      fetchPicks();
    } catch (error) {
      console.error('Error deleting pick:', error);
      toast.error('Failed to delete pick');
    }
  };

  const handleSave = async () => {
    if (!editingPick?.asset_name || !editingPick?.asset_id) {
      toast.error('Please fill in required fields');
      return;
    }

    // Check if we already have 5 picks for this week
    const currentWeekPicks = picks.filter(p => 
      p.week_start_date === editingPick.week_start_date && 
      p.id !== editingPick.id
    );

    if (currentWeekPicks.length >= 5 && !editingPick.id) {
      toast.error('Maximum 5 picks allowed per week');
      return;
    }

    setSaving(true);
    try {
      const pickData = {
        asset_type: editingPick.asset_type,
        asset_id: editingPick.asset_id,
        asset_name: editingPick.asset_name,
        asset_symbol: editingPick.asset_symbol,
        analyst_rating: editingPick.analyst_rating,
        conviction_score: editingPick.conviction_score,
        price_target: editingPick.price_target,
        current_price: editingPick.current_price,
        investment_thesis: editingPick.investment_thesis,
        time_horizon: editingPick.time_horizon,
        sector: editingPick.sector,
        market_cap: editingPick.market_cap,
        week_start_date: editingPick.week_start_date,
        week_end_date: editingPick.week_end_date,
        display_order: editingPick.display_order,
        is_active: editingPick.is_active,
        key_catalysts: catalystsInput.split(',').map(c => c.trim()).filter(Boolean),
        risk_factors: risksInput.split(',').map(r => r.trim()).filter(Boolean),
        upside_potential: editingPick.price_target && editingPick.current_price 
          ? ((editingPick.price_target - editingPick.current_price) / editingPick.current_price * 100)
          : undefined,
      };

      if (editingPick.id) {
        const { error } = await supabase
          .from('featured_analyst_picks')
          .update(pickData)
          .eq('id', editingPick.id);

        if (error) throw error;
        toast.success('Pick updated successfully');
      } else {
        const { error } = await supabase
          .from('featured_analyst_picks')
          .insert(pickData);

        if (error) throw error;
        toast.success('Pick created successfully');
      }

      setDialogOpen(false);
      setEditingPick(null);
      fetchPicks();
    } catch (error) {
      console.error('Error saving pick:', error);
      toast.error('Failed to save pick');
    } finally {
      setSaving(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'strong_buy': return 'bg-green-600 text-white';
      case 'buy': return 'bg-green-500 text-white';
      case 'hold': return 'bg-yellow-500 text-white';
      case 'sell': return 'bg-red-500 text-white';
      case 'strong_sell': return 'bg-red-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'fund': return <BarChart3 className="h-4 w-4" />;
      case 'stock': return <TrendingUp className="h-4 w-4" />;
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      case 'alternative': return <Building2 className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredPicks = activeAssetType === 'all' 
    ? picks 
    : picks.filter(p => p.asset_type === activeAssetType);

  const currentWeekPicks = picks.filter(p => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return p.week_start_date === weekStart;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Featured Analyst Picks</CardTitle>
                <CardDescription>
                  Select up to 5 top picks weekly for funds, stocks, crypto & alternatives
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pick
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{currentWeekPicks.length}/5</p>
                <p className="text-sm text-muted-foreground">This Week's Picks</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {picks.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Picks</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {picks.filter(p => p.analyst_rating === 'strong_buy' || p.analyst_rating === 'buy').length}
                </p>
                <p className="text-sm text-muted-foreground">Buy Ratings</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(picks.map(p => p.week_start_date)).size}
                </p>
                <p className="text-sm text-muted-foreground">Weeks Published</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Tabs value={activeAssetType} onValueChange={setActiveAssetType}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="fund" className="gap-1">
            <BarChart3 className="h-3 w-3" /> Funds
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-1">
            <TrendingUp className="h-3 w-3" /> Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" className="gap-1">
            <Bitcoin className="h-3 w-3" /> Crypto
          </TabsTrigger>
          <TabsTrigger value="alternative" className="gap-1">
            <Building2 className="h-3 w-3" /> Alt
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Picks List */}
      <div className="grid gap-4">
        {filteredPicks.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No picks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Pick" to create your first analyst pick
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPicks.map((pick) => (
            <Card key={pick.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
                      {getAssetIcon(pick.asset_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{pick.asset_name}</h3>
                        {pick.asset_symbol && (
                          <Badge variant="outline">{pick.asset_symbol}</Badge>
                        )}
                        <Badge className={getRatingColor(pick.analyst_rating)}>
                          {pick.analyst_rating.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {pick.asset_type}
                        </Badge>
                        {!pick.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Conviction: {pick.conviction_score}/10
                        </span>
                        {pick.upside_potential && (
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            {pick.upside_potential.toFixed(1)}% upside
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Week of {format(new Date(pick.week_start_date), 'MMM d')}
                        </span>
                      </div>
                      {pick.investment_thesis && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {pick.investment_thesis}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pick)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(pick.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingPick?.id ? 'Edit Analyst Pick' : 'Create Analyst Pick'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type *</Label>
                  <Select
                    value={editingPick?.asset_type}
                    onValueChange={(value: any) => setEditingPick(prev => ({ ...prev, asset_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fund">Fund</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="alternative">Alternative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asset ID/ISIN *</Label>
                  <Input
                    value={editingPick?.asset_id || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, asset_id: e.target.value }))}
                    placeholder="e.g., AAPL, GB00B3X7QG63"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Name *</Label>
                  <Input
                    value={editingPick?.asset_name || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, asset_name: e.target.value }))}
                    placeholder="e.g., Apple Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Symbol/Ticker</Label>
                  <Input
                    value={editingPick?.asset_symbol || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, asset_symbol: e.target.value }))}
                    placeholder="e.g., AAPL"
                  />
                </div>
              </div>

              {/* Rating & Scoring */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Analyst Rating *</Label>
                  <Select
                    value={editingPick?.analyst_rating}
                    onValueChange={(value: any) => setEditingPick(prev => ({ ...prev, analyst_rating: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong_buy">Strong Buy</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="strong_sell">Strong Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conviction Score (1-10) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={editingPick?.conviction_score || 7}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, conviction_score: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Horizon</Label>
                  <Select
                    value={editingPick?.time_horizon}
                    onValueChange={(value: any) => setEditingPick(prev => ({ ...prev, time_horizon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select horizon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short Term (&lt;3 months)</SelectItem>
                      <SelectItem value="medium_term">Medium Term (3-12 months)</SelectItem>
                      <SelectItem value="long_term">Long Term (&gt;12 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Current Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingPick?.current_price || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, current_price: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Target</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingPick?.price_target || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, price_target: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upside Potential</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                    {editingPick?.price_target && editingPick?.current_price
                      ? `${(((editingPick.price_target - editingPick.current_price) / editingPick.current_price) * 100).toFixed(1)}%`
                      : 'Auto-calculated'}
                  </div>
                </div>
              </div>

              {/* Sector & Market Cap */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Input
                    value={editingPick?.sector || ''}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Market Cap</Label>
                  <Select
                    value={editingPick?.market_cap || ''}
                    onValueChange={(value) => setEditingPick(prev => ({ ...prev, market_cap: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select market cap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mega">Mega Cap (&gt;$200B)</SelectItem>
                      <SelectItem value="large">Large Cap ($10B-$200B)</SelectItem>
                      <SelectItem value="mid">Mid Cap ($2B-$10B)</SelectItem>
                      <SelectItem value="small">Small Cap ($300M-$2B)</SelectItem>
                      <SelectItem value="micro">Micro Cap (&lt;$300M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Week Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Week Start Date *</Label>
                  <Input
                    type="date"
                    value={editingPick?.week_start_date || ''}
                    onChange={(e) => {
                      const startDate = new Date(e.target.value);
                      const endDate = addDays(startDate, 6);
                      setEditingPick(prev => ({ 
                        ...prev, 
                        week_start_date: e.target.value,
                        week_end_date: format(endDate, 'yyyy-MM-dd')
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Week End Date</Label>
                  <Input
                    type="date"
                    value={editingPick?.week_end_date || ''}
                    disabled
                  />
                </div>
              </div>

              {/* Investment Thesis */}
              <div className="space-y-2">
                <Label>Investment Thesis</Label>
                <Textarea
                  value={editingPick?.investment_thesis || ''}
                  onChange={(e) => setEditingPick(prev => ({ ...prev, investment_thesis: e.target.value }))}
                  placeholder="Explain the investment case for this pick..."
                  rows={4}
                />
              </div>

              {/* Key Catalysts */}
              <div className="space-y-2">
                <Label>Key Catalysts (comma-separated)</Label>
                <Textarea
                  value={catalystsInput}
                  onChange={(e) => setCatalystsInput(e.target.value)}
                  placeholder="e.g., New product launch, Earnings beat, M&A activity"
                  rows={2}
                />
              </div>

              {/* Risk Factors */}
              <div className="space-y-2">
                <Label>Risk Factors (comma-separated)</Label>
                <Textarea
                  value={risksInput}
                  onChange={(e) => setRisksInput(e.target.value)}
                  placeholder="e.g., Competition, Regulatory risk, Valuation concerns"
                  rows={2}
                />
              </div>

              {/* Display Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editingPick?.display_order || 1}
                    onChange={(e) => setEditingPick(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingPick?.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => setEditingPick(prev => ({ ...prev, is_active: value === 'active' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPick?.id ? 'Update Pick' : 'Create Pick'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}