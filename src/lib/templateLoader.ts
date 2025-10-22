import { DocumentTemplate, AIContent } from "@/types/template";

export interface TemplateMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  htmlFile: string;
  placeholders: string[];
  thumbnail?: string;
}

export const templateMetadata: Record<string, TemplateMetadata> = {
  "financial-plan": {
    id: "financial-plan",
    name: "Financial Plan",
    category: "Finance",
    description: "Comprehensive financial planning document",
    htmlFile: "/templates/financial-plan-template.html",
    thumbnail: "/thumbnails/financial-plan-thumb.png",
    placeholders: [
      "title", "subtitle", "executive_summary", 
      "metric1_value", "metric1_label", "metric2_value", "metric2_label", "metric3_value", "metric3_label",
      "goals_description", "investment_strategy", "risk_management", "action_plan", "footer_text"
    ]
  },
  "business-proposal": {
    id: "business-proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Professional business proposal template",
    htmlFile: "/templates/business-proposal-template.html",
    thumbnail: "/thumbnails/business-proposal-thumb.png",
    placeholders: [
      "title", "tagline", "executive_overview",
      "benefit1_title", "benefit1_text", "benefit2_title", "benefit2_text",
      "benefit3_title", "benefit3_text", "benefit4_title", "benefit4_text",
      "phase1_title", "phase1_content", "phase2_title", "phase2_content", "phase3_title", "phase3_content",
      "financial_overview", "footer_text"
    ]
  },
  "business-plan": {
    id: "business-plan",
    name: "Business Plan",
    category: "Business",
    description: "Comprehensive business plan document",
    htmlFile: "/templates/business-plan-template.html",
    thumbnail: "/thumbnails/business-plan-thumb.png",
    placeholders: [
      "title", "tagline", "company_info", "executive_summary", "company_description",
      "target_market", "market_opportunity", "products_services",
      "year1_revenue", "year3_revenue", "target_profit", "financial_details", "implementation_strategy"
    ]
  },
  "client-letter": {
    id: "client-letter",
    name: "Client Letter",
    category: "Finance",
    description: "Professional client communication letter",
    htmlFile: "/templates/client-letter-template.html",
    thumbnail: "/thumbnails/client-letter-thumb.png",
    placeholders: [
      "company_name", "company_address", "company_contact", "date",
      "recipient_name", "recipient_company", "recipient_address",
      "salutation", "paragraph1", "paragraph2", "paragraph3", "paragraph4",
      "closing", "signer_name", "signer_title"
    ]
  },
  "portfolio-summary": {
    id: "portfolio-summary",
    name: "Portfolio Summary",
    category: "Finance",
    description: "Investment portfolio summary report",
    htmlFile: "/templates/portfolio-summary-template.html",
    thumbnail: "/thumbnails/portfolio-summary-thumb.png",
    placeholders: [
      "title", "date", "total_value", "ytd_return", "asset_count", "risk_score",
      "portfolio_overview", "top_holdings", "performance_analysis", "recommendations"
    ]
  },
  // Fallback for other templates - they'll use the financial-plan template for now
  "proposal": {
    id: "proposal",
    name: "Proposal",
    category: "Finance",
    description: "General proposal document",
    htmlFile: "/templates/business-proposal-template.html",
    thumbnail: "/thumbnails/proposal-thumb.png",
    placeholders: [
      "title", "tagline", "executive_overview",
      "benefit1_title", "benefit1_text", "benefit2_title", "benefit2_text",
      "benefit3_title", "benefit3_text", "benefit4_title", "benefit4_text",
      "phase1_title", "phase1_content", "phase2_title", "phase2_content", "phase3_title", "phase3_content",
      "financial_overview", "footer_text"
    ]
  }
};

export async function loadTemplate(templateId: string): Promise<string> {
  const metadata = templateMetadata[templateId];
  if (!metadata) {
    throw new Error(`Template ${templateId} not found`);
  }

  try {
    const response = await fetch(metadata.htmlFile);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

export function fillTemplate(templateHtml: string, content: AIContent): string {
  let filledHtml = templateHtml;
  
  // Replace all placeholders with actual content
  Object.entries(content).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    filledHtml = filledHtml.replace(regex, value || '');
  });
  
  // Replace any remaining placeholders with empty string
  filledHtml = filledHtml.replace(/\{\{[^}]+\}\}/g, '');
  
  return filledHtml;
}

export function extractContentFromTemplate(filledHtml: string, templateId: string): AIContent {
  const metadata = templateMetadata[templateId];
  if (!metadata) {
    return {};
  }

  const content: AIContent = {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(filledHtml, 'text/html');

  // Extract content from the filled HTML
  metadata.placeholders.forEach(placeholder => {
    // This is a simplified extraction - in production, you'd need more sophisticated parsing
    const regex = new RegExp(`<[^>]*>([^<]*)<\\/[^>]*>`, 'g');
    const matches = filledHtml.match(regex);
    if (matches) {
      // Store extracted content
      content[placeholder] = ''; // Placeholder for actual extraction logic
    }
  });

  return content;
}
