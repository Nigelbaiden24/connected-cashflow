import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Archive, Trash2, Eye, RefreshCw, Loader2, Search, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScrapeRow {
  id: string;
  source: string | null;
  platform: string | null;
  title: string | null;
  category: string;
  sub_category: string | null;
  custom_query: string | null;
  opportunities_count: number | null;
  raw_output: string | null;
  market_context: string | null;
  payload: any;
  sources: any;
  opportunities: any;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  "financial-research": "Financial Research",
  "companies-house": "Companies House",
  "uk-investors": "UK Investors",
  "opportunity-engine": "Opportunity Engine",
  "ai-scanner": "AI Scanner",
  "investor-research": "Investor Research",
  "elite-analyst": "Elite Analyst",
  "opportunity-upload": "Opportunity Upload",
};

export function SavedScrapes() {
  const [rows, setRows] = useState<ScrapeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ScrapeRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_scrape_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Failed to load saved scrapes");
      console.error(error);
    } else {
      setRows((data ?? []) as ScrapeRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (sourceFilter !== "all" && (r.source ?? "") !== sourceFilter) return false;
      if (platformFilter !== "all" && (r.platform ?? "") !== platformFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const blob = `${r.title ?? ""} ${r.category} ${r.custom_query ?? ""} ${r.sub_category ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, sourceFilter, platformFilter]);

  const sources = useMemo(() => Array.from(new Set(rows.map((r) => r.source).filter(Boolean))) as string[], [rows]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this saved scrape?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("admin_scrape_history").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Deleted");
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  const handleClearAll = async () => {
    if (!filtered.length) return;
    if (!confirm(`Delete ALL ${filtered.length} matching saved scrapes? This cannot be undone.`)) return;
    const ids = filtered.map((r) => r.id);
    const { error } = await supabase.from("admin_scrape_history").delete().in("id", ids);
    if (error) {
      toast.error("Bulk delete failed");
    } else {
      toast.success(`Deleted ${ids.length} records`);
      load();
    }
  };

  const copyJson = (row: ScrapeRow) => {
    const blob = JSON.stringify(row.payload ?? row.opportunities ?? row.raw_output ?? row, null, 2);
    navigator.clipboard.writeText(blob);
    toast.success("Copied to clipboard");
  };

  const downloadJson = (row: ScrapeRow) => {
    const blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scrape-${row.source ?? "result"}-${row.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-fuchsia-50 via-rose-50 to-transparent">
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-rose-600 shadow-md">
            <Archive className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Saved Scrapes</div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">
              Auto-saved results from every scraper across both platforms — view, copy, export, or delete.
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-500 pt-2">
          Every scrape runs is automatically persisted here. Use filters to narrow by source or platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search title, category, query…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s}>{SOURCE_LABELS[s] ?? s}</SelectItem>
              ))}
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
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          {filtered.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete filtered ({filtered.length})
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Saved</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No saved scrapes match your filters.</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-md">
                    <div className="font-medium text-slate-900 truncate">{r.title ?? r.category}</div>
                    {r.sub_category && <div className="text-xs text-slate-500 truncate">{r.sub_category}</div>}
                    {r.custom_query && <div className="text-xs text-slate-400 italic truncate">"{r.custom_query}"</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{SOURCE_LABELS[r.source ?? ""] ?? r.source ?? r.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.platform ? <Badge variant="outline">{r.platform}</Badge> : <span className="text-slate-400">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{r.opportunities_count ?? "—"}</TableCell>
                  <TableCell className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString("en-GB")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelected(r)} title="View"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => copyJson(r)} title="Copy JSON"><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => downloadJson(r)} title="Download JSON"><Download className="h-4 w-4" /></Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        title="Delete"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        {deletingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selected?.title ?? selected?.category}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {selected?.source && <Badge variant="secondary">{SOURCE_LABELS[selected.source] ?? selected.source}</Badge>}
              {selected?.platform && <Badge variant="outline">{selected.platform}</Badge>}
              {selected?.opportunities_count != null && <Badge>{selected.opportunities_count} items</Badge>}
              <span className="text-slate-500">{selected && new Date(selected.created_at).toLocaleString("en-GB")}</span>
            </div>
            {selected?.market_context && (
              <div>
                <div className="text-xs uppercase font-semibold text-slate-500 mb-1">Market Context</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.market_context}</p>
              </div>
            )}
            {selected?.raw_output && (
              <div>
                <div className="text-xs uppercase font-semibold text-slate-500 mb-1">Raw Output</div>
                <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 whitespace-pre-wrap max-h-64 overflow-y-auto">{selected.raw_output}</pre>
              </div>
            )}
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 mb-1">Payload</div>
              <pre className="text-xs bg-slate-900 text-slate-100 rounded p-3 overflow-x-auto max-h-96">
                {JSON.stringify(selected?.payload ?? selected?.opportunities ?? selected?.sources ?? {}, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {selected && <Button variant="outline" onClick={() => copyJson(selected)}><Copy className="h-4 w-4 mr-1" /> Copy</Button>}
            {selected && <Button variant="outline" onClick={() => downloadJson(selected)}><Download className="h-4 w-4 mr-1" /> Download</Button>}
            {selected && (
              <Button variant="destructive" onClick={() => handleDelete(selected.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
