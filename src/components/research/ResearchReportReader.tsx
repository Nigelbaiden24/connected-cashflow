import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, X, FileText, Lock, ArrowRight } from "lucide-react";

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

interface PreviewReportFallback extends Partial<FullReport> {
  first_page_title?: string;
  first_page_html?: string;
}

interface Props {
  reportId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isAuthed: boolean;
  onRequestAuth: () => void;
}

export function ResearchReportReader({ reportId, open, onOpenChange, isAuthed, onRequestAuth }: Props) {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!open || !reportId) return;
    setPageIndex(0);
    setReport(null);
    if (!isAuthed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke("public-research-previews", {
        body: { report_id: reportId },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (error) console.error(error);

      const payload = data as { report?: FullReport | null; reports?: PreviewReportFallback[] } | null;
      const fallbackReport = payload?.reports?.find((item) => item.id === reportId) ?? null;
      const fullReport = payload?.report ?? (fallbackReport ? {
        id: fallbackReport.id ?? reportId,
        title: fallbackReport.title ?? "Research report",
        asset_type: fallbackReport.asset_type ?? "research",
        ticker: fallbackReport.ticker ?? null,
        pages: fallbackReport.first_page_html ? [{ title: fallbackReport.first_page_title ?? "Executive Summary", html: fallbackReport.first_page_html }] : null,
        html_content: fallbackReport.html_content ?? null,
        author_name: fallbackReport.author_name ?? null,
        report_date: fallbackReport.report_date ?? null,
        ai_score: fallbackReport.ai_score ?? null,
      } : null);
      setReport(fullReport as FullReport | null);
      setLoading(false);
    })();
  }, [open, reportId, isAuthed]);

  const effectiveReport: FullReport | null = isAuthed ? report : null;

  const pages: ReportPage[] = effectiveReport?.pages?.length
    ? effectiveReport.pages
    : effectiveReport?.html_content
    ? [{ title: effectiveReport.title, html: effectiveReport.html_content }]
    : [];
  const current = pages[pageIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-white">
        <DialogTitle className="sr-only">{effectiveReport?.title ?? "Research report"}</DialogTitle>
        {!isAuthed ? (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/40 mb-5">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to read this report</h3>
            <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
              Research summaries and full report content are only visible to signed-in FlowPulse users.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                onClick={onRequestAuth}
              >
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-200 bg-white text-slate-900" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : !effectiveReport ? (
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
                  <Badge variant="outline" className="border-slate-200">{effectiveReport.asset_type}</Badge>
                  {effectiveReport.ticker && <span className="font-mono">{effectiveReport.ticker}</span>}
                  {effectiveReport.author_name && <span>· {effectiveReport.author_name}</span>}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 truncate">{effectiveReport.title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </header>

            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-3xl px-8 py-10 relative">
                {current ? (
                  <div className="relative">
                    <article
                      className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-amber-600"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(current.html || "") }}
                    />
                  </div>
                ) : (
                  <p className="text-slate-500">No content available for this report.</p>
                )}
              </div>
            </ScrollArea>

            {isAuthed && pages.length > 1 && (
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
