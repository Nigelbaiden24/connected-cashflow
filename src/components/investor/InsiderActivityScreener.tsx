import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";

export function InsiderActivityScreener() {
  const [filters, setFilters] = useState({
    activityType: "all",
    timeframe: "30",
    role: "all",
  });

  const mockInsiderActivity = [
    { symbol: "MSFT", name: "Microsoft Corp.", insider: "Satya Nadella", role: "CEO", type: "Buy", shares: 25000, value: "$10.3M", date: "2024-01-15", signal: "Bullish" },
    { symbol: "AAPL", name: "Apple Inc.", insider: "Tim Cook", role: "CEO", type: "Sell", shares: 50000, value: "$8.9M", date: "2024-01-12", signal: "Neutral" },
    { symbol: "GOOGL", name: "Alphabet Inc.", insider: "Sundar Pichai", role: "CEO", type: "Buy", shares: 15000, value: "$2.1M", date: "2024-01-10", signal: "Bullish" },
    { symbol: "META", name: "Meta Platforms", insider: "Mark Zuckerberg", role: "CEO", type: "Buy", shares: 100000, value: "$47.8M", date: "2024-01-08", signal: "Very Bullish" },
    { symbol: "TSLA", name: "Tesla Inc.", insider: "Elon Musk", role: "CEO", type: "Sell", shares: 35000, value: "$8.5M", date: "2024-01-05", signal: "Bearish" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insider Activity Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={filters.activityType} onValueChange={(value) => setFilters({ ...filters, activityType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="buy">Buys Only</SelectItem>
                  <SelectItem value="sell">Sells Only</SelectItem>
                  <SelectItem value="option">Option Exercises</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={filters.timeframe} onValueChange={(value) => setFilters({ ...filters, timeframe: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Insider Role</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="cfo">CFO</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ activityType: "all", timeframe: "30", role: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockInsiderActivity.length} transactions)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Insider</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInsiderActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.symbol}</TableCell>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {activity.insider}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {activity.type === "Buy" ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Buy</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">Sell</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{activity.shares.toLocaleString()}</TableCell>
                  <TableCell>{activity.value}</TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activity.signal.includes("Bullish")
                          ? "default"
                          : activity.signal === "Bearish"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {activity.signal}
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
