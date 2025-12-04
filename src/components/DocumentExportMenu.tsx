import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Presentation, FileType, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportDocument, ExportFormat, ExportContent } from '@/utils/documentExporter';

interface DocumentExportMenuProps {
  content: string;
  title?: string;
  disabled?: boolean;
}

export const DocumentExportMenu = ({ 
  content, 
  title = 'AI Generated Document',
  disabled = false 
}: DocumentExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "There's no content to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportingFormat(format);

    try {
      const exportData: ExportContent = {
        title,
        content,
        generatedBy: 'FlowPulse Elite Document AI',
        date: new Date(),
      };

      await exportDocument(exportData, format);

      toast({
        title: "Export successful",
        description: `Document exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const exportOptions: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { format: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" /> },
    { format: 'docx', label: 'Word Document (.docx)', icon: <FileText className="h-4 w-4" /> },
    { format: 'xlsx', label: 'Excel Spreadsheet (.xlsx)', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { format: 'csv', label: 'CSV File', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { format: 'pptx', label: 'PowerPoint (.pptx)', icon: <Presentation className="h-4 w-4" /> },
    { format: 'txt', label: 'Plain Text (.txt)', icon: <FileType className="h-4 w-4" /> },
    { format: 'md', label: 'Markdown (.md)', icon: <FileType className="h-4 w-4" /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportOptions.map(({ format, label, icon }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={isExporting}
            className="cursor-pointer"
          >
            {exportingFormat === format ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <span className="mr-2">{icon}</span>
            )}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
