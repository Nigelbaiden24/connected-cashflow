import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import {
  FileText, Download, Loader2, Eye, Settings2,
  User, Target, PiggyBank, Home, Landmark, CreditCard,
  TrendingUp, BarChart3, PieChart, Calendar, Shield,
  Wallet, FileCheck, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ComposedChart, Line
} from "recharts";

interface ClientReportGeneratorProps {
  client: any;
  goals: any[];
  portfolioHoldings: any[];
  formatCurrency: (amount: number) => string;
}

interface ReportSection {
  id: string;
  label: string;
  description: string;
  icon: any;
  category: string;
  includeChart?: boolean;
}

const reportSections: ReportSection[] = [
  // Client Overview
  { id: 'executive_summary', label: 'Executive Summary', description: 'High-level overview of financial position', icon: FileText, category: 'Overview' },
  { id: 'personal_details', label: 'Personal Details', description: 'Contact information and demographics', icon: User, category: 'Overview' },
  { id: 'dependents', label: 'Dependents & Family', description: 'Family members and dependents', icon: User, category: 'Overview' },
  
  // Financial Position
  { id: 'net_worth', label: 'Net Worth Statement', description: 'Assets, liabilities and net worth breakdown', icon: Wallet, category: 'Financial Position', includeChart: true },
  { id: 'income_analysis', label: 'Income Analysis', description: 'All income sources and projections', icon: TrendingUp, category: 'Financial Position', includeChart: true },
  { id: 'expenditure', label: 'Expenditure Analysis', description: 'Current and projected spending', icon: CreditCard, category: 'Financial Position', includeChart: true },
  
  // Assets & Investments
  { id: 'asset_allocation', label: 'Asset Allocation', description: 'Current investment portfolio breakdown', icon: PieChart, category: 'Investments', includeChart: true },
  { id: 'portfolio_holdings', label: 'Portfolio Holdings', description: 'Detailed list of all investments', icon: BarChart3, category: 'Investments' },
  { id: 'performance_analysis', label: 'Performance Analysis', description: 'Historical returns and benchmarking', icon: TrendingUp, category: 'Investments', includeChart: true },
  
  // Retirement & Pensions
  { id: 'pension_summary', label: 'Pension Summary', description: 'All pension accounts and values', icon: Landmark, category: 'Retirement' },
  { id: 'retirement_projection', label: 'Retirement Projection', description: 'Lifetime cashflow projection', icon: Calendar, category: 'Retirement', includeChart: true },
  { id: 'state_pension', label: 'State Pension Entitlement', description: 'Estimated state pension income', icon: Shield, category: 'Retirement' },
  
  // Goals & Planning
  { id: 'goals_summary', label: 'Goals Summary', description: 'All financial goals and progress', icon: Target, category: 'Goals', includeChart: true },
  { id: 'goal_probability', label: 'Goal Probability Analysis', description: 'Monte Carlo success rates', icon: BarChart3, category: 'Goals', includeChart: true },
  
  // Property & Debt
  { id: 'property_schedule', label: 'Property Schedule', description: 'Properties, values and mortgages', icon: Home, category: 'Property & Debt' },
  { id: 'debt_schedule', label: 'Debt Schedule', description: 'All loans and repayment plans', icon: CreditCard, category: 'Property & Debt', includeChart: true },
  
  // Risk & Protection
  { id: 'risk_profile', label: 'Risk Profile Assessment', description: 'Risk tolerance and capacity', icon: Shield, category: 'Risk' },
  { id: 'protection_analysis', label: 'Protection Analysis', description: 'Life, income and health cover', icon: Shield, category: 'Risk' },
  
  // Tax & Estate
  { id: 'tax_summary', label: 'Tax Summary', description: 'Income tax and capital gains overview', icon: FileCheck, category: 'Tax & Estate' },
  { id: 'iht_analysis', label: 'IHT Analysis', description: 'Inheritance tax exposure and planning', icon: Landmark, category: 'Tax & Estate', includeChart: true },
  
  // Recommendations
  { id: 'recommendations', label: 'Recommendations', description: 'Adviser recommendations and next steps', icon: Sparkles, category: 'Recommendations' },
  { id: 'action_plan', label: 'Action Plan', description: 'Prioritised action items', icon: FileCheck, category: 'Recommendations' },
];

