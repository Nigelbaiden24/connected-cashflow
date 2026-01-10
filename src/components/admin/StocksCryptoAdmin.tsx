import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Save, 
  Trash2, 
  Bitcoin, 
  BarChart3, 
  Star, 
  Edit2,
  TrendingUp,
  DollarSign,
  Loader2,
  RefreshCw
} from "lucide-react";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

interface StockCryptoForm {
  symbol: string;
  name: string;
  asset_type: 'stock' | 'crypto';
  description: string;
  current_price: string;
  price_currency: string;
  market_cap: string;
  volume_24h: string;
  price_change_24h: string;
  price_change_7d: string;
  price_change_30d: string;
  price_change_1y: string;
  exchange: string;
  sector: string;
  industry: string;
  pe_ratio: string;
  dividend_yield: string;
  blockchain: string;
  consensus_mechanism: string;
  logo_url: string;
  analyst_rating: AnalystRating | '';
  rating_rationale: string;
  score_fundamentals: number;
  score_technicals: number;
  score_momentum: number;
  score_risk: number;
  investment_thesis: string;
  strengths: string;
  risks: string;
  suitable_investor_type: string;
  key_watchpoints: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
}

const initialForm: StockCryptoForm = {
  symbol: '',
  name: '',
  asset_type: 'stock',
  description: '',
  current_price: '',
  price_currency: 'USD',
  market_cap: '',
  volume_24h: '',
  price_change_24h: '',
  price_change_7d: '',
  price_change_30d: '',
  price_change_1y: '',
  exchange: '',
  sector: '',
  industry: '',
  pe_ratio: '',
  dividend_yield: '',
  blockchain: '',
  consensus_mechanism: '',
  logo_url: '',
  analyst_rating: '',
  rating_rationale: '',
  score_fundamentals: 0,
  score_technicals: 0,
  score_momentum: 0,
  score_risk: 0,
  investment_thesis: '',
  strengths: '',
  risks: '',
  suitable_investor_type: '',
  key_watchpoints: '',
  status: 'draft',
  is_featured: false,
};

const stockSectors = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Discretionary', 
  'Consumer Staples', 'Energy', 'Materials', 'Industrials', 
  'Utilities', 'Real Estate', 'Communication Services'
];

const stockExchanges = [
  'NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKSE', 'SSE', 'Euronext', 'BSE', 'NSE'
];

const cryptoBlockchains = [
  'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polkadot', 
  'Avalanche', 'Polygon', 'BNB Chain', 'Cosmos', 'Tron'
];

