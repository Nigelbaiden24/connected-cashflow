import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Building, RefreshCw, FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  reason: string | null;
  report_id: string | null;
  report_title: string | null;
  category: string | null;
  source_page: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const InsightsAccessRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("report_access_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests((data as AccessRequest[]) || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load access requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("report_access_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not update status");
    }
  };

  const filtered = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);
  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    qualified: requests.filter((r) => r.status === "qualified").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total} accent="from-indigo-500 to-blue-600" />
        <StatCard label="New" value={stats.new} accent="from-orange-500 to-amber-600" />
        <StatCard label="Contacted" value={stats.contacted} accent="from-cyan-500 to-blue-600" />
        <StatCard label="Qualified" value={stats.qualified} accent="from-emerald-500 to-teal-600" />
      </div>

      <Card className="border border-slate-200/60 bg-white shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                Insights Access Requests
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Leads who submitted contact details to access the public Insights library
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchRequests}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company / Role</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-slate-300" />
                          <span>No access requests yet</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                          {r.created_at ? format(new Date(r.created_at), "dd MMM yyyy HH:mm") : "—"}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{r.full_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="flex items-center gap-1.5 text-slate-700"><Mail className="h-3.5 w-3.5" />{r.email}</span>
                            {r.phone && <span className="flex items-center gap-1.5 text-slate-500"><Phone className="h-3.5 w-3.5" />{r.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="flex items-center gap-1.5 text-slate-700"><Building className="h-3.5 w-3.5" />{r.company || "—"}</span>
                            <span className="text-slate-500 text-xs">{r.job_title || ""}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {r.report_title && <span className="text-slate-900 font-medium line-clamp-1">{r.report_title}</span>}
                            {r.category && <Badge variant="secondary" className="w-fit">{r.category}</Badge>}
                            {!r.report_title && !r.category && <span className="text-slate-400">Library</span>}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[260px] text-sm text-slate-600">
                          <span className="line-clamp-2">{r.reason || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                            <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card className="border border-slate-200/60 bg-white shadow-sm rounded-2xl">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent}`} />
      </CardContent>
    </Card>
  );
}
