import { DocumentTemplate, AIContent } from "@/types/template";

export function renderTemplateToHtml(template: DocumentTemplate, aiContent: AIContent, textColors?: Record<string, string>): string {
  const { styles } = template;
  
  // Detect hero-header sections and group with subsequent z-10 elements
  const sections = template.sections;
  const heroGroups: { heroIndex: number; childIndices: number[] }[] = [];
  const heroChildIndices = new Set<number>();
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.id === 'hero-header' || (section.className?.includes('-mt-8') && section.className?.includes('-mx-8'))) {
      const group = { heroIndex: i, childIndices: [] as number[] };
      let j = i + 1;
      while (j < sections.length && sections[j].className?.includes('z-10')) {
        group.childIndices.push(j);
        heroChildIndices.add(j);
        j++;
      }
      heroGroups.push(group);
    }
  }
  
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
      .hero-wrapper {
        background: linear-gradient(135deg, #1e293b 0%, ${styles.primaryColor} 50%, #1e293b 100%);
        padding: 60px 40px;
        border-radius: 16px 16px 0 0;
        margin-bottom: 40px;
        position: relative;
        overflow: hidden;
      }
      .hero-wrapper::before {
        content: '';
        position: absolute;
        top: -30%;
        right: -15%;
        width: 500px;
        height: 500px;
        background: rgba(255,255,255,0.08);
        border-radius: 50%;
      }
      .hero-wrapper::after {
        content: '';
        position: absolute;
        bottom: -20%;
        left: -10%;
        width: 350px;
        height: 350px;
        background: rgba(255,255,255,0.05);
        border-radius: 50%;
      }
      .hero-wrapper h1,
      .hero-wrapper h2,
      .hero-wrapper .hero-child {
        position: relative;
        z-index: 1;
        color: white;
      }
      .hero-wrapper h1 {
        font-size: 2.5em;
        font-weight: 800;
        margin-bottom: 8px;
        letter-spacing: -0.02em;
      }
      .hero-wrapper h2 {
        font-size: 1.2em;
        font-weight: 300;
        opacity: 0.8;
      }
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
  
  // Render a single section to HTML
  const renderSectionHtml = (section: typeof sections[0], isHeroChild = false) => {
    if (!section.editable && section.type === 'divider') {
      return `<div class="${section.className || ''}" style="height: 1px; background: #e2e8f0; margin: 32px 0;"></div>`;
    }
    
    const content = aiContent[section.id] || section.defaultContent || section.placeholder.replace(/\{\{|\}\}/g, '');
    const className = `${section.className || ''} ${section.editable ? 'editable' : ''} ${isHeroChild ? 'hero-child' : ''}`;
    const color = isHeroChild ? 'white' : (textColors?.[section.id] || (styles.primaryColor || '#1a202c'));
    
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
  };
  
  // Build the HTML by processing sections with hero grouping
  let sectionsHtml = '';
  
  for (let i = 0; i < sections.length; i++) {
    // Skip sections that are hero children (already rendered inside hero wrapper)
    if (heroChildIndices.has(i)) continue;
    
    const heroGroup = heroGroups.find(g => g.heroIndex === i);
    if (heroGroup) {
      // Render hero wrapper with children inside
      sectionsHtml += `<div class="hero-wrapper">`;
      for (const childIdx of heroGroup.childIndices) {
        sectionsHtml += renderSectionHtml(sections[childIdx], true);
      }
      sectionsHtml += `</div>`;
    } else {
      sectionsHtml += renderSectionHtml(sections[i]);
    }
  }
  
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
  const sectionElements = doc.querySelectorAll('[data-section-id]');
  sectionElements.forEach(section => {
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
