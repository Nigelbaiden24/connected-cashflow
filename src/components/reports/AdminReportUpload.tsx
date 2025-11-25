import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
}

interface AdminReportUploadProps {
  platform?: "finance" | "business" | "investor";
  section?: "finance_reports" | "investor_research" | "investor_analysis";
  onUploadSuccess?: () => void;
}

export function AdminReportUpload({ platform: defaultPlatform, section, onUploadSuccess }: AdminReportUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>(defaultPlatform || "finance");
  const [platformSection, setPlatformSection] = useState<string>(
    section || (defaultPlatform === "investor" ? "investor_research" : "finance_reports")
  );
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const financeReportTypes = [
    "Equity Research Reports",
    "Stock Analyst Reports",
    "Industry / Sector Research Reports",
    "Thematic Research Reports",
    "Economic Outlook Reports",
    "Moat Analysis Reports",
    "Fund Research Reports",
    "ETF Research Reports",
    "Manager Research Reports",
    "Strategy Research Reports",
    "Parent / People / Process Reports",
    "Sustainability / ESG Risk Reports",
    "Portfolio Performance Reports",
    "Portfolio Risk Reports",
    "Performance Attribution Reports",
    "Portfolio Style / Drift Reports",
    "Portfolio Holdings Reports",
    "Asset Allocation Reports",
    "Scenario / Stress Testing Reports",
    "Investment Committee Reports",
    "Market Commentary Reports",
    "Custom Fact Sheets",
    "Fund Fact Sheets",
    "Strategy Fact Sheets",
    "Regulatory / Compliance Reports",
    "Custom-Branded Client Reports",
    "White-Label Reports",
    "Investment Proposal Reports",
    "Client Review Reports",
    "Data Feed / API-Based Reports",
    "Interactive Financial Model Reports",
    "Custom Portfolio Analytics Packs",
    "Peer Benchmarking Reports",
    "Operational Due Diligence Reports",
    "Semiliquid / Alternative Investment Reports",
    "Multi-Asset Research Reports",
    "Fixed Income Research Reports",
    "Bond Analysis Reports",
    "Manager Due Diligence Packs",
    "Committee Meeting Packs",
    "Custom Publishing System Reports",
    "Thought Leadership Reports",
    "Market Trends Reports",
    "Asset Manager Reporting Packs",
    "Advisor Performance Packs",
    "Product Comparison Reports"
  ];

  const businessReportTypes = [
    "Benchmarking",
    "Market Trends",
    "Competitor Intelligence",
    "Economic Outlook",
    "Technology & Innovation",
    "Customer Insights",
    "Sales & Marketing Intelligence",
    "Operational Efficiency",
    "Workforce & Talent",
    "ESG & Sustainability",
    "Sector Spotlight",
    "Executive Briefings"
  ];

  const investorReportTypes = [
    "Research Reports",
    "Market Analysis",
    "Investment Strategy",
    "Portfolio Analysis",
    "Risk Assessment",
    "Performance Reports",
    "ESG Reports"
  ];

  const getReportTypes = () => {
    const section = platformSection || "finance_reports";
    if (section === "finance_reports" || selectedPlatform === "finance") return financeReportTypes;
    if (selectedPlatform === "business") return businessReportTypes;
    return investorReportTypes;
  };

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name")
        .order("email");

      if (error) throw error;
      
      // Ensure admin user is included
      const allProfiles = data || [];
      const hasAdmin = allProfiles.some(p => p.email === "nigelbaiden24@yahoo.com");
      
      if (!hasAdmin) {
        // Fetch admin user specifically
        const { data: adminData } = await supabase
          .from("user_profiles")
          .select("user_id, email, full_name")
          .eq("email", "nigelbaiden24@yahoo.com")
          .single();
        
        if (adminData) {
          allProfiles.unshift(adminData);
        }
      }
      
      setProfiles(allProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !reportType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedPlatform}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Determine platform and category based on section
      let finalPlatform = selectedPlatform;
      let reportCategory = null;
      
      if (platformSection === "finance_reports") {
        finalPlatform = "finance";
      } else if (platformSection === "investor_research") {
        finalPlatform = "investor";
        reportCategory = "research";
      } else if (platformSection === "investor_analysis") {
        finalPlatform = "investor";
        reportCategory = "analysis";
      }

      // Insert report metadata
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          file_path: filePath,
          report_type: reportType,
          platform: finalPlatform,
          ...(reportCategory && { report_category: reportCategory })
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Grant access to specified user or all users
      if (selectedUserId && selectedUserId !== "all") {
        const { error: accessError } = await supabase
          .from('user_report_access')
          .insert({
            user_id: selectedUserId,
            report_id: reportData.id
          });

        if (accessError) throw accessError;
      } else if (selectedUserId === "all") {
        const accessPayload = profiles.map((profile) => ({
          user_id: profile.user_id,
          report_id: reportData.id,
        }));

        if (accessPayload.length > 0) {
          const { error: accessError } = await supabase
            .from('user_report_access')
            .insert(accessPayload);

          if (accessError) throw accessError;
        }
      }

      toast.success("Report uploaded successfully");
      setOpen(false);
      resetForm();
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error("Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setReportType("");
    setSelectedUserId("all");
    setPlatformSection("finance_reports");
    if (!defaultPlatform) {
      setSelectedPlatform("finance");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">PDF File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 2024 Market Analysis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the report content..."
              rows={3}
            />
          </div>

          {!section && (
            <div className="space-y-2">
              <Label htmlFor="platformSection">Platform Section *</Label>
              <Select value={platformSection} onValueChange={setPlatformSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance_reports">FlowPulse Finance Reports</SelectItem>
                  <SelectItem value="investor_research">FlowPulse Investor Research Reports</SelectItem>
                  <SelectItem value="investor_analysis">FlowPulse Investor Analysis Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!defaultPlatform && (
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {getReportTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">Assign to User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    {profile.full_name} ({profile.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a specific user or make it available to all users
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
