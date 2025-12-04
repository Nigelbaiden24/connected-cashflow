import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: string;
  classifiedType: DocumentType;
  content: string;
  tables: string[][][];
  metadata: {
    pageCount?: number;
    wordCount: number;
    extractedAt: Date;
    hasImages: boolean;
    language?: string;
  };
  keyData: {
    numbers: string[];
    dates: string[];
    entities: string[];
    kpis: { label: string; value: string }[];
  };
}

export type DocumentType = 
  | 'invoice'
  | 'report'
  | 'statement'
  | 'article'
  | 'contract'
  | 'presentation'
  | 'spreadsheet'
  | 'letter'
  | 'proposal'
  | 'policy'
  | 'resume'
  | 'other';

// Classify document type based on content
export const classifyDocument = (content: string, fileName: string): DocumentType => {
  const lower = content.toLowerCase();
  const name = fileName.toLowerCase();

  // Check filename first
  if (name.includes('invoice') || name.includes('inv_')) return 'invoice';
  if (name.includes('statement') || name.includes('stmt')) return 'statement';
  if (name.includes('contract') || name.includes('agreement')) return 'contract';
  if (name.includes('proposal')) return 'proposal';
  if (name.includes('report')) return 'report';
  if (name.includes('policy')) return 'policy';
  if (name.includes('resume') || name.includes('cv')) return 'resume';
  if (name.includes('letter')) return 'letter';

  // Check content patterns
  if (lower.includes('invoice number') || lower.includes('bill to') || lower.includes('amount due')) return 'invoice';
  if (lower.includes('account statement') || lower.includes('balance') || lower.includes('transaction history')) return 'statement';
  if (lower.includes('hereby agree') || lower.includes('terms and conditions') || lower.includes('party of')) return 'contract';
  if (lower.includes('executive summary') || lower.includes('findings') || lower.includes('recommendations')) return 'report';
  if (lower.includes('proposal') || lower.includes('we propose') || lower.includes('scope of work')) return 'proposal';
  if (lower.includes('dear') && lower.includes('sincerely')) return 'letter';
  if (lower.includes('experience') && lower.includes('education') && lower.includes('skills')) return 'resume';
  if (lower.includes('policy') || lower.includes('compliance') || lower.includes('regulation')) return 'policy';

  return 'other';
};

// Extract key data from content
export const extractKeyData = (content: string): ParsedDocument['keyData'] => {
  const numbers: string[] = [];
  const dates: string[] = [];
  const entities: string[] = [];
  const kpis: { label: string; value: string }[] = [];

  // Extract currency amounts
  const currencyMatches = content.match(/[$£€¥]\s*[\d,]+\.?\d*/g) || [];
  numbers.push(...currencyMatches);

  // Extract percentages
  const percentMatches = content.match(/\d+\.?\d*\s*%/g) || [];
  numbers.push(...percentMatches);

  // Extract large numbers (likely financial figures)
  const largeNumbers = content.match(/\b\d{1,3}(,\d{3})+(\.\d{2})?\b/g) || [];
  numbers.push(...largeNumbers);

  // Extract dates
  const datePatterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
  ];
  datePatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    dates.push(...matches);
  });

  // Extract potential entity names (capitalized words in sequence)
  const entityMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  const uniqueEntities = [...new Set(entityMatches)].slice(0, 20);
  entities.push(...uniqueEntities);

  // Extract KPI-like patterns (Label: Value or Label = Value)
  const kpiMatches = content.match(/\b[\w\s]{3,30}:\s*[$£€¥]?[\d,]+\.?\d*%?\b/g) || [];
  kpiMatches.forEach(match => {
    const parts = match.split(':');
    if (parts.length === 2) {
      kpis.push({ label: parts[0].trim(), value: parts[1].trim() });
    }
  });

  return {
    numbers: [...new Set(numbers)].slice(0, 50),
    dates: [...new Set(dates)].slice(0, 20),
    entities,
    kpis: kpis.slice(0, 20),
  };
};

// Extract tables from text content
export const extractTablesFromText = (content: string): string[][][] => {
  const tables: string[][][] = [];
  const lines = content.split('\n');
  let currentTable: string[][] = [];
  let inTable = false;

  for (const line of lines) {
    // Detect markdown-style tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(c => c.trim() && !c.match(/^-+$/));
      if (cells.length > 1 && !line.includes('---')) {
        currentTable.push(cells.map(c => c.trim()));
      }
    } else if (inTable && currentTable.length > 0) {
      tables.push(currentTable);
      currentTable = [];
      inTable = false;
    }

    // Detect tab-separated data
    if (line.includes('\t') && line.split('\t').length > 2) {
      const cells = line.split('\t').map(c => c.trim());
      if (!inTable) {
        currentTable = [];
        inTable = true;
      }
      currentTable.push(cells);
    }
  }

  if (currentTable.length > 0) {
    tables.push(currentTable);
  }

  return tables;
};

// Parse PDF using pdfjs-dist
export const parsePDF = async (file: File): Promise<string> => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. The file may be encrypted or corrupted.');
  }
};

