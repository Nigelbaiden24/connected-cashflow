import { DocumentTemplate } from "@/types/template";

export const businessTemplates: DocumentTemplate[] = [
  {
    id: "business-plan",
    name: "Business Plan",
    category: "Business",
    description: "Comprehensive business plan with market analysis and financial projections",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Plan 2025",
        className: "text-5xl font-bold text-success mb-3 bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Growth & Market Expansion",
        className: "text-2xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-8 border-t-2 border-success/20",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-3xl font-semibold text-success mb-4",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "Our business is positioned to capture significant market share...",
        className: "text-lg leading-relaxed mb-8 text-foreground bg-success/5 p-6 rounded-lg",
        editable: true
      },
      {
        id: "market-analysis-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Market Analysis",
        className: "text-3xl font-semibold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "market-analysis",
        type: "body",
        placeholder: "{{market_analysis}}",
        defaultContent: "The target market demonstrates strong growth potential...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "chart-area",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-success/10 to-success/20 rounded-xl flex items-center justify-center my-10 border-2 border-success/30 shadow-lg",
        editable: true
      },
      {
        id: "strategy-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Growth Strategy",
        className: "text-3xl font-semibold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "strategy",
        type: "bullet-list",
        placeholder: "{{strategy}}",
        defaultContent: "Expand into new geographic markets\nDevelop strategic partnerships\nInvest in technology infrastructure\nEnhance customer experience",
        className: "space-y-3 mb-8 text-lg",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Professional proposal template for client projects",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Project Proposal",
        className: "text-5xl font-bold bg-gradient-to-r from-success to-chart-2 bg-clip-text text-transparent mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Transforming Vision into Reality",
        className: "text-2xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "client-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Project Overview",
        className: "text-3xl font-semibold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "This proposal outlines our approach to delivering exceptional value...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "scope-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Scope of Work",
        className: "text-3xl font-semibold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "scope",
        type: "bullet-list",
        placeholder: "{{scope}}",
        defaultContent: "Initial consultation and requirements gathering\nDetailed project planning and timeline\nImplementation and quality assurance\nTraining and knowledge transfer\nOngoing support and maintenance",
        className: "space-y-3 mb-8 text-lg",
        editable: true
      },
      {
        id: "timeline-visual",
        type: "image",
        placeholder: "{{timeline}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-success/5 via-success/10 to-success/5 rounded-xl flex items-center justify-center my-10 border border-success/30",
        editable: true
      },
      {
        id: "investment-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment & Timeline",
        className: "text-3xl font-semibold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "investment",
        type: "body",
        placeholder: "{{investment}}",
        defaultContent: "The project is structured to deliver value at each phase...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "client-letter",
    name: "Client Letter",
    category: "Business",
    description: "Formal business correspondence",
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
        defaultContent: "Dear Valued Partner",
        className: "text-xl font-semibold mb-6",
        editable: true
      },
      {
        id: "opening",
        type: "body",
        placeholder: "{{opening}}",
        defaultContent: "We are pleased to inform you about exciting developments...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "main-content-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Key Updates",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "main-content",
        type: "body",
        placeholder: "{{main_content}}",
        defaultContent: "Our partnership continues to strengthen with new initiatives...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "highlights",
        type: "bullet-list",
        placeholder: "{{highlights}}",
        defaultContent: "30% revenue growth this quarter\nLaunched three new product lines\nExpanded to two new markets\nEnhanced customer support services",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "closing",
        type: "body",
        placeholder: "{{closing}}",
        defaultContent: "We look forward to continued collaboration and mutual success...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "signature",
        type: "subheading",
        placeholder: "{{signature}}",
        defaultContent: "Best regards,\nBusiness Development Team",
        className: "text-base mt-8",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "portfolio-summary",
    name: "Company Portfolio",
    category: "Business",
    description: "Overview of company projects and achievements",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Company Portfolio",
        className: "text-5xl font-bold text-success mb-3",
        editable: true
      },
      {
        id: "tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Innovation Through Excellence",
        className: "text-2xl text-muted-foreground mb-10",
        editable: true
      },
      {
        id: "showcase-image",
        type: "image",
        placeholder: "{{showcase_image}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-success/10 via-chart-2/10 to-chart-3/10 rounded-2xl flex items-center justify-center my-10 border-2 border-success/30 shadow-2xl",
        editable: true
      },
      {
        id: "about-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "About Us",
        className: "text-3xl font-bold text-success mb-4",
        editable: true
      },
      {
        id: "about",
        type: "body",
        placeholder: "{{about}}",
        defaultContent: "We are a leading provider of innovative business solutions...",
        className: "text-lg leading-relaxed mb-10 text-foreground bg-muted/20 p-6 rounded-lg",
        editable: true
      },
      {
        id: "services-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Our Services",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "services",
        type: "bullet-list",
        placeholder: "{{services}}",
        defaultContent: "Strategic Consulting & Advisory\nDigital Transformation Solutions\nProject Management Services\nChange Management Support",
        className: "space-y-3 mb-10 text-lg font-medium",
        editable: true
      },
      {
        id: "achievements-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Achievements",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "achievements",
        type: "bullet-list",
        placeholder: "{{achievements}}",
        defaultContent: "100+ successful projects delivered\n50+ enterprise clients worldwide\nIndustry recognition and awards\n95% client satisfaction rate",
        className: "space-y-3 mb-10 text-lg",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(28 87% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "kyc-form",
    name: "Business Onboarding",
    category: "Business",
    description: "Client onboarding and verification documentation",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Onboarding Form",
        className: "text-4xl font-bold text-success mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Client Information & Verification",
        className: "text-xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "company-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Company Information",
        className: "text-2xl font-semibold text-success mb-4 bg-success/5 p-3 rounded",
        editable: true
      },
      {
        id: "company-info",
        type: "body",
        placeholder: "{{company_info}}",
        defaultContent: "Please provide your complete company details including registration number...",
        className: "text-base leading-relaxed mb-6 text-foreground pl-4 border-l-4 border-success",
        editable: true
      },
      {
        id: "business-details-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Business Details",
        className: "text-2xl font-semibold text-success mb-4 bg-success/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "business-details",
        type: "bullet-list",
        placeholder: "{{business_details}}",
        defaultContent: "Industry sector and business activities\nAnnual revenue and employee count\nPrimary markets and locations\nKey stakeholders and decision makers",
        className: "space-y-2 mb-6 pl-4 border-l-4 border-success",
        editable: true
      },
      {
        id: "documents-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Required Documentation",
        className: "text-2xl font-semibold text-success mb-4 bg-success/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "documents",
        type: "bullet-list",
        placeholder: "{{documents}}",
        defaultContent: "Certificate of incorporation\nProof of registered address\nDirectors' identification\nFinancial statements (last 2 years)",
        className: "space-y-2 mb-6 pl-4 border-l-4 border-success",
        editable: true
      },
      {
        id: "terms",
        type: "body",
        placeholder: "{{terms}}",
        defaultContent: "By submitting this form, you agree to our terms and conditions...",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-muted/30 p-4 rounded italic",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "compliance-report",
    name: "Compliance Report",
    category: "Business",
    description: "Corporate compliance and audit documentation",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Corporate Compliance Report",
        className: "text-4xl font-bold text-success mb-2",
        editable: true
      },
      {
        id: "report-period",
        type: "subheading",
        placeholder: "{{report_period}}",
        defaultContent: "Reporting Period: Q4 2025",
        className: "text-sm text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Compliance Summary",
        className: "text-2xl font-semibold text-success mb-4 mt-6",
        editable: true
      },
      {
        id: "summary",
        type: "body",
        placeholder: "{{summary}}",
        defaultContent: "This report outlines our compliance status across all key areas...",
        className: "text-base leading-relaxed mb-6 text-foreground bg-success/5 p-5 rounded-lg border-l-4 border-success",
        editable: true
      },
      {
        id: "areas-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Compliance Areas Reviewed",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "areas",
        type: "bullet-list",
        placeholder: "{{areas}}",
        defaultContent: "Data protection and privacy (GDPR)\nHealth and safety standards\nEnvironmental regulations\nEmployment law compliance\nFinancial reporting requirements",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "actions-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Action Items",
        className: "text-2xl font-semibold text-warning mb-4 mt-8",
        editable: true
      },
      {
        id: "actions",
        type: "bullet-list",
        placeholder: "{{actions}}",
        defaultContent: "Update privacy policies by end of month\nComplete staff training on new procedures\nReview supplier compliance certifications\nSchedule next audit for Q1 2026",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Overall compliance status is satisfactory with all major requirements met...",
        className: "text-base leading-relaxed mb-6 text-foreground bg-success/10 p-5 rounded-lg border-l-4 border-success",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "whitepaper",
    name: "Industry Whitepaper",
    category: "Business",
    description: "Thought leadership and research publication",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Digital Transformation in 2025",
        className: "text-5xl font-bold text-success mb-4 leading-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategies for Business Success",
        className: "text-2xl text-muted-foreground mb-10 font-light",
        editable: true
      },
      {
        id: "abstract-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Abstract",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "abstract",
        type: "body",
        placeholder: "{{abstract}}",
        defaultContent: "This whitepaper explores the latest trends in digital transformation...",
        className: "text-lg leading-relaxed mb-10 text-foreground bg-muted/30 p-6 rounded-lg italic border-l-4 border-success",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-r from-success/5 via-chart-2/5 to-chart-3/5 rounded-xl flex items-center justify-center my-10 border border-success/20",
        editable: true
      },
      {
        id: "introduction-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Introduction",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "introduction",
        type: "body",
        placeholder: "{{introduction}}",
        defaultContent: "Digital transformation has become a strategic imperative for businesses...",
        className: "text-lg leading-relaxed mb-10 text-foreground",
        editable: true
      },
      {
        id: "insights-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Insights",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "insights",
        type: "bullet-list",
        placeholder: "{{insights}}",
        defaultContent: "70% of companies accelerating digital initiatives\nCloud adoption up 40% year-over-year\nAI integration becoming mainstream\nCustomer experience remains top priority",
        className: "space-y-3 mb-10 text-lg",
        editable: true
      },
      {
        id: "conclusion-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Conclusion",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Successful digital transformation requires strategic vision and execution...",
        className: "text-lg leading-relaxed mb-10 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "market-commentary",
    name: "Market Update",
    category: "Business",
    description: "Industry news and market analysis",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Market Update",
        className: "text-5xl font-bold bg-gradient-to-r from-success via-chart-2 to-chart-3 bg-clip-text text-transparent mb-3",
        editable: true
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "October 2025",
        className: "text-lg text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Industry Overview",
        className: "text-3xl font-semibold text-success mb-4",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "The industry continues to show strong growth momentum...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-success/5 p-5 rounded-lg",
        editable: true
      },
      {
        id: "trends-chart",
        type: "image",
        placeholder: "{{trends_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-chart-1/10 to-chart-3/10 rounded-xl flex items-center justify-center my-8 border-2 border-success/20",
        editable: true
      },
      {
        id: "developments-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Developments",
        className: "text-3xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "developments",
        type: "bullet-list",
        placeholder: "{{developments}}",
        defaultContent: "Major merger announced in sector\nNew regulations taking effect Q1 2026\nTechnology adoption accelerating\nEmergent competitors entering market",
        className: "space-y-3 mb-6 text-lg",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Business Outlook",
        className: "text-3xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "We anticipate continued growth with emerging opportunities...",
        className: "text-lg leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(28 87% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "meeting-agenda",
    name: "Meeting Agenda",
    category: "Business",
    description: "Structured meeting agenda and action items",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Quarterly Business Review",
        className: "text-4xl font-bold text-success mb-2",
        editable: true
      },
      {
        id: "meeting-info",
        type: "subheading",
        placeholder: "{{meeting_info}}",
        defaultContent: "Date: October 25, 2025 | Time: 2:00 PM | Duration: 90 minutes",
        className: "text-sm text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "participants-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Participants",
        className: "text-2xl font-semibold text-success mb-3 bg-success/5 p-3 rounded",
        editable: true
      },
      {
        id: "participants",
        type: "bullet-list",
        placeholder: "{{participants}}",
        defaultContent: "Executive Leadership Team\nDepartment Heads\nProject Managers\nKey Stakeholders",
        className: "space-y-2 mb-6 pl-4",
        editable: true
      },
      {
        id: "agenda-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Agenda Items",
        className: "text-2xl font-semibold text-success mb-3 bg-success/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "agenda",
        type: "bullet-list",
        placeholder: "{{agenda}}",
        defaultContent: "Q4 performance review (20 min)\nStrategic initiatives update (20 min)\nBudget discussion for 2026 (20 min)\nRisk assessment (15 min)\nAction items and next steps (15 min)",
        className: "space-y-3 mb-6 pl-4 text-base",
        editable: true
      },
      {
        id: "objectives-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Meeting Objectives",
        className: "text-2xl font-semibold text-success mb-3 bg-success/5 p-3 rounded mt-8",
        editable: true
      },
      {
        id: "objectives",
        type: "body",
        placeholder: "{{objectives}}",
        defaultContent: "Review quarterly results and align on strategic priorities for the upcoming year...",
        className: "text-base leading-relaxed mb-6 text-foreground pl-4 border-l-4 border-success",
        editable: true
      },
      {
        id: "preparation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Pre-Meeting Materials",
        className: "text-2xl font-semibold text-success mb-3 mt-8",
        editable: true
      },
      {
        id: "preparation",
        type: "bullet-list",
        placeholder: "{{preparation}}",
        defaultContent: "Q4 financial reports\nProject status updates\nMarket analysis documents\nDraft 2026 budget proposal",
        className: "space-y-2 mb-6",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "scenario-analysis",
    name: "Strategic Analysis",
    category: "Business",
    description: "Business scenario planning and risk assessment",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Strategic Scenario Analysis",
        className: "text-5xl font-bold text-success mb-3",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Business Planning & Risk Assessment",
        className: "text-2xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "baseline-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Baseline Scenario",
        className: "text-3xl font-bold text-success mb-4",
        editable: true
      },
      {
        id: "baseline",
        type: "body",
        placeholder: "{{baseline}}",
        defaultContent: "Under current market conditions with steady growth trajectory...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-success/10 p-6 rounded-lg border-l-4 border-success",
        editable: true
      },
      {
        id: "baseline-chart",
        type: "image",
        placeholder: "{{baseline_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-r from-success/10 to-success/20 rounded-xl flex items-center justify-center my-8 border border-success/30",
        editable: true
      },
      {
        id: "growth-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Growth Scenario",
        className: "text-3xl font-bold text-chart-2 mb-4 mt-10",
        editable: true
      },
      {
        id: "growth",
        type: "body",
        placeholder: "{{growth}}",
        defaultContent: "With successful market expansion and product launches...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-chart-2/10 p-6 rounded-lg border-l-4 border-chart-2",
        editable: true
      },
      {
        id: "risk-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Risk Scenario",
        className: "text-3xl font-bold text-destructive mb-4 mt-10",
        editable: true
      },
      {
        id: "risk",
        type: "body",
        placeholder: "{{risk}}",
        defaultContent: "In challenging market conditions with increased competition...",
        className: "text-lg leading-relaxed mb-6 text-foreground bg-destructive/10 p-6 rounded-lg border-l-4 border-destructive",
        editable: true
      },
      {
        id: "mitigation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Mitigation Strategies",
        className: "text-3xl font-bold text-success mb-4 mt-10",
        editable: true
      },
      {
        id: "mitigation",
        type: "bullet-list",
        placeholder: "{{mitigation}}",
        defaultContent: "Diversify revenue streams\nBuild strategic partnerships\nMaintain operational flexibility\nInvest in innovation",
        className: "space-y-3 mb-6 text-lg",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "multi-page-report",
    name: "Annual Report",
    category: "Business",
    description: "Comprehensive annual business report",
    sections: [
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Annual Report 2025",
        className: "text-6xl font-bold text-center text-success mb-4 mt-20",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Building Tomorrow's Success Today",
        className: "text-2xl text-center text-muted-foreground mb-20",
        editable: true
      },
      {
        id: "divider-cover",
        type: "divider",
        placeholder: "",
        className: "my-12 border-t-4 border-success/30",
        editable: false
      },
      {
        id: "ceo-message-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "CEO Message",
        className: "text-4xl font-bold text-success mb-6 mt-12",
        editable: true
      },
      {
        id: "ceo-message",
        type: "body",
        placeholder: "{{ceo_message}}",
        defaultContent: "It gives me great pleasure to present our achievements for the year...",
        className: "text-lg leading-relaxed mb-10 text-foreground bg-muted/20 p-6 rounded-lg",
        editable: true
      },
      {
        id: "performance-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Performance",
        className: "text-4xl font-bold text-success mb-6 mt-12",
        editable: true
      },
      {
        id: "performance",
        type: "body",
        placeholder: "{{performance}}",
        defaultContent: "We achieved record financial results with strong growth across all divisions...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "performance-chart",
        type: "image",
        placeholder: "{{performance_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-xl flex items-center justify-center my-10 border-2 border-success/30 shadow-xl",
        editable: true
      },
      {
        id: "operations-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Operations Highlights",
        className: "text-4xl font-bold text-success mb-6 mt-12",
        editable: true
      },
      {
        id: "operations",
        type: "body",
        placeholder: "{{operations}}",
        defaultContent: "Our operational efficiency improved significantly through digital transformation...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      },
      {
        id: "metrics-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Key Metrics",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "metrics",
        type: "bullet-list",
        placeholder: "{{metrics}}",
        defaultContent: "Revenue: £150M (+25% YoY)\nProfit Margin: 18.5%\nEmployee Count: 500\nCustomer Satisfaction: 92%\nMarket Share: 12%",
        className: "space-y-3 mb-10 text-lg font-medium",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "2026 Outlook",
        className: "text-4xl font-bold text-success mb-6 mt-12",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "We enter 2026 with strong momentum and exciting growth opportunities...",
        className: "text-lg leading-relaxed mb-8 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    category: "Business",
    description: "Startup pitch presentation document",
    sections: [
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Company Pitch Deck",
        className: "text-6xl font-bold text-center bg-gradient-to-r from-success via-chart-2 to-chart-3 bg-clip-text text-transparent mb-6 mt-24",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Revolutionizing the Industry",
        className: "text-3xl text-center text-muted-foreground mb-24 font-light",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-16 border-t-4 border-gradient-to-r from-success via-chart-2 to-chart-3",
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
        defaultContent: "Current solutions fail to address critical business challenges...",
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
        defaultContent: "We provide innovative, scalable solutions that transform businesses...",
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
        defaultContent: "£10B total addressable market\n25% annual growth rate\n5M potential customers\nLimited competition in our segment",
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
        defaultContent: "£5M annual recurring revenue\n200+ enterprise customers\n40% quarter-over-quarter growth\n95% customer retention",
        className: "space-y-4 mb-12 text-2xl font-medium",
        editable: true
      },
      {
        id: "ask-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "Investment Ask",
        className: "text-5xl font-bold text-success mb-6 mt-16",
        editable: true
      },
      {
        id: "ask",
        type: "body",
        placeholder: "{{ask}}",
        defaultContent: "Seeking £10M Series A to scale operations and expand market reach...",
        className: "text-2xl leading-relaxed mb-12 text-foreground bg-success/10 p-8 rounded-2xl",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
