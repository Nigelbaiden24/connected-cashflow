import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Plus, TrendingUp, TrendingDown, Trash2, Loader2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { ViewModeToggle } from "@/components/showcase/ViewModeToggle";
import { ContentShowcase, ShowcaseItem } from "@/components/showcase/ContentShowcase";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  symbol: string;
  name: string;
  asset_type: string;
  current_price: number | null;
  change_percent: number | null;
  alert_price_high: number | null;
  alert_price_low: number | null;
  notes: string | null;
  added_at: string;
}

export default function FinanceWatchlists() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("");
  const [newWatchlistCategory, setNewWatchlistCategory] = useState("");
  
  const [newItemSymbol, setNewItemSymbol] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("stock");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");

  useEffect(() => {
    loadWatchlists();
  }, []);

  const [viewMode, setViewMode] = useState<string>("grid");

  const loadWatchlists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("investment_watchlists")
        .select("*")
        .or("platform.eq.finance,platform.is.null")
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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load watchlists",
        variant: "destructive",
      });
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
      setWatchlistItems((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load watchlist items",
        variant: "destructive",
      });
    }
  };

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a watchlist name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("investment_watchlists")
        .insert({
          name: newWatchlistName,
          description: newWatchlistDescription || null,
          category: newWatchlistCategory || null,
          platform: "finance",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Watchlist created successfully",
      });

      setNewWatchlistName("");
      setNewWatchlistDescription("");
      setNewWatchlistCategory("");
      setShowCreateDialog(false);
      loadWatchlists();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create watchlist",
        variant: "destructive",
      });
    }
  };

  const deleteWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("investment_watchlists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Watchlist deleted successfully",
      });

      loadWatchlists();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete watchlist",
        variant: "destructive",
      });
    }
  };

  const viewWatchlist = async (watchlist: Watchlist) => {
    setSelectedWatchlist(watchlist);
    await loadWatchlistItems(watchlist.id);
    setShowViewDialog(true);
  };

  const viewItemDetails = (item: WatchlistItem) => {
    setSelectedItem(item);
    setShowItemDialog(true);
  };

  const addItemToWatchlist = async () => {
    if (!selectedWatchlist || !newItemSymbol.trim() || !newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("watchlist_items")
        .insert({
          watchlist_id: selectedWatchlist.id,
          symbol: newItemSymbol.toUpperCase(),
          name: newItemName,
          asset_type: newItemType,
          current_price: newItemPrice ? parseFloat(newItemPrice) : null,
          notes: newItemNotes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added to watchlist",
      });

      setNewItemSymbol("");
      setNewItemName("");
      setNewItemType("stock");
      setNewItemPrice("");
      setNewItemNotes("");
      setShowAddItemDialog(false);
      
      await loadWatchlistItems(selectedWatchlist.id);
      loadWatchlists();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item removed from watchlist",
      });

      if (selectedWatchlist) {
        await loadWatchlistItems(selectedWatchlist.id);
      }
      loadWatchlists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (changePercent: number | null) => {
    if (!changePercent) return null;
    return changePercent >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeColor = (changePercent: number | null) => {
    if (!changePercent) return "text-muted-foreground";
    return changePercent >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const myWatchlists = watchlists.filter(w => !w.created_by_admin && !w.is_public);
  const publicWatchlists = watchlists.filter(w => w.is_public || w.created_by_admin);


  const allWatchlistsForShowcase: ShowcaseItem[] = watchlists.map((w) => ({
    id: w.id,
    title: w.name,
    subtitle: w.category || undefined,
    description: w.description || undefined,
    icon: w.created_by_admin ? <Star className="h-10 w-10" /> : <Eye className="h-10 w-10" />,
    badges: [
      { label: `${w.itemCount || 0} items` },
      ...(w.created_by_admin ? [{ label: "Admin Curated", className: "bg-secondary text-secondary-foreground" }] : []),
    ],
    onClick: () => viewWatchlist(w),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground mt-2">Track and monitor your favorite investments</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} options={["grid", "showcase"]} />
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Watchlist</DialogTitle>
              <DialogDescription>Add a new watchlist to track investments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Watchlist Name *</Label>
                <Input
                  id="name"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="e.g., Tech Stocks, Crypto Portfolio"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newWatchlistDescription}
                  onChange={(e) => setNewWatchlistDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newWatchlistCategory} onValueChange={setNewWatchlistCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                    <SelectItem value="etfs">ETFs</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={createWatchlist}>Create Watchlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {viewMode === "showcase" ? (
        <ContentShowcase items={allWatchlistsForShowcase} emptyMessage="No watchlists yet" />
      ) : (
      <>
      <div>
        <h2 className="text-xl font-semibold mb-4">My Watchlists</h2>
        {myWatchlists.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No watchlists yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myWatchlists.map((watchlist) => (
              <Card key={watchlist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                      {watchlist.category && (
                        <Badge variant="outline" className="mt-2">{watchlist.category}</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWatchlist(watchlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {watchlist.description && (
                    <p className="text-sm text-muted-foreground mb-3">{watchlist.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {watchlist.itemCount || 0} items
                    </span>
                    <Button size="sm" onClick={() => viewWatchlist(watchlist)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {publicWatchlists.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Expert Watchlists</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicWatchlists.map((watchlist) => (
              <Card key={watchlist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      {watchlist.category && (
                        <Badge variant="outline" className="mt-2">{watchlist.category}</Badge>
                      )}
                      <Badge variant="secondary" className="mt-2">Admin Curated</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {watchlist.description && (
                    <p className="text-sm text-muted-foreground mb-3">{watchlist.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {watchlist.itemCount || 0} items
                    </span>
                    <Button size="sm" onClick={() => viewWatchlist(watchlist)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* View Watchlist Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedWatchlist?.name}</DialogTitle>
                {selectedWatchlist?.description && (
                  <DialogDescription>{selectedWatchlist.description}</DialogDescription>
                )}
              </div>
              {selectedWatchlist && !selectedWatchlist.created_by_admin && (
                <Button onClick={() => setShowAddItemDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {watchlistItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items in this watchlist yet</p>
                {selectedWatchlist && !selectedWatchlist.created_by_admin && (
                  <Button className="mt-4" onClick={() => setShowAddItemDialog(true)}>
                    Add First Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {watchlistItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="outline">{item.symbol}</Badge>
                            <Badge>{item.asset_type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            {item.current_price && (
                              <span className="text-lg font-bold">
                                ${item.current_price.toFixed(2)}
                              </span>
                            )}
                            {item.change_percent !== null && (
                              <div className={`flex items-center gap-1 ${getChangeColor(item.change_percent)}`}>
                                {getTrendIcon(item.change_percent)}
                                <span className="font-medium">
                                  {item.change_percent >= 0 ? "+" : ""}
                                  {item.change_percent.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewItemDetails(item)}>
                            Details
                          </Button>
                          {selectedWatchlist && !selectedWatchlist.created_by_admin && (
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Watchlist</DialogTitle>
            <DialogDescription>Add a new security to track</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={newItemSymbol}
                onChange={(e) => setNewItemSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
              />
            </div>
            <div>
              <Label htmlFor="itemName">Name *</Label>
              <Input
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Apple Inc."
              />
            </div>
            <div>
              <Label htmlFor="itemType">Asset Type</Label>
              <Select value={newItemType} onValueChange={setNewItemType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="commodity">Commodity</SelectItem>
                  <SelectItem value="bond">Bond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Current Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="e.g., 150.00"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                placeholder="Any notes about this investment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
            <Button onClick={addItemToWatchlist}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>{selectedItem?.symbol}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Asset Type</Label>
                  <p className="font-medium">{selectedItem.asset_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Price</Label>
                  <p className="font-medium">
                    {selectedItem.current_price ? `$${selectedItem.current_price.toFixed(2)}` : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Change</Label>
                  <p className={`font-medium ${getChangeColor(selectedItem.change_percent)}`}>
                    {selectedItem.change_percent !== null 
                      ? `${selectedItem.change_percent >= 0 ? "+" : ""}${selectedItem.change_percent.toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Added</Label>
                  <p className="font-medium">
                    {new Date(selectedItem.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedItem.alert_price_high && (
                <div>
                  <Label className="text-muted-foreground">Alert: Price Above</Label>
                  <p className="font-medium">${selectedItem.alert_price_high.toFixed(2)}</p>
                </div>
              )}
              {selectedItem.alert_price_low && (
                <div>
                  <Label className="text-muted-foreground">Alert: Price Below</Label>
                  <p className="font-medium">${selectedItem.alert_price_low.toFixed(2)}</p>
                </div>
              )}
              {selectedItem.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
