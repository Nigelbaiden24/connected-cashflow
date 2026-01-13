import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star,
  Loader2,
  Database,
  Radio,
  RefreshCw,
  Award,
  Save
} from 'lucide-react';

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

interface FundAnalystData {
  id: string;
  isin: string;
  fund_name: string;
  fund_type: string | null;
  asset_class: string | null;
  provider: string | null;
  analyst_rating: AnalystRating | null;
  rating_rationale: string | null;
  score_fundamentals: number | null;
  score_performance: number | null;
  score_risk: number | null;
  score_cost: number | null;
  score_esg: number | null;
  overall_score: number | null;
  investment_thesis: string | null;
  strengths: string | null;
  risks: string | null;
  suitable_investor_type: string | null;
  key_watchpoints: string | null;
  one_year_return: number | null;
  three_year_return: number | null;
  five_year_return: number | null;
  ocf: number | null;
  aum: number | null;
  status: string;
  is_featured: boolean;
  updated_at: string;
  created_at: string;
}

const emptyFund: Partial<FundAnalystData> = {
  isin: '',
  fund_name: '',
  fund_type: '',
  asset_class: '',
  provider: '',
  analyst_rating: null,
  rating_rationale: '',
  score_fundamentals: 3,
  score_performance: 3,
  score_risk: 3,
  score_cost: 3,
  score_esg: 3,
  overall_score: 3.0,
  investment_thesis: '',
  strengths: '',
  risks: '',
  suitable_investor_type: '',
  key_watchpoints: '',
  one_year_return: null,
  three_year_return: null,
  five_year_return: null,
  ocf: null,
  aum: null,
  status: 'draft',
  is_featured: false,
};

