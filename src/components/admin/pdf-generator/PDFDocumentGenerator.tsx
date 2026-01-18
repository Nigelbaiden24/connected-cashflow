import jsPDF from 'jspdf';
import { DocumentTemplate, TemplateSection } from './templates';

interface GeneratorOptions {
  template: DocumentTemplate;
  fieldValues: Record<string, string | boolean | number>;
  sectionContent: Record<string, string>;
  companyLogo?: string;
}

export const generatePDFDocument = ({
  template,
  fieldValues,
  sectionContent,
  companyLogo,
}: GeneratorOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPosition > pageHeight - requiredSpace) {
      doc.addPage();
      yPosition = margin;
      addHeader();
    }
  };

  // Add header with logo
  const addHeader = () => {
    // Logo placeholder or actual logo
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'PNG', margin, yPosition, 40, 15);
        yPosition += 20;
      } catch {
        // Fallback to text logo
        doc.setFontSize(20);
        doc.setTextColor(135, 206, 250);
        doc.setFont('helvetica', 'bold');
        doc.text('FlowPulse.io', margin, yPosition + 10);
        yPosition += 20;
      }
    } else {
      // Text logo with branding
      doc.setFontSize(24);
      doc.setTextColor(135, 206, 250);
      doc.setFont('helvetica', 'bold');
      doc.text('FlowPulse.io', margin, yPosition + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Financial Advisory Platform', margin, yPosition + 18);
      yPosition += 25;
    }

    // Decorative line
    doc.setDrawColor(135, 206, 250);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  // Add footer
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('FlowPulse.io | Financial Advisory Platform', margin, footerY);
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - margin - 15, footerY);
    doc.text('Confidential', pageWidth / 2 - 10, footerY);
  };

  // Replace placeholders in content
  const replacePlaceholders = (content: string): string => {
    let result = content;
    Object.entries(fieldValues).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      let displayValue = String(value);
      
      // Format dates
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        displayValue = new Date(value).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      
      // Format numbers as currency where applicable
      if (typeof value === 'number' && (key.includes('Amount') || key.includes('Fee') || key.includes('amount') || key.includes('fee'))) {
        displayValue = new Intl.NumberFormat('en-GB', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      }
      
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  // Add document title
  const addTitle = () => {
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(template.name.toUpperCase(), margin, yPosition);
    yPosition += 15;

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Generated: ${today}`, margin, yPosition);
    yPosition += 15;
  };

  // Add section
  const addSection = (section: TemplateSection) => {
    // Check if section should be shown based on conditional
    if (section.conditional) {
      const conditionValue = fieldValues[section.conditional.fieldId];
      if (conditionValue !== section.conditional.value) {
        return;
      }
    }

    checkPageBreak(40);

    // Section title
    doc.setFontSize(14);
    doc.setTextColor(70, 130, 180);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, yPosition);
    yPosition += 8;

    // Section content
    const content = sectionContent[section.id] || replacePlaceholders(section.content);
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');

    // Handle multi-line content
    const lines = doc.splitTextToSize(content, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(10);
      
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        doc.text(line, margin + 5, yPosition);
      } else {
        doc.text(line, margin, yPosition);
      }
      yPosition += 6;
    });

    yPosition += 8;
  };

  // Add invoice-specific formatting
  const addInvoiceTable = () => {
    if (template.category !== 'invoice') return;

    checkPageBreak(60);

    const amount = Number(fieldValues.amount) || 0;
    const vatRate = Number(fieldValues.vatRate) || 20;
    const includeVAT = fieldValues.includeVAT as boolean;
    const vatAmount = includeVAT ? amount * (vatRate / 100) : 0;
    const total = amount + vatAmount;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 5, yPosition + 7);
    doc.text('Amount', pageWidth - margin - 30, yPosition + 7);
    yPosition += 15;

    // Service row
    doc.setFont('helvetica', 'normal');
    const description = String(fieldValues.serviceDescription || 'Advisory Services').substring(0, 60);
    doc.text(description, margin + 5, yPosition);
    doc.text(`£${amount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
    yPosition += 10;

    // Subtotal
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.text('Subtotal:', margin + 5, yPosition);
    doc.text(`£${amount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
    yPosition += 8;

    // VAT
    if (includeVAT) {
      doc.text(`VAT (${vatRate}%):`, margin + 5, yPosition);
      doc.text(`£${vatAmount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
      yPosition += 8;
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(70, 130, 180);
    doc.rect(margin, yPosition - 4, contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', margin + 5, yPosition + 4);
    doc.text(`£${total.toFixed(2)}`, pageWidth - margin - 30, yPosition + 4);
    yPosition += 20;

    doc.setTextColor(40, 40, 40);
  };

  // Add signature lines
  const addSignatureLines = () => {
    checkPageBreak(60);

    yPosition += 20;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');

    // First signature line
    doc.text('For FlowPulse.io:', margin, yPosition);
    yPosition += 20;
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, yPosition, margin + 80, yPosition);
    doc.text('Signature', margin, yPosition + 5);
    doc.line(margin + 100, yPosition, pageWidth - margin, yPosition);
    doc.text('Date', margin + 100, yPosition + 5);
    yPosition += 20;

    // Second signature line
    const clientName = String(fieldValues.clientName || fieldValues.partyName || 'Client');
    doc.text(`For ${clientName}:`, margin, yPosition);
    yPosition += 20;
    doc.line(margin, yPosition, margin + 80, yPosition);
    doc.text('Signature', margin, yPosition + 5);
    doc.line(margin + 100, yPosition, pageWidth - margin, yPosition);
    doc.text('Date', margin + 100, yPosition + 5);
  };

  // Build the document
  addHeader();
  addTitle();

  // Add sections
  template.sections.forEach((section) => {
    addSection(section);
  });

  // Add invoice table if applicable
  if (template.category === 'invoice') {
    addInvoiceTable();
  }

  // Add signature lines for contracts and agreements
  if (['contract', 'agreement'].includes(template.category)) {
    addSignatureLines();
  }

  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // Save the PDF
  const filename = `FlowPulse_${template.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};