const groupByCategory = (sections: ReportSection[]) => {
  return sections.reduce((acc, section) => {
    if (!acc[section.category]) acc[section.category] = [];
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, ReportSection[]>);
};

export function ClientReportGenerator({ client, goals, portfolioHoldings, formatCurrency }: ClientReportGeneratorProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'executive_summary', 'net_worth', 'asset_allocation', 'retirement_projection', 'goals_summary', 'recommendations'
  ]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeColorGraphs, setIncludeColorGraphs] = useState(true);
  const [reportTitle, setReportTitle] = useState('Financial Planning Report');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const groupedSections = groupByCategory(reportSections);

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectAll = () => {
    setSelectedSections(reportSections.map(s => s.id));
  };

  const selectNone = () => {
    setSelectedSections([]);
  };

  const selectCategory = (category: string) => {
    const categoryIds = reportSections.filter(s => s.category === category).map(s => s.id);
    const allSelected = categoryIds.every(id => selectedSections.includes(id));
    
    if (allSelected) {
      setSelectedSections(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedSections(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one section to include in the report",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    // Simulate report generation with progress
    const steps = [
      'Gathering client data...',
      'Generating financial charts...',
      'Calculating projections...',
      'Building report layout...',
      'Finalizing PDF...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate PDF content
    const reportContent = generatePDFContent();
    
    // Create a temporary container for the HTML content
    const container = document.createElement('div');
    container.innerHTML = reportContent;
    document.body.appendChild(container);
    
    // Configure html2pdf options for enterprise-grade output
    const opt = {
      margin: [10, 10, 15, 10] as [number, number, number, number],
      filename: `${client?.name?.replace(/\s+/g, '_') || 'Client'}_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(container).save();
      
      toast({
        title: "PDF Report Generated",
        description: `${selectedSections.length} sections included in your professional report`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Downloading as HTML instead.",
        variant: "destructive"
      });
      
      // Fallback to HTML download
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client?.name?.replace(/\s+/g, '_') || 'Client'}_Financial_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      document.body.removeChild(container);
    }

    setGenerating(false);
    setProgress(0);
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    
    const netWorth = client?.net_worth || 1050000;
    const totalAssets = netWorth + 340000;
    const totalLiabilities = 340000;

    // Generate chart SVGs for the report
    const assetAllocationData = [
      { name: 'Equities', value: 45, color: '#3b82f6' },
      { name: 'Fixed Income', value: 28, color: '#10b981' },
      { name: 'Property', value: 15, color: '#f59e0b' },
      { name: 'Cash', value: 7, color: '#6366f1' },
      { name: 'Alternative', value: 5, color: '#ec4899' },
    ];

    const projectionData = Array.from({ length: 50 }, (_, i) => ({
      age: 45 + i,
      assets: Math.round(500000 * Math.pow(1.05, i) * (i < 20 ? 1.1 : 0.95)),
    }));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - ${client?.name || 'Client'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: white; text-align: center; page-break-after: always; }
    .cover h1 { font-size: 36px; margin-bottom: 20px; }
    .cover h2 { font-size: 24px; font-weight: 400; margin-bottom: 40px; opacity: 0.9; }
    .cover .date { font-size: 14px; opacity: 0.7; }
    .cover .logo { width: 120px; height: 120px; background: white; border-radius: 50%; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #1e3a5f; }
    .section { margin-bottom: 40px; page-break-inside: avoid; }
    .section-title { font-size: 22px; color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
    .subsection { margin-bottom: 20px; }
    .subsection-title { font-size: 16px; color: #374151; margin-bottom: 10px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    .highlight { background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 15px 0; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .metric-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: 700; color: #1e3a5f; }
    .metric-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
    .chart-container { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; min-height: 200px; }
    .progress-bar { background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; margin: 10px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #059669; }
    .badge-warning { background: #fef3c7; color: #d97706; }
    .badge-info { background: #dbeafe; color: #2563eb; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 40px; }
    @media print { .page { max-width: 100%; } .cover { page-break-after: always; } }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="logo">FP</div>
    <h1>${reportTitle}</h1>
    <h2>Prepared for ${client?.name || 'Client'}</h2>
    <p class="date">${currentDate}</p>
  </div>

  <div class="page">
    ${selectedSections.includes('executive_summary') ? `
    <div class="section">
      <h2 class="section-title">Executive Summary</h2>
      <div class="highlight">
        <p>This comprehensive financial planning report has been prepared for <strong>${client?.name || 'the client'}</strong> as of ${currentDate}. 
        It provides a detailed analysis of your current financial position, investment portfolio, retirement projections, and recommendations for achieving your financial goals.</p>
      </div>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(netWorth)}</div>
          <div class="metric-label">Net Worth</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${goals.length || 2}</div>
          <div class="metric-label">Active Goals</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">92%</div>
          <div class="metric-label">Plan Success Rate</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('personal_details') ? `
    <div class="section">
      <h2 class="section-title">Personal Details</h2>
      <table>
        <tr><th>Full Name</th><td>${client?.name || 'N/A'}</td></tr>
        <tr><th>Email</th><td>${client?.email || 'N/A'}</td></tr>
        <tr><th>Phone</th><td>${client?.phone || 'N/A'}</td></tr>
        <tr><th>Address</th><td>${client?.address || 'N/A'}</td></tr>
        <tr><th>Date of Birth</th><td>${client?.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}</td></tr>
        <tr><th>Occupation</th><td>${client?.occupation || 'N/A'}</td></tr>
        <tr><th>Risk Profile</th><td><span class="badge badge-info">${client?.risk_profile || 'Moderate'}</span></td></tr>
      </table>
    </div>
    ` : ''}

    ${selectedSections.includes('net_worth') ? `
    <div class="section">
      <h2 class="section-title">Net Worth Statement</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value" style="color: #10b981;">${formatCurrency(totalAssets)}</div>
          <div class="metric-label">Total Assets</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: #ef4444;">${formatCurrency(totalLiabilities)}</div>
          <div class="metric-label">Total Liabilities</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(netWorth)}</div>
          <div class="metric-label">Net Worth</div>
        </div>
      </div>
      <table>
        <tr><th>Asset Category</th><th>Value</th><th>% of Total</th></tr>
        <tr><td>Pensions</td><td>${formatCurrency(494000)}</td><td>35.5%</td></tr>
        <tr><td>Property Equity</td><td>${formatCurrency(630000)}</td><td>45.3%</td></tr>
        <tr><td>ISAs</td><td>${formatCurrency(85000)}</td><td>6.1%</td></tr>
        <tr><td>General Investments</td><td>${formatCurrency(125000)}</td><td>9.0%</td></tr>
        <tr><td>Cash</td><td>${formatCurrency(56000)}</td><td>4.0%</td></tr>
        <tr style="background: #f3f4f6; font-weight: bold;"><td>Total Assets</td><td>${formatCurrency(totalAssets)}</td><td>100%</td></tr>
      </table>
    </div>
    ` : ''}

    ${selectedSections.includes('asset_allocation') && includeCharts ? `
    <div class="section">
      <h2 class="section-title">Asset Allocation</h2>
      <div class="chart-container">
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
          ${assetAllocationData.map(item => `
            <div style="text-align: center; margin: 10px;">
              <div style="width: 80px; height: 80px; background: ${item.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${item.value}%</div>
              <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">${item.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <table>
        <tr><th>Asset Class</th><th>Current %</th><th>Target %</th><th>Status</th></tr>
        ${assetAllocationData.map(item => `
          <tr>
            <td><span style="display: inline-block; width: 12px; height: 12px; background: ${item.color}; border-radius: 50%; margin-right: 8px;"></span>${item.name}</td>
            <td>${item.value}%</td>
            <td>${item.value}%</td>
            <td><span class="badge badge-success">On Target</span></td>
          </tr>
        `).join('')}
      </table>
    </div>
    ` : ''}

    ${selectedSections.includes('goals_summary') ? `
    <div class="section">
      <h2 class="section-title">Financial Goals</h2>
      ${goals.length > 0 ? goals.map(goal => `
        <div class="subsection" style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="subsection-title" style="margin: 0;">${goal.goal_name}</div>
            <span class="badge ${goal.status === 'On Track' ? 'badge-success' : 'badge-warning'}">${goal.status}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 10px;">
            <div><span style="color: #6b7280; font-size: 12px;">Target</span><br><strong>${formatCurrency(goal.target_amount)}</strong></div>
            <div><span style="color: #6b7280; font-size: 12px;">Current</span><br><strong>${formatCurrency(goal.current_amount)}</strong></div>
            <div><span style="color: #6b7280; font-size: 12px;">Target Date</span><br><strong>${new Date(goal.target_date).toLocaleDateString('en-GB')}</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${Math.round((goal.current_amount / goal.target_amount) * 100)}%"></div></div>
          <div style="font-size: 12px; color: #6b7280; text-align: right;">${Math.round((goal.current_amount / goal.target_amount) * 100)}% complete</div>
        </div>
      `).join('') : `
        <div class="subsection" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          <div class="subsection-title">Retirement at 65</div>
          <div class="progress-bar"><div class="progress-fill" style="width: 68%"></div></div>
          <div style="font-size: 12px; color: #6b7280;">68% funded • Target: ${formatCurrency(1500000)}</div>
        </div>
        <div class="subsection" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          <div class="subsection-title">Children's Education</div>
          <div class="progress-bar"><div class="progress-fill" style="width: 42%"></div></div>
          <div style="font-size: 12px; color: #6b7280;">42% funded • Target: ${formatCurrency(120000)}</div>
        </div>
      `}
    </div>
    ` : ''}

    ${selectedSections.includes('retirement_projection') ? `
    <div class="section">
      <h2 class="section-title">Retirement Projection</h2>
      <div class="highlight">
        <p>Based on current savings rate and investment strategy, you are projected to achieve <strong>92%</strong> of your retirement income target with a high confidence level.</p>
      </div>
      ${includeCharts ? `
      <div class="chart-container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 150px; padding: 10px;">
          ${projectionData.filter((_, i) => i % 5 === 0).map((d, i) => `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 20px; background: linear-gradient(180deg, #3b82f6, #10b981); height: ${Math.min(d.assets / 20000, 120)}px; border-radius: 4px 4px 0 0;"></div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${d.age}</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align: center; font-size: 12px; color: #6b7280;">Projected Assets by Age</div>
      </div>
      ` : ''}
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">65</div>
          <div class="metric-label">Retirement Age</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(45000)}</div>
          <div class="metric-label">Annual Income Target</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">30 yrs</div>
          <div class="metric-label">Retirement Duration</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('pension_summary') ? `
    <div class="section">
      <h2 class="section-title">Pension Summary</h2>
      <table>
        <tr><th>Pension Account</th><th>Provider</th><th>Type</th><th>Value/Annual</th></tr>
        <tr><td>SIPP</td><td>Hargreaves Lansdown</td><td>DC</td><td>${formatCurrency(285000)}</td></tr>
        <tr><td>Workplace Pension</td><td>Aviva</td><td>DC</td><td>${formatCurrency(142000)}</td></tr>
        <tr><td>Previous Employer</td><td>Scottish Widows</td><td>DC</td><td>${formatCurrency(67000)}</td></tr>
        <tr><td>DB Pension (Deferred)</td><td>BT</td><td>DB</td><td>${formatCurrency(12500)}/yr</td></tr>
        <tr><td>State Pension</td><td>HMRC</td><td>State</td><td>${formatCurrency(10600)}/yr</td></tr>
        <tr style="background: #f3f4f6; font-weight: bold;"><td colspan="3">Total DC Fund Value</td><td>${formatCurrency(494000)}</td></tr>
      </table>
    </div>
    ` : ''}

    ${selectedSections.includes('property_schedule') ? `
    <div class="section">
      <h2 class="section-title">Property Schedule</h2>
      <table>
        <tr><th>Property</th><th>Type</th><th>Value</th><th>Mortgage</th><th>Equity</th></tr>
        <tr><td>Main Residence</td><td>Primary</td><td>${formatCurrency(650000)}</td><td>${formatCurrency(180000)}</td><td>${formatCurrency(470000)}</td></tr>
        <tr><td>Buy-to-Let</td><td>Investment</td><td>${formatCurrency(320000)}</td><td>${formatCurrency(160000)}</td><td>${formatCurrency(160000)}</td></tr>
        <tr style="background: #f3f4f6; font-weight: bold;"><td colspan="2">Total</td><td>${formatCurrency(970000)}</td><td>${formatCurrency(340000)}</td><td>${formatCurrency(630000)}</td></tr>
      </table>
    </div>
    ` : ''}

    ${selectedSections.includes('recommendations') ? `
    <div class="section">
      <h2 class="section-title">Recommendations</h2>
      <div class="subsection">
        <div class="highlight" style="border-left-color: #10b981;">
          <strong>1. Maximise Pension Contributions</strong>
          <p style="margin-top: 8px;">Consider increasing annual pension contributions to utilise the full £60,000 annual allowance. This would provide additional tax relief and boost retirement savings.</p>
        </div>
        <div class="highlight" style="border-left-color: #f59e0b;">
          <strong>2. ISA Utilisation</strong>
          <p style="margin-top: 8px;">Ensure full use of the £20,000 annual ISA allowance for both partners. Consider Junior ISAs for children's education funding.</p>
        </div>
        <div class="highlight" style="border-left-color: #6366f1;">
          <strong>3. Protection Review</strong>
          <p style="margin-top: 8px;">Review life insurance and income protection levels to ensure adequate coverage for the family. Current cover may be insufficient given increased liabilities.</p>
        </div>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('action_plan') ? `
    <div class="section">
      <h2 class="section-title">Action Plan</h2>
      <table>
        <tr><th>Priority</th><th>Action</th><th>Deadline</th><th>Status</th></tr>
        <tr><td><span class="badge badge-warning">High</span></td><td>Review pension fund selection</td><td>Within 30 days</td><td>Pending</td></tr>
        <tr><td><span class="badge badge-warning">High</span></td><td>Increase life cover</td><td>Within 60 days</td><td>Pending</td></tr>
        <tr><td><span class="badge badge-info">Medium</span></td><td>Consolidate old pensions</td><td>Within 90 days</td><td>Pending</td></tr>
        <tr><td><span class="badge badge-success">Low</span></td><td>Annual cashflow review</td><td>12 months</td><td>Scheduled</td></tr>
      </table>
    </div>
    ` : ''}

    <div class="footer">
      <p>This report was generated on ${currentDate}</p>
      <p>FlowPulse Financial Planning Platform</p>
      <p style="margin-top: 10px; font-size: 10px;">This document is for informational purposes only and does not constitute financial advice. Please consult with your financial adviser before making any investment decisions.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Client Report
              </CardTitle>
              <CardDescription>
                Select the sections and options for your client's financial planning report
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Financial Planning Report"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="charts" 
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="charts" className="text-sm">Include Charts</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="colors" 
                  checked={includeColorGraphs}
                  onCheckedChange={(checked) => setIncludeColorGraphs(checked as boolean)}
                />
                <Label htmlFor="colors" className="text-sm">Color Graphs</Label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-6">
              <Badge variant="outline" className="gap-1">
                <FileCheck className="h-3 w-3" />
                {selectedSections.length} sections selected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedSections).map(([category, sections]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => selectCategory(category)}
                  className="h-7 text-xs"
                >
                  {sections.every(s => selectedSections.includes(s.id)) ? 'Deselect' : 'Select'} All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSections.includes(section.id) 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Checkbox 
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm truncate">{section.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  {section.includeChart && (
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Chart
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Button */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground">
                Your report will include {selectedSections.length} sections with 
                {includeCharts ? ' charts and graphs' : ' tables only'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={generateReport} 
                disabled={generating || selectedSections.length === 0}
                className="min-w-[180px]"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {generating && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Generating report... {Math.round(progress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
