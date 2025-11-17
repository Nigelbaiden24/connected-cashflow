import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, TrendingUp, Globe, Building, Gem } from "lucide-react";

export default function ScreenersDiscovery() {
  const screenerCategories = [
    { name: "International Stocks", icon: Globe, count: 245 },
    { name: "Cryptocurrency", icon: TrendingUp, count: 180 },
    { name: "Real Estate", icon: Building, count: 95 },
    { name: "Precious Metals", icon: Gem, count: 42 },
    { name: "Private Equity", icon: Building, count: 68 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screeners & Discovery</h1>
        <p className="text-muted-foreground mt-2">Find investment opportunities with advanced screening tools</p>
      </div>

      <Tabs defaultValue="stocks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
          <TabsTrigger value="metals">Precious Metals</TabsTrigger>
          <TabsTrigger value="private-equity">Private Equity</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search investments..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        <TabsContent value="stocks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {screenerCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{category.count}</p>
                  <p className="text-sm text-muted-foreground">opportunities available</p>
                  <Button className="w-full mt-4" variant="outline">View Screener</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Screener</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Filter and discover crypto assets based on market cap, volume, and technical indicators.</p>
              <Button>Launch Crypto Screener</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-estate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real Estate & Land Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Discover international property investments and land opportunities.</p>
              <Button>Browse Properties</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Precious Metals & Gemstones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track and invest in gold, silver, platinum, diamonds, and other precious assets.</p>
              <Button>View Metals Market</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private-equity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Private Equity & Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Explore private equity opportunities and businesses available for acquisition.</p>
              <Button>View Deals</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
