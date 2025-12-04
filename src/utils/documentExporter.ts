import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';

export interface ExportContent {
  title: string;
  content: string;
  sections?: {
    heading: string;
    content: string;
    type?: 'paragraph' | 'bullets' | 'numbered' | 'table';
    tableData?: string[][];
  }[];
  generatedBy?: string;
  date?: Date;
}

// Parse markdown-like content into structured sections
export const parseContentToSections = (content: string): ExportContent['sections'] => {
  const sections: ExportContent['sections'] = [];
  const lines = content.split('\n');
  let currentSection: { heading: string; content: string; type?: 'paragraph' | 'bullets' | 'numbered' | 'table'; tableData?: string[][] } | null = null;
  let inTable = false;
  let tableData: string[][] = [];

  for (const line of lines) {
    // Check for headings (## or ###)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentSection) {
        if (tableData.length > 0) {
          currentSection.tableData = tableData;
          currentSection.type = 'table';
          tableData = [];
        }
        sections.push(currentSection);
      }
      currentSection = { heading: line.replace(/^#+\s*/, ''), content: '', type: 'paragraph' };
      inTable = false;
    }
    // Check for table (lines starting with |)
    else if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(c => c.trim() && !c.match(/^-+$/));
      if (cells.length > 0 && !line.includes('---')) {
        tableData.push(cells.map(c => c.trim()));
      }
    }
    // Check for bullet points
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (currentSection) {
        currentSection.type = 'bullets';
        currentSection.content += line + '\n';
      }
    }
    // Check for numbered lists
    else if (/^\d+\.\s/.test(line.trim())) {
      if (currentSection) {
        currentSection.type = 'numbered';
        currentSection.content += line + '\n';
      }
    }
    // Regular content
    else if (line.trim()) {
      if (inTable && tableData.length > 0) {
        if (currentSection) {
          currentSection.tableData = tableData;
          currentSection.type = 'table';
        }
        tableData = [];
        inTable = false;
      }
      if (currentSection) {
        currentSection.content += line + '\n';
      } else {
        currentSection = { heading: '', content: line + '\n', type: 'paragraph' };
      }
    }
  }

  if (currentSection) {
    if (tableData.length > 0) {
      currentSection.tableData = tableData;
      currentSection.type = 'table';
    }
    sections.push(currentSection);
  }

  return sections;
};

// Export to PDF
export const exportToPDF = (data: ExportContent): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Front page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Company branding
  doc.setTextColor(135, 206, 250);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  const companyName = 'FlowPulse.io';
  doc.text(companyName, (pageWidth - doc.getTextWidth(companyName)) / 2, 80);

  doc.setTextColor(70, 130, 180);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const tagline = 'Elite Document AI';
  doc.text(tagline, (pageWidth - doc.getTextWidth(tagline)) / 2, 95);

  doc.setDrawColor(135, 206, 250);
  doc.setLineWidth(2);
  doc.line(margin, 110, pageWidth - margin, 110);

  // Title
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.title, pageWidth - (margin * 4));
  let titleY = 140;
  titleLines.forEach((line: string) => {
    doc.text(line, (pageWidth - doc.getTextWidth(line)) / 2, titleY);
    titleY += 12;
  });

  // Date
  doc.setTextColor(70, 130, 180);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const dateStr = (data.date || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(dateStr, (pageWidth - doc.getTextWidth(dateStr)) / 2, pageHeight - 40);

  if (data.generatedBy) {
    const byText = `Prepared by: ${data.generatedBy}`;
    doc.text(byText, (pageWidth - doc.getTextWidth(byText)) / 2, pageHeight - 25);
  }

  // Content pages
  doc.addPage();
  let yPosition = 40;
  const lineHeight = 7;

  const addHeader = () => {
    doc.setFillColor(135, 206, 250);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FlowPulse.io', margin, 16);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - margin - 20, 16);
    yPosition = 40;
  };

  addHeader();

  const sections = data.sections || parseContentToSections(data.content);

  sections?.forEach((section) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      addHeader();
    }

    // Section heading
    if (section.heading) {
      doc.setTextColor(70, 130, 180);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(section.heading, margin, yPosition);
      yPosition += 12;
    }

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Content based on type
    if (section.type === 'table' && section.tableData) {
      const colWidth = contentWidth / (section.tableData[0]?.length || 1);
      section.tableData.forEach((row, rowIndex) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          addHeader();
        }
        row.forEach((cell, colIndex) => {
          const x = margin + (colIndex * colWidth);
          if (rowIndex === 0) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          doc.text(cell.substring(0, 30), x, yPosition);
        });
        yPosition += lineHeight;
      });
      yPosition += 8;
    } else {
      const lines = doc.splitTextToSize(section.content.trim(), contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          addHeader();
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 8;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by FlowPulse Elite Document AI', margin, pageHeight - 10);

  const filename = `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};

// Export to DOCX
export const exportToDocx = async (data: ExportContent): Promise<void> => {
  const sections = data.sections || parseContentToSections(data.content);
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.title, bold: true, size: 48 })],
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  // Subtitle with date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${(data.date || new Date()).toLocaleDateString('en-GB')}`,
          size: 24,
          italics: true,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  if (data.generatedBy) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Prepared by: ${data.generatedBy}`, size: 24 })],
        spacing: { after: 600 },
      })
    );
  }

  // Content sections
  sections?.forEach((section) => {
    if (section.heading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: section.heading, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );
    }

    if (section.type === 'table' && section.tableData) {
      const tableRows = section.tableData.map((row, rowIndex) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cell, bold: rowIndex === 0 })] })],
                width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
              })
          ),
        })
      );

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    } else if (section.type === 'bullets') {
      const bulletItems = section.content.split('\n').filter(l => l.trim());
      bulletItems.forEach((item) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.replace(/^[-*]\s*/, ''), size: 24 })],
            bullet: { level: 0 },
          })
        );
      });
    } else if (section.type === 'numbered') {
      const numberedItems = section.content.split('\n').filter(l => l.trim());
      numberedItems.forEach((item) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item.replace(/^\d+\.\s*/, ''), size: 24 })],
            numbering: { reference: 'default-numbering', level: 0 },
          })
        );
      });
    } else {
      const paragraphs = section.content.split('\n').filter(p => p.trim());
      paragraphs.forEach((para) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: 24 })],
            spacing: { after: 200 },
          })
        );
      });
    }
  });

  const doc = new Document({
    sections: [{ children }],
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: 'start',
            },
          ],
        },
      ],
    },
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.docx`);
};

