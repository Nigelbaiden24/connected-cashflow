import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

export function StockScreener() {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minMarketCap: "",
    sector: "all",
    exchange: "all",
  });

  const mockStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 178.32, change: 2.45, marketCap: "2.8T", sector: "Technology", pe: 29.5 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 412.87, change: -1.23, marketCap: "3.1T", sector: "Technology", pe: 35.2 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.23, change: 0.87, marketCap: "1.8T", sector: "Technology", pe: 26.8 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.65, change: 3.21, marketCap: "1.9T", sector: "Consumer", pe: 54.3 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 242.18, change: -5.67, marketCap: "770B", sector: "Automotive", pe: 68.4 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Min Price ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price ($)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Market Cap</Label>
              <Select value={filters.minMarketCap} onValueChange={(value) => setFilters({ ...filters, minMarketCap: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="small">Small Cap (&lt; $2B)</SelectItem>
                  <SelectItem value="mid">Mid Cap ($2B - $10B)</SelectItem>
                  <SelectItem value="large">Large Cap (&gt; $10B)</SelectItem>
                  <SelectItem value="mega">Mega Cap (&gt; $200B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exchange</Label>
              <Select value={filters.exchange} onValueChange={(value) => setFilters({ ...filters, exchange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  <SelectItem value="nyse">NYSE</SelectItem>
                  <SelectItem value="nasdaq">NASDAQ</SelectItem>
                  <SelectItem value="lse">LSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ minPrice: "", maxPrice: "", minMarketCap: "", sector: "all", exchange: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockStocks.length} stocks)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>P/E</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>${stock.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {stock.change > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">+{stock.change}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">{stock.change}%</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{stock.marketCap}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stock.sector}</Badge>
                  </TableCell>
                  <TableCell>{stock.pe}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
