import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

export function RiskScreener() {
  const [filters, setFilters] = useState({
    riskLevel: "all",
    beta: "all",
    debtRatio: "all",
  });

  const mockRiskProfiles = [
    { symbol: "JNJ", name: "Johnson & Johnson", riskLevel: "Low", beta: 0.65, debtRatio: 0.32, rating: "AAA", volatility: "6.5%" },
    { symbol: "PG", name: "Procter & Gamble", riskLevel: "Low", beta: 0.48, debtRatio: 0.41, rating: "AA+", volatility: "5.8%" },
    { symbol: "AAPL", name: "Apple Inc.", riskLevel: "Medium", beta: 1.12, debtRatio: 1.57, rating: "AA+", volatility: "18.3%" },
    { symbol: "TSLA", name: "Tesla Inc.", riskLevel: "High", beta: 2.03, debtRatio: 0.15, rating: "BB+", volatility: "42.7%" },
    { symbol: "GME", name: "GameStop Corp.", riskLevel: "Very High", beta: 2.87, debtRatio: 0.08, rating: "B-", volatility: "78.2%" },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "High":
        return "text-orange-500";
      case "Very High":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={filters.riskLevel} onValueChange={(value) => setFilters({ ...filters, riskLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="very-high">Very High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Beta Range</Label>
              <Select value={filters.beta} onValueChange={(value) => setFilters({ ...filters, beta: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Beta Values</SelectItem>
                  <SelectItem value="low">Low Beta (&lt;0.8)</SelectItem>
                  <SelectItem value="medium">Medium Beta (0.8-1.2)</SelectItem>
                  <SelectItem value="high">High Beta (&gt;1.2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Debt Ratio</Label>
              <Select value={filters.debtRatio} onValueChange={(value) => setFilters({ ...filters, debtRatio: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Debt Levels</SelectItem>
                  <SelectItem value="low">Low Debt (&lt;0.5)</SelectItem>
                  <SelectItem value="medium">Medium Debt (0.5-1.0)</SelectItem>
                  <SelectItem value="high">High Debt (&gt;1.0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ riskLevel: "all", beta: "all", debtRatio: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockRiskProfiles.length} securities)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Beta</TableHead>
                <TableHead>Debt Ratio</TableHead>
                <TableHead>Credit Rating</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRiskProfiles.map((item) => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium">{item.symbol}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.riskLevel === "Low" || item.riskLevel === "Medium" ? (
                        <Shield className={`h-4 w-4 ${getRiskColor(item.riskLevel)}`} />
                      ) : (
                        <AlertTriangle className={`h-4 w-4 ${getRiskColor(item.riskLevel)}`} />
                      )}
                      <span className={getRiskColor(item.riskLevel)}>{item.riskLevel}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.beta}</TableCell>
                  <TableCell>{item.debtRatio}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.rating}</Badge>
                  </TableCell>
                  <TableCell>{item.volatility}</TableCell>
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