// Export to XLSX
export const exportToXlsx = (data: ExportContent): void => {
  const sections = data.sections || parseContentToSections(data.content);
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['FlowPulse Elite Document AI'],
    [''],
    ['Title', data.title],
    ['Generated', (data.date || new Date()).toLocaleDateString('en-GB')],
    ['Prepared By', data.generatedBy || 'FlowPulse AI'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Content sheet
  const contentRows: string[][] = [['Section', 'Content']];
  sections?.forEach((section) => {
    if (section.type === 'table' && section.tableData) {
      section.tableData.forEach((row) => {
        contentRows.push([section.heading || '', row.join(' | ')]);
      });
    } else {
      contentRows.push([section.heading || '', section.content.trim()]);
    }
  });
  const contentSheet = XLSX.utils.aoa_to_sheet(contentRows);
  XLSX.utils.book_append_sheet(workbook, contentSheet, 'Content');

  // Tables sheet if there are tables
  const tablesWithData = sections?.filter(s => s.type === 'table' && s.tableData);
  if (tablesWithData && tablesWithData.length > 0) {
    tablesWithData.forEach((section, idx) => {
      if (section.tableData) {
        const tableSheet = XLSX.utils.aoa_to_sheet(section.tableData);
        XLSX.utils.book_append_sheet(workbook, tableSheet, `Table_${idx + 1}`);
      }
    });
  }

  XLSX.writeFile(workbook, `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
};

// Export to CSV
export const exportToCsv = (data: ExportContent): void => {
  const sections = data.sections || parseContentToSections(data.content);
  const rows: string[][] = [['Section', 'Type', 'Content']];

  sections?.forEach((section) => {
    rows.push([section.heading || '', section.type || 'paragraph', section.content.trim().replace(/\n/g, ' ')]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.csv`);
};

// Export to PPTX
export const exportToPptx = async (data: ExportContent): Promise<void> => {
  const pptx = new PptxGenJS();
  pptx.author = 'FlowPulse Elite Document AI';
  pptx.title = data.title;
  pptx.subject = 'AI Generated Document';

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText('FlowPulse.io', {
    x: 0.5,
    y: 0.5,
    w: '90%',
    fontSize: 36,
    bold: true,
    color: '87CEFA',
  });
  titleSlide.addText(data.title, {
    x: 0.5,
    y: 2,
    w: '90%',
    fontSize: 28,
    bold: true,
    color: '333333',
  });
  titleSlide.addText(`Generated: ${(data.date || new Date()).toLocaleDateString('en-GB')}`, {
    x: 0.5,
    y: 4,
    w: '90%',
    fontSize: 14,
    color: '666666',
  });
  if (data.generatedBy) {
    titleSlide.addText(`Prepared by: ${data.generatedBy}`, {
      x: 0.5,
      y: 4.5,
      w: '90%',
      fontSize: 14,
      color: '666666',
    });
  }

  const sections = data.sections || parseContentToSections(data.content);

  // Content slides
  sections?.forEach((section) => {
    const slide = pptx.addSlide();

    // Section heading
    if (section.heading) {
      slide.addText(section.heading, {
        x: 0.5,
        y: 0.3,
        w: '90%',
        fontSize: 24,
        bold: true,
        color: '4682B4',
      });
    }

    // Content
    if (section.type === 'table' && section.tableData) {
      slide.addTable(section.tableData as any, {
        x: 0.5,
        y: 1.2,
        w: 9,
        fontSize: 12,
        border: { pt: 1, color: 'CCCCCC' },
      });
    } else if (section.type === 'bullets' || section.type === 'numbered') {
      const items = section.content.split('\n').filter(l => l.trim());
      slide.addText(
        items.map(item => ({
          text: item.replace(/^[-*\d.]\s*/, ''),
          options: { bullet: section.type === 'bullets', fontSize: 16 },
        })),
        { x: 0.5, y: 1.2, w: '90%', color: '333333' }
      );
    } else {
      slide.addText(section.content.trim(), {
        x: 0.5,
        y: 1.2,
        w: '90%',
        fontSize: 16,
        color: '333333',
        valign: 'top',
      });
    }
  });

  pptx.writeFile({ fileName: `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.pptx` });
};

// Export to TXT
export const exportToTxt = (data: ExportContent): void => {
  let content = `${data.title}\n${'='.repeat(data.title.length)}\n\n`;
  content += `Generated: ${(data.date || new Date()).toLocaleDateString('en-GB')}\n`;
  if (data.generatedBy) {
    content += `Prepared by: ${data.generatedBy}\n`;
  }
  content += '\n---\n\n';

  const sections = data.sections || parseContentToSections(data.content);
  sections?.forEach((section) => {
    if (section.heading) {
      content += `${section.heading}\n${'-'.repeat(section.heading.length)}\n`;
    }
    content += section.content.trim() + '\n\n';
  });

  content += '\n---\nGenerated by FlowPulse Elite Document AI';

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.txt`);
};

// Export to Markdown
export const exportToMarkdown = (data: ExportContent): void => {
  let content = `# ${data.title}\n\n`;
  content += `*Generated: ${(data.date || new Date()).toLocaleDateString('en-GB')}*\n`;
  if (data.generatedBy) {
    content += `*Prepared by: ${data.generatedBy}*\n`;
  }
  content += '\n---\n\n';

  const sections = data.sections || parseContentToSections(data.content);
  sections?.forEach((section) => {
    if (section.heading) {
      content += `## ${section.heading}\n\n`;
    }

    if (section.type === 'table' && section.tableData) {
      const headers = section.tableData[0];
      content += `| ${headers.join(' | ')} |\n`;
      content += `| ${headers.map(() => '---').join(' | ')} |\n`;
      section.tableData.slice(1).forEach((row) => {
        content += `| ${row.join(' | ')} |\n`;
      });
      content += '\n';
    } else {
      content += section.content.trim() + '\n\n';
    }
  });

  content += '\n---\n*Generated by FlowPulse Elite Document AI*';

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.md`);
};

// Main export function
export type ExportFormat = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx' | 'txt' | 'md';

export const exportDocument = async (data: ExportContent, format: ExportFormat): Promise<void> => {
  switch (format) {
    case 'pdf':
      exportToPDF(data);
      break;
    case 'docx':
      await exportToDocx(data);
      break;
    case 'xlsx':
      exportToXlsx(data);
      break;
    case 'csv':
      exportToCsv(data);
      break;
    case 'pptx':
      await exportToPptx(data);
      break;
    case 'txt':
      exportToTxt(data);
      break;
    case 'md':
      exportToMarkdown(data);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Detect requested export format from message
export const detectExportFormat = (message: string): ExportFormat | null => {
  const lower = message.toLowerCase();
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('word') || lower.includes('docx') || lower.includes('.docx')) return 'docx';
  if (lower.includes('excel') || lower.includes('xlsx') || lower.includes('.xlsx')) return 'xlsx';
  if (lower.includes('csv') || lower.includes('.csv')) return 'csv';
  if (lower.includes('powerpoint') || lower.includes('pptx') || lower.includes('presentation') || lower.includes('.pptx')) return 'pptx';
  if (lower.includes('text') || lower.includes('txt') || lower.includes('.txt')) return 'txt';
  if (lower.includes('markdown') || lower.includes('.md')) return 'md';
  if (lower.includes('download') || lower.includes('export')) return 'pdf'; // Default to PDF
  return null;
};