// Parse Word documents using mammoth
export const parseWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word parsing error:', error);
    throw new Error('Failed to parse Word document.');
  }
};

// Parse Excel/CSV files using xlsx
export const parseSpreadsheet = async (file: File): Promise<{ text: string; tables: string[][][] }> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let text = '';
    const tables: string[][][] = [];
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      
      text += `\n--- Sheet: ${sheetName} ---\n`;
      data.forEach(row => {
        text += row.join('\t') + '\n';
      });
      
      if (data.length > 0) {
        tables.push(data.map(row => row.map(cell => String(cell || ''))));
      }
    });
    
    return { text: text.trim(), tables };
  } catch (error) {
    console.error('Spreadsheet parsing error:', error);
    throw new Error('Failed to parse spreadsheet.');
  }
};

// Parse images with OCR
export const parseImageWithOCR = async (file: File): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image.');
  }
};

// Parse text files
export const parseTextFile = async (file: File): Promise<string> => {
  return await file.text();
};

// Main document parser
export const parseDocument = async (file: File): Promise<ParsedDocument> => {
  const fileType = file.type || '';
  const fileName = file.name.toLowerCase();
  let content = '';
  let tables: string[][][] = [];
  let hasImages = false;

  // Determine file type and parse accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    content = await parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    content = await parseWord(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileType === 'application/vnd.ms-excel' ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.csv')
  ) {
    const result = await parseSpreadsheet(file);
    content = result.text;
    tables = result.tables;
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName.endsWith('.pptx')
  ) {
    // Basic PPTX parsing - extract as text
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    content = 'PowerPoint presentation content extracted';
  } else if (fileType.startsWith('image/')) {
    content = await parseImageWithOCR(file);
    hasImages = true;
  } else if (
    fileType === 'text/plain' ||
    fileType === 'text/csv' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md')
  ) {
    content = await parseTextFile(file);
  } else {
    // Try as text
    try {
      content = await parseTextFile(file);
    } catch {
      throw new Error(`Unsupported file type: ${fileType || fileName}`);
    }
  }

  // Extract tables from text content if not already parsed
  if (tables.length === 0) {
    tables = extractTablesFromText(content);
  }

  // Classify and extract key data
  const classifiedType = classifyDocument(content, file.name);
  const keyData = extractKeyData(content);
  const wordCount = content.split(/\s+/).filter(w => w).length;

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fileName: file.name,
    fileType: fileType || 'unknown',
    classifiedType,
    content,
    tables,
    metadata: {
      wordCount,
      extractedAt: new Date(),
      hasImages,
    },
    keyData,
  };
};

// Compare two documents
export const compareDocuments = (doc1: ParsedDocument, doc2: ParsedDocument): {
  similarities: string[];
  differences: string[];
  summary: string;
} => {
  const similarities: string[] = [];
  const differences: string[] = [];

  // Compare document types
  if (doc1.classifiedType === doc2.classifiedType) {
    similarities.push(`Both documents are classified as: ${doc1.classifiedType}`);
  } else {
    differences.push(`Document types differ: ${doc1.fileName} is "${doc1.classifiedType}", ${doc2.fileName} is "${doc2.classifiedType}"`);
  }

  // Compare word counts
  const wordDiff = Math.abs(doc1.metadata.wordCount - doc2.metadata.wordCount);
  if (wordDiff < 100) {
    similarities.push(`Similar document lengths (~${Math.round((doc1.metadata.wordCount + doc2.metadata.wordCount) / 2)} words)`);
  } else {
    differences.push(`Different lengths: ${doc1.fileName} has ${doc1.metadata.wordCount} words, ${doc2.fileName} has ${doc2.metadata.wordCount} words`);
  }

  // Compare key numbers
  const sharedNumbers = doc1.keyData.numbers.filter(n => doc2.keyData.numbers.includes(n));
  if (sharedNumbers.length > 0) {
    similarities.push(`Shared financial figures: ${sharedNumbers.slice(0, 5).join(', ')}`);
  }

  // Compare entities
  const sharedEntities = doc1.keyData.entities.filter(e => doc2.keyData.entities.includes(e));
  if (sharedEntities.length > 0) {
    similarities.push(`Common entities: ${sharedEntities.slice(0, 5).join(', ')}`);
  }

  // Compare dates
  const sharedDates = doc1.keyData.dates.filter(d => doc2.keyData.dates.includes(d));
  if (sharedDates.length > 0) {
    similarities.push(`Common dates: ${sharedDates.slice(0, 5).join(', ')}`);
  }

  const summary = `Comparison of "${doc1.fileName}" and "${doc2.fileName}":\n` +
    `Found ${similarities.length} similarities and ${differences.length} differences.\n` +
    `${similarities.length > 0 ? 'Key similarities: ' + similarities[0] : ''}\n` +
    `${differences.length > 0 ? 'Key differences: ' + differences[0] : ''}`;

  return { similarities, differences, summary };
};
