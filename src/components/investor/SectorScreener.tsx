import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Label } from "@/components/ui/label";

export function SectorScreener() {
  const [filters, setFilters] = useState({
    performance: "all",
    volatility: "all",
    region: "all",
  });

  const mockSectors = [
    { sector: "Technology", performance: 12.5, volatility: "High", marketCap: "$15.2T", companies: 487, topCompany: "Apple Inc." },
    { sector: "Healthcare", performance: 8.3, volatility: "Medium", marketCap: "$7.8T", companies: 312, topCompany: "Johnson & Johnson" },
    { sector: "Finance", performance: 6.7, volatility: "Medium", marketCap: "$11.4T", companies: 523, topCompany: "JPMorgan Chase" },
    { sector: "Energy", performance: -2.1, volatility: "High", marketCap: "$4.2T", companies: 198, topCompany: "ExxonMobil" },
    { sector: "Consumer Goods", performance: 5.4, volatility: "Low", marketCap: "$6.9T", companies: 421, topCompany: "Procter & Gamble" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sector Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Performance</Label>
              <Select value={filters.performance} onValueChange={(value) => setFilters({ ...filters, performance: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="top">Top Performers (&gt;10%)</SelectItem>
                  <SelectItem value="positive">Positive Growth</SelectItem>
                  <SelectItem value="negative">Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Volatility</Label>
              <Select value={filters.volatility} onValueChange={(value) => setFilters({ ...filters, volatility: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Global</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ performance: "all", volatility: "all", region: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockSectors.length} sectors)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector</TableHead>
                <TableHead>Performance (YTD)</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Top Company</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSectors.map((sector) => (
                <TableRow key={sector.sector}>
                  <TableCell className="font-medium">{sector.sector}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {sector.performance > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">+{sector.performance}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">{sector.performance}%</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sector.volatility === "High"
                          ? "destructive"
                          : sector.volatility === "Medium"
                          ? "default"
                          : "outline"
                      }
                    >
                      {sector.volatility}
                    </Badge>
                  </TableCell>
                  <TableCell>{sector.marketCap}</TableCell>
                  <TableCell>{sector.companies}</TableCell>
                  <TableCell>{sector.topCompany}</TableCell>
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
