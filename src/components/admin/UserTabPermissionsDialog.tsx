import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  Briefcase, 
  TrendingUp,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Sparkles,
  TrendingUp as MarketIcon,
  Bot,
  FolderKanban,
  Zap,
  BarChart3,
  Lightbulb,
  Calculator,
  PieChart,
  Target,
  AlertTriangle,
  Activity,
  Users,
  UserPlus,
  Shield,
  FileText,
  Bell,
  Mail,
  LineChart,
  Search,
  GraduationCap,
  Database,
  Eye,
  ClipboardList
} from "lucide-react";

interface UserTabPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    email: string;
    full_name: string;
  } | null;
  onPermissionsUpdated: () => void;
}

interface TabPermission {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const financeTabPermissions: TabPermission[] = [
  // AI Tools
  { key: "finance_dashboard", label: "Dashboard", icon: LayoutDashboard, category: "AI Tools" },
  { key: "finance_ai_chatbot", label: "AI Chatbot", icon: MessageSquare, category: "AI Tools" },
  { key: "finance_calendar", label: "Calendar", icon: Calendar, category: "AI Tools" },
  { key: "finance_document_generator", label: "Document Generator", icon: Sparkles, category: "AI Tools" },
  { key: "finance_market_data", label: "Market Data", icon: MarketIcon, category: "AI Tools" },
  // Research & Analysis
  { key: "finance_market_commentary", label: "Market Commentary", icon: TrendingUp, category: "Research & Analysis" },
  { key: "finance_model_portfolios", label: "Model Portfolios", icon: Briefcase, category: "Research & Analysis" },
  { key: "finance_benchmarking_trends", label: "Benchmarking & Trends", icon: Activity, category: "Research & Analysis" },
  { key: "finance_ai_analyst", label: "AI Analyst", icon: Bot, category: "Research & Analysis" },
  { key: "finance_watchlists", label: "Watchlists", icon: FolderKanban, category: "Research & Analysis" },
  { key: "finance_screeners", label: "Screeners & Discovery", icon: Zap, category: "Research & Analysis" },
  { key: "finance_fund_database", label: "Fund & ETF Database", icon: BarChart3, category: "Research & Analysis" },
  { key: "finance_stocks_crypto", label: "Stocks & Crypto", icon: TrendingUp, category: "Research & Analysis" },
  { key: "finance_opportunities", label: "Opportunity Intelligence", icon: Lightbulb, category: "Research & Analysis" },
  // Financial Planning
  { key: "finance_financial_planning", label: "Financial Planning", icon: Calculator, category: "Financial Planning" },
  { key: "finance_portfolio_management", label: "Portfolio Management", icon: PieChart, category: "Financial Planning" },
  { key: "finance_goal_planning", label: "Goal Planning", icon: Target, category: "Financial Planning" },
  { key: "finance_investment_analysis", label: "Investment Analysis", icon: BarChart3, category: "Financial Planning" },
  { key: "finance_risk_assessment", label: "Risk Assessment", icon: AlertTriangle, category: "Financial Planning" },
  { key: "finance_scenario_analysis", label: "Scenario Analysis", icon: Activity, category: "Financial Planning" },
  // Practice Management
  { key: "finance_crm", label: "CRM", icon: Users, category: "Practice Management" },
  { key: "finance_client_management", label: "Client Management", icon: Users, category: "Practice Management" },
  { key: "finance_client_onboarding", label: "Client Onboarding", icon: UserPlus, category: "Practice Management" },
  { key: "finance_practice_management", label: "Practice Management", icon: Briefcase, category: "Practice Management" },
  { key: "finance_payroll", label: "Payroll", icon: Calculator, category: "Practice Management" },
  { key: "finance_compliance", label: "Compliance", icon: Shield, category: "Practice Management" },
  { key: "finance_reports", label: "Reports", icon: FileText, category: "Practice Management" },
  { key: "finance_security", label: "Security", icon: Shield, category: "Practice Management" },
  { key: "finance_automation", label: "Automation Center", icon: Activity, category: "Practice Management" },
];

const investorTabPermissions: TabPermission[] = [
  { key: "investor_dashboard", label: "Dashboard", icon: BarChart3, category: "Main" },
  { key: "investor_research_reports", label: "Research Reports", icon: FileText, category: "Main" },
  { key: "investor_analysis_reports", label: "Analysis Reports", icon: BarChart3, category: "Main" },
  { key: "investor_market_commentary", label: "Market Commentary", icon: TrendingUp, category: "Main" },
  { key: "investor_model_portfolios", label: "Model Portfolios", icon: Briefcase, category: "Main" },
  { key: "investor_signals_alerts", label: "Signals & Alerts", icon: Bell, category: "Main" },
  { key: "investor_newsletters", label: "Newsletters", icon: Mail, category: "Main" },
  { key: "investor_benchmarking_trends", label: "Benchmarking & Trends", icon: LineChart, category: "Main" },
  { key: "investor_screeners", label: "Screeners & Discovery", icon: Search, category: "Main" },
  { key: "investor_fund_database", label: "Fund & ETF Database", icon: Database, category: "Main" },
  { key: "investor_stocks_crypto", label: "Stocks & Crypto", icon: TrendingUp, category: "Main" },
  { key: "investor_ai_analyst", label: "AI Analyst", icon: Bot, category: "Main" },
  { key: "investor_learning_hub", label: "Learning Hub", icon: GraduationCap, category: "Main" },
  { key: "investor_market_data_hub", label: "Market Data Hub", icon: Database, category: "Main" },
  { key: "investor_tools_calculators", label: "Tools & Calculators", icon: Calculator, category: "Main" },
  { key: "investor_risk_compliance", label: "Risk & Compliance", icon: Shield, category: "Main" },
  { key: "investor_opportunities", label: "Opportunity Intelligence", icon: Lightbulb, category: "Main" },
  { key: "investor_watchlists", label: "Watchlists", icon: Eye, category: "Main" },
  { key: "investor_tasks", label: "Tasks", icon: ClipboardList, category: "Main" },
];

type PermissionState = Record<string, boolean>;

export function UserTabPermissionsDialog({ 
  open, 
  onOpenChange, 
  user, 
  onPermissionsUpdated 
}: UserTabPermissionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [financePermissions, setFinancePermissions] = useState<PermissionState>({});
  const [investorPermissions, setInvestorPermissions] = useState<PermissionState>({});

  useEffect(() => {
    if (open && user) {
      fetchPermissions();
    }
  }, [open, user]);

  const fetchPermissions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_permissions")
        .select("*")
        .eq("user_id", user.user_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Initialize permissions from database or defaults
      const financePerms: PermissionState = {};
      const investorPerms: PermissionState = {};

      financeTabPermissions.forEach(p => {
        const value = data?.[p.key as keyof typeof data];
        financePerms[p.key] = typeof value === 'boolean' ? value : true;
      });

      investorTabPermissions.forEach(p => {
        const value = data?.[p.key as keyof typeof data];
        investorPerms[p.key] = typeof value === 'boolean' ? value : true;
      });

      setFinancePermissions(financePerms);
      setInvestorPermissions(investorPerms);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const permissions = { ...financePermissions, ...investorPermissions };
      
      const { error } = await supabase.rpc('update_tab_permissions', {
        _user_id: user.user_id,
        _permissions: permissions
      });

      if (error) throw error;

      toast.success("Permissions updated successfully");
      onPermissionsUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const toggleFinancePermission = (key: string) => {
    setFinancePermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInvestorPermission = (key: string) => {
    setInvestorPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllFinance = () => {
    const all: PermissionState = {};
    financeTabPermissions.forEach(p => { all[p.key] = true; });
    setFinancePermissions(all);
  };

  const clearAllFinance = () => {
    const all: PermissionState = {};
    financeTabPermissions.forEach(p => { all[p.key] = false; });
    setFinancePermissions(all);
  };

  const selectAllInvestor = () => {
    const all: PermissionState = {};
    investorTabPermissions.forEach(p => { all[p.key] = true; });
    setInvestorPermissions(all);
  };

  const clearAllInvestor = () => {
    const all: PermissionState = {};
    investorTabPermissions.forEach(p => { all[p.key] = false; });
    setInvestorPermissions(all);
  };

  const groupByCategory = (permissions: TabPermission[]) => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, TabPermission[]>);
  };

  const financeGrouped = groupByCategory(financeTabPermissions);
  const investorGrouped = groupByCategory(investorTabPermissions);

  const financeEnabledCount = Object.values(financePermissions).filter(Boolean).length;
  const investorEnabledCount = Object.values(investorPermissions).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Tab Permissions for {user?.full_name}
          </DialogTitle>
          <DialogDescription>
            Configure which tabs and features this user can access on each platform
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="finance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Finance Platform
                <Badge variant="secondary" className="ml-1">
                  {financeEnabledCount}/{financeTabPermissions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="investor" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Investor Platform
                <Badge variant="secondary" className="ml-1">
                  {investorEnabledCount}/{investorTabPermissions.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="finance" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Select which Finance platform tabs this user can access
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFinance}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFinance}>
                    Clear All
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(financeGrouped).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-primary mb-3">{category}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const Icon = perm.icon;
                          return (
                            <div 
                              key={perm.key}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                financePermissions[perm.key] 
                                  ? 'bg-primary/5 border-primary/30' 
                                  : 'bg-muted/30 border-border'
                              }`}
                              onClick={() => toggleFinancePermission(perm.key)}
                            >
                              <Checkbox 
                                checked={financePermissions[perm.key] || false}
                                onCheckedChange={() => toggleFinancePermission(perm.key)}
                              />
                              <Icon className={`h-4 w-4 ${financePermissions[perm.key] ? 'text-primary' : 'text-muted-foreground'}`} />
                              <Label className="cursor-pointer font-medium text-sm">
                                {perm.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="investor" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Select which Investor platform tabs this user can access
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllInvestor}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllInvestor}>
                    Clear All
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(investorGrouped).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-primary mb-3">{category}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {perms.map(perm => {
                          const Icon = perm.icon;
                          return (
                            <div 
                              key={perm.key}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                investorPermissions[perm.key] 
                                  ? 'bg-primary/5 border-primary/30' 
                                  : 'bg-muted/30 border-border'
                              }`}
                              onClick={() => toggleInvestorPermission(perm.key)}
                            >
                              <Checkbox 
                                checked={investorPermissions[perm.key] || false}
                                onCheckedChange={() => toggleInvestorPermission(perm.key)}
                              />
                              <Icon className={`h-4 w-4 ${investorPermissions[perm.key] ? 'text-primary' : 'text-muted-foreground'}`} />
                              <Label className="cursor-pointer font-medium text-sm">
                                {perm.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}