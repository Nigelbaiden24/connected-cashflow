import jsPDF from 'jspdf';

export interface DocumentContent {
  title: string;
  content: string;
  type?: 'report' | 'presentation' | 'letter' | 'proposal' | 'analysis' | 'general';
  sections?: { heading: string; content: string }[];
  tableData?: { headers: string[]; rows: string[][] };
}

// Generate PDF document
export const generatePDF = (doc: DocumentContent): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = 30;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.title, margin, yPosition);
  yPosition += 15;

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;
  pdf.setTextColor(0);

  // Divider
  pdf.setDrawColor(200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Content
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const lines = pdf.splitTextToSize(doc.content, maxWidth);
  
  for (const line of lines) {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  }

  // Sections if provided
  if (doc.sections) {
    for (const section of doc.sections) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.heading, margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const sectionLines = pdf.splitTextToSize(section.content, maxWidth);
      
      for (const line of sectionLines) {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      }
    }
  }

  // Table if provided
  if (doc.tableData && doc.tableData.headers.length > 0) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }
    
    yPosition += 10;
    const colWidth = maxWidth / doc.tableData.headers.length;
    
    // Headers
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 5, maxWidth, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    doc.tableData.headers.forEach((header, i) => {
      pdf.text(header.substring(0, 15), margin + i * colWidth + 2, yPosition);
    });
    yPosition += 10;
    
    // Rows
    pdf.setFont('helvetica', 'normal');
    for (const row of doc.tableData.rows) {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      row.forEach((cell, i) => {
        pdf.text(String(cell).substring(0, 15), margin + i * colWidth + 2, yPosition);
      });
      yPosition += 7;
    }
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `FlowPulse Elite Document AI - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  pdf.save(`${doc.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

// Generate DOCX-like document (as rich text HTML that can be opened in Word)
export const generateDOCX = (doc: DocumentContent): void => {
  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset="utf-8">
      <title>${doc.title}</title>
      <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; margin: 40px; }
        h1 { font-size: 24pt; color: #1a1a1a; margin-bottom: 10px; }
        h2 { font-size: 16pt; color: #333; margin-top: 20px; }
        p { margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .date { color: #666; font-size: 10pt; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 9pt; color: #999; }
      </style>
    </head>
    <body>
      <h1>${doc.title}</h1>
      <p class="date">Generated: ${new Date().toLocaleDateString()}</p>
      <hr>
      ${doc.content.split('\n').map(p => `<p>${p}</p>`).join('')}
  `;

  if (doc.sections) {
    for (const section of doc.sections) {
      html += `<h2>${section.heading}</h2>`;
      html += section.content.split('\n').map(p => `<p>${p}</p>`).join('');
    }
  }

  if (doc.tableData && doc.tableData.headers.length > 0) {
    html += '<table>';
    html += '<tr>' + doc.tableData.headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    for (const row of doc.tableData.rows) {
      html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    }
    html += '</table>';
  }

  html += `
      <div class="footer">Generated by FlowPulse Elite Document AI</div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

// Generate Excel-compatible CSV
export const generateExcel = (doc: DocumentContent): void => {
  let csv = '';
  
  // Add title row
  csv += `"${doc.title}"\n`;
  csv += `"Generated: ${new Date().toLocaleDateString()}"\n\n`;

  if (doc.tableData && doc.tableData.headers.length > 0) {
    // Headers
    csv += doc.tableData.headers.map(h => `"${h}"`).join(',') + '\n';
    // Rows
    for (const row of doc.tableData.rows) {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    }
  } else {
    // Parse content for table-like data
    const lines = doc.content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.includes('|') || line.includes('\t')) {
        const cells = line.split(/[|\t]/).map(c => c.trim()).filter(c => c);
        csv += cells.map(c => `"${c.replace(/"/g, '""')}"`).join(',') + '\n';
      } else {
        csv += `"${line.replace(/"/g, '""')}"\n`;
      }
    }
  }

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Generate PowerPoint-like presentation (HTML that can be converted)
export const generatePowerPoint = (doc: DocumentContent): void => {
  const slides: string[] = [];
  
  // Title slide
  slides.push(`
    <div class="slide">
      <h1>${doc.title}</h1>
      <p class="subtitle">Generated by FlowPulse Elite Document AI</p>
      <p class="date">${new Date().toLocaleDateString()}</p>
    </div>
  `);

  // Content slides
  if (doc.sections && doc.sections.length > 0) {
    for (const section of doc.sections) {
      const bullets = section.content.split('\n').filter(l => l.trim());
      slides.push(`
        <div class="slide">
          <h2>${section.heading}</h2>
          <ul>
            ${bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `);
    }
  } else {
    // Split content into slides
    const paragraphs = doc.content.split('\n\n').filter(p => p.trim());
    for (let i = 0; i < paragraphs.length; i++) {
      const bullets = paragraphs[i].split('\n').filter(l => l.trim());
      slides.push(`
        <div class="slide">
          <h2>Slide ${i + 2}</h2>
          <ul>
            ${bullets.slice(0, 6).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `);
    }
  }

  const html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>${doc.title} - Presentation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
        .slide { 
          background: white; 
          width: 800px; 
          height: 600px; 
          margin: 20px auto; 
          padding: 40px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          page-break-after: always;
          box-sizing: border-box;
        }
        h1 { font-size: 36pt; color: #1a1a1a; text-align: center; margin-top: 150px; }
        h2 { font-size: 28pt; color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        .subtitle { text-align: center; font-size: 18pt; color: #666; }
        .date { text-align: center; color: #999; }
        ul { font-size: 18pt; line-height: 2; }
        li { margin: 10px 0; }
        @media print { .slide { box-shadow: none; margin: 0; } }
      </style>
    </head>
    <body>
      ${slides.join('')}
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}_presentation.html`;
  a.click();
  URL.revokeObjectURL(url);
};

// Generate plain text
export const generateTXT = (doc: DocumentContent): void => {
  let text = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  text += `${'-'.repeat(50)}\n\n`;
  text += doc.content + '\n\n';

  if (doc.sections) {
    for (const section of doc.sections) {
      text += `\n${section.heading}\n${'-'.repeat(section.heading.length)}\n`;
      text += section.content + '\n';
    }
  }

  if (doc.tableData && doc.tableData.headers.length > 0) {
    text += '\n' + doc.tableData.headers.join('\t') + '\n';
    text += '-'.repeat(50) + '\n';
    for (const row of doc.tableData.rows) {
      text += row.join('\t') + '\n';
    }
  }

  text += `\n\n---\nGenerated by FlowPulse Elite Document AI`;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// Generate Markdown
export const generateMarkdown = (doc: DocumentContent): void => {
  let md = `# ${doc.title}\n\n`;
  md += `> Generated: ${new Date().toLocaleDateString()}\n\n`;
  md += `---\n\n`;
  md += doc.content + '\n\n';

  if (doc.sections) {
    for (const section of doc.sections) {
      md += `## ${section.heading}\n\n`;
      md += section.content + '\n\n';
    }
  }

  if (doc.tableData && doc.tableData.headers.length > 0) {
    md += '\n| ' + doc.tableData.headers.join(' | ') + ' |\n';
    md += '| ' + doc.tableData.headers.map(() => '---').join(' | ') + ' |\n';
    for (const row of doc.tableData.rows) {
      md += '| ' + row.join(' | ') + ' |\n';
    }
  }

  md += `\n\n---\n*Generated by FlowPulse Elite Document AI*`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

// Parse AI response for document content
export const parseDocumentFromResponse = (response: string): DocumentContent | null => {
  // Try to extract structured content from AI response
  const titleMatch = response.match(/(?:^|\n)#\s*(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'Generated Document';

  // Extract sections
  const sectionRegex = /(?:^|\n)##\s*(.+?)(?:\n)([\s\S]*?)(?=\n##|\n#|$)/g;
  const sections: { heading: string; content: string }[] = [];
  let match;
  
  while ((match = sectionRegex.exec(response)) !== null) {
    sections.push({
      heading: match[1].trim(),
      content: match[2].trim()
    });
  }

  // Extract table data if present
  const tableMatch = response.match(/\|(.+)\|[\s\S]*?\|[-\s|]+\|([\s\S]*?)(?=\n\n|\n[^|]|$)/);
  let tableData: { headers: string[]; rows: string[][] } | undefined;
  
  if (tableMatch) {
    const headers = tableMatch[1].split('|').map(h => h.trim()).filter(h => h);
    const rowsText = tableMatch[2];
    const rows = rowsText.split('\n')
      .filter(r => r.includes('|'))
      .map(r => r.split('|').map(c => c.trim()).filter(c => c));
    
    if (headers.length > 0 && rows.length > 0) {
      tableData = { headers, rows };
    }
  }

  // Clean content (remove markdown formatting for plain text)
  let content = response
    .replace(/^#.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .trim();

  return {
    title,
    content,
    sections: sections.length > 0 ? sections : undefined,
    tableData
  };
};

// Detect document generation intent from user message
export const detectDocumentIntent = (message: string): { 
  wantsDocument: boolean; 
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'txt' | 'md' | null;
  documentType: string | null;
} => {
  const lower = message.toLowerCase();
  
  const wantsDocument = 
    lower.includes('generate') ||
    lower.includes('create') ||
    lower.includes('make') ||
    lower.includes('produce') ||
    lower.includes('download') ||
    lower.includes('export') ||
    lower.includes('build me') ||
    lower.includes('write me') ||
    lower.includes('draft');

  const documentKeywords = [
    'report', 'document', 'presentation', 'spreadsheet', 'letter',
    'proposal', 'analysis', 'summary', 'plan', 'contract', 'policy',
    'checklist', 'email', 'cv', 'resume', 'whitepaper', 'ebook',
    'newsletter', 'pitch deck', 'infographic', 'table', 'chart'
  ];

  const hasDocumentKeyword = documentKeywords.some(k => lower.includes(k));

  // Detect format
  let format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'txt' | 'md' | null = null;
  
  if (lower.includes('pdf')) format = 'pdf';
  else if (lower.includes('word') || lower.includes('docx') || lower.includes('doc')) format = 'docx';
  else if (lower.includes('excel') || lower.includes('xlsx') || lower.includes('spreadsheet')) format = 'xlsx';
  else if (lower.includes('powerpoint') || lower.includes('pptx') || lower.includes('presentation') || lower.includes('slides')) format = 'pptx';
  else if (lower.includes('csv')) format = 'csv';
  else if (lower.includes('text') || lower.includes('txt')) format = 'txt';
  else if (lower.includes('markdown') || lower.includes('md')) format = 'md';
  else if (wantsDocument && hasDocumentKeyword) format = 'pdf'; // Default to PDF

  // Detect document type
  let documentType: string | null = null;
  for (const keyword of documentKeywords) {
    if (lower.includes(keyword)) {
      documentType = keyword;
      break;
    }
  }

  return {
    wantsDocument: wantsDocument && hasDocumentKeyword,
    format,
    documentType
  };
};

// Main export function
export const exportDocument = (doc: DocumentContent, format: string): void => {
  switch (format.toLowerCase()) {
    case 'pdf':
      generatePDF(doc);
      break;
    case 'docx':
    case 'doc':
    case 'word':
      generateDOCX(doc);
      break;
    case 'xlsx':
    case 'excel':
    case 'csv':
      generateExcel(doc);
      break;
    case 'pptx':
    case 'powerpoint':
    case 'presentation':
      generatePowerPoint(doc);
      break;
    case 'txt':
    case 'text':
      generateTXT(doc);
      break;
    case 'md':
    case 'markdown':
      generateMarkdown(doc);
      break;
    default:
      generatePDF(doc);
  }
};
