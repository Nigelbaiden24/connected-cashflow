import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, File, Table as TableIcon, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { generateFinancialReport } from "@/utils/pdfGenerator";

interface PlanExporterProps {
  plans: any[];
  selectedPlans?: string[];
}

export function PlanExporter({ plans, selectedPlans }: PlanExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getPlansToExport = () => {
    if (selectedPlans && selectedPlans.length > 0) {
      return plans.filter(p => selectedPlans.includes(p.id));
    }
    return plans;
  };

  const exportAsCSV = () => {
    try {
      const plansToExport = getPlansToExport();
      if (plansToExport.length === 0) {
        toast.error("No plans to export");
        return;
      }

      const headers = [
        "Plan Name",
        "Plan Type",
        "Status",
        "Risk Tolerance",
        "Current Net Worth",
        "Target Net Worth",
        "Time Horizon",
        "Start Date",
        "Created At"
      ];

      const rows = plansToExport.map(plan => [
        plan.plan_name,
        plan.plan_type,
        plan.status,
        plan.risk_tolerance || "",
        plan.current_net_worth || "",
        plan.target_net_worth || "",
        plan.time_horizon || "",
        plan.start_date,
        new Date(plan.created_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `financial-plans-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const plansToExport = getPlansToExport();
      if (plansToExport.length === 0) {
        toast.error("No plans to export");
        return;
      }

      // Create a formatted report content
      const content = plansToExport.map(plan => {
        return `
**${plan.plan_name}**
Type: ${plan.plan_type}
Status: ${plan.status}
Risk Tolerance: ${plan.risk_tolerance || 'N/A'}
Current Net Worth: £${(plan.current_net_worth || 0).toLocaleString()}
Target Net Worth: £${(plan.target_net_worth || 0).toLocaleString()}
Time Horizon: ${plan.time_horizon || 'N/A'} years
Start Date: ${new Date(plan.start_date).toLocaleDateString()}

Primary Objectives:
${plan.primary_objectives?.map((obj: string) => `• ${obj}`).join('\n') || 'None specified'}

${plan.notes ? `Notes: ${plan.notes}` : ''}
---
`;
      }).join('\n');

      generateFinancialReport({
        title: `Financial Plans Report - ${new Date().toLocaleDateString()}`,
        content,
        generatedBy: "FlowPulse Financial Planning System",
        date: new Date()
      });

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = () => {
    try {
      const plansToExport = getPlansToExport();
      if (plansToExport.length === 0) {
        toast.error("No plans to export");
        return;
      }

      const jsonContent = JSON.stringify(plansToExport, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `financial-plans-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("JSON exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export JSON");
    }
  };

  const plansCount = selectedPlans && selectedPlans.length > 0 ? selectedPlans.length : plans.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || plans.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export ({plansCount})
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          <TableIcon className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <File className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}