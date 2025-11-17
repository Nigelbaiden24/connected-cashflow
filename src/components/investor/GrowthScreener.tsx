import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";

export function GrowthScreener() {
  const [filters, setFilters] = useState({
    minRevenueGrowth: "",
    minEarningsGrowth: "",
    stage: "all",
  });

  const mockGrowthStocks = [
    { symbol: "NVDA", name: "NVIDIA Corp.", revenueGrowth: 126.5, earningsGrowth: 168.3, stage: "Expansion", roe: 36.2, momentum: "Strong" },
    { symbol: "META", name: "Meta Platforms", revenueGrowth: 23.2, earningsGrowth: 35.4, stage: "Mature Growth", roe: 29.8, momentum: "Positive" },
    { symbol: "SHOP", name: "Shopify Inc.", revenueGrowth: 31.7, earningsGrowth: 45.6, stage: "Growth", roe: 8.4, momentum: "Strong" },
    { symbol: "SNOW", name: "Snowflake Inc.", revenueGrowth: 48.3, earningsGrowth: -12.5, stage: "Early Growth", roe: -15.3, momentum: "Moderate" },
    { symbol: "NET", name: "Cloudflare Inc.", revenueGrowth: 37.2, earningsGrowth: 22.8, stage: "Growth", roe: 3.2, momentum: "Strong" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Growth Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Min Revenue Growth (%)</Label>
              <Input
                type="number"
                placeholder="20"
                value={filters.minRevenueGrowth}
                onChange={(e) => setFilters({ ...filters, minRevenueGrowth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Earnings Growth (%)</Label>
              <Input
                type="number"
                placeholder="15"
                value={filters.minEarningsGrowth}
                onChange={(e) => setFilters({ ...filters, minEarningsGrowth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Growth Stage</Label>
              <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="early">Early Growth</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="expansion">Expansion</SelectItem>
                  <SelectItem value="mature">Mature Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ minRevenueGrowth: "", minEarningsGrowth: "", stage: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockGrowthStocks.length} growth stocks)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Revenue Growth</TableHead>
                <TableHead>Earnings Growth</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>ROE</TableHead>
                <TableHead>Momentum</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockGrowthStocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span>+{stock.revenueGrowth}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={stock.earningsGrowth > 0 ? "text-green-500" : "text-red-500"}>
                      {stock.earningsGrowth > 0 ? "+" : ""}{stock.earningsGrowth}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{stock.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={stock.roe > 0 ? "text-green-500" : "text-red-500"}>
                      {stock.roe}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stock.momentum === "Strong" ? "default" : "outline"}>
                      {stock.momentum}
                    </Badge>
                  </TableCell>
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
