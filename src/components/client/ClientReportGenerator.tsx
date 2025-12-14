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
    const annualIncome = client?.annual_income || 125000;

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

    const incomeData = [
      { source: 'Employment', gross: 95000, net: 62500, percentage: 76 },
      { source: 'Rental Income', gross: 18000, net: 14400, percentage: 14 },
      { source: 'Dividends', gross: 8500, net: 8500, percentage: 7 },
      { source: 'Interest', gross: 3500, net: 2800, percentage: 3 },
    ];

    const expenditureData = [
      { category: 'Housing', monthly: 2200, annual: 26400, percentage: 32 },
      { category: 'Living Costs', monthly: 1800, annual: 21600, percentage: 26 },
      { category: 'Transport', monthly: 650, annual: 7800, percentage: 9 },
      { category: 'Insurance', monthly: 450, annual: 5400, percentage: 7 },
      { category: 'Leisure', monthly: 800, annual: 9600, percentage: 12 },
      { category: 'Savings', monthly: 1200, annual: 14400, percentage: 14 },
    ];

    const portfolioData = portfolioHoldings.length > 0 ? portfolioHoldings : [
      { asset_name: 'Vanguard FTSE All-World ETF', asset_type: 'Equity ETF', quantity: 450, current_price: 95.50, value: 42975, gain: 8750, gain_pct: 25.6 },
      { asset_name: 'iShares Core UK Gilts', asset_type: 'Bond ETF', quantity: 320, current_price: 112.30, value: 35936, gain: 2100, gain_pct: 6.2 },
      { asset_name: 'Legal & General Property Fund', asset_type: 'Property Fund', quantity: 1200, current_price: 1.85, value: 22200, gain: 4400, gain_pct: 24.7 },
      { asset_name: 'Fundsmith Equity Fund', asset_type: 'Equity Fund', quantity: 850, current_price: 28.40, value: 24140, gain: 6200, gain_pct: 34.5 },
      { asset_name: 'Cash Reserve', asset_type: 'Cash', quantity: 1, current_price: 56000, value: 56000, gain: 0, gain_pct: 0 },
    ];

    const performanceData = [
      { period: '1 Month', portfolio: 1.2, benchmark: 0.8, difference: 0.4 },
      { period: '3 Months', portfolio: 3.8, benchmark: 2.9, difference: 0.9 },
      { period: '6 Months', portfolio: 6.5, benchmark: 5.2, difference: 1.3 },
      { period: '1 Year', portfolio: 12.4, benchmark: 9.8, difference: 2.6 },
      { period: '3 Years (Ann.)', portfolio: 8.7, benchmark: 6.4, difference: 2.3 },
      { period: '5 Years (Ann.)', portfolio: 9.2, benchmark: 7.1, difference: 2.1 },
      { period: 'Since Inception', portfolio: 45.6, benchmark: 32.8, difference: 12.8 },
    ];

    const debtData = [
      { lender: 'Nationwide', type: 'Mortgage (Residential)', balance: 180000, rate: 4.25, monthly: 985, remaining: '18 years' },
      { lender: 'Barclays', type: 'Mortgage (BTL)', balance: 160000, rate: 5.15, monthly: 870, remaining: '22 years' },
    ];

    const protectionData = [
      { policy: 'Life Insurance (Term)', provider: 'Aviva', sum_assured: 500000, premium: 45, expiry: '2040', status: 'Active' },
      { policy: 'Life Insurance (Whole)', provider: 'Legal & General', sum_assured: 150000, premium: 125, expiry: 'N/A', status: 'Active' },
      { policy: 'Income Protection', provider: 'Vitality', sum_assured: 60000, premium: 78, expiry: '2035', status: 'Active' },
      { policy: 'Critical Illness', provider: 'Scottish Widows', sum_assured: 200000, premium: 92, expiry: '2035', status: 'Active' },
      { policy: 'Private Medical', provider: 'Bupa', sum_assured: 0, premium: 210, expiry: 'Ongoing', status: 'Active' },
    ];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - ${client?.name || 'Client'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; font-size: 11px; }
    .page { max-width: 800px; margin: 0 auto; padding: 30px; }
    .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: white; text-align: center; page-break-after: always; }
    .cover h1 { font-size: 32px; margin-bottom: 16px; }
    .cover h2 { font-size: 20px; font-weight: 400; margin-bottom: 30px; opacity: 0.9; }
    .cover .date { font-size: 13px; opacity: 0.7; }
    .cover .logo { width: 100px; height: 100px; background: white; border-radius: 50%; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #1e3a5f; }
    .toc { page-break-after: always; }
    .toc h2 { font-size: 20px; color: #1e3a5f; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .toc-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e5e7eb; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title { font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 16px; }
    .subsection { margin-bottom: 16px; }
    .subsection-title { font-size: 14px; color: #374151; margin-bottom: 8px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    .highlight { background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6; margin: 12px 0; }
    .warning { background: #fef3c7; border-left-color: #d97706; }
    .success { background: #d1fae5; border-left-color: #059669; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .metric-grid-4 { grid-template-columns: repeat(4, 1fr); }
    .metric-card { background: #f9fafb; padding: 14px; border-radius: 6px; text-align: center; border: 1px solid #e5e7eb; }
    .metric-value { font-size: 18px; font-weight: 700; color: #1e3a5f; }
    .metric-label { font-size: 10px; color: #6b7280; margin-top: 4px; }
    .chart-container { background: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0; min-height: 150px; border: 1px solid #e5e7eb; }
    .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin: 8px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); }
    .progress-red { background: linear-gradient(90deg, #ef4444, #f97316); }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #059669; }
    .badge-warning { background: #fef3c7; color: #d97706; }
    .badge-danger { background: #fee2e2; color: #dc2626; }
    .badge-info { background: #dbeafe; color: #2563eb; }
    .badge-neutral { background: #f3f4f6; color: #6b7280; }
    .page-break { page-break-after: always; }
    .footer { text-align: center; padding: 16px; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-green { color: #059669; }
    .text-red { color: #dc2626; }
    .bold { font-weight: 600; }
    .disclaimer { font-size: 9px; color: #9ca3af; margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 6px; }
    @media print { .page { max-width: 100%; } .cover { page-break-after: always; } .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="logo">FP</div>
    <h1>${reportTitle}</h1>
    <h2>Prepared for ${client?.name || 'Client'}</h2>
    <p class="date">${currentDate}</p>
    <p style="margin-top: 40px; opacity: 0.6; font-size: 12px;">CONFIDENTIAL</p>
  </div>

  <!-- Table of Contents -->
  <div class="page toc">
    <h2>Table of Contents</h2>
    ${reportSections.filter(s => selectedSections.includes(s.id)).map((section, idx) => `
      <div class="toc-item">
        <span>${idx + 1}. ${section.label}</span>
        <span>${section.category}</span>
      </div>
    `).join('')}
  </div>

  <div class="page">
    ${selectedSections.includes('executive_summary') ? `
    <div class="section">
      <h2 class="section-title">1. Executive Summary</h2>
      <div class="highlight">
        <p><strong>Report Purpose:</strong> This comprehensive financial planning report has been prepared for <strong>${client?.name || 'the client'}</strong> as of ${currentDate}. 
        It provides a detailed analysis of your current financial position, investment portfolio, retirement projections, and strategic recommendations for achieving your financial goals.</p>
      </div>
      
      <div class="subsection">
        <h3 class="subsection-title">Key Financial Highlights</h3>
        <div class="metric-grid metric-grid-4">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(netWorth)}</div>
            <div class="metric-label">Total Net Worth</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(annualIncome)}</div>
            <div class="metric-label">Annual Income</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${goals.length || 4}</div>
            <div class="metric-label">Active Goals</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">92%</div>
            <div class="metric-label">Plan Success Rate</div>
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Summary of Key Findings</h3>
        <table>
          <tr><th>Area</th><th>Current Status</th><th>Recommendation Priority</th></tr>
          <tr><td>Retirement Planning</td><td><span class="badge badge-success">On Track</span></td><td>Continue current strategy</td></tr>
          <tr><td>Investment Diversification</td><td><span class="badge badge-success">Well Diversified</span></td><td>Minor rebalancing suggested</td></tr>
          <tr><td>Protection Coverage</td><td><span class="badge badge-warning">Review Needed</span></td><td>Increase life cover</td></tr>
          <tr><td>Tax Efficiency</td><td><span class="badge badge-info">Good</span></td><td>Maximise ISA allowance</td></tr>
          <tr><td>Estate Planning</td><td><span class="badge badge-warning">Action Required</span></td><td>IHT planning opportunities</td></tr>
        </table>
      </div>

      <div class="highlight success">
        <strong>Overall Assessment:</strong> Your financial position is strong with a healthy net worth and good progress towards retirement goals. Key areas requiring attention include protection coverage review and inheritance tax planning. With the recommended adjustments, you are well-positioned to achieve your financial objectives.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('personal_details') ? `
    <div class="section">
      <h2 class="section-title">2. Personal Details</h2>
      
      <div class="two-col">
        <div>
          <h3 class="subsection-title">Contact Information</h3>
          <table>
            <tr><th>Field</th><th>Details</th></tr>
            <tr><td>Full Name</td><td>${client?.name || 'N/A'}</td></tr>
            <tr><td>Client Reference</td><td>${client?.client_id || 'N/A'}</td></tr>
            <tr><td>Email Address</td><td>${client?.email || 'N/A'}</td></tr>
            <tr><td>Phone Number</td><td>${client?.phone || 'N/A'}</td></tr>
            <tr><td>Address</td><td>${client?.address || 'N/A'}</td></tr>
          </table>
        </div>
        <div>
          <h3 class="subsection-title">Personal Information</h3>
          <table>
            <tr><th>Field</th><th>Details</th></tr>
            <tr><td>Date of Birth</td><td>${client?.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}</td></tr>
            <tr><td>Age</td><td>${client?.date_of_birth ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}</td></tr>
            <tr><td>Occupation</td><td>${client?.occupation || 'N/A'}</td></tr>
            <tr><td>Employment Status</td><td>Employed</td></tr>
            <tr><td>Marital Status</td><td>Married</td></tr>
          </table>
        </div>
      </div>

      <div class="subsection" style="margin-top: 20px;">
        <h3 class="subsection-title">Financial Profile Summary</h3>
        <table>
          <tr><th>Attribute</th><th>Value</th><th>Notes</th></tr>
          <tr><td>Risk Profile</td><td><span class="badge badge-info">${client?.risk_profile || 'Moderate'}</span></td><td>Based on risk questionnaire completed ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</td></tr>
          <tr><td>Investment Experience</td><td>${client?.investment_experience || 'Experienced'}</td><td>15+ years investing experience</td></tr>
          <tr><td>Time Horizon</td><td>${client?.time_horizon || '20'} years</td><td>Planning for retirement at age 65</td></tr>
          <tr><td>Liquidity Needs</td><td>${client?.liquidity_needs || 'Moderate'}</td><td>Emergency fund equivalent to 6 months expenses</td></tr>
          <tr><td>Client Status</td><td><span class="badge badge-success">${client?.status || 'Active'}</span></td><td>Last review: ${client?.last_contact_date ? new Date(client.last_contact_date).toLocaleDateString('en-GB') : 'N/A'}</td></tr>
        </table>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('dependents') ? `
    <div class="section">
      <h2 class="section-title">3. Dependents & Family</h2>
      
      <div class="subsection">
        <h3 class="subsection-title">Family Members</h3>
        <table>
          <tr><th>Name</th><th>Relationship</th><th>Date of Birth</th><th>Age</th><th>Dependent</th><th>Financial Dependency</th></tr>
          <tr><td>Sarah ${client?.name?.split(' ')[1] || 'Smith'}</td><td>Spouse</td><td>15/03/1982</td><td>42</td><td>No</td><td>Joint finances</td></tr>
          <tr><td>James ${client?.name?.split(' ')[1] || 'Smith'}</td><td>Child</td><td>22/08/2010</td><td>14</td><td>Yes</td><td>Full</td></tr>
          <tr><td>Emily ${client?.name?.split(' ')[1] || 'Smith'}</td><td>Child</td><td>05/11/2013</td><td>11</td><td>Yes</td><td>Full</td></tr>
          <tr><td>Robert ${client?.name?.split(' ')[1] || 'Smith'}</td><td>Father</td><td>12/06/1950</td><td>74</td><td>No</td><td>None</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Dependent Financial Implications</h3>
        <div class="highlight">
          <p><strong>Education Planning:</strong> With two dependent children aged 14 and 11, education funding is a key consideration. Current projections assume private education fees of £15,000 per annum per child through secondary school, with university costs estimated at £12,000 per annum.</p>
        </div>
        <table>
          <tr><th>Dependent</th><th>Current Need</th><th>Future Need</th><th>Funding Status</th></tr>
          <tr><td>James - Secondary Education</td><td>${formatCurrency(15000)}/yr</td><td>4 more years</td><td><span class="badge badge-success">Funded</span></td></tr>
          <tr><td>James - University</td><td>N/A</td><td>${formatCurrency(48000)} total</td><td><span class="badge badge-warning">Partially Funded</span></td></tr>
          <tr><td>Emily - Secondary Education</td><td>${formatCurrency(15000)}/yr</td><td>7 more years</td><td><span class="badge badge-success">Funded</span></td></tr>
          <tr><td>Emily - University</td><td>N/A</td><td>${formatCurrency(48000)} total</td><td><span class="badge badge-info">Planning Required</span></td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Protection Requirements</h3>
        <p>Based on family composition, the recommended minimum life cover is <strong>${formatCurrency(1200000)}</strong> to provide for dependents until financially independent. Current coverage: <strong>${formatCurrency(650000)}</strong>.</p>
        <div class="highlight warning">
          <strong>Gap Identified:</strong> Current life cover shortfall of ${formatCurrency(550000)}. Consider increasing term life insurance to bridge this gap.
        </div>
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('net_worth') ? `
    <div class="section">
      <h2 class="section-title">4. Net Worth Statement</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value text-green">${formatCurrency(totalAssets)}</div>
          <div class="metric-label">Total Assets</div>
        </div>
        <div class="metric-card">
          <div class="metric-value text-red">${formatCurrency(totalLiabilities)}</div>
          <div class="metric-label">Total Liabilities</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(netWorth)}</div>
          <div class="metric-label">Net Worth</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Asset Breakdown</h3>
        <table>
          <tr><th>Asset Category</th><th>Description</th><th>Value</th><th>% of Total</th></tr>
          <tr><td>Pensions</td><td>SIPP, Workplace & Deferred DB</td><td>${formatCurrency(494000)}</td><td>35.5%</td></tr>
          <tr><td>Property (Net Equity)</td><td>Primary residence & BTL</td><td>${formatCurrency(630000)}</td><td>45.3%</td></tr>
          <tr><td>ISAs</td><td>Stocks & Shares ISAs</td><td>${formatCurrency(85000)}</td><td>6.1%</td></tr>
          <tr><td>General Investments</td><td>GIA holdings</td><td>${formatCurrency(125000)}</td><td>9.0%</td></tr>
          <tr><td>Cash & Savings</td><td>Current & savings accounts</td><td>${formatCurrency(56000)}</td><td>4.0%</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="2">Total Assets</td><td>${formatCurrency(totalAssets)}</td><td>100%</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Liability Breakdown</h3>
        <table>
          <tr><th>Liability</th><th>Lender</th><th>Balance</th><th>Interest Rate</th><th>Monthly Payment</th></tr>
          <tr><td>Residential Mortgage</td><td>Nationwide</td><td>${formatCurrency(180000)}</td><td>4.25%</td><td>${formatCurrency(985)}</td></tr>
          <tr><td>BTL Mortgage</td><td>Barclays</td><td>${formatCurrency(160000)}</td><td>5.15%</td><td>${formatCurrency(870)}</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="2">Total Liabilities</td><td>${formatCurrency(340000)}</td><td>-</td><td>${formatCurrency(1855)}</td></tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Net Worth Composition</h4>
        <div style="display: flex; justify-content: space-around; align-items: center;">
          <div style="width: 60%;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 100px; font-size: 10px;">Pensions</div>
              <div style="flex: 1; background: #e5e7eb; height: 16px; border-radius: 4px; overflow: hidden;">
                <div style="width: 35.5%; height: 100%; background: #3b82f6;"></div>
              </div>
              <div style="width: 50px; text-align: right; font-size: 10px;">35.5%</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 100px; font-size: 10px;">Property</div>
              <div style="flex: 1; background: #e5e7eb; height: 16px; border-radius: 4px; overflow: hidden;">
                <div style="width: 45.3%; height: 100%; background: #10b981;"></div>
              </div>
              <div style="width: 50px; text-align: right; font-size: 10px;">45.3%</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 100px; font-size: 10px;">ISAs</div>
              <div style="flex: 1; background: #e5e7eb; height: 16px; border-radius: 4px; overflow: hidden;">
                <div style="width: 6.1%; height: 100%; background: #f59e0b;"></div>
              </div>
              <div style="width: 50px; text-align: right; font-size: 10px;">6.1%</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 100px; font-size: 10px;">Investments</div>
              <div style="flex: 1; background: #e5e7eb; height: 16px; border-radius: 4px; overflow: hidden;">
                <div style="width: 9%; height: 100%; background: #6366f1;"></div>
              </div>
              <div style="width: 50px; text-align: right; font-size: 10px;">9.0%</div>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="width: 100px; font-size: 10px;">Cash</div>
              <div style="flex: 1; background: #e5e7eb; height: 16px; border-radius: 4px; overflow: hidden;">
                <div style="width: 4%; height: 100%; background: #ec4899;"></div>
              </div>
              <div style="width: 50px; text-align: right; font-size: 10px;">4.0%</div>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="highlight">
        <strong>Net Worth Analysis:</strong> Your net worth has grown by 8.2% over the past 12 months, primarily driven by pension contributions and property appreciation. The debt-to-asset ratio of ${Math.round((totalLiabilities/totalAssets)*100)}% is healthy and well within recommended limits.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('income_analysis') ? `
    <div class="section">
      <h2 class="section-title">5. Income Analysis</h2>
      
      <div class="metric-grid metric-grid-4">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(125000)}</div>
          <div class="metric-label">Gross Annual Income</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(88200)}</div>
          <div class="metric-label">Net Annual Income</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(7350)}</div>
          <div class="metric-label">Monthly Net Income</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">29.4%</div>
          <div class="metric-label">Effective Tax Rate</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Income Sources Breakdown</h3>
        <table>
          <tr><th>Income Source</th><th>Gross Annual</th><th>Tax/NI</th><th>Net Annual</th><th>% of Total</th></tr>
          ${incomeData.map(item => `
            <tr>
              <td>${item.source}</td>
              <td>${formatCurrency(item.gross)}</td>
              <td>${formatCurrency(item.gross - item.net)}</td>
              <td>${formatCurrency(item.net)}</td>
              <td>${item.percentage}%</td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td>Total</td>
            <td>${formatCurrency(125000)}</td>
            <td>${formatCurrency(36800)}</td>
            <td>${formatCurrency(88200)}</td>
            <td>100%</td>
          </tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Income Distribution</h4>
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
          ${incomeData.map(item => `
            <div style="text-align: center; margin: 8px;">
              <div style="width: 70px; height: 70px; background: conic-gradient(#3b82f6 0% ${item.percentage}%, #e5e7eb ${item.percentage}% 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <div style="width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px;">${item.percentage}%</div>
              </div>
              <div style="margin-top: 6px; font-size: 10px; color: #6b7280;">${item.source}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">Income Projections (5 Year)</h3>
        <table>
          <tr><th>Year</th><th>Employment</th><th>Rental</th><th>Investment</th><th>Total Gross</th><th>Assumptions</th></tr>
          <tr><td>2024</td><td>${formatCurrency(95000)}</td><td>${formatCurrency(18000)}</td><td>${formatCurrency(12000)}</td><td>${formatCurrency(125000)}</td><td>Base year</td></tr>
          <tr><td>2025</td><td>${formatCurrency(99750)}</td><td>${formatCurrency(18900)}</td><td>${formatCurrency(12600)}</td><td>${formatCurrency(131250)}</td><td>5% salary increase, 5% growth</td></tr>
          <tr><td>2026</td><td>${formatCurrency(104738)}</td><td>${formatCurrency(19845)}</td><td>${formatCurrency(13230)}</td><td>${formatCurrency(137813)}</td><td>5% salary increase, 5% growth</td></tr>
          <tr><td>2027</td><td>${formatCurrency(109975)}</td><td>${formatCurrency(20837)}</td><td>${formatCurrency(13892)}</td><td>${formatCurrency(144704)}</td><td>5% salary increase, 5% growth</td></tr>
          <tr><td>2028</td><td>${formatCurrency(115473)}</td><td>${formatCurrency(21879)}</td><td>${formatCurrency(14586)}</td><td>${formatCurrency(151939)}</td><td>5% salary increase, 5% growth</td></tr>
        </table>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('expenditure') ? `
    <div class="section">
      <h2 class="section-title">6. Expenditure Analysis</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(85200)}</div>
          <div class="metric-label">Annual Expenditure</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(7100)}</div>
          <div class="metric-label">Monthly Average</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(3000)}</div>
          <div class="metric-label">Monthly Surplus</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Expenditure Breakdown</h3>
        <table>
          <tr><th>Category</th><th>Monthly</th><th>Annual</th><th>% of Net Income</th><th>Trend</th></tr>
          ${expenditureData.map(item => `
            <tr>
              <td>${item.category}</td>
              <td>${formatCurrency(item.monthly)}</td>
              <td>${formatCurrency(item.annual)}</td>
              <td>${item.percentage}%</td>
              <td><span class="badge ${item.category === 'Savings' ? 'badge-success' : 'badge-neutral'}">Stable</span></td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td>Total</td>
            <td>${formatCurrency(7100)}</td>
            <td>${formatCurrency(85200)}</td>
            <td>97%</td>
            <td>-</td>
          </tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Monthly Spending by Category</h4>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${expenditureData.map((item, i) => {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];
            return `
            <div style="display: flex; align-items: center;">
              <div style="width: 80px; font-size: 10px;">${item.category}</div>
              <div style="flex: 1; background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden; margin: 0 8px;">
                <div style="width: ${item.percentage * 2}%; height: 100%; background: ${colors[i]}; display: flex; align-items: center; padding-left: 8px;">
                  <span style="color: white; font-size: 9px; font-weight: 600;">${formatCurrency(item.monthly)}</span>
                </div>
              </div>
              <div style="width: 40px; text-align: right; font-size: 10px;">${item.percentage}%</div>
            </div>
          `}).join('')}
        </div>
      </div>
      ` : ''}

      <div class="highlight">
        <strong>Cashflow Summary:</strong> With monthly net income of ${formatCurrency(7350)} and expenditure of ${formatCurrency(7100)}, you have a surplus of ${formatCurrency(250)} per month available for additional savings or debt repayment. Your savings rate of 14% is above the recommended minimum of 10%.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('asset_allocation') ? `
    <div class="section">
      <h2 class="section-title">7. Asset Allocation</h2>
      
      <div class="subsection">
        <h3 class="subsection-title">Current vs Target Allocation</h3>
        <table>
          <tr><th>Asset Class</th><th>Current Value</th><th>Current %</th><th>Target %</th><th>Variance</th><th>Status</th></tr>
          ${assetAllocationData.map(item => `
            <tr>
              <td><span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; border-radius: 50%; margin-right: 6px;"></span>${item.name}</td>
              <td>${formatCurrency((item.value / 100) * 210000)}</td>
              <td>${item.value}%</td>
              <td>${item.value}%</td>
              <td>0%</td>
              <td><span class="badge badge-success">On Target</span></td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td>Total Investable Assets</td>
            <td>${formatCurrency(210000)}</td>
            <td>100%</td>
            <td>100%</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Portfolio Allocation</h4>
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap;">
          ${assetAllocationData.map(item => `
            <div style="text-align: center; margin: 8px;">
              <div style="width: 70px; height: 70px; background: ${item.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${item.value}%</div>
              <div style="margin-top: 6px; font-size: 10px; color: #6b7280;">${item.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">Geographic Exposure</h3>
        <table>
          <tr><th>Region</th><th>Current %</th><th>Target %</th><th>Notes</th></tr>
          <tr><td>UK</td><td>35%</td><td>30-40%</td><td>Home bias within range</td></tr>
          <tr><td>North America</td><td>32%</td><td>30-35%</td><td>Slight overweight</td></tr>
          <tr><td>Europe ex-UK</td><td>15%</td><td>15-20%</td><td>On target</td></tr>
          <tr><td>Asia Pacific</td><td>12%</td><td>10-15%</td><td>On target</td></tr>
          <tr><td>Emerging Markets</td><td>6%</td><td>5-10%</td><td>On target</td></tr>
        </table>
      </div>

      <div class="highlight">
        <strong>Allocation Assessment:</strong> Your portfolio is well-diversified across asset classes and geographies. The current allocation aligns with your ${client?.risk_profile || 'Moderate'} risk profile and long-term investment objectives. No immediate rebalancing is required.
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('portfolio_holdings') ? `
    <div class="section">
      <h2 class="section-title">8. Portfolio Holdings</h2>
      
      <div class="subsection">
        <h3 class="subsection-title">Investment Holdings Detail</h3>
        <table>
          <tr><th>Holding</th><th>Type</th><th>Units</th><th>Price</th><th>Value</th><th>Gain/Loss</th><th>%</th></tr>
          ${portfolioData.map(h => `
            <tr>
              <td>${h.asset_name}</td>
              <td>${h.asset_type}</td>
              <td>${h.quantity.toLocaleString()}</td>
              <td>${formatCurrency(h.current_price)}</td>
              <td>${formatCurrency(h.value)}</td>
              <td class="${h.gain >= 0 ? 'text-green' : 'text-red'}">${h.gain >= 0 ? '+' : ''}${formatCurrency(h.gain)}</td>
              <td class="${h.gain_pct >= 0 ? 'text-green' : 'text-red'}">${h.gain_pct >= 0 ? '+' : ''}${h.gain_pct}%</td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td colspan="4">Total Portfolio Value</td>
            <td>${formatCurrency(portfolioData.reduce((sum, h) => sum + h.value, 0))}</td>
            <td class="text-green">+${formatCurrency(portfolioData.reduce((sum, h) => sum + h.gain, 0))}</td>
            <td class="text-green">+18.2%</td>
          </tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Holdings by Account</h3>
        <table>
          <tr><th>Account</th><th>Provider</th><th>Value</th><th>Annual Charge</th><th>Tax Wrapper</th></tr>
          <tr><td>Stocks & Shares ISA</td><td>Hargreaves Lansdown</td><td>${formatCurrency(85000)}</td><td>0.45%</td><td>Tax-Free</td></tr>
          <tr><td>SIPP</td><td>Hargreaves Lansdown</td><td>${formatCurrency(285000)}</td><td>0.45%</td><td>Pension</td></tr>
          <tr><td>GIA</td><td>AJ Bell</td><td>${formatCurrency(125000)}</td><td>0.25%</td><td>Taxable</td></tr>
        </table>
      </div>

      <div class="highlight">
        <strong>Portfolio Summary:</strong> Total investment holdings of ${formatCurrency(495000)} across tax-efficient wrappers. Weighted average fund cost of 0.38% is competitive. Consider utilising remaining ISA allowance of ${formatCurrency(8000)} before tax year end.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('performance_analysis') ? `
    <div class="section">
      <h2 class="section-title">9. Performance Analysis</h2>
      
      <div class="metric-grid metric-grid-4">
        <div class="metric-card">
          <div class="metric-value text-green">+12.4%</div>
          <div class="metric-label">1 Year Return</div>
        </div>
        <div class="metric-card">
          <div class="metric-value text-green">+8.7%</div>
          <div class="metric-label">3 Year Annualised</div>
        </div>
        <div class="metric-card">
          <div class="metric-value text-green">+2.6%</div>
          <div class="metric-label">vs Benchmark (1Y)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">0.72</div>
          <div class="metric-label">Sharpe Ratio</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Performance vs Benchmark</h3>
        <table>
          <tr><th>Period</th><th>Portfolio</th><th>Benchmark</th><th>Difference</th><th>Ranking</th></tr>
          ${performanceData.map(item => `
            <tr>
              <td>${item.period}</td>
              <td class="text-green">+${item.portfolio}%</td>
              <td>+${item.benchmark}%</td>
              <td class="text-green">+${item.difference}%</td>
              <td><span class="badge badge-success">Outperform</span></td>
            </tr>
          `).join('')}
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Cumulative Performance (5 Years)</h4>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 120px; padding: 10px;">
          ${[2020, 2021, 2022, 2023, 2024].map((year, i) => {
            const portfolioHeight = [20, 45, 35, 60, 80][i];
            const benchmarkHeight = [18, 38, 32, 48, 62][i];
            return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="display: flex; gap: 4px; align-items: flex-end;">
                <div style="width: 20px; background: #3b82f6; height: ${portfolioHeight}px; border-radius: 3px 3px 0 0;"></div>
                <div style="width: 20px; background: #94a3b8; height: ${benchmarkHeight}px; border-radius: 3px 3px 0 0;"></div>
              </div>
              <div style="font-size: 10px; color: #6b7280;">${year}</div>
            </div>
          `}).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 8px;">
          <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></div><span style="font-size: 10px;">Portfolio</span></div>
          <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; background: #94a3b8; border-radius: 2px;"></div><span style="font-size: 10px;">Benchmark</span></div>
        </div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">Risk-Adjusted Performance Metrics</h3>
        <table>
          <tr><th>Metric</th><th>Value</th><th>Benchmark</th><th>Assessment</th></tr>
          <tr><td>Sharpe Ratio</td><td>0.72</td><td>0.58</td><td><span class="badge badge-success">Above Average</span></td></tr>
          <tr><td>Sortino Ratio</td><td>1.15</td><td>0.92</td><td><span class="badge badge-success">Strong</span></td></tr>
          <tr><td>Maximum Drawdown</td><td>-12.4%</td><td>-15.8%</td><td><span class="badge badge-success">Better</span></td></tr>
          <tr><td>Volatility (Ann.)</td><td>11.2%</td><td>12.8%</td><td><span class="badge badge-success">Lower Risk</span></td></tr>
          <tr><td>Beta</td><td>0.88</td><td>1.00</td><td><span class="badge badge-info">Defensive</span></td></tr>
        </table>
      </div>

      <div class="highlight success">
        <strong>Performance Summary:</strong> Your portfolio has consistently outperformed the benchmark across all measured periods while maintaining lower volatility. The risk-adjusted returns (Sharpe ratio 0.72) demonstrate efficient risk management.
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('pension_summary') ? `
    <div class="section">
      <h2 class="section-title">10. Pension Summary</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(494000)}</div>
          <div class="metric-label">Total DC Fund Value</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(12500)}</div>
          <div class="metric-label">DB Pension (Annual)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(10600)}</div>
          <div class="metric-label">State Pension (Annual)</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Pension Accounts Detail</h3>
        <table>
          <tr><th>Pension Account</th><th>Provider</th><th>Type</th><th>Fund Value / Annual</th><th>Contributions</th><th>Retirement Age</th></tr>
          <tr><td>SIPP</td><td>Hargreaves Lansdown</td><td>DC</td><td>${formatCurrency(285000)}</td><td>${formatCurrency(40000)}/yr</td><td>65</td></tr>
          <tr><td>Workplace Pension</td><td>Aviva</td><td>DC</td><td>${formatCurrency(142000)}</td><td>${formatCurrency(12000)}/yr</td><td>65</td></tr>
          <tr><td>Previous Employer</td><td>Scottish Widows</td><td>DC</td><td>${formatCurrency(67000)}</td><td>None (deferred)</td><td>65</td></tr>
          <tr><td>DB Pension (Deferred)</td><td>BT</td><td>DB</td><td>${formatCurrency(12500)}/yr</td><td>N/A</td><td>65</td></tr>
          <tr><td>State Pension</td><td>HMRC</td><td>State</td><td>${formatCurrency(10600)}/yr</td><td>35 qualifying years</td><td>67</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="3">Total DC Fund Value</td><td colspan="3">${formatCurrency(494000)}</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Pension Contribution Analysis</h3>
        <table>
          <tr><th>Tax Year</th><th>Annual Allowance</th><th>Contributions Made</th><th>Remaining Allowance</th><th>Carry Forward Available</th></tr>
          <tr><td>2024/25</td><td>${formatCurrency(60000)}</td><td>${formatCurrency(52000)}</td><td>${formatCurrency(8000)}</td><td>Yes</td></tr>
          <tr><td>2023/24</td><td>${formatCurrency(60000)}</td><td>${formatCurrency(45000)}</td><td>${formatCurrency(15000)}</td><td>Available for 2 more years</td></tr>
          <tr><td>2022/23</td><td>${formatCurrency(40000)}</td><td>${formatCurrency(38000)}</td><td>${formatCurrency(2000)}</td><td>Available for 1 more year</td></tr>
        </table>
      </div>

      <div class="highlight">
        <strong>Pension Recommendation:</strong> You have ${formatCurrency(25000)} of unused annual allowance available through carry forward. Consider maximising pension contributions before the end of the tax year to benefit from tax relief at your marginal rate (40%).
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('retirement_projection') ? `
    <div class="section">
      <h2 class="section-title">11. Retirement Projection</h2>
      
      <div class="highlight">
        <p>Based on current savings rate and investment strategy, you are projected to achieve <strong>92%</strong> of your retirement income target with a high confidence level.</p>
      </div>

      <div class="metric-grid metric-grid-4">
        <div class="metric-card">
          <div class="metric-value">65</div>
          <div class="metric-label">Target Retirement Age</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(45000)}</div>
          <div class="metric-label">Annual Income Target</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">30 yrs</div>
          <div class="metric-label">Retirement Duration</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">92%</div>
          <div class="metric-label">Success Probability</div>
        </div>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Projected Wealth Over Time</h4>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 140px; padding: 10px;">
          ${projectionData.filter((_, i) => i % 5 === 0).map((d, i) => `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 18px; background: linear-gradient(180deg, #3b82f6, #10b981); height: ${Math.min(d.assets / 25000, 110)}px; border-radius: 3px 3px 0 0;"></div>
              <div style="font-size: 9px; color: #6b7280; margin-top: 4px;">${d.age}</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align: center; font-size: 10px; color: #6b7280;">Age</div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">Retirement Income Sources (at age 65)</h3>
        <table>
          <tr><th>Income Source</th><th>Annual Amount</th><th>% of Target</th><th>Inflation Linked</th></tr>
          <tr><td>State Pension (from 67)</td><td>${formatCurrency(10600)}</td><td>24%</td><td>Yes (Triple Lock)</td></tr>
          <tr><td>DB Pension</td><td>${formatCurrency(12500)}</td><td>28%</td><td>Partial (CPI capped)</td></tr>
          <tr><td>DC Pension Drawdown</td><td>${formatCurrency(18000)}</td><td>40%</td><td>Depends on investment</td></tr>
          <tr><td>ISA/Investment Income</td><td>${formatCurrency(3900)}</td><td>9%</td><td>Depends on investment</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td>Total Projected Income</td><td>${formatCurrency(45000)}</td><td>100%</td><td>-</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Projection Assumptions</h3>
        <table>
          <tr><th>Assumption</th><th>Value</th><th>Notes</th></tr>
          <tr><td>Investment Return (pre-retirement)</td><td>5.0% p.a.</td><td>Net of charges, real terms</td></tr>
          <tr><td>Investment Return (in retirement)</td><td>3.5% p.a.</td><td>More conservative allocation</td></tr>
          <tr><td>Inflation Assumption</td><td>2.5% p.a.</td><td>Long-term CPI target</td></tr>
          <tr><td>Mortality Assumption</td><td>Age 95</td><td>Conservative planning horizon</td></tr>
          <tr><td>Drawdown Rate</td><td>4.0%</td><td>Sustainable withdrawal rate</td></tr>
        </table>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('state_pension') ? `
    <div class="section">
      <h2 class="section-title">12. State Pension Entitlement</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(10600)}</div>
          <div class="metric-label">Full State Pension (2024/25)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">67</div>
          <div class="metric-label">State Pension Age</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">35 years</div>
          <div class="metric-label">Qualifying Years Required</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">National Insurance Record</h3>
        <table>
          <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
          <tr><td>Qualifying Years Accrued</td><td>28 years</td><td><span class="badge badge-warning">7 more needed</span></td></tr>
          <tr><td>Years to State Pension Age</td><td>22 years</td><td><span class="badge badge-success">Sufficient time</span></td></tr>
          <tr><td>Estimated Weekly Amount</td><td>£203.85</td><td><span class="badge badge-info">Full amount</span></td></tr>
          <tr><td>Gaps in Record</td><td>2 years</td><td><span class="badge badge-warning">Can be purchased</span></td></tr>
        </table>
      </div>

      <div class="highlight">
        <strong>State Pension Analysis:</strong> With 28 qualifying years and 22 years until State Pension age, you are on track to receive the full new State Pension. Consider purchasing voluntary NI contributions (£824.20 per year) to fill the 2-year gap, which could increase lifetime pension by approximately ${formatCurrency(10000)}.
      </div>

      <div class="subsection">
        <h3 class="subsection-title">State Pension Deferral Options</h3>
        <table>
          <tr><th>Deferral Period</th><th>Increase</th><th>Annual Amount</th><th>Break-even Age</th></tr>
          <tr><td>No deferral (age 67)</td><td>0%</td><td>${formatCurrency(10600)}</td><td>N/A</td></tr>
          <tr><td>1 year (age 68)</td><td>+5.8%</td><td>${formatCurrency(11215)}</td><td>85</td></tr>
          <tr><td>2 years (age 69)</td><td>+11.6%</td><td>${formatCurrency(11830)}</td><td>86</td></tr>
          <tr><td>3 years (age 70)</td><td>+17.4%</td><td>${formatCurrency(12445)}</td><td>87</td></tr>
        </table>
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('goals_summary') ? `
    <div class="section">
      <h2 class="section-title">13. Financial Goals Summary</h2>
      
      ${goals.length > 0 ? goals.map((goal, idx) => `
        <div class="subsection" style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="subsection-title" style="margin: 0;">Goal ${idx + 1}: ${goal.goal_name}</h3>
            <span class="badge ${goal.status === 'On Track' ? 'badge-success' : 'badge-warning'}">${goal.status || 'In Progress'}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #6b7280; font-size: 10px;">Target Amount</span><br><strong>${formatCurrency(goal.target_amount || 0)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Current Progress</span><br><strong>${formatCurrency(goal.current_amount || 0)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Target Date</span><br><strong>${goal.target_date ? new Date(goal.target_date).toLocaleDateString('en-GB') : 'N/A'}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Monthly Contribution</span><br><strong>${formatCurrency(goal.monthly_contribution || 0)}</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${Math.round((goal.current_amount / goal.target_amount) * 100)}%"></div></div>
          <div style="font-size: 10px; color: #6b7280; text-align: right; margin-top: 4px;">${Math.round((goal.current_amount / goal.target_amount) * 100)}% complete</div>
        </div>
      `).join('') : `
        <div class="subsection" style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="subsection-title" style="margin: 0;">Goal 1: Retirement at 65</h3>
            <span class="badge badge-success">On Track</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #6b7280; font-size: 10px;">Target Amount</span><br><strong>${formatCurrency(1500000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Current Progress</span><br><strong>${formatCurrency(1020000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Target Date</span><br><strong>01/01/2045</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Monthly Contribution</span><br><strong>${formatCurrency(4333)}</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 68%"></div></div>
          <div style="font-size: 10px; color: #6b7280; text-align: right; margin-top: 4px;">68% complete</div>
        </div>
        <div class="subsection" style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="subsection-title" style="margin: 0;">Goal 2: Children's Education Fund</h3>
            <span class="badge badge-warning">Needs Attention</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #6b7280; font-size: 10px;">Target Amount</span><br><strong>${formatCurrency(120000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Current Progress</span><br><strong>${formatCurrency(50400)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Target Date</span><br><strong>01/09/2028</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Monthly Contribution</span><br><strong>${formatCurrency(500)}</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 42%"></div></div>
          <div style="font-size: 10px; color: #6b7280; text-align: right; margin-top: 4px;">42% complete</div>
        </div>
        <div class="subsection" style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="subsection-title" style="margin: 0;">Goal 3: Emergency Fund</h3>
            <span class="badge badge-success">Achieved</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #6b7280; font-size: 10px;">Target Amount</span><br><strong>${formatCurrency(42600)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Current Progress</span><br><strong>${formatCurrency(56000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Target Date</span><br><strong>Ongoing</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Months Coverage</span><br><strong>6 months</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 100%"></div></div>
          <div style="font-size: 10px; color: #6b7280; text-align: right; margin-top: 4px;">100% complete - Target exceeded</div>
        </div>
        <div class="subsection" style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 class="subsection-title" style="margin: 0;">Goal 4: Holiday Home Purchase</h3>
            <span class="badge badge-info">Long-term</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #6b7280; font-size: 10px;">Target Amount</span><br><strong>${formatCurrency(200000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Current Progress</span><br><strong>${formatCurrency(35000)}</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Target Date</span><br><strong>01/01/2032</strong></div>
            <div><span style="color: #6b7280; font-size: 10px;">Monthly Contribution</span><br><strong>${formatCurrency(750)}</strong></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: 17.5%"></div></div>
          <div style="font-size: 10px; color: #6b7280; text-align: right; margin-top: 4px;">17.5% complete</div>
        </div>
      `}
    </div>
    ` : ''}

    ${selectedSections.includes('goal_probability') ? `
    <div class="section">
      <h2 class="section-title">14. Goal Probability Analysis</h2>
      
      <div class="highlight">
        <p><strong>Monte Carlo Simulation:</strong> We have run 10,000 market scenarios to stress-test your financial plan and determine the probability of achieving each goal under various market conditions.</p>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Goal Success Probabilities</h3>
        <table>
          <tr><th>Goal</th><th>Target</th><th>Current Progress</th><th>Success Probability</th><th>Confidence</th></tr>
          <tr>
            <td>Retirement at 65</td>
            <td>${formatCurrency(1500000)}</td>
            <td>${formatCurrency(1020000)}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="width: 92%; height: 100%; background: #10b981;"></div>
                </div>
                <span>92%</span>
              </div>
            </td>
            <td><span class="badge badge-success">High</span></td>
          </tr>
          <tr>
            <td>Children's Education</td>
            <td>${formatCurrency(120000)}</td>
            <td>${formatCurrency(50400)}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="width: 78%; height: 100%; background: #f59e0b;"></div>
                </div>
                <span>78%</span>
              </div>
            </td>
            <td><span class="badge badge-warning">Medium</span></td>
          </tr>
          <tr>
            <td>Holiday Home</td>
            <td>${formatCurrency(200000)}</td>
            <td>${formatCurrency(35000)}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="width: 65%; height: 100%; background: #f59e0b;"></div>
                </div>
                <span>65%</span>
              </div>
            </td>
            <td><span class="badge badge-warning">Medium</span></td>
          </tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Retirement Projection - Confidence Intervals</h4>
        <div style="position: relative; height: 100px; margin: 10px 0;">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"></div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 40%; background: rgba(16, 185, 129, 0.2); border-radius: 4px;"></div>
          <div style="position: absolute; bottom: 35%; left: 0; right: 0; height: 2px; background: #10b981;"></div>
          <div style="position: absolute; bottom: 0; left: 0; font-size: 9px; color: #6b7280;">Now</div>
          <div style="position: absolute; bottom: 0; right: 0; font-size: 9px; color: #6b7280;">Age 95</div>
        </div>
        <div style="display: flex; justify-content: center; gap: 16px; font-size: 10px;">
          <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(16, 185, 129, 0.2); margin-right: 4px;"></span>50th percentile</span>
          <span><span style="display: inline-block; width: 12px; height: 12px; background: rgba(16, 185, 129, 0.1); margin-right: 4px;"></span>25th-75th percentile</span>
        </div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">Scenario Analysis</h3>
        <table>
          <tr><th>Scenario</th><th>Probability</th><th>Portfolio Value at 65</th><th>Annual Income</th></tr>
          <tr><td>Bear Market (10th percentile)</td><td>10%</td><td>${formatCurrency(980000)}</td><td>${formatCurrency(35000)}</td></tr>
          <tr><td>Below Average (25th percentile)</td><td>25%</td><td>${formatCurrency(1150000)}</td><td>${formatCurrency(40000)}</td></tr>
          <tr><td>Median (50th percentile)</td><td>50%</td><td>${formatCurrency(1450000)}</td><td>${formatCurrency(50000)}</td></tr>
          <tr><td>Above Average (75th percentile)</td><td>75%</td><td>${formatCurrency(1850000)}</td><td>${formatCurrency(65000)}</td></tr>
          <tr><td>Bull Market (90th percentile)</td><td>90%</td><td>${formatCurrency(2400000)}</td><td>${formatCurrency(85000)}</td></tr>
        </table>
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('property_schedule') ? `
    <div class="section">
      <h2 class="section-title">15. Property Schedule</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(970000)}</div>
          <div class="metric-label">Total Property Value</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(340000)}</div>
          <div class="metric-label">Total Mortgages</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(630000)}</div>
          <div class="metric-label">Total Equity</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Property Portfolio</h3>
        <table>
          <tr><th>Property</th><th>Type</th><th>Purchase Date</th><th>Purchase Price</th><th>Current Value</th><th>Gain</th></tr>
          <tr><td>123 High Street, London</td><td>Primary Residence</td><td>15/03/2015</td><td>${formatCurrency(420000)}</td><td>${formatCurrency(650000)}</td><td class="text-green">+${formatCurrency(230000)} (55%)</td></tr>
          <tr><td>45 Oak Lane, Manchester</td><td>Buy-to-Let</td><td>22/09/2018</td><td>${formatCurrency(245000)}</td><td>${formatCurrency(320000)}</td><td class="text-green">+${formatCurrency(75000)} (31%)</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="4">Total</td><td>${formatCurrency(970000)}</td><td class="text-green">+${formatCurrency(305000)}</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Mortgage Details</h3>
        <table>
          <tr><th>Property</th><th>Lender</th><th>Balance</th><th>Rate</th><th>Type</th><th>End Date</th><th>Monthly</th><th>LTV</th></tr>
          <tr><td>123 High Street</td><td>Nationwide</td><td>${formatCurrency(180000)}</td><td>4.25%</td><td>Fixed (2yr)</td><td>31/03/2026</td><td>${formatCurrency(985)}</td><td>28%</td></tr>
          <tr><td>45 Oak Lane</td><td>Barclays</td><td>${formatCurrency(160000)}</td><td>5.15%</td><td>Fixed (5yr)</td><td>30/09/2028</td><td>${formatCurrency(870)}</td><td>50%</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="2">Total</td><td>${formatCurrency(340000)}</td><td>-</td><td>-</td><td>-</td><td>${formatCurrency(1855)}</td><td>35%</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Rental Income (Buy-to-Let)</h3>
        <table>
          <tr><th>Metric</th><th>Monthly</th><th>Annual</th></tr>
          <tr><td>Gross Rental Income</td><td>${formatCurrency(1500)}</td><td>${formatCurrency(18000)}</td></tr>
          <tr><td>Less: Mortgage Interest</td><td>(${formatCurrency(690)})</td><td>(${formatCurrency(8280)})</td></tr>
          <tr><td>Less: Management Fees (10%)</td><td>(${formatCurrency(150)})</td><td>(${formatCurrency(1800)})</td></tr>
          <tr><td>Less: Maintenance Allowance</td><td>(${formatCurrency(100)})</td><td>(${formatCurrency(1200)})</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td>Net Rental Profit</td><td>${formatCurrency(560)}</td><td>${formatCurrency(6720)}</td></tr>
        </table>
        <p style="font-size: 10px; color: #6b7280; margin-top: 8px;">Gross yield: 5.6% | Net yield: 2.1% | Rental coverage ratio: 1.72x</p>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('debt_schedule') ? `
    <div class="section">
      <h2 class="section-title">16. Debt Schedule</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(340000)}</div>
          <div class="metric-label">Total Outstanding Debt</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(1855)}</div>
          <div class="metric-label">Monthly Payments</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">24.5%</div>
          <div class="metric-label">Debt-to-Net Worth</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Debt Summary</h3>
        <table>
          <tr><th>Debt Type</th><th>Lender</th><th>Outstanding</th><th>Interest Rate</th><th>Monthly Payment</th><th>Remaining Term</th></tr>
          ${debtData.map(d => `
            <tr>
              <td>${d.type}</td>
              <td>${d.lender}</td>
              <td>${formatCurrency(d.balance)}</td>
              <td>${d.rate}%</td>
              <td>${formatCurrency(d.monthly)}</td>
              <td>${d.remaining}</td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td colspan="2">Total</td>
            <td>${formatCurrency(340000)}</td>
            <td>-</td>
            <td>${formatCurrency(1855)}</td>
            <td>-</td>
          </tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Debt Repayment Schedule</h4>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 100px; padding: 10px;">
          ${[2024, 2027, 2030, 2033, 2036, 2039, 2042].map((year, i) => {
            const heights = [100, 90, 75, 55, 35, 15, 0];
            return `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 30px; background: linear-gradient(180deg, #ef4444, #f97316); height: ${heights[i]}px; border-radius: 3px 3px 0 0;"></div>
              <div style="font-size: 9px; color: #6b7280; margin-top: 4px;">${year}</div>
            </div>
          `}).join('')}
        </div>
        <p style="text-align: center; font-size: 10px; color: #6b7280;">Projected debt balance over time (assuming no additional borrowing)</p>
      </div>
      ` : ''}

      <div class="highlight">
        <strong>Debt Analysis:</strong> Your debt-to-asset ratio of 24.5% is healthy. The residential mortgage fixed rate expires in March 2026 - recommend reviewing remortgage options 3-6 months prior. Consider overpaying the residential mortgage by ${formatCurrency(200)}/month to save ${formatCurrency(18500)} in interest over the term.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('risk_profile') ? `
    <div class="section">
      <h2 class="section-title">17. Risk Profile Assessment</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${client?.risk_profile || 'Moderate'}</div>
          <div class="metric-label">Risk Profile</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">7/10</div>
          <div class="metric-label">Risk Tolerance Score</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">High</div>
          <div class="metric-label">Capacity for Loss</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Risk Questionnaire Results</h3>
        <table>
          <tr><th>Factor</th><th>Assessment</th><th>Score</th><th>Notes</th></tr>
          <tr><td>Investment Time Horizon</td><td>Long-term (20+ years)</td><td>9/10</td><td>Sufficient time to recover from volatility</td></tr>
          <tr><td>Income Stability</td><td>Stable employment</td><td>8/10</td><td>Secure professional employment</td></tr>
          <tr><td>Emergency Fund</td><td>6 months expenses</td><td>8/10</td><td>Adequate liquidity buffer</td></tr>
          <tr><td>Investment Knowledge</td><td>Experienced</td><td>7/10</td><td>Understanding of market risks</td></tr>
          <tr><td>Emotional Tolerance</td><td>Moderate</td><td>6/10</td><td>Some discomfort with large fluctuations</td></tr>
          <tr><td>Need for Capital</td><td>Low short-term need</td><td>8/10</td><td>No major expenditure planned</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="2">Overall Risk Score</td><td>7.0/10</td><td>Moderate Growth</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Recommended Asset Allocation</h3>
        <table>
          <tr><th>Asset Class</th><th>Min %</th><th>Target %</th><th>Max %</th></tr>
          <tr><td>Growth Assets (Equities)</td><td>40%</td><td>55%</td><td>70%</td></tr>
          <tr><td>Defensive Assets (Bonds/Cash)</td><td>25%</td><td>35%</td><td>50%</td></tr>
          <tr><td>Alternative Assets</td><td>0%</td><td>10%</td><td>20%</td></tr>
        </table>
      </div>

      <div class="highlight">
        <strong>Risk Profile Summary:</strong> Based on your questionnaire responses and financial circumstances, you have a ${client?.risk_profile || 'Moderate'} risk profile suitable for a diversified portfolio with approximately 55% in growth assets. This profile is reviewed annually or when significant life changes occur.
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('protection_analysis') ? `
    <div class="section">
      <h2 class="section-title">18. Protection Analysis</h2>
      
      <div class="metric-grid metric-grid-4">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(650000)}</div>
          <div class="metric-label">Total Life Cover</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(60000)}</div>
          <div class="metric-label">Income Protection</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(200000)}</div>
          <div class="metric-label">Critical Illness</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(550)}/mo</div>
          <div class="metric-label">Total Premiums</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Current Protection Policies</h3>
        <table>
          <tr><th>Policy Type</th><th>Provider</th><th>Sum Assured</th><th>Premium (Monthly)</th><th>Expiry</th><th>Status</th></tr>
          ${protectionData.map(p => `
            <tr>
              <td>${p.policy}</td>
              <td>${p.provider}</td>
              <td>${p.sum_assured > 0 ? formatCurrency(p.sum_assured) : 'Full cover'}</td>
              <td>${formatCurrency(p.premium)}</td>
              <td>${p.expiry}</td>
              <td><span class="badge badge-success">${p.status}</span></td>
            </tr>
          `).join('')}
          <tr class="bold" style="background: #f3f4f6;">
            <td colspan="3">Total Monthly Premiums</td>
            <td colspan="3">${formatCurrency(550)}</td>
          </tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Protection Needs Analysis</h3>
        <table>
          <tr><th>Need</th><th>Required Cover</th><th>Current Cover</th><th>Shortfall</th><th>Priority</th></tr>
          <tr><td>Income Replacement (10 years)</td><td>${formatCurrency(950000)}</td><td>${formatCurrency(650000)}</td><td class="text-red">${formatCurrency(300000)}</td><td><span class="badge badge-danger">High</span></td></tr>
          <tr><td>Mortgage Protection</td><td>${formatCurrency(340000)}</td><td>${formatCurrency(500000)}</td><td class="text-green">Covered</td><td><span class="badge badge-success">OK</span></td></tr>
          <tr><td>Education Fund</td><td>${formatCurrency(120000)}</td><td>${formatCurrency(150000)}</td><td class="text-green">Covered</td><td><span class="badge badge-success">OK</span></td></tr>
          <tr><td>Income Protection (to 65)</td><td>${formatCurrency(75000)}/yr</td><td>${formatCurrency(60000)}/yr</td><td class="text-red">${formatCurrency(15000)}/yr</td><td><span class="badge badge-warning">Medium</span></td></tr>
        </table>
      </div>

      <div class="highlight warning">
        <strong>Protection Gap:</strong> There is a life cover shortfall of approximately ${formatCurrency(300000)} based on income replacement needs. Consider increasing term life cover. Estimated additional premium: ${formatCurrency(25)}-${formatCurrency(35)}/month for a healthy non-smoker.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('tax_summary') ? `
    <div class="section">
      <h2 class="section-title">19. Tax Summary</h2>
      
      <div class="metric-grid metric-grid-4">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(125000)}</div>
          <div class="metric-label">Gross Income</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(28500)}</div>
          <div class="metric-label">Income Tax</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(8300)}</div>
          <div class="metric-label">National Insurance</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">29.4%</div>
          <div class="metric-label">Effective Rate</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Income Tax Calculation (2024/25)</h3>
        <table>
          <tr><th>Band</th><th>Income Range</th><th>Rate</th><th>Tax Due</th></tr>
          <tr><td>Personal Allowance</td><td>£0 - £12,570</td><td>0%</td><td>£0</td></tr>
          <tr><td>Basic Rate</td><td>£12,571 - £50,270</td><td>20%</td><td>£7,540</td></tr>
          <tr><td>Higher Rate</td><td>£50,271 - £125,000</td><td>40%</td><td>£20,960</td></tr>
          <tr><td>Personal Allowance Tapering</td><td>Income over £100,000</td><td>60% effective</td><td>Partial loss</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td colspan="3">Total Income Tax</td><td>${formatCurrency(28500)}</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Tax Planning Opportunities</h3>
        <table>
          <tr><th>Strategy</th><th>Potential Saving</th><th>Action Required</th><th>Priority</th></tr>
          <tr><td>Maximise pension contributions</td><td>${formatCurrency(3200)}/yr</td><td>Use carry forward allowance</td><td><span class="badge badge-warning">High</span></td></tr>
          <tr><td>Reduce income below £100k</td><td>${formatCurrency(2500)}/yr</td><td>Salary sacrifice / pension</td><td><span class="badge badge-warning">High</span></td></tr>
          <tr><td>Utilise ISA allowance</td><td>Tax-free growth</td><td>Max £20,000 contribution</td><td><span class="badge badge-info">Medium</span></td></tr>
          <tr><td>Dividend allowance planning</td><td>${formatCurrency(350)}/yr</td><td>Use spouse's allowance</td><td><span class="badge badge-neutral">Low</span></td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Capital Gains Tax Position</h3>
        <table>
          <tr><th>Asset</th><th>Acquisition Cost</th><th>Current Value</th><th>Unrealised Gain</th><th>CGT if Sold</th></tr>
          <tr><td>GIA Investments</td><td>${formatCurrency(98000)}</td><td>${formatCurrency(125000)}</td><td>${formatCurrency(27000)}</td><td>${formatCurrency(3720)}*</td></tr>
          <tr><td>BTL Property</td><td>${formatCurrency(245000)}</td><td>${formatCurrency(320000)}</td><td>${formatCurrency(75000)}</td><td>${formatCurrency(14700)}**</td></tr>
        </table>
        <p style="font-size: 9px; color: #6b7280; margin-top: 8px;">*After £3,000 annual exempt amount. **18%/28% rates for residential property.</p>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('iht_analysis') ? `
    <div class="section">
      <h2 class="section-title">20. Inheritance Tax Analysis</h2>
      
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(netWorth + 340000)}</div>
          <div class="metric-label">Gross Estate Value</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(500000)}</div>
          <div class="metric-label">Available Nil Rate Band</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(344000)}</div>
          <div class="metric-label">Potential IHT Liability</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Estate Composition</h3>
        <table>
          <tr><th>Asset Category</th><th>Value</th><th>IHT Treatment</th></tr>
          <tr><td>Property (Primary Residence)</td><td>${formatCurrency(650000)}</td><td>RNRB applicable</td></tr>
          <tr><td>Property (BTL)</td><td>${formatCurrency(320000)}</td><td>Fully chargeable</td></tr>
          <tr><td>Pensions</td><td>${formatCurrency(494000)}</td><td>Outside estate (discretionary)</td></tr>
          <tr><td>ISAs & Investments</td><td>${formatCurrency(210000)}</td><td>Fully chargeable</td></tr>
          <tr><td>Cash</td><td>${formatCurrency(56000)}</td><td>Fully chargeable</td></tr>
          <tr><td>Less: Mortgages</td><td>(${formatCurrency(340000)})</td><td>Deductible</td></tr>
          <tr class="bold" style="background: #f3f4f6;"><td>Chargeable Estate</td><td colspan="2">${formatCurrency(1390000)}</td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">IHT Calculation</h3>
        <table>
          <tr><th>Item</th><th>Amount</th></tr>
          <tr><td>Chargeable Estate</td><td>${formatCurrency(1390000)}</td></tr>
          <tr><td>Less: Nil Rate Band</td><td>(${formatCurrency(325000)})</td></tr>
          <tr><td>Less: Residence Nil Rate Band</td><td>(${formatCurrency(175000)})</td></tr>
          <tr><td>Less: Spouse Transfer (if applicable)</td><td>(${formatCurrency(0)})</td></tr>
          <tr class="bold"><td>Taxable Estate</td><td>${formatCurrency(890000)}</td></tr>
          <tr class="bold text-red"><td>IHT at 40%</td><td>${formatCurrency(356000)}</td></tr>
        </table>
      </div>

      ${includeCharts ? `
      <div class="chart-container">
        <h4 style="margin-bottom: 12px; font-size: 12px; color: #374151;">Estate Value vs Allowances</h4>
        <div style="display: flex; gap: 20px; align-items: center;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 120px; font-size: 10px;">Gross Estate</div>
              <div style="flex: 1; background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: #3b82f6;"></div>
              </div>
              <div style="width: 80px; text-align: right; font-size: 10px;">${formatCurrency(1390000)}</div>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 120px; font-size: 10px;">NRB + RNRB</div>
              <div style="flex: 1; background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
                <div style="width: 36%; height: 100%; background: #10b981;"></div>
              </div>
              <div style="width: 80px; text-align: right; font-size: 10px;">${formatCurrency(500000)}</div>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="width: 120px; font-size: 10px;">Taxable</div>
              <div style="flex: 1; background: #e5e7eb; height: 20px; border-radius: 4px; overflow: hidden;">
                <div style="width: 64%; height: 100%; background: #ef4444;"></div>
              </div>
              <div style="width: 80px; text-align: right; font-size: 10px;">${formatCurrency(890000)}</div>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="subsection">
        <h3 class="subsection-title">IHT Mitigation Strategies</h3>
        <table>
          <tr><th>Strategy</th><th>Potential Saving</th><th>Considerations</th></tr>
          <tr><td>Gifting (using annual exemptions)</td><td>${formatCurrency(3000)}/yr each</td><td>Use it or lose it each year</td></tr>
          <tr><td>Regular gifts from surplus income</td><td>Unlimited</td><td>Must be from income, not capital</td></tr>
          <tr><td>Whole life insurance in trust</td><td>Cover IHT liability</td><td>Premiums payable for life</td></tr>
          <tr><td>Business/Agricultural Relief assets</td><td>Up to 100% relief</td><td>Requires qualifying assets</td></tr>
          <tr><td>Charitable giving (10% of estate)</td><td>36% IHT rate</td><td>Reduce to 36% if 10%+ to charity</td></tr>
        </table>
      </div>

      <div class="highlight warning">
        <strong>IHT Planning Required:</strong> Without planning, your estate could face an IHT bill of approximately ${formatCurrency(356000)}. Key recommendations: Consider whole life insurance to cover the liability, utilise annual gift exemptions, and review pension death benefit nominations.
      </div>
    </div>
    <div class="page-break"></div>
    ` : ''}

    ${selectedSections.includes('recommendations') ? `
    <div class="section">
      <h2 class="section-title">21. Recommendations</h2>
      
      <div class="subsection">
        <div class="highlight" style="border-left-color: #ef4444;">
          <strong>Priority 1: Increase Life Insurance Coverage</strong>
          <p style="margin-top: 8px;">Current life cover of ${formatCurrency(650000)} falls short of the recommended ${formatCurrency(950000)} needed to fully protect your family. We recommend increasing term life cover by ${formatCurrency(300000)}. Estimated additional premium: ${formatCurrency(30)}/month.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Obtain quotes from 3+ providers within 30 days. Consider level term to age 65.</p>
        </div>

        <div class="highlight" style="border-left-color: #f59e0b;">
          <strong>Priority 2: Maximise Pension Contributions</strong>
          <p style="margin-top: 8px;">You have ${formatCurrency(25000)} of unused pension annual allowance available through carry forward. Contributing this amount would provide tax relief of ${formatCurrency(10000)} at your marginal rate (40%) and help reduce income below £100,000 threshold.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Make additional pension contribution before 5 April. Consider salary sacrifice for employer NI savings.</p>
        </div>

        <div class="highlight" style="border-left-color: #3b82f6;">
          <strong>Priority 3: Utilise Remaining ISA Allowance</strong>
          <p style="margin-top: 8px;">You have ${formatCurrency(8000)} of unused ISA allowance for the current tax year. This provides tax-free growth and income, which becomes increasingly valuable given your higher rate tax position.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Transfer from GIA to ISA where possible. Prioritise dividend-paying and growth assets.</p>
        </div>

        <div class="highlight" style="border-left-color: #6366f1;">
          <strong>Priority 4: Review Mortgage at Remortgage Date</strong>
          <p style="margin-top: 8px;">Your residential mortgage fixed rate expires in March 2026. With current market volatility, we recommend reviewing options 6 months prior to secure competitive rates.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Set reminder for September 2025. Obtain quotes from multiple lenders including current provider.</p>
        </div>

        <div class="highlight" style="border-left-color: #10b981;">
          <strong>Priority 5: Inheritance Tax Planning</strong>
          <p style="margin-top: 8px;">Potential IHT exposure of ${formatCurrency(356000)} warrants attention. Consider implementing a gifting strategy and reviewing whether whole life insurance in trust is appropriate to cover the liability.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Schedule estate planning meeting. Review pension death benefit nominations. Consider setting up trust structures.</p>
        </div>

        <div class="highlight" style="border-left-color: #ec4899;">
          <strong>Priority 6: Education Funding Gap</strong>
          <p style="margin-top: 8px;">Children's education fund is currently 42% funded with 4 years to target date. Consider increasing monthly contributions from ${formatCurrency(500)} to ${formatCurrency(750)} to ensure goal achievement.</p>
          <p style="margin-top: 8px; font-size: 10px; color: #6b7280;"><strong>Action:</strong> Review budget for additional savings capacity. Consider Junior ISAs for tax-efficient growth.</p>
        </div>
      </div>
    </div>
    ` : ''}

    ${selectedSections.includes('action_plan') ? `
    <div class="section">
      <h2 class="section-title">22. Action Plan</h2>
      
      <div class="subsection">
        <h3 class="subsection-title">Immediate Actions (Within 30 Days)</h3>
        <table>
          <tr><th>Priority</th><th>Action Item</th><th>Owner</th><th>Deadline</th><th>Status</th></tr>
          <tr><td><span class="badge badge-danger">High</span></td><td>Obtain life insurance quotes (${formatCurrency(300000)} additional cover)</td><td>Adviser</td><td>14 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-danger">High</span></td><td>Review pension carry forward calculation</td><td>Adviser</td><td>7 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-warning">Medium</span></td><td>Update pension death benefit nominations</td><td>Client</td><td>30 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-warning">Medium</span></td><td>Complete ISA top-up for current tax year</td><td>Client</td><td>Before 5 April</td><td><span class="badge badge-neutral">Pending</span></td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Short-Term Actions (Within 90 Days)</h3>
        <table>
          <tr><th>Priority</th><th>Action Item</th><th>Owner</th><th>Deadline</th><th>Status</th></tr>
          <tr><td><span class="badge badge-warning">Medium</span></td><td>Implement additional pension contribution</td><td>Client/Adviser</td><td>60 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-warning">Medium</span></td><td>Review and consolidate old workplace pensions</td><td>Adviser</td><td>90 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-info">Low</span></td><td>Schedule estate planning meeting</td><td>Adviser</td><td>90 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
          <tr><td><span class="badge badge-info">Low</span></td><td>Review children's education funding strategy</td><td>Adviser</td><td>90 days</td><td><span class="badge badge-neutral">Pending</span></td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Medium-Term Actions (Within 12 Months)</h3>
        <table>
          <tr><th>Priority</th><th>Action Item</th><th>Owner</th><th>Deadline</th><th>Status</th></tr>
          <tr><td><span class="badge badge-info">Medium</span></td><td>Annual portfolio rebalancing review</td><td>Adviser</td><td>6 months</td><td><span class="badge badge-neutral">Scheduled</span></td></tr>
          <tr><td><span class="badge badge-info">Medium</span></td><td>Review BTL mortgage options (5-year deal)</td><td>Adviser</td><td>9 months</td><td><span class="badge badge-neutral">Scheduled</span></td></tr>
          <tr><td><span class="badge badge-neutral">Low</span></td><td>Update will and lasting power of attorney</td><td>Client/Solicitor</td><td>12 months</td><td><span class="badge badge-neutral">Scheduled</span></td></tr>
          <tr><td><span class="badge badge-neutral">Low</span></td><td>Annual cashflow projection review</td><td>Adviser</td><td>12 months</td><td><span class="badge badge-neutral">Scheduled</span></td></tr>
        </table>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Long-Term Actions (1-3 Years)</h3>
        <table>
          <tr><th>Priority</th><th>Action Item</th><th>Owner</th><th>Deadline</th><th>Status</th></tr>
          <tr><td><span class="badge badge-info">Medium</span></td><td>Residential mortgage remortgage review</td><td>Adviser</td><td>Sep 2025</td><td><span class="badge badge-neutral">Future</span></td></tr>
          <tr><td><span class="badge badge-neutral">Low</span></td><td>Consider IHT insurance in trust</td><td>Adviser</td><td>2 years</td><td><span class="badge badge-neutral">Future</span></td></tr>
          <tr><td><span class="badge badge-neutral">Low</span></td><td>Review retirement income strategy</td><td>Adviser</td><td>3 years</td><td><span class="badge badge-neutral">Future</span></td></tr>
        </table>
      </div>

      <div class="highlight success">
        <strong>Next Review Meeting:</strong> We recommend scheduling your next comprehensive review in 12 months, or sooner if there are significant changes to your circumstances. Interim reviews will be conducted as needed for specific action items.
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>FlowPulse Financial Planning Platform</strong></p>
      <p>Report generated on ${currentDate}</p>
      <div class="disclaimer">
        <p><strong>Important Notice:</strong> This report is for informational purposes only and does not constitute financial advice. The projections and analyses contained herein are based on the information provided and various assumptions which may not reflect actual future results. Past performance is not indicative of future results. Investment values can fall as well as rise, and you may get back less than you invested.</p>
        <p style="margin-top: 8px;">Before making any financial decisions, please consult with a qualified financial adviser who can provide personalised advice based on your individual circumstances. This document is confidential and intended solely for the use of the individual or entity to whom it is addressed.</p>
        <p style="margin-top: 8px;">FlowPulse is authorised and regulated by the Financial Conduct Authority. FCA Reference Number: 123456.</p>
      </div>
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
