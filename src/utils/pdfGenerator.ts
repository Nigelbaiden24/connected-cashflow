import jsPDF from 'jspdf';

interface ReportData {
  title: string;
  content: string;
  generatedBy?: string;
  date?: Date;
}

export const generateFinancialReport = (data: ReportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // ============ FRONT PAGE ============
  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Company name - centered and large in blue
  doc.setTextColor(135, 206, 250); // Shiny baby blue
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  const companyName = 'FlowPulse.io';
  const companyWidth = doc.getTextWidth(companyName);
  doc.text(companyName, (pageWidth - companyWidth) / 2, 80);
  
  // Tagline in darker blue
  doc.setTextColor(70, 130, 180);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const tagline = 'Financial Advisory Platform';
  const taglineWidth = doc.getTextWidth(tagline);
  doc.text(tagline, (pageWidth - taglineWidth) / 2, 95);
  
  // Decorative line
  doc.setDrawColor(135, 206, 250);
  doc.setLineWidth(2);
  doc.line(margin, 110, pageWidth - margin, 110);
  
  // Report title in dark text
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.title, pageWidth - (margin * 4));
  let titleY = 140;
  titleLines.forEach((line: string) => {
    const lineWidth = doc.getTextWidth(line);
    doc.text(line, (pageWidth - lineWidth) / 2, titleY);
    titleY += 12;
  });
  
  // Date in blue
  doc.setTextColor(70, 130, 180);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const dateStr = (data.date || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, (pageWidth - dateWidth) / 2, pageHeight - 40);
  
  if (data.generatedBy) {
    const byText = `Prepared by: ${data.generatedBy}`;
    const byWidth = doc.getTextWidth(byText);
    doc.text(byText, (pageWidth - byWidth) / 2, pageHeight - 25);
  }
  
  // ============ CONTENT PAGES ============
  doc.addPage();
  
  // Header on content pages
  doc.setFillColor(135, 206, 250);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FlowPulse.io', margin, 16);
  
  // Content - parse and format with paragraphs
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Split content into paragraphs
  const paragraphs = data.content.split('\n\n').filter(p => p.trim());
  let yPosition = 40;
  const lineHeight = 7;
  const paragraphSpacing = 12;
  
  paragraphs.forEach((paragraph, index) => {
    // Check for headers (lines ending with :)
    const isHeader = paragraph.trim().endsWith(':') && paragraph.length < 100;
    
    if (isHeader) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 40) {
        doc.addPage();
        
        // Add header on new pages
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
      }
      
      // Format as header
      doc.setTextColor(70, 130, 180);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(paragraph, margin, yPosition);
      yPosition += paragraphSpacing;
      
      // Reset to normal text
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
    } else {
      // Format as paragraph
      const lines = doc.splitTextToSize(paragraph, contentWidth);
      
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          
          // Add header on new pages
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
          doc.setFontSize(11);
          doc.setTextColor(40, 40, 40);
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      // Add spacing after paragraph (except last one)
      if (index < paragraphs.length - 1) {
        yPosition += paragraphSpacing - lineHeight;
      }
    }
  });
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This report is generated by FlowPulse.io AI Assistant', margin, footerY);
  doc.text('Confidential & Proprietary', pageWidth - margin - 40, footerY);
  
  // Save the PDF
  const filename = `FlowPulse_${data.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};
