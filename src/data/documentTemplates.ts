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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Contact Information",
        className: "text-4xl font-bold text-primary mb-4",
        editable: true
      },
      {
        id: "contact-name",
        type: "subheading",
        placeholder: "{{contact_name}}",
        defaultContent: "John Smith",
        className: "text-2xl font-semibold mb-2",
        editable: true
      },
      {
        id: "contact-details-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Contact Details",
        className: "text-xl font-semibold text-primary mb-3 mt-6",
        editable: true
      },
      {
        id: "contact-details",
        type: "body",
        placeholder: "{{contact_details}}",
        defaultContent: "Email: john.smith@example.com\nPhone: +44 20 1234 5678\nMobile: +44 7700 900123\nAddress: 123 Business Street, London, UK",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "company-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Company Information",
        className: "text-xl font-semibold text-chart-2 mb-3 mt-6",
        editable: true
      },
      {
        id: "company-details",
        type: "body",
        placeholder: "{{company_details}}",
        defaultContent: "Company: Example Corp Ltd\nPosition: Managing Director\nDepartment: Operations\nIndustry: Technology",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "notes-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Notes",
        className: "text-xl font-semibold text-chart-3 mb-3 mt-6",
        editable: true
      },
      {
        id: "notes",
        type: "body",
        placeholder: "{{notes}}",
        defaultContent: "Key contact for project management\nPrefers email communication\nAvailable for meetings Tuesday-Thursday",
        className: "text-base leading-relaxed mb-6 text-muted-foreground bg-muted/30 p-4 rounded",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "INVOICE",
        className: "text-5xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "invoice-number",
        type: "subheading",
        placeholder: "{{invoice_number}}",
        defaultContent: "Invoice #INV-2025-001",
        className: "text-xl text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "from-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "From:",
        className: "text-lg font-semibold text-primary mb-2",
        editable: true
      },
      {
        id: "from-details",
        type: "body",
        placeholder: "{{from_details}}",
        defaultContent: "Your Company Name\n123 Business Street\nLondon, UK, SW1A 1AA\nEmail: billing@company.com\nPhone: +44 20 1234 5678",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "to-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Bill To:",
        className: "text-lg font-semibold text-chart-2 mb-2 mt-6",
        editable: true
      },
      {
        id: "to-details",
        type: "body",
        placeholder: "{{to_details}}",
        defaultContent: "Client Company Name\n456 Client Road\nManchester, UK, M1 1AA\nEmail: accounts@client.com",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "invoice-details-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Invoice Details",
        className: "text-lg font-semibold text-primary mb-2 mt-8 border-t pt-6",
        editable: true
      },
      {
        id: "invoice-dates",
        type: "body",
        placeholder: "{{invoice_dates}}",
        defaultContent: "Invoice Date: 20 October 2025\nDue Date: 20 November 2025\nPayment Terms: Net 30",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "items-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Items",
        className: "text-lg font-semibold text-primary mb-3 mt-6 bg-primary/10 p-3 rounded",
        editable: true
      },
      {
        id: "items",
        type: "bullet-list",
        placeholder: "{{items}}",
        defaultContent: "Consulting Services - 10 hours @ £150/hr - £1,500.00\nProject Management - 5 hours @ £120/hr - £600.00\nDocumentation & Reports - Fixed Fee - £400.00",
        className: "space-y-2 mb-6 text-base",
        editable: true
      },
      {
        id: "total-heading",
        type: "subheading",
        placeholder: "{{section5_heading}}",
        defaultContent: "Summary",
        className: "text-lg font-semibold text-primary mb-3 mt-8 border-t pt-6",
        editable: true
      },
      {
        id: "totals",
        type: "body",
        placeholder: "{{totals}}",
        defaultContent: "Subtotal: £2,500.00\nVAT (20%): £500.00\nTotal Amount Due: £3,000.00",
        className: "text-xl leading-relaxed mb-6 text-foreground font-bold",
        editable: true
      },
      {
        id: "payment-info",
        type: "body",
        placeholder: "{{payment_info}}",
        defaultContent: "Payment Information:\nBank: Example Bank\nAccount Name: Your Company Name\nAccount Number: 12345678\nSort Code: 12-34-56\nReference: INV-2025-001",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-muted/30 p-4 rounded",
        editable: true
      },
      {
        id: "terms",
        type: "body",
        placeholder: "{{terms}}",
        defaultContent: "Terms & Conditions: Payment is due within 30 days of invoice date. Late payments may incur additional charges.",
        className: "text-xs text-muted-foreground italic mt-8",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Investment Proposal",
        className: "text-5xl font-bold text-chart-3 mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Partnership Opportunity",
        className: "text-xl text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Proposal Overview",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "We present a comprehensive investment opportunity...",
        className: "text-base leading-relaxed mb-6 text-foreground p-5 bg-chart-3/5 rounded-lg",
        editable: true
      },
      {
        id: "scope-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Scope of Services",
        className: "text-2xl font-semibold text-chart-2 mb-4 mt-8",
        editable: true
      },
      {
        id: "scope",
        type: "bullet-list",
        placeholder: "{{scope}}",
        defaultContent: "Portfolio management and optimization\nRisk assessment and mitigation strategies\nQuarterly performance reviews\nTax-efficient investment planning",
        className: "space-y-3 mb-6",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-r from-primary/10 to-chart-3/10 rounded-lg flex items-center justify-center my-8 border border-primary/30",
        editable: true
      },
      {
        id: "investment-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Terms",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "investment",
        type: "body",
        placeholder: "{{investment}}",
        defaultContent: "The proposed fee structure is designed to align our success with yours...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "20 October 2025",
        className: "text-sm text-muted-foreground mb-2",
        editable: true
      },
      {
        id: "recipient",
        type: "subheading",
        placeholder: "{{recipient}}",
        defaultContent: "Dear Valued Client",
        className: "text-xl font-semibold mb-6",
        editable: true
      },
      {
        id: "opening",
        type: "body",
        placeholder: "{{opening}}",
        defaultContent: "We are writing to provide you with an important update regarding your investment portfolio...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "main-content-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Portfolio Update",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "main-content",
        type: "body",
        placeholder: "{{main_content}}",
        defaultContent: "Your portfolio has performed well during the recent quarter...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "key-points-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Highlights",
        className: "text-2xl font-semibold text-chart-2 mb-4 mt-8",
        editable: true
      },
      {
        id: "key-points",
        type: "bullet-list",
        placeholder: "{{key_points}}",
        defaultContent: "Total return of 12.5% year-to-date\nSuccessful rebalancing in Q3\nNew investment opportunities identified\nUpcoming quarterly review scheduled",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "closing",
        type: "body",
        placeholder: "{{closing}}",
        defaultContent: "We appreciate your continued trust and look forward to discussing these developments with you...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "signature",
        type: "subheading",
        placeholder: "{{signature}}",
        defaultContent: "Yours sincerely,\nFinancial Advisory Team",
        className: "text-base mt-8",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Portfolio Performance Summary",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "period",
        type: "subheading",
        placeholder: "{{period}}",
        defaultContent: "Q4 2025",
        className: "text-xl text-chart-2 mb-8",
        editable: true
      },
      {
        id: "performance-chart",
        type: "image",
        placeholder: "{{performance_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-chart-1/10 via-primary/10 to-chart-3/10 rounded-xl flex items-center justify-center my-8 border-2 border-primary/30 shadow-xl",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Performance Overview",
        className: "text-3xl font-bold text-primary mb-4",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "Your portfolio delivered strong performance during this period...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-muted/20 p-6 rounded-lg",
        editable: true
      },
      {
        id: "allocation-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Asset Allocation",
        className: "text-3xl font-bold text-chart-2 mb-4 mt-10",
        editable: true
      },
      {
        id: "allocation",
        type: "bullet-list",
        placeholder: "{{allocation}}",
        defaultContent: "Equities: 60% (£720,000)\nFixed Income: 25% (£300,000)\nAlternatives: 10% (£120,000)\nCash: 5% (£60,000)",
        className: "space-y-3 mb-6 text-lg font-medium",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Recommendations",
        className: "text-3xl font-bold text-chart-3 mb-4 mt-10",
        editable: true
      },
      {
        id: "recommendations",
        type: "body",
        placeholder: "{{recommendations}}",
        defaultContent: "Based on current market conditions, we recommend maintaining your current allocation...",
        className: "text-lg leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Client Onboarding Documentation",
        className: "text-4xl font-bold text-primary mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Know Your Customer (KYC) Information",
        className: "text-xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "personal-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Personal Information",
        className: "text-2xl font-semibold text-primary mb-4 bg-primary/5 p-3 rounded",
        editable: true
      },
      {
        id: "personal-info",
        type: "body",
        placeholder: "{{personal_info}}",
        defaultContent: "Please provide your full legal name, date of birth, and residential address...",
        className: "text-base leading-relaxed mb-6 text-foreground pl-4 border-l-4 border-primary",
        editable: true
      },
      {
        id: "financial-info-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Information",
        className: "text-2xl font-semibold text-chart-2 mb-4 bg-chart-2/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "financial-info",
        type: "bullet-list",
        placeholder: "{{financial_info}}",
        defaultContent: "Source of funds and wealth\nAnnual income range\nInvestment objectives\nRisk tolerance level",
        className: "space-y-2 mb-6 pl-4 border-l-4 border-chart-2",
        editable: true
      },
      {
        id: "documents-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Required Documents",
        className: "text-2xl font-semibold text-chart-3 mb-4 bg-chart-3/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "documents",
        type: "bullet-list",
        placeholder: "{{documents}}",
        defaultContent: "Valid government-issued ID (passport or driver's license)\nProof of address (utility bill or bank statement)\nBank account verification\nTax identification number",
        className: "space-y-2 mb-6 pl-4 border-l-4 border-chart-3",
        editable: true
      },
      {
        id: "declarations",
        type: "body",
        placeholder: "{{declarations}}",
        defaultContent: "I hereby declare that the information provided is accurate and complete...",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-muted/30 p-4 rounded italic",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Compliance Audit Report",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "report-id",
        type: "subheading",
        placeholder: "{{report_id}}",
        defaultContent: "Report ID: COMP-2025-Q4",
        className: "text-sm text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-2xl font-semibold text-primary mb-4 mt-6",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This compliance report covers the audit period and identifies key findings...",
        className: "text-base leading-relaxed mb-6 text-foreground bg-primary/5 p-5 rounded-lg border-l-4 border-primary",
        editable: true
      },
      {
        id: "findings-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Findings",
        className: "text-2xl font-semibold text-warning mb-4 mt-8",
        editable: true
      },
      {
        id: "findings",
        type: "bullet-list",
        placeholder: "{{findings}}",
        defaultContent: "All KYC documentation up to date\nAnti-money laundering procedures compliant\nTransaction monitoring systems operational\nClient communication records maintained",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "actions-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Corrective Actions",
        className: "text-2xl font-semibold text-destructive mb-4 mt-8",
        editable: true
      },
      {
        id: "actions",
        type: "bullet-list",
        placeholder: "{{actions}}",
        defaultContent: "Update staff training materials\nEnhance customer due diligence procedures\nImplement quarterly compliance reviews\nUpgrade transaction monitoring software",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Overall compliance status remains satisfactory with minor improvements recommended...",
        className: "text-base leading-relaxed mb-6 text-foreground bg-success/10 p-5 rounded-lg border-l-4 border-success",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "The Future of Sustainable Investing",
        className: "text-5xl font-bold text-primary mb-4 leading-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "A Comprehensive Analysis of ESG Trends",
        className: "text-2xl text-chart-2 mb-8 font-light",
        editable: true
      },
      {
        id: "abstract-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Abstract",
        className: "text-3xl font-bold text-primary mb-4 mt-10",
        editable: true
      },
      {
        id: "abstract",
        type: "body",
        placeholder: "{{abstract}}",
        defaultContent: "This whitepaper examines emerging trends in sustainable investment practices...",
        className: "text-lg leading-relaxed mb-8 text-foreground bg-muted/30 p-6 rounded-lg italic border-l-4 border-primary",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 rounded-xl flex items-center justify-center my-10 border border-primary/20",
        editable: true
      },
      {
        id: "introduction-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Introduction",
        className: "text-3xl font-bold text-chart-2 mb-4 mt-10",
        editable: true
      },
      {
        id: "introduction",
        type: "body",
        placeholder: "{{introduction}}",
        defaultContent: "Environmental, Social, and Governance (ESG) investing has evolved significantly...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "findings-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Research Findings",
        className: "text-3xl font-bold text-chart-3 mb-4 mt-10",
        editable: true
      },
      {
        id: "findings",
        type: "bullet-list",
        placeholder: "{{findings}}",
        defaultContent: "ESG assets projected to exceed $50 trillion by 2025\n78% of institutional investors incorporate ESG criteria\nGreen bonds market growing at 40% annually\nRegulatory frameworks strengthening globally",
        className: "space-y-3 mb-8 text-lg",
        editable: true
      },
      {
        id: "conclusion-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Conclusion",
        className: "text-3xl font-bold text-primary mb-4 mt-10",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Sustainable investing represents not just an ethical imperative but a strategic opportunity...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Market Update",
        className: "text-5xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent mb-3",
        editable: true
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "Week of October 20, 2025",
        className: "text-lg text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "market-overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Market Overview",
        className: "text-3xl font-semibold text-primary mb-4",
        editable: true
      },
      {
        id: "market-overview",
        type: "body",
        placeholder: "{{market_overview}}",
        defaultContent: "Global markets showed mixed performance this week as investors digested economic data...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-primary/5 p-5 rounded-lg",
        editable: true
      },
      {
        id: "market-chart",
        type: "image",
        placeholder: "{{market_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-chart-1/10 to-chart-3/10 rounded-xl flex items-center justify-center my-8 border-2 border-primary/20",
        editable: true
      },
      {
        id: "key-developments-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Developments",
        className: "text-3xl font-semibold text-chart-2 mb-4 mt-8",
        editable: true
      },
      {
        id: "key-developments",
        type: "bullet-list",
        placeholder: "{{key_developments}}",
        defaultContent: "Central bank signals potential rate cuts in Q1 2026\nTech sector rebounds on strong earnings\nCommodity prices stabilize after recent volatility\nEmerging markets attract increased capital flows",
        className: "space-y-3 mb-6 text-lg",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Outlook",
        className: "text-3xl font-semibold text-chart-3 mb-4 mt-8",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "Looking ahead, we maintain a cautiously optimistic stance on risk assets...",
        className: "text-lg leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Quarterly Review Meeting",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "meeting-details",
        type: "subheading",
        placeholder: "{{meeting_details}}",
        defaultContent: "Date: October 25, 2025 | Time: 10:00 AM | Duration: 60 minutes",
        className: "text-sm text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "attendees-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Attendees",
        className: "text-2xl font-semibold text-primary mb-3 bg-primary/5 p-3 rounded",
        editable: true
      },
      {
        id: "attendees",
        type: "bullet-list",
        placeholder: "{{attendees}}",
        defaultContent: "Client Representative\nSenior Portfolio Manager\nFinancial Analyst\nCompliance Officer",
        className: "space-y-2 mb-6 pl-4",
        editable: true
      },
      {
        id: "agenda-items-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Agenda Items",
        className: "text-2xl font-semibold text-chart-2 mb-3 bg-chart-2/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "agenda-items",
        type: "bullet-list",
        placeholder: "{{agenda_items}}",
        defaultContent: "Portfolio performance review (15 min)\nMarket outlook discussion (10 min)\nStrategy adjustments (15 min)\nRisk management review (10 min)\nQ&A and next steps (10 min)",
        className: "space-y-3 mb-6 pl-4 text-base",
        editable: true
      },
      {
        id: "objectives-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Meeting Objectives",
        className: "text-2xl font-semibold text-chart-3 mb-3 bg-chart-3/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "objectives",
        type: "body",
        placeholder: "{{objectives}}",
        defaultContent: "Review quarterly performance against benchmarks and discuss strategic adjustments...",
        className: "text-base leading-relaxed mb-6 text-foreground pl-4 border-l-4 border-chart-3",
        editable: true
      },
      {
        id: "preparation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Pre-Meeting Preparation",
        className: "text-2xl font-semibold text-primary mb-3 mt-8",
        editable: true
      },
      {
        id: "preparation",
        type: "bullet-list",
        placeholder: "{{preparation}}",
        defaultContent: "Review portfolio performance report\nPrepare questions on market outlook\nConsider any life changes affecting goals\nBring relevant financial documents",
        className: "space-y-2 mb-6",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Scenario Analysis Report",
        className: "text-5xl font-bold text-primary mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Portfolio Stress Testing & Risk Assessment",
        className: "text-2xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "base-case-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Base Case Scenario",
        className: "text-3xl font-bold text-success mb-4",
        editable: true
      },
      {
        id: "base-case",
        type: "body",
        placeholder: "{{base_case}}",
        defaultContent: "Under normal market conditions with moderate economic growth of 2-3%...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-success/10 p-6 rounded-lg border-l-4 border-success",
        editable: true
      },
      {
        id: "base-chart",
        type: "image",
        placeholder: "{{base_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-r from-success/10 to-success/20 rounded-xl flex items-center justify-center my-8 border border-success/30",
        editable: true
      },
      {
        id: "bull-case-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Bull Case Scenario",
        className: "text-3xl font-bold text-chart-2 mb-4 mt-10",
        editable: true
      },
      {
        id: "bull-case",
        type: "body",
        placeholder: "{{bull_case}}",
        defaultContent: "In an optimistic scenario with strong economic expansion and market confidence...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-chart-2/10 p-6 rounded-lg border-l-4 border-chart-2",
        editable: true
      },
      {
        id: "bear-case-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Bear Case Scenario",
        className: "text-3xl font-bold text-destructive mb-4 mt-10",
        editable: true
      },
      {
        id: "bear-case",
        type: "body",
        placeholder: "{{bear_case}}",
        defaultContent: "Under adverse conditions with economic contraction and market stress...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-destructive/10 p-6 rounded-lg border-l-4 border-destructive",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Risk Management Recommendations",
        className: "text-3xl font-bold text-primary mb-4 mt-10",
        editable: true
      },
      {
        id: "recommendations",
        type: "bullet-list",
        placeholder: "{{recommendations}}",
        defaultContent: "Maintain diversified asset allocation\nImplement downside protection strategies\nRegular portfolio rebalancing\nStress test quarterly",
        className: "space-y-3 mb-6 text-lg",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Annual Investment Report 2025",
        className: "text-6xl font-bold text-center text-primary mb-4 mt-20",
        editable: true
      },
      {
        id: "cover-subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Comprehensive Market Analysis & Portfolio Review",
        className: "text-2xl text-center text-muted-foreground mb-20",
        editable: true
      },
      {
        id: "divider-cover",
        type: "divider",
        placeholder: "",
        className: "my-12 border-t-4 border-primary/30",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-4xl font-bold text-primary mb-6 mt-12",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This comprehensive report provides an in-depth analysis of portfolio performance...",
        className: "text-lg leading-relaxed mb-10 text-foreground bg-muted/20 p-6 rounded-lg",
        editable: true
      },
      {
        id: "market-analysis-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Market Analysis",
        className: "text-4xl font-bold text-chart-2 mb-6 mt-12",
        editable: true
      },
      {
        id: "market-analysis",
        type: "body",
        placeholder: "{{market_analysis}}",
        defaultContent: "Global markets experienced significant volatility throughout 2025...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "analysis-chart",
        type: "image",
        placeholder: "{{analysis_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-xl flex items-center justify-center my-10 border-2 border-chart-2/30 shadow-xl",
        editable: true
      },
      {
        id: "performance-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Portfolio Performance",
        className: "text-4xl font-bold text-chart-3 mb-6 mt-12",
        editable: true
      },
      {
        id: "performance",
        type: "body",
        placeholder: "{{performance}}",
        defaultContent: "Your portfolio achieved a total return of 14.2% for the year...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "key-metrics-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Key Performance Metrics",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "key-metrics",
        type: "bullet-list",
        placeholder: "{{key_metrics}}",
        defaultContent: "Total Return: 14.2%\nBenchmark Outperformance: +2.8%\nVolatility (Std Dev): 11.5%\nSharpe Ratio: 1.23\nMaximum Drawdown: -8.7%",
        className: "space-y-3 mb-10 text-lg font-medium",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "2026 Outlook",
        className: "text-4xl font-bold text-primary mb-6 mt-12",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "Looking ahead to 2026, we anticipate continued market opportunities...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
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
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Investment Opportunity",
        className: "text-6xl font-bold text-center bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent mb-6 mt-24",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Transforming the Future of Finance",
        className: "text-3xl text-center text-muted-foreground mb-24 font-light",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-16 border-t-4 border-gradient-to-r from-primary via-chart-2 to-chart-3",
        editable: false
      },
      {
        id: "problem-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "The Problem",
        className: "text-5xl font-bold text-destructive mb-6 mt-16",
        editable: true
      },
      {
        id: "problem",
        type: "body",
        placeholder: "{{problem}}",
        defaultContent: "Traditional investment approaches fail to address modern challenges...",
        className: "text-2xl leading-relaxed mb-12 text-foreground",
        editable: true
      },
      {
        id: "solution-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Our Solution",
        className: "text-5xl font-bold text-success mb-6 mt-16",
        editable: true
      },
      {
        id: "solution",
        type: "body",
        placeholder: "{{solution}}",
        defaultContent: "We leverage cutting-edge technology and data-driven insights...",
        className: "text-2xl leading-relaxed mb-12 text-foreground",
        editable: true
      },
      {
        id: "solution-visual",
        type: "image",
        placeholder: "{{solution_visual}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-success/10 to-chart-2/10 rounded-2xl flex items-center justify-center my-12 border-2 border-success/30 shadow-2xl",
        editable: true
      },
      {
        id: "market-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Market Opportunity",
        className: "text-5xl font-bold text-chart-2 mb-6 mt-16",
        editable: true
      },
      {
        id: "market",
        type: "bullet-list",
        placeholder: "{{market}}",
        defaultContent: "£500B total addressable market\n15% annual growth rate\n2M potential clients in UK alone\nFirst-mover advantage in emerging segment",
        className: "space-y-4 mb-12 text-2xl font-medium",
        editable: true
      },
      {
        id: "traction-heading",
        type: "heading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Traction",
        className: "text-5xl font-bold text-chart-3 mb-6 mt-16",
        editable: true
      },
      {
        id: "traction",
        type: "bullet-list",
        placeholder: "{{traction}}",
        defaultContent: "£50M assets under management\n500+ active clients\n25% month-over-month growth\n98% client retention rate",
        className: "space-y-4 mb-12 text-2xl font-medium",
        editable: true
      },
      {
        id: "ask-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "The Ask",
        className: "text-5xl font-bold text-primary mb-6 mt-16",
        editable: true
      },
      {
        id: "ask",
        type: "body",
        placeholder: "{{ask}}",
        defaultContent: "We're raising £5M to accelerate growth and expand our technology platform...",
        className: "text-2xl leading-relaxed mb-12 text-foreground bg-primary/10 p-8 rounded-2xl",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(217 91% 60%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
