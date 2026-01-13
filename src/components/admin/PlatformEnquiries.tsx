import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Building, RefreshCw, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  source_page: string | null;
  status: string | null;
  created_at: string | null;
}

export const PlatformEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setEnquiries(prev => 
        prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getPlatformBadge = (sourcePage: string | null) => {
    if (sourcePage?.includes("finance")) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-sm">Finance</Badge>;
    } else if (sourcePage?.includes("investor")) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm">Investor</Badge>;
    }
    return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">General</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "contacted":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm"><CheckCircle className="h-3 w-3 mr-1" />Contacted</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "closed":
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200 shadow-sm"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200 shadow-sm"><Clock className="h-3 w-3 mr-1" />New</Badge>;
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    const platformMatch = filter === "all" || 
      (filter === "finance" && e.source_page?.includes("finance")) ||
      (filter === "investor" && e.source_page?.includes("investor"));
    
    const statusMatch = statusFilter === "all" || e.status === statusFilter || 
      (statusFilter === "new" && !e.status);
    
    return platformMatch && statusMatch;
  });

  const stats = {
    total: enquiries.length,
    finance: enquiries.filter(e => e.source_page?.includes("finance")).length,
    investor: enquiries.filter(e => e.source_page?.includes("investor")).length,
    new: enquiries.filter(e => !e.status || e.status === "new").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200/60 bg-gradient-to-br from-white to-blue-50/50 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.finance}</p>
                <p className="text-sm text-slate-500">Finance Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200/60 bg-gradient-to-br from-white to-purple-50/50 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.investor}</p>
                <p className="text-sm text-slate-500">Investor Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200/60 bg-gradient-to-br from-white to-orange-50/50 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl shadow-sm">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.new}</p>
                <p className="text-sm text-slate-500">New Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiries Table */}
      <Card className="border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                Platform Enquiries
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Sign-up enquiries from FlowPulse Finance and Investor platforms
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px] bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 transition-colors">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 transition-colors">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchEnquiries}
                className="border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50">
                  <TableHead className="text-slate-600 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Platform</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Company</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Message</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-slate-300" />
                        <span>No enquiries found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-slate-600">
                        {enquiry.created_at 
                          ? format(new Date(enquiry.created_at), "dd MMM yyyy HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getPlatformBadge(enquiry.source_page)}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{enquiry.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <a href={`mailto:${enquiry.email}`} className="hover:text-indigo-600 transition-colors">
                              {enquiry.email}
                            </a>
                          </div>
                          {enquiry.phone && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <a href={`tel:${enquiry.phone}`} className="hover:text-indigo-600 transition-colors">
                                {enquiry.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {enquiry.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {enquiry.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-slate-500 truncate" title={enquiry.message}>
                          {enquiry.message}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                      <TableCell>
                        <Select 
                          value={enquiry.status || "new"} 
                          onValueChange={(value) => updateStatus(enquiry.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8 bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
