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
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Finance</Badge>;
    } else if (sourcePage?.includes("investor")) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Investor</Badge>;
    }
    return <Badge variant="outline">General</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "contacted":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Contacted</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "closed":
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><Clock className="h-3 w-3 mr-1" />New</Badge>;
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
        <Card className="border-white/10 bg-gradient-to-br from-zinc-950 to-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-zinc-400">Total Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-gradient-to-br from-zinc-950 to-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.finance}</p>
                <p className="text-sm text-zinc-400">Finance Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-gradient-to-br from-zinc-950 to-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.investor}</p>
                <p className="text-sm text-zinc-400">Investor Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-gradient-to-br from-zinc-950 to-black">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.new}</p>
                <p className="text-sm text-zinc-400">New Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiries Table */}
      <Card className="border-white/10 bg-gradient-to-br from-zinc-950 to-black">
        <CardHeader className="border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Platform Enquiries
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Sign-up enquiries from FlowPulse Finance and Investor platforms
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px] bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-zinc-900 border-white/10">
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
                className="border-white/10"
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
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Platform</TableHead>
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Contact</TableHead>
                  <TableHead className="text-zinc-400">Company</TableHead>
                  <TableHead className="text-zinc-400">Message</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                      No enquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-zinc-300">
                        {enquiry.created_at 
                          ? format(new Date(enquiry.created_at), "dd MMM yyyy HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getPlatformBadge(enquiry.source_page)}</TableCell>
                      <TableCell className="font-medium text-white">{enquiry.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-zinc-300">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${enquiry.email}`} className="hover:text-primary">
                              {enquiry.email}
                            </a>
                          </div>
                          {enquiry.phone && (
                            <div className="flex items-center gap-1 text-zinc-400">
                              <Phone className="h-3 w-3" />
                              <a href={`tel:${enquiry.phone}`} className="hover:text-primary">
                                {enquiry.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {enquiry.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-zinc-500" />
                            {enquiry.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-zinc-400 truncate" title={enquiry.message}>
                          {enquiry.message}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                      <TableCell>
                        <Select 
                          value={enquiry.status || "new"} 
                          onValueChange={(value) => updateStatus(enquiry.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8 bg-zinc-900 border-white/10">
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
