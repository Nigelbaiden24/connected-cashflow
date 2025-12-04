import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  Loader2, 
  X, 
  File, 
  FileSpreadsheet, 
  FileImage,
  Presentation,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseDocument, ParsedDocument } from '@/utils/documentParser';

interface MultiDocumentUploadProps {
  onDocumentsParsed: (documents: ParsedDocument[], summary: string) => void;
  maxFiles?: number;
}

const getFileIcon = (fileType: string, fileName: string) => {
  const name = fileName.toLowerCase();
  if (fileType.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
    return <FileSpreadsheet className="h-4 w-4" />;
  }
  if (fileType.includes('presentation') || name.endsWith('.pptx')) {
    return <Presentation className="h-4 w-4" />;
  }
  if (fileType.startsWith('image/')) {
    return <FileImage className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
};

const getDocumentTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    invoice: 'bg-chart-1/20 text-chart-1',
    report: 'bg-chart-2/20 text-chart-2',
    statement: 'bg-chart-3/20 text-chart-3',
    contract: 'bg-chart-4/20 text-chart-4',
    proposal: 'bg-chart-5/20 text-chart-5',
    other: 'bg-muted text-muted-foreground',
  };
  return colors[type] || colors.other;
};

export const MultiDocumentUpload = ({ 
  onDocumentsParsed, 
  maxFiles = 10 
}: MultiDocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedDocs, setParsedDocs] = useState<ParsedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setParsedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const parsed: ParsedDocument[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Processing ${file.name} (${i + 1}/${files.length})...`);

        try {
          const doc = await parseDocument(file);
          parsed.push(doc);
        } catch (error) {
          console.error(`Error parsing ${file.name}:`, error);
          toast({
            title: `Failed to parse ${file.name}`,
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: "destructive",
          });
        }
      }

      setParsedDocs(parsed);

      if (parsed.length > 0) {
        // Generate summary for AI
        const summary = generateDocumentSummary(parsed);
        onDocumentsParsed(parsed, summary);

        toast({
          title: "Documents processed",
          description: `Successfully analyzed ${parsed.length} document(s)`,
        });
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing documents",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const generateDocumentSummary = (docs: ParsedDocument[]): string => {
    let summary = `I have analyzed ${docs.length} document(s):\n\n`;

    docs.forEach((doc, index) => {
      summary += `**Document ${index + 1}: ${doc.fileName}**\n`;
      summary += `- Type: ${doc.classifiedType}\n`;
      summary += `- Word count: ${doc.metadata.wordCount}\n`;
      
      if (doc.keyData.numbers.length > 0) {
        summary += `- Key figures: ${doc.keyData.numbers.slice(0, 5).join(', ')}\n`;
      }
      
      if (doc.keyData.dates.length > 0) {
        summary += `- Dates found: ${doc.keyData.dates.slice(0, 3).join(', ')}\n`;
      }
      
      if (doc.keyData.entities.length > 0) {
        summary += `- Entities: ${doc.keyData.entities.slice(0, 5).join(', ')}\n`;
      }
      
      if (doc.tables.length > 0) {
        summary += `- Contains ${doc.tables.length} table(s)\n`;
      }
      
      // Include content preview
      const contentPreview = doc.content.substring(0, 500).replace(/\n+/g, ' ');
      summary += `- Content preview: ${contentPreview}...\n\n`;
    });

    summary += `\nFull document content is available for detailed analysis. What would you like me to do with these documents?`;

    return summary;
  };

  const clearAll = () => {
    setFiles([]);
    setParsedDocs([]);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.txt,.md,image/*"
        onChange={handleFileSelect}
        disabled={isProcessing}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || files.length >= maxFiles}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Add Documents
        </Button>

        {files.length > 0 && (
          <>
            <Button
              size="sm"
              onClick={processFiles}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Analyze {files.length} File(s)
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {processingStatus && (
        <p className="text-sm text-muted-foreground">{processingStatus}</p>
      )}

      {files.length > 0 && (
        <Card className="p-3">
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {files.map((file, index) => {
                const parsed = parsedDocs[index];
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    {getFileIcon(file.type, file.name)}
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    {parsed && (
                      <>
                        <Badge variant="secondary" className={getDocumentTypeColor(parsed.classifiedType)}>
                          {parsed.classifiedType}
                        </Badge>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Supported: PDF, Word, Excel, PowerPoint, CSV, TXT, Images (OCR) • Max {maxFiles} files
      </p>
    </div>
  );
};
