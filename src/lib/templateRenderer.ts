import { DocumentTemplate, AIContent } from "@/types/template";

export function renderTemplateToHtml(template: DocumentTemplate, aiContent: AIContent, textColors?: Record<string, string>): string {
  const { styles } = template;
  
  // Create header with gradient for business proposal
  const isBusinessProposal = template.id === 'proposal';
  const headerSection = isBusinessProposal ? template.sections.slice(0, 2) : [];
  const contentSections = isBusinessProposal ? template.sections.slice(2) : template.sections;
  
  // Generate CSS from template styles
  const css = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        line-height: 1.6;
        color: #1a202c;
      }
      .template-container {
        max-width: 1200px;
        margin: 0 auto;
        background: ${styles.backgroundColor};
      }
      ${isBusinessProposal ? `
      .proposal-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
        padding: 60px 40px;
        border-radius: 16px;
        margin-bottom: 40px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(30, 64, 175, 0.3);
      }
      .proposal-header::before {
        content: '';
        position: absolute;
        top: -30%;
        right: -15%;
        width: 500px;
        height: 500px;
        background: rgba(255,255,255,0.08);
        border-radius: 50%;
      }
      .proposal-header::after {
        content: '';
        position: absolute;
        bottom: -20%;
        left: -10%;
        width: 350px;
        height: 350px;
        background: rgba(255,255,255,0.05);
        border-radius: 50%;
      }
      .proposal-header h1,
      .proposal-header h2 {
        position: relative;
        z-index: 1;
        color: white;
      }
      ` : ''}
      .content-wrapper {
        padding: 40px;
      }
      .section {
        margin-bottom: 32px;
      }
      h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
        margin-bottom: 16px;
        color: ${styles.primaryColor};
      }
      p {
        margin-bottom: 16px;
        line-height: 1.8;
      }
      ul, ol {
        margin-left: 24px;
        margin-bottom: 16px;
      }
      li {
        margin-bottom: 12px;
        line-height: 1.6;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
      .editable {
        position: relative;
        min-height: 20px;
      }
      .editable:empty:before {
        content: attr(data-placeholder);
        color: #a0aec0;
        font-style: italic;
      }
    </style>
  `;
  
  // Render header for business proposal
  const headerHtml = isBusinessProposal ? `
    <div class="proposal-header">
      ${headerSection.map(section => {
        const content = aiContent[section.id] || section.defaultContent || '';
        const tag = section.type === 'heading' ? 'h1' : 'h2';
        return `<${tag} class="${section.className || ''}" data-section-id="${section.id}">${content}</${tag}>`;
      }).join('\n')}
    </div>
  ` : '';
  
  // Render content sections
  const sectionsHtml = contentSections.map(section => {
    if (!section.editable && section.type === 'divider') {
      return `<div class="${section.className || ''}" style="height: 1px; background: #e2e8f0; margin: 32px 0;"></div>`;
    }
    
    const content = aiContent[section.id] || section.defaultContent || section.placeholder.replace(/\{\{|\}\}/g, '');
    const className = `${section.className || ''} ${section.editable ? 'editable' : ''}`;
    const color = textColors?.[section.id] || (styles.primaryColor || '#1a202c');
    
    switch (section.type) {
      case 'heading':
        return `<h1 class="${className}" data-section-id="${section.id}" style="color: ${color}">${content}</h1>`;
      
      case 'subheading':
        return `<h2 class="${className}" data-section-id="${section.id}" style="color: ${color}">${content}</h2>`;
      
      case 'body':
        return `<div class="section ${className}" data-section-id="${section.id}" style="color: ${color}"><p>${content.replace(/\n/g, '</p><p>')}</p></div>`;
      
      case 'bullet-list':
        const items = content.split('\n').filter(item => item.trim());
        return `<div class="section ${className}" data-section-id="${section.id}" style="color: ${color}"><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
      
      case 'image':
        if (content && content.startsWith('http')) {
          return `<div class="section ${className}" data-section-id="${section.id}"><img src="${content}" alt="${section.id}" /></div>`;
        }
        return `<div class="section ${className}" data-section-id="${section.id}" style="min-height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%); border-radius: 12px; border: 2px dashed #cbd5e1;">
          <p style="color: #64748b; font-size: 14px;">📷 Image Placeholder - Drag and drop an image here</p>
        </div>`;
      
      case 'divider':
        return `<hr class="${className}" style="border: none; border-top: 2px solid ${styles.primaryColor}; margin: 40px 0; opacity: 0.2;" />`;
      
      default:
        return `<div class="section ${className}" data-section-id="${section.id}" style="color: ${color}">${content}</div>`;
    }
  }).join('\n');
  
  // Combine everything
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.name}</title>
      ${css}
    </head>
    <body>
      <div class="template-container">
        ${headerHtml}
        <div class="content-wrapper">
          ${sectionsHtml}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function extractContentFromHtml(html: string): AIContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const content: AIContent = {};
  
  // Find all elements with data-section-id attribute
  const sections = doc.querySelectorAll('[data-section-id]');
  sections.forEach(section => {
    const id = section.getAttribute('data-section-id');
    if (id) {
      // Extract text content, preserving structure
      if (section.tagName === 'UL' || section.tagName === 'OL') {
        const items = Array.from(section.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
        content[id] = items.join('\n');
      } else if (section.tagName === 'IMG') {
        content[id] = (section as HTMLImageElement).src;
      } else {
        content[id] = section.textContent?.trim() || '';
      }
    }
  });
  
  return content;
}
