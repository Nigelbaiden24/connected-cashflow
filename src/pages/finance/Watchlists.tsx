import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Plus, Trash2, TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Watchlist {
  id: string;
  name: string;
  description: string;
  items: WatchlistItem[];
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change_percent?: number;
  notes?: string;
}

// Sample data
const sampleWatchlists: Watchlist[] = [
  {
    id: "1",
    name: "Tech Giants",
    description: "Major technology companies",
    items: [
      { id: "1", symbol: "AAPL", name: "Apple Inc.", price: 178.50, change_percent: 1.2 },
      { id: "2", symbol: "MSFT", name: "Microsoft Corp.", price: 378.25, change_percent: 0.8 },
      { id: "3", symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change_percent: -0.5 },
    ]
  },
  {
    id: "2",
    name: "Dividend Stocks",
    description: "High dividend yield stocks",
    items: [
      { id: "4", symbol: "JNJ", name: "Johnson & Johnson", price: 156.20, change_percent: 0.3 },
      { id: "5", symbol: "PG", name: "Procter & Gamble", price: 148.90, change_percent: -0.2 },
    ]
  }
];

export default function FinanceWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(sampleWatchlists);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newWatchlist, setNewWatchlist] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const createWatchlist = () => {
    if (!newWatchlist.name.trim()) {
      toast({ title: "Error", description: "Please enter a name", variant: "destructive" });
      return;
    }

    const newList: Watchlist = {
      id: Date.now().toString(),
      name: newWatchlist.name,
      description: newWatchlist.description,
      items: []
    };

    setWatchlists([...watchlists, newList]);
    setNewWatchlist({ name: "", description: "" });
    setCreateDialogOpen(false);
    toast({ title: "Success", description: "Watchlist created" });
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(watchlists.filter(w => w.id !== id));
    toast({ title: "Deleted", description: "Watchlist removed" });
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4 text-muted-foreground" />;
    return change > 0 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return "text-muted-foreground";
    return change > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground mt-2">Track securities and investments for your clients</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Watchlist</DialogTitle>
              <DialogDescription>Create a new watchlist to track securities</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="My Watchlist"
                  value={newWatchlist.name}
                  onChange={(e) => setNewWatchlist({ ...newWatchlist, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Description..."
                  value={newWatchlist.description}
                  onChange={(e) => setNewWatchlist({ ...newWatchlist, description: e.target.value })}
                />
              </div>
              <Button onClick={createWatchlist} className="w-full">Create Watchlist</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {watchlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No watchlists yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((watchlist) => (
            <Card key={watchlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{watchlist.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{watchlist.items.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedWatchlist(watchlist); setDetailDialogOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteWatchlist(watchlist.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Watchlist Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWatchlist?.name}</DialogTitle>
            <DialogDescription>{selectedWatchlist?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedWatchlist?.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No securities in this watchlist</div>
          ) : (
            <div className="space-y-2">
              {selectedWatchlist?.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold">{item.symbol}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price?.toFixed(2) || "-"}</p>
                      <p className={`text-sm flex items-center gap-1 justify-end ${getChangeColor(item.change_percent)}`}>
                        {getTrendIcon(item.change_percent)}
                        {item.change_percent?.toFixed(2) || 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
