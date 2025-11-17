import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Building } from "lucide-react";

export function CompanyScreener() {
  const [filters, setFilters] = useState({
    minEmployees: "",
    region: "all",
    founded: "all",
    ownership: "all",
  });

  const mockCompanies = [
    { name: "Apple Inc.", employees: "164,000", founded: "1976", hq: "Cupertino, CA", ownership: "Public", revenue: "$394B" },
    { name: "Microsoft Corporation", employees: "221,000", founded: "1975", hq: "Redmond, WA", ownership: "Public", revenue: "$211B" },
    { name: "SpaceX", employees: "13,000", founded: "2002", hq: "Hawthorne, CA", ownership: "Private", revenue: "$8B" },
    { name: "Stripe Inc.", employees: "8,000", founded: "2010", hq: "San Francisco, CA", ownership: "Private", revenue: "$15B" },
    { name: "JPMorgan Chase", employees: "293,000", founded: "1799", hq: "New York, NY", ownership: "Public", revenue: "$158B" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Screener Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Min Employees</Label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.minEmployees}
                onChange={(e) => setFilters({ ...filters, minEmployees: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Founded</Label>
              <Select value={filters.founded} onValueChange={(value) => setFilters({ ...filters, founded: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="recent">Last 10 Years</SelectItem>
                  <SelectItem value="established">10-50 Years</SelectItem>
                  <SelectItem value="legacy">50+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ownership</Label>
              <Select value={filters.ownership} onValueChange={(value) => setFilters({ ...filters, ownership: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => setFilters({ minEmployees: "", region: "all", founded: "all", ownership: "all" })}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({mockCompanies.length} companies)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Founded</TableHead>
                <TableHead>Headquarters</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCompanies.map((company) => (
                <TableRow key={company.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>{company.employees}</TableCell>
                  <TableCell>{company.founded}</TableCell>
                  <TableCell>{company.hq}</TableCell>
                  <TableCell>
                    <Badge variant={company.ownership === "Public" ? "default" : "outline"}>
                      {company.ownership}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.revenue}</TableCell>
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
