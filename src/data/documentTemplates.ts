import { DocumentTemplate } from "@/types/template";

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "contact",
    name: "Contact Sheet",
    category: "Business",
    description: "Professional contact information sheet for clients and partners",
    thumbnail: "/thumbnails/business-letter-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.3),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Contact Information",
        className: "relative z-10 text-5xl font-bold mb-3 bg-gradient-to-r from-white via-indigo-100 to-blue-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "contact-name",
        type: "subheading",
        placeholder: "{{contact_name}}",
        defaultContent: "John Smith",
        className: "relative z-10 text-2xl font-semibold mb-2 text-white/90",
        editable: true
      },
      {
        id: "contact-details-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Contact Details",
        className: "text-2xl font-bold text-foreground mt-8 mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-primary after:to-chart-2 after:rounded-full",
        editable: true
      },
      {
        id: "contact-details",
        type: "body",
        placeholder: "{{contact_details}}",
        defaultContent: "Email: john.smith@example.com\nPhone: +44 20 1234 5678\nMobile: +44 7700 900123\nAddress: 123 Business Street, London, UK",
        className: "text-base leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/20 p-6 rounded-2xl border-l-4 border-primary",
        editable: true
      },
      {
        id: "company-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Company Information",
        className: "text-2xl font-bold text-foreground mt-8 mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-chart-2 after:to-chart-3 after:rounded-full",
        editable: true
      },
      {
        id: "company-details",
        type: "body",
        placeholder: "{{company_details}}",
        defaultContent: "Company: Example Corp Ltd\nPosition: Managing Director\nDepartment: Operations\nIndustry: Technology",
        className: "text-base leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/20 p-6 rounded-2xl border-l-4 border-chart-2",
        editable: true
      },
      {
        id: "notes-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Notes",
        className: "text-2xl font-bold text-foreground mt-8 mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-chart-3 after:to-chart-4 after:rounded-full",
        editable: true
      },
      {
        id: "notes",
        type: "body",
        placeholder: "{{notes}}",
        defaultContent: "Key contact for project management\nPrefers email communication\nAvailable for meetings Tuesday-Thursday",
        className: "text-base leading-relaxed mb-6 text-muted-foreground bg-gradient-to-br from-chart-3/10 to-chart-4/5 p-6 rounded-2xl border border-chart-3/20",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(239 84% 67%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "finance-invoice",
    name: "Finance Invoice",
    category: "Finance",
    description: "Professional invoice template for billing and payments",
    thumbnail: "/thumbnails/business-proposal-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.3),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "INVOICE",
        className: "relative z-10 text-6xl font-extrabold text-white mb-2 tracking-tight",
        editable: true
      },
      {
        id: "invoice-number",
        type: "subheading",
        placeholder: "{{invoice_number}}",
        defaultContent: "Invoice #INV-2025-001",
        className: "relative z-10 text-xl text-emerald-200/80 mb-6 font-light",
        editable: true
      },
      {
        id: "from-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "From:",
        className: "text-lg font-bold text-foreground mb-2 mt-6 uppercase tracking-widest text-xs",
        editable: true
      },
      {
        id: "from-details",
        type: "body",
        placeholder: "{{from_details}}",
        defaultContent: "Your Company Name\n123 Business Street\nLondon, UK, SW1A 1AA\nEmail: billing@company.com\nPhone: +44 20 1234 5678",
        className: "text-base leading-relaxed mb-6 text-muted-foreground p-5 bg-gradient-to-br from-muted/40 to-muted/10 rounded-xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "to-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Bill To:",
        className: "text-lg font-bold text-foreground mb-2 mt-8 uppercase tracking-widest text-xs",
        editable: true
      },
      {
        id: "to-details",
        type: "body",
        placeholder: "{{to_details}}",
        defaultContent: "Client Company Name\n456 Client Road\nManchester, UK, M1 1AA\nEmail: accounts@client.com",
        className: "text-base leading-relaxed mb-6 text-muted-foreground p-5 bg-gradient-to-br from-muted/40 to-muted/10 rounded-xl border-l-4 border-teal-500",
        editable: true
      },
      {
        id: "invoice-details-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Invoice Details",
        className: "text-2xl font-bold text-foreground mb-3 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "invoice-dates",
        type: "body",
        placeholder: "{{invoice_dates}}",
        defaultContent: "Invoice Date: 20 October 2025\nDue Date: 20 November 2025\nPayment Terms: Net 30",
        className: "text-base leading-relaxed mb-6 text-foreground p-4 bg-emerald-500/5 rounded-xl",
        editable: true
      },
      {
        id: "items-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Items",
        className: "text-2xl font-bold text-foreground mb-4 mt-8 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "items",
        type: "bullet-list",
        placeholder: "{{items}}",
        defaultContent: "Consulting Services - 10 hours @ £150/hr - £1,500.00\nProject Management - 5 hours @ £120/hr - £600.00\nDocumentation & Reports - Fixed Fee - £400.00",
        className: "space-y-3 mb-8 text-base [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-gradient-to-r [&_li]:before:from-emerald-500 [&_li]:before:to-teal-500 [&_li]:before:rounded-full [&_li]:text-foreground [&_li]:py-3 [&_li]:px-5 [&_li]:bg-muted/20 [&_li]:rounded-xl",
        editable: true
      },
      {
        id: "total-heading",
        type: "subheading",
        placeholder: "{{section5_heading}}",
        defaultContent: "Summary",
        className: "text-2xl font-bold text-foreground mb-3 mt-8",
        editable: true
      },
      {
        id: "totals",
        type: "body",
        placeholder: "{{totals}}",
        defaultContent: "Subtotal: £2,500.00\nVAT (20%): £500.00\nTotal Amount Due: £3,000.00",
        className: "text-xl leading-relaxed mb-6 text-foreground font-bold p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border-2 border-emerald-500/20",
        editable: true
      },
      {
        id: "payment-info",
        type: "body",
        placeholder: "{{payment_info}}",
        defaultContent: "Payment Information:\nBank: Example Bank\nAccount Name: Your Company Name\nAccount Number: 12345678\nSort Code: 12-34-56\nReference: INV-2025-001",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-muted/30 p-5 rounded-xl border border-border",
        editable: true
      },
      {
        id: "terms",
        type: "body",
        placeholder: "{{terms}}",
        defaultContent: "Terms & Conditions: Payment is due within 30 days of invoice date. Late payments may incur additional charges.",
        className: "text-xs text-muted-foreground italic mt-8 pt-6 border-t border-border",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(160 84% 39%)",
      secondaryColor: "hsl(172 66% 50%)",
      accentColor: "hsl(187 92% 69%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "financial-plan",
    name: "Financial Plan",
    category: "Finance",
    description: "Comprehensive financial planning document with projections and strategies",
    thumbnail: "/thumbnails/financial-plan-thumb.png",
    sections: [
      // Hero Header Section
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(120,80,200,0.3),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(80,120,220,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "badge",
        type: "subheading",
        placeholder: "{{badge}}",
        defaultContent: "◆ FINANCIAL STRATEGY DOCUMENT",
        className: "relative z-10 -mt-12 mb-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest text-emerald-400 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full uppercase",
        editable: true
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Financial Plan 2025",
        className: "relative z-10 text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent tracking-tight leading-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Wealth Management & Growth Optimization",
        className: "relative z-10 text-xl text-white/80 mb-8 font-light max-w-2xl leading-relaxed",
        editable: true
      },
      {
        id: "header-meta",
        type: "body",
        placeholder: "{{header_meta}}",
        defaultContent: "Prepared: December 2024  •  Version 1.0  •  Confidential",
        className: "relative z-10 text-sm text-white/50 pt-6 border-t border-white/10 font-medium tracking-wide",
        editable: true
      },
      // Executive Summary Section
      {
        id: "executive-section-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "flex items-center gap-4 mt-10 mb-6",
        editable: false
      },
      {
        id: "executive-icon",
        type: "body",
        placeholder: "",
        defaultContent: "📊",
        className: "flex items-center justify-center w-14 h-14 text-2xl bg-gradient-to-br from-primary to-chart-2 rounded-2xl shadow-lg shadow-primary/30",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-3xl font-bold text-foreground relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-primary after:to-chart-2 after:rounded-full",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This comprehensive financial plan outlines strategic recommendations designed to optimize your wealth management strategy, maximize returns while managing risk, and ensure long-term financial security for you and your family.",
        className: "text-lg leading-relaxed text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/20 p-8 rounded-2xl border-l-4 border-primary relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:rounded-2xl",
        editable: true
      },
      // Key Metrics Section
      {
        id: "metrics-section",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "-mx-8 my-10 px-10 py-12 bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 relative overflow-hidden before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]",
        editable: false
      },
      {
        id: "metrics-title",
        type: "subheading",
        placeholder: "{{metrics_title}}",
        defaultContent: "Key Financial Objectives",
        className: "relative z-10 -mt-8 text-2xl font-bold text-white text-center mb-8",
        editable: true
      },
      {
        id: "metric-1",
        type: "body",
        placeholder: "{{metric1}}",
        defaultContent: "💰 $2.5M • Target Net Worth",
        className: "relative z-10 text-center p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-4 text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "metric-2",
        type: "body",
        placeholder: "{{metric2}}",
        defaultContent: "📈 12.5% • Annual ROI Target",
        className: "relative z-10 text-center p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-4 text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "metric-3",
        type: "body",
        placeholder: "{{metric3}}",
        defaultContent: "🎯 2045 • Retirement Goal",
        className: "relative z-10 text-center p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent",
        editable: true
      },
      // Financial Goals Section
      {
        id: "goals-section-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "flex items-center gap-4 mt-12 mb-6",
        editable: false
      },
      {
        id: "goals-icon",
        type: "body",
        placeholder: "",
        defaultContent: "🎯",
        className: "flex items-center justify-center w-14 h-14 text-2xl bg-gradient-to-br from-chart-2 to-chart-3 rounded-2xl shadow-lg shadow-chart-2/30",
        editable: false
      },
      {
        id: "goals-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Goals",
        className: "text-3xl font-bold text-foreground relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-chart-2 after:to-chart-3 after:rounded-full",
        editable: true
      },
      {
        id: "goals",
        type: "bullet-list",
        placeholder: "{{goals}}",
        defaultContent: "Achieve 12% annual portfolio growth through diversified investments\nBuild emergency fund covering 12 months of expenses\nRetirement savings target of £2M by 2045\nProperty investment diversification across 3 markets\nTax-efficient wealth transfer planning",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-primary [&_li]:before:to-chart-2 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      // Investment Strategy Section
      {
        id: "strategy-section-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "flex items-center gap-4 mt-12 mb-6",
        editable: false
      },
      {
        id: "strategy-icon",
        type: "body",
        placeholder: "",
        defaultContent: "🚀",
        className: "flex items-center justify-center w-14 h-14 text-2xl bg-gradient-to-br from-chart-3 to-chart-4 rounded-2xl shadow-lg shadow-chart-3/30",
        editable: false
      },
      {
        id: "strategy-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Strategy",
        className: "text-3xl font-bold text-foreground relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-chart-3 after:to-chart-4 after:rounded-full",
        editable: true
      },
      {
        id: "strategy-card-1",
        type: "body",
        placeholder: "{{portfolio_allocation}}",
        defaultContent: "01 PORTFOLIO ALLOCATION\n\nOur recommended allocation balances growth and stability: 60% Equities (diversified across sectors and geographies), 25% Fixed Income (government and corporate bonds), 10% Alternative Investments (real estate, commodities), 5% Cash reserves for opportunities.",
        className: "relative p-8 bg-white rounded-2xl border border-border shadow-lg mb-6 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-primary before:to-chart-2 before:rounded-t-2xl overflow-hidden",
        editable: true
      },
      {
        id: "strategy-card-2",
        type: "body",
        placeholder: "{{risk_management}}",
        defaultContent: "02 RISK MANAGEMENT\n\nComprehensive risk mitigation through: Portfolio diversification across asset classes, Regular rebalancing (quarterly reviews), Stop-loss mechanisms on high-volatility positions, Insurance coverage optimization, and Currency hedging for international exposure.",
        className: "relative p-8 bg-white rounded-2xl border border-border shadow-lg mb-6 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      },
      // Action Plan Section
      {
        id: "action-section-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "flex items-center gap-4 mt-12 mb-6",
        editable: false
      },
      {
        id: "action-icon",
        type: "body",
        placeholder: "",
        defaultContent: "✅",
        className: "flex items-center justify-center w-14 h-14 text-2xl bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/30",
        editable: false
      },
      {
        id: "action-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Action Plan",
        className: "text-3xl font-bold text-foreground relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "action-plan",
        type: "body",
        placeholder: "{{action_plan}}",
        defaultContent: "Next Steps & Recommendations\n\nImmediate actions to implement this financial strategy: Schedule comprehensive portfolio review meeting, Complete risk tolerance reassessment, Initiate tax-loss harvesting analysis, Review and update beneficiary designations, Set up automated investment contributions, and Establish quarterly performance review cadence.",
        className: "relative p-10 bg-gradient-to-br from-primary via-purple-600 to-chart-2 rounded-3xl text-white overflow-hidden before:absolute before:top-0 before:right-0 before:w-64 before:h-64 before:bg-white/10 before:rounded-full before:-translate-y-1/2 before:translate-x-1/2 after:absolute after:bottom-0 after:left-0 after:w-48 after:h-48 after:bg-white/5 after:rounded-full after:translate-y-1/2 after:-translate-x-1/2 [&]:text-lg [&]:leading-relaxed",
        editable: true
      },
      // Footer
      {
        id: "footer",
        type: "body",
        placeholder: "{{footer}}",
        defaultContent: "📋 FlowPulse Financial Advisory • Confidential Document • © 2024 All Rights Reserved",
        className: "mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(262 83% 58%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(280 85% 65%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "proposal",
    name: "Business Proposal",
    category: "Finance",
    description: "Professional proposal for client services and partnerships",
    thumbnail: "/thumbnails/proposal-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.25),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Investment Proposal",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Partnership Opportunity",
        className: "relative z-10 text-xl text-white/80 mb-6 font-light",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Proposal Overview",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "We are pleased to present this comprehensive investment proposal, developed after thorough analysis of your current financial position, risk tolerance, and long-term objectives. Our advisory team has conducted extensive due diligence across multiple asset classes and market segments to identify strategies that align with your wealth accumulation goals. This proposal encompasses a diversified approach combining traditional equity positions with alternative investments, structured to optimise risk-adjusted returns whilst maintaining capital preservation as a primary consideration. We believe the strategies outlined herein represent a compelling opportunity to enhance portfolio performance over the medium to long term.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-8 rounded-2xl border-l-4 border-amber-500",
        editable: true
      },
      {
        id: "scope-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Scope of Services",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-orange-500 after:to-red-400 after:rounded-full",
        editable: true
      },
      {
        id: "scope",
        type: "bullet-list",
        placeholder: "{{scope}}",
        defaultContent: "Portfolio management and optimization\nRisk assessment and mitigation strategies\nQuarterly performance reviews\nTax-efficient investment planning",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-amber-500 [&_li]:before:to-orange-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-400/10 rounded-2xl flex items-center justify-center my-10 border-2 border-amber-500/20 shadow-xl",
        editable: true
      },
      {
        id: "investment-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Terms",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-400 after:to-rose-500 after:rounded-full",
        editable: true
      },
      {
        id: "investment",
        type: "body",
        placeholder: "{{investment}}",
        defaultContent: "The proposed fee structure has been carefully designed to align our interests directly with your investment success. Our tiered management fee begins at 0.85% per annum on the first £500,000 of assets under management, reducing to 0.65% on assets between £500,000 and £1,000,000, and further reducing to 0.50% on assets exceeding £1,000,000. This competitive structure ensures that as your portfolio grows, the relative cost of our services decreases proportionally. Performance fees of 10% above the agreed benchmark are applied only when returns exceed the FTSE All-Share Total Return Index, ensuring you only pay for genuine outperformance. All fees are charged quarterly in arrears and fully transparent.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(38 92% 50%)",
      secondaryColor: "hsl(25 95% 53%)",
      accentColor: "hsl(12 76% 61%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "client-letter",
    name: "Client Letter",
    category: "Finance",
    description: "Formal correspondence for client communications",
    thumbnail: "/thumbnails/client-letter-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-10 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-t-lg overflow-hidden before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-sky-500 before:via-blue-500 before:to-indigo-500",
        editable: false
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "20 October 2025",
        className: "relative z-10 text-sm text-white/60 mb-2 font-medium tracking-wide",
        editable: true
      },
      {
        id: "recipient",
        type: "subheading",
        placeholder: "{{recipient}}",
        defaultContent: "Dear Valued Client",
        className: "text-2xl font-semibold mb-6 mt-8 text-foreground",
        editable: true
      },
      {
        id: "opening",
        type: "body",
        placeholder: "{{opening}}",
        defaultContent: "We are writing to provide you with an important update regarding your investment portfolio and to share our perspective on recent market developments that may impact your financial strategy. As your dedicated advisory team, we remain committed to ensuring full transparency in all matters pertaining to your wealth management arrangements, and we believe it is essential to keep you informed of both the opportunities and challenges that have emerged during this reporting period.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "main-content-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Portfolio Update",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "main-content",
        type: "body",
        placeholder: "{{main_content}}",
        defaultContent: "Your portfolio has delivered strong performance during the recent quarter, generating a total return of 8.3% against a benchmark return of 6.1%. This outperformance of 2.2 percentage points was primarily driven by our overweight position in technology and healthcare equities, which benefited from robust earnings growth and favourable sector rotation. Our fixed income allocation also contributed positively, as duration positioning proved advantageous amid the recent shift in interest rate expectations. We have maintained disciplined risk management throughout the period, with portfolio volatility remaining well within the agreed parameters established during our last review meeting.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground bg-gradient-to-br from-sky-500/5 to-blue-500/5 p-6 rounded-xl border-l-4 border-sky-500",
        editable: true
      },
      {
        id: "key-points-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Highlights",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "key-points",
        type: "bullet-list",
        placeholder: "{{key_points}}",
        defaultContent: "Total return of 12.5% year-to-date\nSuccessful rebalancing in Q3\nNew investment opportunities identified\nUpcoming quarterly review scheduled",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-sky-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "closing",
        type: "body",
        placeholder: "{{closing}}",
        defaultContent: "We sincerely appreciate your continued trust and confidence in our advisory services, and we look forward to discussing these developments in greater detail during our upcoming quarterly review. Should you have any immediate questions or concerns regarding your portfolio, please do not hesitate to contact your dedicated relationship manager. We remain fully committed to achieving your long-term financial objectives and ensuring that your investment strategy continues to evolve in response to changing market conditions.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "signature",
        type: "subheading",
        placeholder: "{{signature}}",
        defaultContent: "Yours sincerely,\nFinancial Advisory Team",
        className: "text-base mt-10 pt-8 border-t border-border text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(204 80% 54%)",
      secondaryColor: "hsl(221 83% 53%)",
      accentColor: "hsl(239 84% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "portfolio-summary",
    name: "Portfolio Summary",
    category: "Finance",
    description: "Comprehensive overview of investment portfolio performance",
    thumbnail: "/thumbnails/portfolio-summary-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.3),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Portfolio Performance Summary",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "period",
        type: "subheading",
        placeholder: "{{period}}",
        defaultContent: "Q4 2025",
        className: "relative z-10 text-xl text-violet-200/80 mb-6 font-light inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full",
        editable: true
      },
      {
        id: "performance-chart",
        type: "image",
        placeholder: "{{performance_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-violet-500/20 shadow-xl",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Performance Overview",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "Your portfolio delivered strong performance during this reporting period, achieving a total return of 14.2% compared to the composite benchmark return of 11.4%. This represents an outperformance of 2.8 percentage points, largely attributable to our tactical asset allocation decisions and rigorous security selection process. The equity component of your portfolio returned 18.7%, driven by strong earnings growth in our core holdings across the technology, healthcare, and consumer discretionary sectors. Fixed income allocations provided stable income generation and portfolio diversification benefits, returning 4.8% for the period.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-violet-500/8 to-purple-500/5 p-8 rounded-2xl border-l-4 border-violet-500",
        editable: true
      },
      {
        id: "allocation-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Asset Allocation",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "allocation",
        type: "bullet-list",
        placeholder: "{{allocation}}",
        defaultContent: "Equities: 60% (£720,000)\nFixed Income: 25% (£300,000)\nAlternatives: 10% (£120,000)\nCash: 5% (£60,000)",
        className: "space-y-4 mb-8 text-lg font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-violet-500 [&_li]:before:to-purple-500 [&_li]:before:rounded-full [&_li]:text-foreground [&_li]:py-3 [&_li]:px-6 [&_li]:bg-violet-500/5 [&_li]:rounded-xl",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Recommendations",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "recommendations",
        type: "body",
        placeholder: "{{recommendations}}",
        defaultContent: "Based on current market conditions and our forward-looking analysis, we recommend maintaining your current strategic asset allocation with minor tactical adjustments. Specifically, we suggest increasing your exposure to international developed markets by 3% to capitalise on valuation differentials, whilst reducing your UK large-cap allocation by a corresponding amount. Additionally, we recommend establishing a 5% position in infrastructure-linked investments to enhance portfolio diversification and provide inflation-protected income streams. These adjustments are consistent with your stated risk tolerance and are expected to improve the portfolio's risk-adjusted return profile over the coming twelve months.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-violet-500 before:to-indigo-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(263 70% 50%)",
      secondaryColor: "hsl(271 81% 56%)",
      accentColor: "hsl(239 84% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "kyc-form",
    name: "KYC Onboarding Form",
    category: "Finance",
    description: "Know Your Customer compliance documentation",
    thumbnail: "/thumbnails/kyc-form-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_60%_40%,rgba(6,182,212,0.3),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Client Onboarding Documentation",
        className: "relative z-10 text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-cyan-100 to-teal-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Know Your Customer (KYC) Information",
        className: "relative z-10 text-lg text-white/70 mb-6 font-light",
        editable: true
      },
      {
        id: "personal-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Personal Information",
        className: "text-2xl font-bold text-foreground mb-4 mt-6 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "personal-info",
        type: "body",
        placeholder: "{{personal_info}}",
        defaultContent: "Please provide your full legal name, date of birth, and residential address...",
        className: "text-base leading-relaxed mb-8 text-muted-foreground pl-6 border-l-4 border-cyan-500 bg-cyan-500/5 p-6 rounded-r-xl",
        editable: true
      },
      {
        id: "financial-info-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Information",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-teal-500 after:to-emerald-500 after:rounded-full",
        editable: true
      },
      {
        id: "financial-info",
        type: "bullet-list",
        placeholder: "{{financial_info}}",
        defaultContent: "Source of funds and wealth\nAnnual income range\nInvestment objectives\nRisk tolerance level",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-teal-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50",
        editable: true
      },
      {
        id: "documents-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Required Documents",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "documents",
        type: "bullet-list",
        placeholder: "{{documents}}",
        defaultContent: "Valid government-issued ID (passport or driver's license)\nProof of address (utility bill or bank statement)\nBank account verification\nTax identification number",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-emerald-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50",
        editable: true
      },
      {
        id: "declarations",
        type: "body",
        placeholder: "{{declarations}}",
        defaultContent: "I hereby declare that the information provided is accurate and complete...",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-gradient-to-br from-cyan-500/8 to-teal-500/5 p-6 rounded-2xl italic border border-cyan-500/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(187 92% 41%)",
      secondaryColor: "hsl(172 66% 50%)",
      accentColor: "hsl(160 84% 39%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "compliance-report",
    name: "Compliance Report",
    category: "Finance",
    description: "Regulatory compliance and audit documentation",
    thumbnail: "/thumbnails/compliance-report-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-rose-950 via-red-900 to-rose-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(244,63,94,0.25),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Compliance Audit Report",
        className: "relative z-10 text-4xl font-extrabold mb-2 bg-gradient-to-r from-white via-rose-100 to-red-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "report-id",
        type: "subheading",
        placeholder: "{{report_id}}",
        defaultContent: "Report ID: COMP-2025-Q4",
        className: "relative z-10 text-sm text-white/60 mb-6 font-mono tracking-wider",
        editable: true
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-2xl font-bold text-foreground mb-4 mt-8 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-rose-500 after:to-red-500 after:rounded-full",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This compliance report covers the audit period and identifies key findings...",
        className: "text-base leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-rose-500/8 to-red-500/5 p-6 rounded-2xl border-l-4 border-rose-500",
        editable: true
      },
      {
        id: "findings-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Findings",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full",
        editable: true
      },
      {
        id: "findings",
        type: "bullet-list",
        placeholder: "{{findings}}",
        defaultContent: "All KYC documentation up to date\nAnti-money laundering procedures compliant\nTransaction monitoring systems operational\nClient communication records maintained",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-emerald-500 [&_li]:before:to-green-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2",
        editable: true
      },
      {
        id: "actions-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Corrective Actions",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-500 after:to-rose-600 after:rounded-full",
        editable: true
      },
      {
        id: "actions",
        type: "bullet-list",
        placeholder: "{{actions}}",
        defaultContent: "Update staff training materials\nEnhance customer due diligence procedures\nImplement quarterly compliance reviews\nUpgrade transaction monitoring software",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-red-500 [&_li]:before:to-rose-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Overall compliance status across all assessed areas remains satisfactory, with the firm demonstrating a robust culture of regulatory adherence and risk awareness. Our review identified several opportunities for enhancement in client communication record-keeping and transaction monitoring workflows, which have been documented in the corrective actions section above. We recommend implementing the proposed improvements within the next 90 days and scheduling a follow-up review to assess progress. The compliance team has shown commendable diligence in maintaining up-to-date policies and procedures in line with evolving FCA regulatory requirements.",
        className: "text-base leading-relaxed mb-6 text-muted-foreground relative p-6 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-green-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(350 89% 60%)",
      secondaryColor: "hsl(0 72% 51%)",
      accentColor: "hsl(38 92% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "whitepaper",
    name: "Whitepaper",
    category: "Finance",
    description: "In-depth research and thought leadership document",
    thumbnail: "/thumbnails/whitepaper-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "The Future of Sustainable Investing",
        className: "relative z-10 text-5xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "A Comprehensive Analysis of ESG Trends",
        className: "relative z-10 text-xl text-blue-200/70 mb-8 font-light max-w-2xl",
        editable: true
      },
      {
        id: "abstract-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Abstract",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "abstract",
        type: "body",
        placeholder: "{{abstract}}",
        defaultContent: "This whitepaper examines the rapidly evolving landscape of sustainable investment practices, analysing key trends, regulatory developments, and performance outcomes that are reshaping the global asset management industry. Drawing on proprietary research, institutional survey data, and comprehensive market analysis, we present evidence-based insights into how Environmental, Social, and Governance (ESG) factors are increasingly integral to investment decision-making processes. Our findings suggest that sustainable investing has moved decisively from the periphery to the mainstream, with significant implications for portfolio construction, risk management, and long-term value creation.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground bg-gradient-to-br from-blue-500/8 to-sky-500/5 p-8 rounded-2xl italic border-l-4 border-blue-600",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-blue-600/10 via-sky-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-blue-600/20 shadow-xl",
        editable: true
      },
      {
        id: "introduction-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Introduction",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "introduction",
        type: "body",
        placeholder: "{{introduction}}",
        defaultContent: "Environmental, Social, and Governance (ESG) investing has evolved significantly over the past decade, transitioning from a niche approach favoured by mission-driven investors to a mainstream strategy embraced by the world's largest asset managers. This transformation has been catalysed by converging forces: mounting evidence that ESG integration enhances risk-adjusted returns, increasing regulatory mandates across jurisdictions, and growing demand from institutional and retail investors alike for investment approaches that align financial objectives with broader societal outcomes. The global ESG assets under management now exceed $40 trillion and are projected to surpass $50 trillion by 2025, representing more than one-third of total global assets.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground",
        editable: true
      },
      {
        id: "findings-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Research Findings",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "findings",
        type: "bullet-list",
        placeholder: "{{findings}}",
        defaultContent: "ESG assets projected to exceed $50 trillion by 2025\n78% of institutional investors incorporate ESG criteria\nGreen bonds market growing at 40% annually\nRegulatory frameworks strengthening globally",
        className: "space-y-4 mb-10 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-blue-600 [&_li]:before:to-sky-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "conclusion-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Conclusion",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-teal-500 after:to-emerald-500 after:rounded-full",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Sustainable investing represents not merely an ethical imperative but a compelling strategic opportunity for investors seeking superior long-term returns. Our research demonstrates that companies with strong ESG profiles exhibit lower cost of capital, reduced regulatory risk, and enhanced operational resilience during market downturns. As regulatory frameworks continue to strengthen and data quality improves, we anticipate further acceleration in ESG adoption across all investor segments. Investment managers who fail to integrate sustainability considerations into their processes risk both underperformance and increasing client attrition in the years ahead.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-gradient-to-br from-blue-600/8 to-emerald-500/5 rounded-2xl border border-blue-600/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(199 89% 48%)",
      accentColor: "hsl(172 66% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "market-commentary",
    name: "Market Commentary",
    category: "Finance",
    description: "Timely analysis of market trends and investment implications",
    thumbnail: "/thumbnails/market-commentary-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-fuchsia-950 via-pink-900 to-rose-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(232,121,249,0.25),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(244,63,94,0.15),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Market Update",
        className: "relative z-10 text-5xl font-extrabold bg-gradient-to-r from-white via-pink-100 to-fuchsia-100 bg-clip-text text-transparent mb-3 tracking-tight",
        editable: true
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "Week of October 20, 2025",
        className: "relative z-10 text-lg text-pink-200/70 mb-6 font-light",
        editable: true
      },
      {
        id: "market-overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Market Overview",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-fuchsia-500 after:to-pink-500 after:rounded-full",
        editable: true
      },
      {
        id: "market-overview",
        type: "body",
        placeholder: "{{market_overview}}",
        defaultContent: "Global markets exhibited mixed performance during the week as investors digested a complex array of macroeconomic data releases, central bank communications, and corporate earnings reports. The S&P 500 gained 1.2% on the back of strong technology earnings, whilst European indices remained largely flat amid renewed concerns about energy security. UK markets outperformed modestly, with the FTSE 100 rising 0.8% supported by a weaker sterling benefiting internationally-exposed constituents. Bond markets experienced notable volatility following unexpectedly hawkish commentary from Federal Reserve officials, with the US 10-year yield climbing 12 basis points to 4.35%.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-fuchsia-500/8 to-pink-500/5 p-8 rounded-2xl border-l-4 border-fuchsia-500",
        editable: true
      },
      {
        id: "market-chart",
        type: "image",
        placeholder: "{{market_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-fuchsia-500/20 shadow-xl",
        editable: true
      },
      {
        id: "key-developments-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Developments",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-pink-500 after:to-rose-500 after:rounded-full",
        editable: true
      },
      {
        id: "key-developments",
        type: "bullet-list",
        placeholder: "{{key_developments}}",
        defaultContent: "Central bank signals potential rate cuts in Q1 2026\nTech sector rebounds on strong earnings\nCommodity prices stabilize after recent volatility\nEmerging markets attract increased capital flows",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-fuchsia-500 [&_li]:before:to-pink-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Outlook",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-rose-500 after:to-red-500 after:rounded-full",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "Looking ahead, we maintain a cautiously optimistic stance on risk assets, supported by resilient corporate earnings, improving consumer confidence, and the anticipated commencement of monetary easing cycles across major economies. However, we remain vigilant regarding geopolitical risks, persistent inflationary pressures in certain sectors, and the potential for policy missteps. Our recommended positioning favours quality equities with strong balance sheets, selective exposure to emerging markets, and a modest overweight in investment-grade credit. We continue to advocate for disciplined portfolio rebalancing and the maintenance of adequate diversification across asset classes and geographies.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-fuchsia-500 before:to-rose-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(292 84% 61%)",
      secondaryColor: "hsl(330 81% 60%)",
      accentColor: "hsl(350 89% 60%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "meeting-agenda",
    name: "Meeting Agenda",
    category: "Finance",
    description: "Structured agenda for client meetings and reviews",
    thumbnail: "/thumbnails/meeting-agenda-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-12 bg-gradient-to-r from-slate-800 via-zinc-700 to-slate-800 rounded-t-lg overflow-hidden before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-orange-500 before:to-red-500",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Quarterly Review Meeting",
        className: "relative z-10 text-4xl font-extrabold text-white mb-2 tracking-tight",
        editable: true
      },
      {
        id: "meeting-details",
        type: "subheading",
        placeholder: "{{meeting_details}}",
        defaultContent: "Date: October 25, 2025 | Time: 10:00 AM | Duration: 60 minutes",
        className: "relative z-10 text-sm text-white/50 mb-6 font-mono tracking-wide",
        editable: true
      },
      {
        id: "attendees-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Attendees",
        className: "text-2xl font-bold text-foreground mb-4 mt-6 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full",
        editable: true
      },
      {
        id: "attendees",
        type: "bullet-list",
        placeholder: "{{attendees}}",
        defaultContent: "Client Representative\nSenior Portfolio Manager\nFinancial Analyst\nCompliance Officer",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-amber-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-1",
        editable: true
      },
      {
        id: "agenda-items-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Agenda Items",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-orange-500 after:to-red-500 after:rounded-full",
        editable: true
      },
      {
        id: "agenda-items",
        type: "bullet-list",
        placeholder: "{{agenda_items}}",
        defaultContent: "Portfolio performance review (15 min)\nMarket outlook discussion (10 min)\nStrategy adjustments (15 min)\nRisk management review (10 min)\nQ&A and next steps (10 min)",
        className: "space-y-3 mb-8 text-base [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-orange-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:px-4 [&_li]:bg-muted/20 [&_li]:rounded-lg",
        editable: true
      },
      {
        id: "objectives-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Meeting Objectives",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:rounded-full",
        editable: true
      },
      {
        id: "objectives",
        type: "body",
        placeholder: "{{objectives}}",
        defaultContent: "The primary objective of this meeting is to conduct a thorough review of quarterly portfolio performance against agreed benchmarks, discuss any strategic adjustments necessitated by changing market conditions, and ensure alignment between the client's evolving personal circumstances and the current investment strategy. We will also address any outstanding action items from our previous meeting and establish clear next steps for the coming quarter, including target dates for implementation of any agreed changes.",
        className: "text-base leading-relaxed mb-8 text-muted-foreground pl-6 border-l-4 border-amber-500 bg-amber-500/5 p-6 rounded-r-xl",
        editable: true
      },
      {
        id: "preparation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Pre-Meeting Preparation",
        className: "text-2xl font-bold text-foreground mb-4 mt-10",
        editable: true
      },
      {
        id: "preparation",
        type: "bullet-list",
        placeholder: "{{preparation}}",
        defaultContent: "Review portfolio performance report\nPrepare questions on market outlook\nConsider any life changes affecting goals\nBring relevant financial documents",
        className: "space-y-2 mb-6 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-red-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(38 92% 50%)",
      secondaryColor: "hsl(25 95% 53%)",
      accentColor: "hsl(0 72% 51%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "scenario-analysis",
    name: "Scenario Analysis",
    category: "Finance",
    description: "Strategic planning and risk modeling document",
    thumbnail: "/thumbnails/scenario-analysis-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(161,161,170,0.15),transparent_60%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Scenario Analysis Report",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-zinc-200 to-slate-300 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Portfolio Stress Testing & Risk Assessment",
        className: "relative z-10 text-xl text-zinc-400 mb-6 font-light",
        editable: true
      },
      {
        id: "base-case-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Base Case Scenario",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "base-case",
        type: "body",
        placeholder: "{{base_case}}",
        defaultContent: "Under the base case scenario, we assume a continuation of moderate economic growth in the range of 2-3% GDP expansion, gradual normalisation of monetary policy with interest rates stabilising at 3.5-4.0%, and inflation returning to central bank target ranges by mid-2026. In this environment, we project the portfolio to deliver a total return of 8-10% per annum, with equity allocations contributing the majority of growth whilst fixed income provides stable income generation and portfolio ballast. Risk metrics remain within acceptable parameters, with expected portfolio volatility of 10-12% and maximum drawdown limited to approximately 12%.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-8 rounded-2xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "base-chart",
        type: "image",
        placeholder: "{{base_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-emerald-500/20 shadow-lg",
        editable: true
      },
      {
        id: "bull-case-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Bull Case Scenario",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "bull-case",
        type: "body",
        placeholder: "{{bull_case}}",
        defaultContent: "In the bull case scenario, characterised by accelerating economic expansion above 3.5% GDP growth, benign inflation dynamics, and strong corporate earnings momentum, the portfolio is projected to deliver total returns of 15-20% per annum. This scenario assumes successful resolution of current geopolitical tensions, continued innovation-driven productivity gains, and a supportive regulatory environment for capital markets. Equity allocations would benefit most significantly, with growth-oriented sectors such as technology and healthcare potentially delivering outsized returns. We would recommend increasing risk exposure incrementally should early indicators of this scenario materialise.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-sky-500/10 to-blue-500/5 p-8 rounded-2xl border-l-4 border-sky-500",
        editable: true
      },
      {
        id: "bear-case-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Bear Case Scenario",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-500 after:to-rose-600 after:rounded-full",
        editable: true
      },
      {
        id: "bear-case",
        type: "body",
        placeholder: "{{bear_case}}",
        defaultContent: "Under the bear case scenario, we model a significant economic contraction of -1.5% to -3.0% GDP, triggered by a combination of escalating geopolitical conflict, persistent inflation above 5%, and aggressive monetary tightening. In this environment, the portfolio could experience drawdowns of 20-30% from peak values, with equity allocations bearing the brunt of losses. However, our defensive positioning—including allocation to government bonds, gold, and cash equivalents—would provide meaningful portfolio protection. Stress testing indicates that even in this adverse scenario, the portfolio would recover to pre-drawdown levels within 18-24 months, assuming no fundamental changes to the long-term economic trajectory.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-red-500/10 to-rose-500/5 p-8 rounded-2xl border-l-4 border-red-500",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Risk Management Recommendations",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "recommendations",
        type: "bullet-list",
        placeholder: "{{recommendations}}",
        defaultContent: "Maintain diversified asset allocation\nImplement downside protection strategies\nRegular portfolio rebalancing\nStress test quarterly",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-violet-500 [&_li]:before:to-purple-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(240 6% 10%)",
      secondaryColor: "hsl(160 84% 39%)",
      accentColor: "hsl(350 89% 60%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "multi-page-report",
    name: "Multi-Page Report",
    category: "Finance",
    description: "Comprehensive multi-section analytical report",
    thumbnail: "/thumbnails/multi-page-report-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-24 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.25),transparent_60%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.15),transparent_50%)]",
        editable: false
      },
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Annual Investment Report 2025",
        className: "relative z-10 text-6xl font-extrabold text-center mb-4 bg-gradient-to-r from-white via-indigo-100 to-blue-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "cover-subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Comprehensive Market Analysis & Portfolio Review",
        className: "relative z-10 text-2xl text-center text-indigo-200/70 mb-8 font-light",
        editable: true
      },
      {
        id: "divider-cover",
        type: "divider",
        placeholder: "",
        className: "my-12 border-t-4 border-indigo-500/30",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This comprehensive annual report provides an in-depth analysis of portfolio performance, market conditions, and strategic positioning throughout the 2025 fiscal year. Despite a challenging macroeconomic environment characterised by heightened volatility and shifting monetary policy expectations, our disciplined investment approach delivered consistent outperformance against key benchmarks. The report details our asset allocation decisions, security selection outcomes, risk management protocols, and forward-looking strategic recommendations designed to position the portfolio for continued success in the year ahead.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground bg-gradient-to-br from-indigo-500/8 to-blue-500/5 p-8 rounded-2xl border-l-4 border-indigo-500",
        editable: true
      },
      {
        id: "market-analysis-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Market Analysis",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-blue-500 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "market-analysis",
        type: "body",
        placeholder: "{{market_analysis}}",
        defaultContent: "Global markets experienced significant volatility throughout 2025, driven by evolving central bank policies, geopolitical uncertainties, and shifting economic growth expectations. The first half of the year saw equity markets rally strongly on expectations of interest rate cuts, whilst the third quarter brought a correction as inflation data proved stickier than anticipated. The final quarter witnessed a robust recovery, supported by improving corporate earnings and renewed optimism regarding the economic outlook. Across the full year, developed market equities returned 16.8%, emerging markets delivered 12.3%, and global bonds provided a modest but positive 3.9% return.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "analysis-chart",
        type: "image",
        placeholder: "{{analysis_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-sky-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-indigo-500/20 shadow-xl",
        editable: true
      },
      {
        id: "performance-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Portfolio Performance",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-sky-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "performance",
        type: "body",
        placeholder: "{{performance}}",
        defaultContent: "Your portfolio achieved a total return of 14.2% for the year, outperforming the composite benchmark by 2.8 percentage points. This outperformance was driven by successful tactical asset allocation, with our timely increase in equity exposure during the Q3 correction proving particularly beneficial. Security selection within the equity component added an additional 1.4% of alpha, with notable contributions from our positions in artificial intelligence infrastructure companies, premium consumer brands, and renewable energy developers. The fixed income allocation delivered 4.2%, benefiting from our duration positioning ahead of the rate-cutting cycle.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "key-metrics-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Key Performance Metrics",
        className: "text-2xl font-bold text-foreground mb-4 mt-8 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "key-metrics",
        type: "bullet-list",
        placeholder: "{{key_metrics}}",
        defaultContent: "Total Return: 14.2%\nBenchmark Outperformance: +2.8%\nVolatility (Std Dev): 11.5%\nSharpe Ratio: 1.23\nMaximum Drawdown: -8.7%",
        className: "space-y-4 mb-10 text-lg font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-indigo-500 [&_li]:before:to-blue-500 [&_li]:before:rounded-full [&_li]:text-foreground [&_li]:py-3 [&_li]:px-5 [&_li]:bg-indigo-500/5 [&_li]:rounded-xl",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "2026 Outlook",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-teal-500 after:to-emerald-500 after:rounded-full",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "Looking ahead to 2026, we anticipate a constructive but more nuanced investment environment. The global economy is expected to grow at approximately 2.8%, with the US and Asia leading whilst Europe faces structural headwinds. We believe the current monetary easing cycle will support risk assets, but valuations in certain sectors—particularly large-cap technology—warrant caution. Our strategic positioning favours international diversification, quality factor exposure, and selective allocation to alternative assets including infrastructure and private credit. We recommend maintaining a balanced approach, with sufficient flexibility to capitalise on opportunities as they arise during the year.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-gradient-to-br from-indigo-500/8 to-emerald-500/5 rounded-2xl border border-indigo-500/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(239 84% 67%)",
      secondaryColor: "hsl(221 83% 53%)",
      accentColor: "hsl(172 66% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    category: "Finance",
    description: "Investment pitch presentation document",
    thumbnail: "/thumbnails/pitch-deck-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-28 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.2),transparent_60%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_50%)]",
        editable: false
      },
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Investment Opportunity",
        className: "relative z-10 text-6xl font-extrabold text-center mb-6 bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Transforming the Future of Finance",
        className: "relative z-10 text-3xl text-center text-violet-200/60 mb-8 font-light",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-16 border-t-4 border-violet-500/20",
        editable: false
      },
      {
        id: "problem-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "The Problem",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "problem",
        type: "body",
        placeholder: "{{problem}}",
        defaultContent: "Traditional investment management approaches were designed for a world that no longer exists. Legacy advisory firms rely on outdated portfolio construction methodologies, lack real-time risk monitoring capabilities, and charge excessive fees that erode client returns over time. The average investor loses 1.5-2.5% annually to hidden costs, opaque fee structures, and suboptimal asset allocation—amounting to hundreds of thousands of pounds over a typical investment horizon. Meanwhile, the demand for sophisticated, technology-enabled financial advice has never been greater, with over 60% of high-net-worth individuals expressing dissatisfaction with their current advisory relationships.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground",
        editable: true
      },
      {
        id: "solution-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Our Solution",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "solution",
        type: "body",
        placeholder: "{{solution}}",
        defaultContent: "We have developed a proprietary technology platform that combines institutional-grade portfolio analytics with intuitive client-facing interfaces, delivering a wealth management experience that is both more sophisticated and more accessible than anything currently available in the market. Our AI-powered risk engine processes over 50,000 data points daily to dynamically optimise portfolio positioning, whilst our automated rebalancing system ensures that client portfolios remain aligned with their strategic objectives at all times. This technology-first approach enables us to deliver superior investment outcomes at a fraction of the cost of traditional advisory firms.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground",
        editable: true
      },
      {
        id: "solution-visual",
        type: "image",
        placeholder: "{{solution_visual}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center my-12 border-2 border-violet-500/20 shadow-2xl",
        editable: true
      },
      {
        id: "market-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Market Opportunity",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-blue-500 after:to-sky-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "market",
        type: "bullet-list",
        placeholder: "{{market}}",
        defaultContent: "£500B total addressable market\n15% annual growth rate\n2M potential clients in UK alone\nFirst-mover advantage in emerging segment",
        className: "space-y-4 mb-12 text-2xl font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-3 [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:bg-gradient-to-r [&_li]:before:from-blue-500 [&_li]:before:to-sky-500 [&_li]:before:rounded-full [&_li]:text-foreground",
        editable: true
      },
      {
        id: "traction-heading",
        type: "heading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Traction",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "traction",
        type: "bullet-list",
        placeholder: "{{traction}}",
        defaultContent: "£50M assets under management\n500+ active clients\n25% month-over-month growth\n98% client retention rate",
        className: "space-y-4 mb-12 text-2xl font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-3 [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:bg-gradient-to-r [&_li]:before:from-amber-500 [&_li]:before:to-orange-500 [&_li]:before:rounded-full [&_li]:text-foreground",
        editable: true
      },
      {
        id: "ask-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "The Ask",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "ask",
        type: "body",
        placeholder: "{{ask}}",
        defaultContent: "We are seeking £5M in Series A funding to accelerate our growth trajectory and expand our technology platform into new market segments. The capital will be deployed across three strategic priorities: 40% towards technology development including AI model enhancement and mobile platform expansion, 35% towards client acquisition and marketing to drive AUM growth, and 25% towards talent acquisition to build out our investment research and client services teams. At our current growth rate, we project reaching £500M in AUM within 24 months, delivering a clear path to profitability and positioning the firm for a potential Series B or strategic partnership opportunity.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground relative p-10 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-3xl border-2 border-violet-500/20",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(263 70% 50%)",
      secondaryColor: "hsl(271 81% 56%)",
      accentColor: "hsl(330 81% 60%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
