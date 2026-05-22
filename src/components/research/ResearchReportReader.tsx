import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, X, FileText } from "lucide-react";

interface ReportPage { title: string; html: string }
interface FullReport {
  id: string;
  title: string;
  asset_type: string;
  ticker: string | null;
  pages: ReportPage[] | null;
  html_content: string | null;
  author_name: string | null;
  report_date: string | null;
  ai_score: number | null;
}

interface Props {
  reportId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ResearchReportReader({ reportId, open, onOpenChange }: Props) {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!open || !reportId) return;
    setPageIndex(0);
    setReport(null);
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("generated_research_reports")
        .select("id, title, asset_type, ticker, pages, html_content, author_name, report_date, ai_score")
        .eq("id", reportId)
        .maybeSingle();
      if (error) console.error(error);
      setReport((data as unknown) as FullReport | null);
      setLoading(false);
    })();
  }, [open, reportId]);

  const pages: ReportPage[] = report?.pages?.length
    ? report.pages
    : report?.html_content
    ? [{ title: report.title, html: report.html_content }]
    : [];
  const current = pages[pageIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-white">
        <DialogTitle className="sr-only">{report?.title ?? "Research report"}</DialogTitle>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : !report ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-2">
            <FileText className="h-10 w-10" />
            <p>Report not available.</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 bg-gradient-to-b from-slate-50 to-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                  <Badge variant="outline" className="border-slate-200">{report.asset_type}</Badge>
                  {report.ticker && <span className="font-mono">{report.ticker}</span>}
                  {report.author_name && <span>· {report.author_name}</span>}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 truncate">{report.title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </header>

            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-3xl px-8 py-10">
                {current ? (
                  <article
                    className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-amber-600"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(current.html || "") }}
                  />
                ) : (
                  <p className="text-slate-500">No content available for this report.</p>
                )}
              </div>
            </ScrollArea>

            {pages.length > 1 && (
              <footer className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-xs text-slate-500">
                  Page {pageIndex + 1} of {pages.length}
                  {current?.title ? ` · ${current.title}` : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pageIndex >= pages.length - 1}
                  onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </footer>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
