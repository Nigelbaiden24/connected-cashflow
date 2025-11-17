import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, TrendingUp, TrendingDown, Star } from "lucide-react";
import { useState } from "react";

export default function Watchlists() {
  const [searchTerm, setSearchTerm] = useState("");

  const watchlists = [
    {
      name: "International Growth Stocks",
      items: 24,
      performance: "+8.2%",
      trend: "up",
    },
    {
      name: "Crypto Portfolio",
      items: 12,
      performance: "-3.1%",
      trend: "down",
    },
    {
      name: "Precious Metals",
      items: 8,
      performance: "+2.5%",
      trend: "up",
    },
  ];

  const watchedAssets = [
    { name: "Apple Inc.", symbol: "AAPL", price: "$182.45", change: "+1.2%", trend: "up" },
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: "-2.3%", trend: "down" },
    { name: "Gold", symbol: "GC", price: "$2,045/oz", change: "+0.5%", trend: "up" },
    { name: "Tesla Inc.", symbol: "TSLA", price: "$245.18", change: "+3.1%", trend: "up" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground mt-2">Track and monitor your favorite investments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Watchlist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {watchlists.map((list, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{list.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{list.items} assets</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${list.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {list.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {list.performance}
                  </div>
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
    </div>
  );
}
