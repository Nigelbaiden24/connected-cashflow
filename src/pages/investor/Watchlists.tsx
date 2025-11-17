import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Plus, TrendingUp, TrendingDown, Star, Bell, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Watchlists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customWatchlists, setCustomWatchlists] = useState([
    { id: "1", name: "International Growth Stocks", items: 24, performance: "+8.2%", trend: "up", notificationsEnabled: true },
    { id: "2", name: "Crypto Portfolio", items: 12, performance: "-3.1%", trend: "down", notificationsEnabled: false },
    { id: "3", name: "Precious Metals", items: 8, performance: "+2.5%", trend: "up", notificationsEnabled: true },
  ]);
  
  const [customSectors, setCustomSectors] = useState([
    { id: "1", name: "Clean Energy", companies: 15, performance: "+12.5%", trend: "up", notificationsEnabled: true },
    { id: "2", name: "AI & Machine Learning", companies: 22, performance: "+18.3%", trend: "up", notificationsEnabled: true },
    { id: "3", name: "Biotech", companies: 10, performance: "-2.1%", trend: "down", notificationsEnabled: false },
  ]);

  const [followedTopics, setFollowedTopics] = useState([
    { id: "1", name: "Fed Interest Rate Decisions", updates: 8, notificationsEnabled: true },
    { id: "2", name: "EU Regulatory Changes", updates: 5, notificationsEnabled: true },
    { id: "3", name: "ESG Investing Trends", updates: 12, notificationsEnabled: false },
  ]);

  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newSectorName, setNewSectorName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const watchedAssets = [
    { name: "Apple Inc.", symbol: "AAPL", price: "$182.45", change: "+1.2%", trend: "up" },
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: "-2.3%", trend: "down" },
    { name: "Gold", symbol: "GC", price: "$2,045/oz", change: "+0.5%", trend: "up" },
    { name: "Tesla Inc.", symbol: "TSLA", price: "$245.18", change: "+3.1%", trend: "up" },
  ];

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      const newWatchlist = {
        id: Date.now().toString(),
        name: newWatchlistName,
        items: 0,
        performance: "+0.0%",
        trend: "up" as const,
        notificationsEnabled: true,
      };
      setCustomWatchlists([...customWatchlists, newWatchlist]);
      setNewWatchlistName("");
      setOpenDialog(null);
      toast.success(`Watchlist "${newWatchlistName}" created`);
    }
  };

  const handleCreateSector = () => {
    if (newSectorName.trim()) {
      const newSector = {
        id: Date.now().toString(),
        name: newSectorName,
        companies: 0,
        performance: "+0.0%",
        trend: "up" as const,
        notificationsEnabled: true,
      };
      setCustomSectors([...customSectors, newSector]);
      setNewSectorName("");
      setOpenDialog(null);
      toast.success(`Sector "${newSectorName}" created`);
    }
  };

  const handleFollowTopic = () => {
    if (newTopicName.trim()) {
      const newTopic = {
        id: Date.now().toString(),
        name: newTopicName,
        updates: 0,
        notificationsEnabled: true,
      };
      setFollowedTopics([...followedTopics, newTopic]);
      setNewTopicName("");
      setOpenDialog(null);
      toast.success(`Now following "${newTopicName}"`);
    }
  };

  const handleDeleteWatchlist = (id: string) => {
    setCustomWatchlists(customWatchlists.filter(w => w.id !== id));
    toast.success("Watchlist deleted");
  };

  const handleDeleteSector = (id: string) => {
    setCustomSectors(customSectors.filter(s => s.id !== id));
    toast.success("Sector deleted");
  };

  const handleUnfollowTopic = (id: string) => {
    setFollowedTopics(followedTopics.filter(t => t.id !== id));
    toast.success("Topic unfollowed");
  };

  const toggleWatchlistNotifications = (id: string) => {
    setCustomWatchlists(customWatchlists.map(w => 
      w.id === id ? { ...w, notificationsEnabled: !w.notificationsEnabled } : w
    ));
  };

  const toggleSectorNotifications = (id: string) => {
    setCustomSectors(customSectors.map(s => 
      s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s
    ));
  };

  const toggleTopicNotifications = (id: string) => {
    setFollowedTopics(followedTopics.map(t => 
      t.id === id ? { ...t, notificationsEnabled: !t.notificationsEnabled } : t
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground mt-2">Track and monitor your favorite investments</p>
        </div>
      </div>

      <Tabs defaultValue="watchlists" className="w-full">
        <TabsList>
          <TabsTrigger value="watchlists">Custom Watchlists</TabsTrigger>
          <TabsTrigger value="sectors">Custom Sectors</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="assets">All Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlists" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openDialog === "watchlist"} onOpenChange={(open) => setOpenDialog(open ? "watchlist" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Watchlist</DialogTitle>
                  <DialogDescription>Give your watchlist a name to organize your investments</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="watchlist-name">Watchlist Name</Label>
                    <Input
                      id="watchlist-name"
                      placeholder="e.g., Tech Stocks"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                  <Button onClick={handleCreateWatchlist}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {customWatchlists.map((list) => (
              <Card key={list.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteWatchlist(list.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{list.items} assets</span>
                      <div className={`flex items-center gap-1 text-sm font-medium ${list.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {list.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {list.performance}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Notifications</span>
                      </div>
                      <Switch
                        checked={list.notificationsEnabled}
                        onCheckedChange={() => toggleWatchlistNotifications(list.id)}
                      />
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openDialog === "sector"} onOpenChange={(open) => setOpenDialog(open ? "sector" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sector
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Sector</DialogTitle>
                  <DialogDescription>Create a custom sector to group companies by theme</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector-name">Sector Name</Label>
                    <Input
                      id="sector-name"
                      placeholder="e.g., Renewable Energy"
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                  <Button onClick={handleCreateSector}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {customSectors.map((sector) => (
              <Card key={sector.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{sector.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSector(sector.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{sector.companies} companies</span>
                      <div className={`flex items-center gap-1 text-sm font-medium ${sector.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {sector.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {sector.performance}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Notifications</span>
                      </div>
                      <Switch
                        checked={sector.notificationsEnabled}
                        onCheckedChange={() => toggleSectorNotifications(sector.id)}
                      />
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Sector
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openDialog === "topic"} onOpenChange={(open) => setOpenDialog(open ? "topic" : null)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Follow Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Follow a Topic</DialogTitle>
                  <DialogDescription>Stay updated on specific market topics and themes</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic-name">Topic Name</Label>
                    <Input
                      id="topic-name"
                      placeholder="e.g., Inflation Trends"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                  <Button onClick={handleFollowTopic}>Follow</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {followedTopics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUnfollowTopic(topic.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{topic.updates} updates</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Notifications</span>
                      </div>
                      <Switch
                        checked={topic.notificationsEnabled}
                        onCheckedChange={() => toggleTopicNotifications(topic.id)}
                      />
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Watched Assets</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {watchedAssets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{asset.price}</p>
                        <div className={`flex items-center gap-1 text-sm ${asset.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {asset.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {asset.change}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
