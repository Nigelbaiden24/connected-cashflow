import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Search, RefreshCw, Star } from "lucide-react";

interface Opp {
  id: string;
  title: string;
  category: string | null;
  sub_category: string | null;
  price: number | null;
  price_currency: string | null;
  location: string | null;
  status: string | null;
  platform: string | null;
  featured: boolean | null;
  created_at: string;
}

export function OpportunityManager() {
  const [items, setItems] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Opp | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("opportunity_products")
      .select("id,title,category,sub_category,price,price_currency,location,status,platform,featured,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error(`Failed to load: ${error.message}`);
    } else {
      setItems((data as Opp[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    if (statusFilter !== "all" && (i.status || "") !== statusFilter) return false;
    if (platformFilter !== "all" && (i.platform || "") !== platformFilter) return false;
    if (search && !`${i.title} ${i.category} ${i.location}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this opportunity? This cannot be undone.")) return;
    const { error } = await supabase.from("opportunity_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleFeatured = async (item: Opp) => {
    const { error } = await supabase
      .from("opportunity_products")
      .update({ featured: !item.featured })
      .eq("id", item.id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, featured: !item.featured } : p)));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, created_at, ...patch } = editing;
    const { error } = await supabase
      .from("opportunity_products")
      .update({
        ...patch,
        price: patch.price === null || patch.price === undefined ? null : Number(patch.price),
      })
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setItems((prev) => prev.map((p) => (p.id === id ? editing : p)));
    setEditing(null);
  };

  return (
    <Card className="bg-white border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-slate-900">Manage Opportunities</CardTitle>
            <CardDescription className="text-slate-500">
              View, edit, feature or remove opportunities published to front-end platforms.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, location..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No opportunities match your filters.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[260px] truncate">
                    <div className="flex items-center gap-2">
                      {item.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                      <span className="truncate">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.category}
                    {item.sub_category && <span className="text-slate-400"> / {item.sub_category}</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.location || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {item.price
                      ? `${item.price_currency || "GBP"} ${Number(item.price).toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "active" ? "default" : "secondary"}>
                      {item.status || "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{item.platform || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        title={item.featured ? "Unfeature" : "Feature"}
                        onClick={() => handleToggleFeatured(item)}
                      >
                        <Star className={`h-4 w-4 ${item.featured ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(item)} title="Edit">
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>Update fields and save changes.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <Label>Sub-category</Label>
                <Input value={editing.sub_category || ""} onChange={(e) => setEditing({ ...editing, sub_category: e.target.value })} />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={editing.price ?? ""}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={editing.price_currency || "GBP"} onValueChange={(v) => setEditing({ ...editing, price_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Location</Label>
                <Input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status || "draft"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select value={editing.platform || ""} onValueChange={(v) => setEditing({ ...editing, platform: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
