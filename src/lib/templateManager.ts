export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  htmlPath: string;
}

export const templates: Template[] = [
  {
    id: "cross-border-ma",
    name: "Cross-Border M&A Tracker",
    description: "Professional M&A transaction tracking template with charts and data tables",
    category: "Investment Analysis",
    thumbnailUrl: "/templates/cross-border-ma-tracker.html",
    htmlPath: "/templates/cross-border-ma-tracker.html"
  },
  {
    id: "financial-report",
    name: "Financial Report",
    description: "Clean, minimalist financial reporting template with key metrics",
    category: "Reports",
    thumbnailUrl: "/templates/financial-report.html",
    htmlPath: "/templates/financial-report.html"
  },
  {
    id: "sector-flows",
    name: "Sector Capital Flows",
    description: "CleanTech, BioTech and FinTech sector analysis template",
    category: "Market Analysis",
    thumbnailUrl: "/templates/sector-capital-flows.html",
    htmlPath: "/templates/sector-capital-flows.html"
  }
];

export const loadTemplate = async (templateId: string): Promise<string> => {
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error("Template not found");
  
  const response = await fetch(template.htmlPath);
  if (!response.ok) throw new Error("Failed to load template");
  
  return await response.text();
};

export const extractTextContent = (html: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textNodes: string[] = [];
  
  // Extract text from all elements
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (text && text.length > 0) {
      textNodes.push(text);
    }
  }
  
  return textNodes;
};

export const replaceTemplateContent = (
  html: string,
  replacements: Record<string, string>
): string => {
  let modifiedHtml = html;
  
  Object.entries(replacements).forEach(([key, value]) => {
    // Replace placeholder text with AI-generated content
    const regex = new RegExp(key, 'gi');
    modifiedHtml = modifiedHtml.replace(regex, value);
  });
  
  return modifiedHtml;
};