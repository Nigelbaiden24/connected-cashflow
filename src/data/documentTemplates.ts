import { DocumentTemplate } from "@/types/template";

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "financial-plan",
    name: "Financial Plan",
    category: "Finance",
    description: "Comprehensive financial planning document with projections and strategies",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Financial Plan 2025",
        className: "text-5xl font-bold text-primary mb-3 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Wealth Management",
        className: "text-2xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-8 border-t-2 border-gradient-to-r from-primary via-chart-2 to-chart-3",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-3xl font-bold text-primary mb-4",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This comprehensive financial plan outlines strategic recommendations...",
        className: "text-lg leading-relaxed mb-8 text-foreground bg-muted/30 p-6 rounded-lg",
        editable: true
      },
      {
        id: "chart-area-1",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-xl flex items-center justify-center my-8 border-2 border-primary/20 shadow-lg",
        editable: true
      },
      {
        id: "goals-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Goals",
        className: "text-3xl font-bold text-chart-2 mb-4 mt-10",
        editable: true
      },
      {
        id: "goals",
        type: "bullet-list",
        placeholder: "{{goals}}",
        defaultContent: "Achieve 8% annual portfolio growth\nBuild emergency fund of 6 months expenses\nRetirement savings target of £2M by 2045\nProperty investment diversification",
        className: "space-y-3 mb-8 text-lg",
        editable: true
      },
      {
        id: "strategy-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Strategy",
        className: "text-3xl font-bold text-chart-3 mb-4 mt-10",
        editable: true
      },
      {
        id: "strategy",
        type: "body",
        placeholder: "{{strategy}}",
        defaultContent: "Our recommended investment approach balances growth and risk management...",
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
    id: "proposal",
    name: "Business Proposal",
    category: "Finance",
    description: "Professional proposal for client services and partnerships",
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