export function FundAnalystAdmin() {
  const [funds, setFunds] = useState<FundAnalystData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Partial<FundAnalystData> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fund_analyst_activity')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFunds((data || []) as FundAnalystData[]);
    } catch (error) {
      console.error('Error fetching fund analyst activity:', error);
      toast.error('Failed to fetch fund analyst activity');
    } finally {
      setLoading(false);
    }
  };

  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.fund_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fund.isin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setEditingFund({ ...emptyFund });
    setIsDialogOpen(true);
  };

  const handleEdit = (fund: FundAnalystData) => {
    setEditingFund({ ...fund });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fund analyst entry?')) return;

    try {
      const { error } = await supabase
        .from('fund_analyst_activity')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Fund analyst entry deleted');
      fetchFunds();
    } catch (error) {
      console.error('Error deleting fund:', error);
      toast.error('Failed to delete fund analyst entry');
    }
  };

  const handleSave = async () => {
    if (!editingFund) return;

    if (!editingFund.isin || !editingFund.fund_name) {
      toast.error('ISIN and Fund Name are required');
      return;
    }

    setSaving(true);
    try {
      // Calculate overall score
      const scores = [
        editingFund.score_fundamentals,
        editingFund.score_performance,
        editingFund.score_risk,
        editingFund.score_cost,
        editingFund.score_esg,
      ].filter(s => s !== null && s !== undefined) as number[];
      
      const overall_score = scores.length > 0 
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
        : null;

      const fundData = {
        ...editingFund,
        overall_score,
        updated_at: new Date().toISOString(),
      };

      if (editingFund.id) {
        // Update existing
        const { error } = await supabase
          .from('fund_analyst_activity')
          .update(fundData)
          .eq('id', editingFund.id);

        if (error) throw error;
        toast.success('Fund analyst entry updated');
      } else {
        // Create new - ensure required fields
        const insertData = {
          ...fundData,
          isin: editingFund.isin!,
          fund_name: editingFund.fund_name!,
        };
        const { error } = await supabase
          .from('fund_analyst_activity')
          .insert([insertData]);

        if (error) throw error;
        toast.success('Fund analyst entry created');
      }

      setIsDialogOpen(false);
      setEditingFund(null);
      fetchFunds();
    } catch (error) {
      console.error('Error saving fund:', error);
      toast.error('Failed to save fund analyst entry');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fund_analyst_activity')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Fund published to activity hub');
      fetchFunds();
    } catch (error) {
      console.error('Error publishing fund:', error);
      toast.error('Failed to publish fund');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fund_analyst_activity')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Fund unpublished');
      fetchFunds();
    } catch (error) {
      console.error('Error unpublishing fund:', error);
      toast.error('Failed to unpublish fund');
    }
  };

  const getAnalystBadgeStyle = (rating: AnalystRating | null) => {
    const styles: Record<string, string> = {
      'Gold': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
      'Silver': 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
      'Bronze': 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
      'Neutral': 'bg-slate-200 text-slate-700',
      'Negative': 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
    };
    return rating ? styles[rating] || 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground';
  };

  const stats = {
    total: funds.length,
    published: funds.filter(f => f.status === 'published').length,
    draft: funds.filter(f => f.status === 'draft').length,
    featured: funds.filter(f => f.is_featured).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <Database className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
              <Radio className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
              <Edit2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                Fund Analyst Activity Manager
              </CardTitle>
              <CardDescription>
                Create and manage fund analyst ratings for the activity hub
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchFunds}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fund Rating
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by fund name or ISIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fund List */}
          <ScrollArea className="h-[500px] border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFunds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fund analyst entries found</p>
                <p className="text-sm mt-1">Create your first fund rating to get started</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredFunds.map((fund) => (
                  <div
                    key={fund.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{fund.fund_name}</h4>
                          {fund.is_featured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{fund.isin}</span>
                          {fund.provider && (
                            <>
                              <span>•</span>
                              <span>{fund.provider}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {fund.analyst_rating && (
                        <Badge className={getAnalystBadgeStyle(fund.analyst_rating)}>
                          {fund.analyst_rating}
                        </Badge>
                      )}
                      <Badge variant={fund.status === 'published' ? 'default' : 'secondary'}>
                        {fund.status}
                      </Badge>
                      {fund.overall_score && (
                        <span className="text-sm font-bold text-emerald-600">
                          {fund.overall_score.toFixed(1)}/5
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        {fund.status === 'draft' ? (
                          <Button size="sm" variant="outline" onClick={() => handlePublish(fund.id)}>
                            Publish
                          </Button>
                        ) : fund.status === 'published' ? (
                          <Button size="sm" variant="ghost" onClick={() => handleUnpublish(fund.id)}>
                            Unpublish
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(fund)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(fund.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFund?.id ? 'Edit Fund Analyst Entry' : 'Create New Fund Analyst Entry'}
            </DialogTitle>
            <DialogDescription>
              Add analyst ratings and insights for a fund or ETF
            </DialogDescription>
          </DialogHeader>

          {editingFund && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isin">ISIN *</Label>
                  <Input
                    id="isin"
                    value={editingFund.isin || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, isin: e.target.value })}
                    placeholder="e.g., GB00B4TZHH95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_name">Fund Name *</Label>
                  <Input
                    id="fund_name"
                    value={editingFund.fund_name || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, fund_name: e.target.value })}
                    placeholder="e.g., Vanguard LifeStrategy 80%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={editingFund.provider || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, provider: e.target.value })}
                    placeholder="e.g., Vanguard"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_type">Fund Type</Label>
                  <Input
                    id="fund_type"
                    value={editingFund.fund_type || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, fund_type: e.target.value })}
                    placeholder="e.g., Multi-Asset"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset_class">Asset Class</Label>
                  <Input
                    id="asset_class"
                    value={editingFund.asset_class || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, asset_class: e.target.value })}
                    placeholder="e.g., Equity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analyst_rating">Analyst Rating</Label>
                  <Select 
                    value={editingFund.analyst_rating || ''} 
                    onValueChange={(v) => setEditingFund({ ...editingFund, analyst_rating: v as AnalystRating })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">🏆 Gold</SelectItem>
                      <SelectItem value="Silver">🥈 Silver</SelectItem>
                      <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                      <SelectItem value="Neutral">◉ Neutral</SelectItem>
                      <SelectItem value="Negative">⚠ Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-4">
                <h4 className="font-medium">Score Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(['score_fundamentals', 'score_performance', 'score_risk', 'score_cost', 'score_esg'] as const).map((scoreKey) => (
                    <div key={scoreKey} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{scoreKey.replace('score_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                        <span className="text-sm font-medium">{editingFund[scoreKey] || 0}/5</span>
                      </div>
                      <Slider
                        value={[editingFund[scoreKey] || 0]}
                        onValueChange={([v]) => setEditingFund({ ...editingFund, [scoreKey]: v })}
                        min={0}
                        max={5}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance & Costs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="one_year_return">1Y Return (%)</Label>
                  <Input
                    id="one_year_return"
                    type="number"
                    step="0.01"
                    value={editingFund.one_year_return ?? ''}
                    onChange={(e) => setEditingFund({ ...editingFund, one_year_return: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ocf">OCF (%)</Label>
                  <Input
                    id="ocf"
                    type="number"
                    step="0.01"
                    value={editingFund.ocf ?? ''}
                    onChange={(e) => setEditingFund({ ...editingFund, ocf: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g., 0.22"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aum">AUM (Millions)</Label>
                  <Input
                    id="aum"
                    type="number"
                    step="0.01"
                    value={editingFund.aum ?? ''}
                    onChange={(e) => setEditingFund({ ...editingFund, aum: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g., 5400"
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rating_rationale">Rating Rationale</Label>
                  <Textarea
                    id="rating_rationale"
                    value={editingFund.rating_rationale || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, rating_rationale: e.target.value })}
                    placeholder="Brief explanation for the rating..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investment_thesis">Investment Thesis</Label>
                  <Textarea
                    id="investment_thesis"
                    value={editingFund.investment_thesis || ''}
                    onChange={(e) => setEditingFund({ ...editingFund, investment_thesis: e.target.value })}
                    placeholder="Core investment case..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strengths">Strengths</Label>
                    <Textarea
                      id="strengths"
                      value={editingFund.strengths || ''}
                      onChange={(e) => setEditingFund({ ...editingFund, strengths: e.target.value })}
                      placeholder="Key strengths..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risks">Risks</Label>
                    <Textarea
                      id="risks"
                      value={editingFund.risks || ''}
                      onChange={(e) => setEditingFund({ ...editingFund, risks: e.target.value })}
                      placeholder="Key risks..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suitable_investor_type">Suitable Investor Type</Label>
                    <Input
                      id="suitable_investor_type"
                      value={editingFund.suitable_investor_type || ''}
                      onChange={(e) => setEditingFund({ ...editingFund, suitable_investor_type: e.target.value })}
                      placeholder="e.g., Long-term growth investors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key_watchpoints">Key Watchpoints</Label>
                    <Input
                      id="key_watchpoints"
                      value={editingFund.key_watchpoints || ''}
                      onChange={(e) => setEditingFund({ ...editingFund, key_watchpoints: e.target.value })}
                      placeholder="e.g., Interest rate sensitivity"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Featured */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={editingFund.is_featured || false}
                    onCheckedChange={(checked) => setEditingFund({ ...editingFund, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Fund</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
                  <Select 
                    value={editingFund.status || 'draft'} 
                    onValueChange={(v) => setEditingFund({ ...editingFund, status: v })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
