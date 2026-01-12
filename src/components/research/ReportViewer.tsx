import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, FileText, Calendar, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ReportSection {
  heading: string;
  content: string;
}

export interface ReportModule {
  module_id: string;
  module_title: string;
  sections: ReportSection[];
}

export interface OrchestatedReport {
  title: string;
  generated_date: string;
  modules: ReportModule[];
  disclaimer: string;
}

interface ReportViewerProps {
  report: OrchestatedReport;
  onExportPDF?: () => void;
  onPrint?: () => void;
}

export function ReportViewer({ report, onExportPDF, onPrint }: ReportViewerProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Generated: {report.generated_date}
            </span>
            <Badge variant="outline">
              {report.modules.length} Module{report.modules.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Table of Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="space-y-1">
            {report.modules.map((module, index) => (
              <a
                key={module.module_id}
                href={`#module-${module.module_id}`}
                className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <span className="font-medium">{index + 1}. {module.module_title}</span>
                {module.sections.length > 0 && (
                  <ul className="ml-4 mt-1 text-sm text-muted-foreground">
                    {module.sections.slice(0, 3).map((section, sIndex) => (
                      <li key={sIndex}>• {section.heading}</li>
                    ))}
                    {module.sections.length > 3 && (
                      <li className="text-xs">...and {module.sections.length - 3} more</li>
                    )}
                  </ul>
                )}
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-8 print:space-y-4">
        {report.modules.map((module, moduleIndex) => (
          <Card key={module.module_id} id={`module-${module.module_id}`} className="print:break-inside-avoid">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center p-0">
                  {moduleIndex + 1}
                </Badge>
                <CardTitle>{module.module_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {module.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">{section.heading}</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                    {sectionIndex < module.sections.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Important Disclaimer</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {report.disclaimer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
