import { DocumentTemplate } from "@/types/template";

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "financial-report",
    name: "Financial Report",
    category: "Finance",
    description: "Professional financial report with executive summary and key findings",
    thumbnail: "/thumbnails/financial-report-thumb.png",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Financial Report",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Q4 2024 Analysis",
        className: "text-xl text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-8 border-t-2 border-primary/20",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-2xl font-semibold text-primary mb-4",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "This report provides a comprehensive overview of financial performance...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "key-findings-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Findings",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "key-findings",
        type: "bullet-list",
        placeholder: "{{key_findings}}",
        defaultContent: "Revenue increased by 15%\nOperating margin improved to 25%\nStrong cash flow generation\nSuccessful market expansion",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "image-placeholder",
        type: "image",
        placeholder: "{{image1}}",
        defaultContent: "",
        className: "w-full h-64 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center my-8",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Recommendations",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "recommendations",
        type: "body",
        placeholder: "{{recommendations}}",
        defaultContent: "Based on the analysis, we recommend the following strategic actions...",
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
    id: "sector-flows",
    name: "Sector Capital Flows",
    category: "Finance",
    description: "Analysis of capital flows across market sectors",
    thumbnail: "/thumbnails/sector-flows-thumb.png",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Sector Capital Flows Analysis",
        className: "text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Market Trends & Investment Patterns",
        className: "text-xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "market-overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Market Overview",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "market-overview",
        type: "body",
        placeholder: "{{market_overview}}",
        defaultContent: "Current market conditions show significant capital movement across sectors...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "chart-placeholder",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-lg flex items-center justify-center my-8 border-2 border-primary/20",
        editable: true
      },
      {
        id: "sector-analysis-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Sector Analysis",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "sector-analysis",
        type: "bullet-list",
        placeholder: "{{sector_analysis}}",
        defaultContent: "Technology sector leads with 32% inflows\nHealthcare shows resilient 18% growth\nEnergy sector experiencing rotation\nFinancials remain stable with moderate flows",
        className: "space-y-3 mb-6",
        editable: true
      },
      {
        id: "conclusion-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment Outlook",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Looking ahead, we anticipate continued sector rotation driven by macro trends...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(199 89% 48%)",
      secondaryColor: "hsl(195 100% 50%)",
      accentColor: "hsl(285 85% 65%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "cross-border-ma",
    name: "Cross-Border M&A Tracker",
    category: "Finance",
    description: "Track and analyze international M&A transactions",
    thumbnail: "/thumbnails/cross-border-ma-thumb.png",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Cross-Border M&A Tracker",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "International Transaction Analysis",
        className: "text-xl text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "decorative-divider",
        type: "divider",
        placeholder: "",
        className: "my-8 border-t-4 border-gradient-to-r from-primary via-secondary to-accent",
        editable: false
      },
      {
        id: "deal-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Deal Summary",
        className: "text-2xl font-semibold text-primary mb-4",
        editable: true
      },
      {
        id: "deal-summary",
        type: "body",
        placeholder: "{{deal_summary}}",
        defaultContent: "Overview of recent cross-border M&A activity and key transaction highlights...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "transaction-details-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Transaction Details",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "transaction-details",
        type: "bullet-list",
        placeholder: "{{transaction_details}}",
        defaultContent: "Total deal value: $2.4B\nAcquirer: Global Tech Corp (US)\nTarget: Innovation Labs (EU)\nTransaction type: Strategic acquisition\nExpected completion: Q2 2025",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "data-visualization",
        type: "image",
        placeholder: "{{visualization}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-lg flex items-center justify-center my-8 border border-primary/30",
        editable: true
      },
      {
        id: "market-impact-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Market Impact & Analysis",
        className: "text-2xl font-semibold text-primary mb-4 mt-8",
        editable: true
      },
      {
        id: "market-impact",
        type: "body",
        placeholder: "{{market_impact}}",
        defaultContent: "This transaction represents a significant shift in the global market landscape...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(340 82% 52%)",
      accentColor: "hsl(28 87% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
