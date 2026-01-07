import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bookmark,
  Plus,
  Eye,
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Bell,
  MoreVertical,
  FolderOpen,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fundDatabase } from "@/data/fundDatabase";
import type { CompleteFund } from "@/types/fund";

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by_admin: boolean;
  category: string | null;
  created_at: string;
  itemCount?: number;
}

interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  name: string;
  notes: string | null;
  added_at: string;
}

interface FundWatchlistProps {
  onViewFund?: (fund: CompleteFund) => void;
}

export function FundWatchlist({ onViewFund }: FundWatchlistProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddFundDialog, setShowAddFundDialog] = useState(false);
  
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("");
  const [newWatchlistCategory, setNewWatchlistCategory] = useState("funds");
  
  const [selectedFundToAdd, setSelectedFundToAdd] = useState<CompleteFund | null>(null);
  const [fundSearchQuery, setFundSearchQuery] = useState("");
  const [fundNotes, setFundNotes] = useState("");

  useEffect(() => {
    loadWatchlists();
  }, []);

  useEffect(() => {
    if (selectedWatchlist) {
      loadWatchlistItems(selectedWatchlist.id);
    }
  }, [selectedWatchlist]);

  const loadWatchlists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("investment_watchlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const watchlistsWithCounts = await Promise.all(
        (data || []).map(async (watchlist) => {
          const { count } = await supabase
            .from("watchlist_items")
            .select("*", { count: "exact", head: true })
            .eq("watchlist_id", watchlist.id);
          
          return { ...watchlist, itemCount: count || 0 };
        })
      );

      setWatchlists(watchlistsWithCounts);
      if (watchlistsWithCounts.length > 0 && !selectedWatchlist) {
        setSelectedWatchlist(watchlistsWithCounts[0]);
      }
    } catch (error) {
      console.error("Error loading watchlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistItems = async (watchlistId: string) => {
    try {
      const { data, error } = await supabase
        .from("watchlist_items")
        .select("*")
        .eq("watchlist_id", watchlistId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setWatchlistItems((data as WatchlistItem[]) || []);
    } catch (error) {
      console.error("Error loading watchlist items:", error);
    }
  };

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast({ title: "Error", description: "Please enter a watchlist name", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("investment_watchlists")
        .insert({
          name: newWatchlistName,
          description: newWatchlistDescription || null,
          category: newWatchlistCategory,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Success", description: "Watchlist created successfully" });
      setNewWatchlistName("");
      setNewWatchlistDescription("");
      setNewWatchlistCategory("funds");
      setShowCreateDialog(false);
      loadWatchlists();
      if (data) setSelectedWatchlist(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create watchlist", variant: "destructive" });
    }
  };

  const addFundToWatchlist = async () => {
    if (!selectedWatchlist || !selectedFundToAdd) return;

    try {
      const { error } = await supabase
        .from("watchlist_items")
        .insert({
          watchlist_id: selectedWatchlist.id,
          symbol: selectedFundToAdd.isin,
          name: selectedFundToAdd.name,
          asset_type: "fund",
          current_price: selectedFundToAdd.performance.oneYearReturn,
          notes: fundNotes || null,
        });

      if (error) throw error;

      toast({ title: "Added", description: `${selectedFundToAdd.name} added to watchlist` });
      setSelectedFundToAdd(null);
      setFundSearchQuery("");
      setFundNotes("");
      setShowAddFundDialog(false);
      loadWatchlistItems(selectedWatchlist.id);
      loadWatchlists();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add fund", variant: "destructive" });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast({ title: "Removed", description: "Item removed from watchlist" });
      if (selectedWatchlist) loadWatchlistItems(selectedWatchlist.id);
      loadWatchlists();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    }
  };

  const deleteWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("investment_watchlists")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Watchlist deleted" });
      setSelectedWatchlist(null);
      loadWatchlists();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete watchlist", variant: "destructive" });
    }
  };

  const filteredFunds = fundSearchQuery.length >= 2
    ? fundDatabase.filter(f =>
        f.name.toLowerCase().includes(fundSearchQuery.toLowerCase()) ||
        f.isin.toLowerCase().includes(fundSearchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const matchedFund = (symbol: string) => fundDatabase.find(f => f.isin === symbol);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Watchlist Sidebar */}
      <Card className="lg:col-span-1 border-border/50 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <CardTitle className="text-lg">My Watchlists</CardTitle>
                <CardDescription>{watchlists.length} lists</CardDescription>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Watchlist</DialogTitle>
                  <DialogDescription>Create a new fund watchlist</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      placeholder="e.g., Core Holdings, Research List"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newWatchlistDescription}
                      onChange={(e) => setNewWatchlistDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={createWatchlist}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-4">
              {watchlists.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No watchlists yet</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First
                  </Button>
                </div>
              ) : (
                watchlists.map((wl) => (
                  <Card
                    key={wl.id}
                    className={`cursor-pointer transition-all ${
                      selectedWatchlist?.id === wl.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedWatchlist(wl)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{wl.name}</p>
                            {wl.created_by_admin && (
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{wl.itemCount || 0} funds</p>
                        </div>
                        {!wl.created_by_admin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); deleteWatchlist(wl.id); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Watchlist Content */}
      <Card className="lg:col-span-3 border-border/50 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedWatchlist?.name || "Select a Watchlist"}
              </CardTitle>
              <CardDescription>
                {selectedWatchlist?.description || "Choose a watchlist from the sidebar"}
              </CardDescription>
            </div>
            {selectedWatchlist && !selectedWatchlist.created_by_admin && (
              <Dialog open={showAddFundDialog} onOpenChange={setShowAddFundDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fund
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add Fund to Watchlist</DialogTitle>
                    <DialogDescription>Search and add a fund to {selectedWatchlist.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Search Funds</Label>
                      <Input
                        value={fundSearchQuery}
                        onChange={(e) => { setFundSearchQuery(e.target.value); setSelectedFundToAdd(null); }}
                        placeholder="Search by name or ISIN..."
                      />
                      {filteredFunds.length > 0 && !selectedFundToAdd && (
                        <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                          {filteredFunds.map((fund) => (
                            <div
                              key={fund.isin}
                              className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0"
                              onClick={() => { setSelectedFundToAdd(fund); setFundSearchQuery(fund.name); }}
                            >
                              <p className="font-medium text-sm">{fund.name}</p>
                              <p className="text-xs text-muted-foreground">{fund.isin} • {fund.provider}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedFundToAdd && (
                      <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Selected Fund</span>
                          </div>
                          <p className="font-semibold">{selectedFundToAdd.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedFundToAdd.isin}</p>
                        </CardContent>
                      </Card>
                    )}
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={fundNotes}
                        onChange={(e) => setFundNotes(e.target.value)}
                        placeholder="Add notes about this fund..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddFundDialog(false)}>Cancel</Button>
                    <Button onClick={addFundToWatchlist} disabled={!selectedFundToAdd}>Add to Watchlist</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!selectedWatchlist ? (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Watchlist Selected</h3>
              <p className="text-muted-foreground">Select a watchlist from the sidebar or create a new one</p>
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Bookmark className="h-10 w-10 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Empty Watchlist</h3>
              <p className="text-muted-foreground mb-4">Add funds to start tracking them</p>
              {!selectedWatchlist.created_by_admin && (
                <Button onClick={() => setShowAddFundDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Fund
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {watchlistItems.map((item) => {
                  const fund = matchedFund(item.symbol);
                  const returnValue = fund?.performance.oneYearReturn ?? null;
                  const isPositive = returnValue !== null && returnValue >= 0;
                  
                  return (
                    <Card key={item.id} className="border-border/50 hover:border-primary/30 transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 
                                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => fund && onViewFund?.(fund)}
                              >
                                {item.name}
                              </h3>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                {item.symbol}
                              </Badge>
                            </div>
                            {fund && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{fund.provider}</span>
                                <span>•</span>
                                <span>OCF {fund.costs.ocf}%</span>
                                <span>•</span>
                                <span>Risk {fund.risk.srriRating}/7</span>
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">"{item.notes}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {returnValue !== null && (
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  {isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isPositive ? '+' : ''}{returnValue.toFixed(1)}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">1Y Return</p>
                              </div>
                            )}
                            {fund?.ratings?.starRating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: fund.ratings.starRating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => fund && onViewFund?.(fund)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!selectedWatchlist.created_by_admin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