export function StocksCryptoAdmin() {
  const [form, setForm] = useState<StockCryptoForm>(initialForm);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks_crypto')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    const scores = [form.score_fundamentals, form.score_technicals, form.score_momentum, form.score_risk];
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  };

  const handleSubmit = async () => {
    if (!form.symbol || !form.name) {
      toast.error('Please fill in required fields (Symbol and Name)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        asset_type: form.asset_type,
        description: form.description || null,
        current_price: form.current_price ? parseFloat(form.current_price) : null,
        price_currency: form.price_currency,
        market_cap: form.market_cap ? parseFloat(form.market_cap) : null,
        volume_24h: form.volume_24h ? parseFloat(form.volume_24h) : null,
        price_change_24h: form.price_change_24h ? parseFloat(form.price_change_24h) : null,
        price_change_7d: form.price_change_7d ? parseFloat(form.price_change_7d) : null,
        price_change_30d: form.price_change_30d ? parseFloat(form.price_change_30d) : null,
        price_change_1y: form.price_change_1y ? parseFloat(form.price_change_1y) : null,
        exchange: form.exchange || null,
        sector: form.sector || null,
        industry: form.industry || null,
        pe_ratio: form.pe_ratio ? parseFloat(form.pe_ratio) : null,
        dividend_yield: form.dividend_yield ? parseFloat(form.dividend_yield) : null,
        blockchain: form.blockchain || null,
        consensus_mechanism: form.consensus_mechanism || null,
        logo_url: form.logo_url || null,
        analyst_rating: form.analyst_rating || null,
        rating_rationale: form.rating_rationale || null,
        score_fundamentals: form.score_fundamentals || null,
        score_technicals: form.score_technicals || null,
        score_momentum: form.score_momentum || null,
        score_risk: form.score_risk || null,
        overall_score: calculateOverallScore() || null,
        investment_thesis: form.investment_thesis || null,
        strengths: form.strengths || null,
        risks: form.risks || null,
        suitable_investor_type: form.suitable_investor_type || null,
        key_watchpoints: form.key_watchpoints || null,
        status: form.status,
        is_featured: form.is_featured,
      };

      if (editingId) {
        const { error } = await supabase
          .from('stocks_crypto')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Asset updated successfully');
      } else {
        const { error } = await supabase
          .from('stocks_crypto')
          .insert([payload]);

        if (error) throw error;
        toast.success('Asset created successfully');
      }

      setForm(initialForm);
      setEditingId(null);
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (asset: any) => {
    setEditingId(asset.id);
    setForm({
      symbol: asset.symbol || '',
      name: asset.name || '',
      asset_type: asset.asset_type || 'stock',
      description: asset.description || '',
      current_price: asset.current_price?.toString() || '',
      price_currency: asset.price_currency || 'USD',
      market_cap: asset.market_cap?.toString() || '',
      volume_24h: asset.volume_24h?.toString() || '',
      price_change_24h: asset.price_change_24h?.toString() || '',
      price_change_7d: asset.price_change_7d?.toString() || '',
      price_change_30d: asset.price_change_30d?.toString() || '',
      price_change_1y: asset.price_change_1y?.toString() || '',
      exchange: asset.exchange || '',
      sector: asset.sector || '',
      industry: asset.industry || '',
      pe_ratio: asset.pe_ratio?.toString() || '',
      dividend_yield: asset.dividend_yield?.toString() || '',
      blockchain: asset.blockchain || '',
      consensus_mechanism: asset.consensus_mechanism || '',
      logo_url: asset.logo_url || '',
      analyst_rating: asset.analyst_rating || '',
      rating_rationale: asset.rating_rationale || '',
      score_fundamentals: asset.score_fundamentals || 0,
      score_technicals: asset.score_technicals || 0,
      score_momentum: asset.score_momentum || 0,
      score_risk: asset.score_risk || 0,
      investment_thesis: asset.investment_thesis || '',
      strengths: asset.strengths || '',
      risks: asset.risks || '',
      suitable_investor_type: asset.suitable_investor_type || '',
      key_watchpoints: asset.key_watchpoints || '',
      status: asset.status || 'draft',
      is_featured: asset.is_featured || false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('stocks_crypto')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Asset deleted successfully');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const getRatingBadgeColor = (rating: string | null) => {
    switch (rating) {
      case 'Gold': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Silver': return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
      case 'Bronze': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'Neutral': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {form.asset_type === 'crypto' ? (
              <Bitcoin className="h-5 w-5 text-amber-400" />
            ) : (
              <BarChart3 className="h-5 w-5 text-blue-400" />
            )}
            {editingId ? 'Edit Asset' : 'Add New Stock / Crypto'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Add stocks or cryptocurrencies with analyst ratings and commentary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="bg-zinc-800/50 border border-white/10">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="ratings">Analyst Ratings</TabsTrigger>
              <TabsTrigger value="commentary">Commentary</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Asset Type *</Label>
                  <Select value={form.asset_type} onValueChange={(v: 'stock' | 'crypto') => setForm({ ...form, asset_type: v })}>
                    <SelectTrigger className="bg-zinc-800/50 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Symbol / Ticker *</Label>
                  <Input
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL, BTC"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Apple Inc., Bitcoin"
                  className="bg-zinc-800/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the asset..."
                  className="bg-zinc-800/50 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Logo URL</Label>
                <Input
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800/50 border-white/10 text-white"
                />
              </div>

              {form.asset_type === 'stock' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Exchange</Label>
                    <Select value={form.exchange} onValueChange={(v) => setForm({ ...form, exchange: v })}>
                      <SelectTrigger className="bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {stockExchanges.map(ex => (
                          <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Sector</Label>
                    <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v })}>
                      <SelectTrigger className="bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {stockSectors.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Industry</Label>
                    <Input
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="e.g., Consumer Electronics"
                      className="bg-zinc-800/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              {form.asset_type === 'crypto' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Blockchain</Label>
                    <Select value={form.blockchain} onValueChange={(v) => setForm({ ...form, blockchain: v })}>
                      <SelectTrigger className="bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {cryptoBlockchains.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Consensus Mechanism</Label>
                    <Select value={form.consensus_mechanism} onValueChange={(v) => setForm({ ...form, consensus_mechanism: v })}>
                      <SelectTrigger className="bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select mechanism" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="Proof of Work">Proof of Work</SelectItem>
                        <SelectItem value="Proof of Stake">Proof of Stake</SelectItem>
                        <SelectItem value="Delegated PoS">Delegated PoS</SelectItem>
                        <SelectItem value="Proof of History">Proof of History</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Current Price</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.00000001"
                      value={form.current_price}
                      onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                      placeholder="0.00"
                      className="bg-zinc-800/50 border-white/10 text-white"
                    />
                    <Select value={form.price_currency} onValueChange={(v) => setForm({ ...form, price_currency: v })}>
                      <SelectTrigger className="w-24 bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Market Cap</Label>
                  <Input
                    type="number"
                    value={form.market_cap}
                    onChange={(e) => setForm({ ...form, market_cap: e.target.value })}
                    placeholder="e.g., 1000000000"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">24h Volume</Label>
                  <Input
                    type="number"
                    value={form.volume_24h}
                    onChange={(e) => setForm({ ...form, volume_24h: e.target.value })}
                    placeholder="e.g., 50000000"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">24h Change (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_change_24h}
                    onChange={(e) => setForm({ ...form, price_change_24h: e.target.value })}
                    placeholder="e.g., 2.5"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">7d Change (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_change_7d}
                    onChange={(e) => setForm({ ...form, price_change_7d: e.target.value })}
                    placeholder="e.g., -1.2"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">30d Change (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_change_30d}
                    onChange={(e) => setForm({ ...form, price_change_30d: e.target.value })}
                    placeholder="e.g., 15.8"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">1Y Change (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price_change_1y}
                    onChange={(e) => setForm({ ...form, price_change_1y: e.target.value })}
                    placeholder="e.g., 45.2"
                    className="bg-zinc-800/50 border-white/10 text-white"
                  />
                </div>
              </div>

              {form.asset_type === 'stock' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">P/E Ratio</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.pe_ratio}
                      onChange={(e) => setForm({ ...form, pe_ratio: e.target.value })}
                      placeholder="e.g., 25.5"
                      className="bg-zinc-800/50 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Dividend Yield (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.dividend_yield}
                      onChange={(e) => setForm({ ...form, dividend_yield: e.target.value })}
                      placeholder="e.g., 1.5"
                      className="bg-zinc-800/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-zinc-300 text-lg">Analyst Rating</Label>
                <div className="flex flex-wrap gap-2">
                  {(['Gold', 'Silver', 'Bronze', 'Neutral', 'Negative'] as AnalystRating[]).map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant="outline"
                      onClick={() => setForm({ ...form, analyst_rating: form.analyst_rating === rating ? '' : rating })}
                      className={`${form.analyst_rating === rating ? getRatingBadgeColor(rating) : 'border-white/10 text-zinc-400'}`}
                    >
                      <Star className={`h-4 w-4 mr-2 ${form.analyst_rating === rating ? 'fill-current' : ''}`} />
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Rating Rationale</Label>
                <Textarea
                  value={form.rating_rationale}
                  onChange={(e) => setForm({ ...form, rating_rationale: e.target.value })}
                  placeholder="Explain the reasoning behind this rating..."
                  className="bg-zinc-800/50 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300 text-lg">Conviction Scores (0-5)</Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-zinc-400">Fundamentals</Label>
                      <span className="text-white font-bold">{form.score_fundamentals}/5</span>
                    </div>
                    <Slider
                      value={[form.score_fundamentals]}
                      onValueChange={(v) => setForm({ ...form, score_fundamentals: v[0] })}
                      max={5}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-zinc-400">Technicals</Label>
                      <span className="text-white font-bold">{form.score_technicals}/5</span>
                    </div>
                    <Slider
                      value={[form.score_technicals]}
                      onValueChange={(v) => setForm({ ...form, score_technicals: v[0] })}
                      max={5}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-zinc-400">Momentum</Label>
                      <span className="text-white font-bold">{form.score_momentum}/5</span>
                    </div>
                    <Slider
                      value={[form.score_momentum]}
                      onValueChange={(v) => setForm({ ...form, score_momentum: v[0] })}
                      max={5}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-zinc-400">Risk</Label>
                      <span className="text-white font-bold">{form.score_risk}/5</span>
                    </div>
                    <Slider
                      value={[form.score_risk]}
                      onValueChange={(v) => setForm({ ...form, score_risk: v[0] })}
                      max={5}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-zinc-400 text-sm">Overall Score</p>
                  <p className="text-3xl font-bold text-primary">{calculateOverallScore().toFixed(2)}/5</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="commentary" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Investment Thesis</Label>
                <Textarea
                  value={form.investment_thesis}
                  onChange={(e) => setForm({ ...form, investment_thesis: e.target.value })}
                  placeholder="Detailed investment thesis..."
                  className="bg-zinc-800/50 border-white/10 text-white min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-400">Strengths</Label>
                  <Textarea
                    value={form.strengths}
                    onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    placeholder="Key strengths and advantages..."
                    className="bg-emerald-500/5 border-emerald-500/20 text-white min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-400">Risks</Label>
                  <Textarea
                    value={form.risks}
                    onChange={(e) => setForm({ ...form, risks: e.target.value })}
                    placeholder="Key risks and concerns..."
                    className="bg-red-500/5 border-red-500/20 text-white min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Suitable Investor Type</Label>
                <Input
                  value={form.suitable_investor_type}
                  onChange={(e) => setForm({ ...form, suitable_investor_type: e.target.value })}
                  placeholder="e.g., Growth investors with high risk tolerance"
                  className="bg-zinc-800/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-amber-400">Key Watchpoints</Label>
                <Textarea
                  value={form.key_watchpoints}
                  onChange={(e) => setForm({ ...form, key_watchpoints: e.target.value })}
                  placeholder="Important factors to monitor..."
                  className="bg-amber-500/5 border-amber-500/20 text-white min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                />
                <Label className="text-zinc-300">Featured</Label>
              </div>
              <Select value={form.status} onValueChange={(v: 'draft' | 'published' | 'archived') => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-32 bg-zinc-800/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => { setEditingId(null); setForm(initialForm); }}
                  className="border-white/10 text-zinc-300"
                >
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingId ? 'Update Asset' : 'Create Asset'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card className="bg-zinc-900/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Existing Assets</CardTitle>
            <CardDescription className="text-zinc-400">
              {assets.length} stocks and cryptocurrencies
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAssets} className="border-white/10 text-zinc-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-zinc-400 mt-2">Loading assets...</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-zinc-400">Asset</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Rating</TableHead>
                    <TableHead className="text-zinc-400">Score</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id} className="border-white/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {asset.logo_url ? (
                            <img src={asset.logo_url} alt={asset.name} className="h-8 w-8 rounded-full" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                              {asset.asset_type === 'crypto' ? (
                                <Bitcoin className="h-4 w-4 text-amber-400" />
                              ) : (
                                <BarChart3 className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{asset.name}</p>
                            <p className="text-xs text-zinc-500">{asset.symbol}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={asset.asset_type === 'crypto' ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400'}>
                          {asset.asset_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.analyst_rating ? (
                          <Badge className={getRatingBadgeColor(asset.analyst_rating)}>
                            {asset.analyst_rating}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-white">
                        {asset.overall_score ? Number(asset.overall_score).toFixed(1) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          asset.status === 'published' ? 'border-emerald-500/30 text-emerald-400' :
                          asset.status === 'draft' ? 'border-amber-500/30 text-amber-400' :
                          'border-zinc-500/30 text-zinc-400'
                        }>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(asset)} className="text-zinc-400 hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(asset.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
