import { DocumentTemplate } from "@/types/template";

export const businessTemplates: DocumentTemplate[] = [
  {
    id: "business-plan",
    name: "Business Plan",
    category: "Business",
    description: "Comprehensive business plan with market analysis and financial projections",
    thumbnail: "",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Plan 2025",
        className: "text-4xl font-bold text-primary mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Growth & Market Expansion",
        className: "text-xl text-muted-foreground mb-8",
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
        className: "text-2xl font-semibold text-success mb-4",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "Our business is positioned to capture significant market share...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "market-analysis-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Market Analysis",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "market-analysis",
        type: "body",
        placeholder: "{{market_analysis}}",
        defaultContent: "The target market demonstrates strong growth potential...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "chart-area",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-64 bg-gradient-to-r from-success/10 to-success/20 rounded-lg flex items-center justify-center my-8",
        editable: true
      },
      {
        id: "strategy-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Growth Strategy",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "strategy",
        type: "bullet-list",
        placeholder: "{{strategy}}",
        defaultContent: "Expand into new geographic markets\nDevelop strategic partnerships\nInvest in technology infrastructure\nEnhance customer experience",
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
    id: "proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Professional proposal template for client projects",
    thumbnail: "",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Project Proposal",
        className: "text-4xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Transforming Vision into Reality",
        className: "text-xl text-muted-foreground mb-6",
        editable: true
      },
      {
        id: "client-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Project Overview",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "This proposal outlines our approach to delivering exceptional value...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "scope-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Scope of Work",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "scope",
        type: "bullet-list",
        placeholder: "{{scope}}",
        defaultContent: "Initial consultation and requirements gathering\nDetailed project planning and timeline\nImplementation and quality assurance\nTraining and knowledge transfer\nOngoing support and maintenance",
        className: "space-y-3 mb-6",
        editable: true
      },
      {
        id: "timeline-visual",
        type: "image",
        placeholder: "{{timeline}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-success/5 via-success/10 to-success/5 rounded-lg flex items-center justify-center my-8 border border-success/30",
        editable: true
      },
      {
        id: "investment-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Investment & Timeline",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "investment",
        type: "body",
        placeholder: "{{investment}}",
        defaultContent: "The project is structured to deliver value at each phase...",
        className: "text-base leading-relaxed mb-6 text-foreground",
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
    id: "market-report",
    name: "Market Research Report",
    category: "Business",
    description: "Detailed market research and competitive analysis",
    thumbnail: "",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Market Research Report",
        className: "text-4xl font-bold text-success mb-2",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Industry Analysis & Trends",
        className: "text-xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "methodology-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Research Methodology",
        className: "text-2xl font-semibold text-success mb-4",
        editable: true
      },
      {
        id: "methodology",
        type: "body",
        placeholder: "{{methodology}}",
        defaultContent: "Our research approach combines quantitative and qualitative methods...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      },
      {
        id: "findings-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Findings",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "findings",
        type: "bullet-list",
        placeholder: "{{findings}}",
        defaultContent: "Market size estimated at £4.2B with 12% CAGR\nDigital transformation driving adoption\nEmerging competitors entering the space\nCustomer preferences shifting towards sustainability",
        className: "space-y-2 mb-6",
        editable: true
      },
      {
        id: "data-visualization",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-success/10 rounded-lg flex items-center justify-center my-8 border-2 border-success/20",
        editable: true
      },
      {
        id: "recommendations-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Strategic Recommendations",
        className: "text-2xl font-semibold text-success mb-4 mt-8",
        editable: true
      },
      {
        id: "recommendations",
        type: "body",
        placeholder: "{{recommendations}}",
        defaultContent: "Based on our analysis, we recommend the following strategic initiatives...",
        className: "text-base leading-relaxed mb-6 text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(199 89% 48%)",
      accentColor: "hsl(28 87% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
