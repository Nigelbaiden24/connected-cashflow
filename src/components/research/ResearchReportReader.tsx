import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, X, FileText, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

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

export interface ReaderPreview {
  id: string;
  title: string;
  asset_type: string;
  ticker: string | null;
  author_name: string | null;
  report_date: string | null;
  ai_score: number | null;
  first_page_title: string;
  first_page_html: string;
}

interface Props {
  reportId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isAuthed: boolean;
  preview?: ReaderPreview | null;
  onRequestAuth: () => void;
}

export function ResearchReportReader({ reportId, open, onOpenChange, isAuthed, preview, onRequestAuth }: Props) {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!open || !reportId) return;
    setPageIndex(0);
    setReport(null);
    if (!isAuthed) {
      // Unauthenticated: don't fetch full report, just use preview
      setLoading(false);
      return;
    }
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
  }, [open, reportId, isAuthed]);

  // For unauthed users, synthesize a single-page report from the preview (first page only)
  const effectiveReport: FullReport | null = isAuthed
    ? report
    : preview
    ? {
        id: preview.id,
        title: preview.title,
        asset_type: preview.asset_type,
        ticker: preview.ticker,
        pages: [{ title: preview.first_page_title, html: preview.first_page_html }],
        html_content: preview.first_page_html,
        author_name: preview.author_name,
        report_date: preview.report_date,
        ai_score: preview.ai_score,
      }
    : null;

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
        {loading ? (
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
                  {!isAuthed && (
                    <Badge className="ml-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                      <Lock className="h-2.5 w-2.5 mr-1" /> Preview
                    </Badge>
                  )}
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
                  <div className={`relative ${!isAuthed ? "min-h-[560px]" : ""}`}>
                    <article
                      className={`prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-amber-600 ${
                        !isAuthed ? "max-h-[560px] overflow-hidden select-none blur-[3px] opacity-60 pointer-events-none" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(current.html || "") }}
                    />

                    {!isAuthed && (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white" />

                        <div className="absolute left-1/2 top-28 z-20 w-[min(100%,34rem)] -translate-x-1/2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-8 text-center shadow-[0_24px_80px_-18px_rgba(15,23,42,0.35)]">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/40 mb-4">
                            <Lock className="h-6 w-6 text-amber-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Continue reading the full report
                          </h3>
                          <p className="mt-2 text-slate-500 max-w-md mx-auto leading-relaxed">
                            Create your free FlowPulse account to unlock the rest of <span className="font-semibold text-slate-900">{effectiveReport.title}</span>, including conviction scoring, valuation models, and downloadable PDF.
                          </p>
                          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                              onClick={onRequestAuth}
                            >
                              Create free account <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                              onClick={onRequestAuth}
                            >
                              Sign in
                            </Button>
                          </div>
                          <div className="mt-5 flex flex-wrap justify-center gap-3 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Independent coverage</span>
                            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-amber-500" /> 0–5 conviction scoring</span>
                          </div>
                        </div>
                      </>
                    )}
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
