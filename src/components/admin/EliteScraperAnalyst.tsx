import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, Brain, Loader2, Download, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateEliteReport, EliteReport } from "@/utils/eliteReportPdf";
import { saveScrapeResult } from "@/hooks/useScrapeAutoSave";

interface Props {
  platform: "finance" | "investor";
}

export function EliteScraperAnalyst({ platform }: Props) {
  const [scrapedData, setScrapedData] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [explanation, setExplanation] = useState("");
  const [report, setReport] = useState<EliteReport | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isInvestor = platform === "investor";
  const accent = isInvestor
    ? "from-violet-600 to-fuchsia-600"
    : "from-blue-600 to-cyan-600";
  const headerBg = isInvestor
    ? "from-violet-50 via-fuchsia-50 to-transparent"
    : "from-blue-50 via-cyan-50 to-transparent";

  const handleExplain = async () => {
    if (!scrapedData.trim()) { toast.error("Paste scraped data first"); return; }
    setLoadingExplain(true); setExplanation("");
    try {
      const { data, error } = await supabase.functions.invoke("elite-scraper-analyst", {
        body: { mode: "explain", platform, scrapedData, categoryLabel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExplanation(data.explanation || "");
      toast.success("Explanation generated");
      saveScrapeResult({
        source: "elite-analyst",
        platform,
        title: `Elite Explain — ${categoryLabel || "Untitled"}`,
        category: categoryLabel || "Elite Analyst",
        payload: { mode: "explain", explanation: data.explanation, scrapedData },
        rawOutput: data.explanation,
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to generate explanation");
    } finally { setLoadingExplain(false); }
  };

  const handleReport = async () => {
    if (!scrapedData.trim()) { toast.error("Paste scraped data first"); return; }
    setLoadingReport(true); setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke("elite-scraper-analyst", {
        body: { mode: "report", platform, scrapedData, categoryLabel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReport(data.report);
      toast.success("Report generated — preview below");
      saveScrapeResult({
        source: "elite-analyst",
        platform,
        title: `Elite Report — ${data.report?.title || categoryLabel || "Untitled"}`,
        category: categoryLabel || "Elite Analyst",
        payload: { mode: "report", report: data.report, scrapedData },
        opportunities: data.report?.opportunities,
        opportunitiesCount: Array.isArray(data.report?.opportunities) ? data.report.opportunities.length : 0,
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to generate report");
    } finally { setLoadingReport(false); }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      await generateEliteReport(report, { platform, categoryLabel });
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally { setDownloading(false); }
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white overflow-hidden">
      <CardHeader className={`border-b border-slate-100 bg-gradient-to-r ${headerBg}`}>
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br shadow-md ${accent}`}>
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold flex items-center gap-2">
              Elite AI Analyst
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">
              Process scraped intelligence — explain it, or generate a publication-grade PDF report
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-500 pt-2">
          Paste any scraped output from above, then choose Explain (plain-English breakdown) or Report (full PDF with charts & tables).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="space-y-2">
            <Label>Scraped Data / Raw Intelligence</Label>
            <Textarea
              value={scrapedData}
              onChange={(e) => setScrapedData(e.target.value)}
              placeholder="Paste scraped news, opportunity candidates, market data or full research output here…"
              className="min-h-[180px] font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Category / Topic (optional)</Label>
            <Input
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="e.g. Crypto & Digital Assets"
            />
            <p className="text-xs text-slate-500 pt-1">
              Adds context to the AI and is shown on the PDF cover page.
            </p>
          </div>
        </div>

        <Tabs defaultValue="explain" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="explain" className="gap-2">
              <BookOpen className="h-4 w-4" /> Explain
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2">
              <FileText className="h-4 w-4" /> Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explain" className="mt-4 space-y-3">
            <Button onClick={handleExplain} disabled={loadingExplain} className={`bg-gradient-to-r ${accent} text-white`}>
              {loadingExplain ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analysing…</> : <><Sparkles className="h-4 w-4 mr-2" />Explain This Data</>}
            </Button>
            {explanation && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 max-h-[480px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
                  {explanation}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleReport} disabled={loadingReport} className={`bg-gradient-to-r ${accent} text-white`}>
                {loadingReport ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Building report…</> : <><Brain className="h-4 w-4 mr-2" />Generate Elite Report</>}
              </Button>
              {report && (
                <Button onClick={handleDownload} disabled={downloading} variant="outline">
                  {downloading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Rendering PDF…</> : <><Download className="h-4 w-4 mr-2" />Download PDF</>}
                </Button>
              )}
            </div>

            {report && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 max-h-[520px] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{report.title}</h3>
                  {report.subtitle && <p className="text-sm text-slate-500">{report.subtitle}</p>}
                </div>
                {report.executive_summary && (
                  <section>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">Executive Summary</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.executive_summary}</p>
                  </section>
                )}
                {report.key_metrics?.length ? (
                  <section className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {report.key_metrics.map((m, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{m.label}</div>
                        <div className="text-base font-bold text-slate-900">{m.value}</div>
                        {m.change && <div className="text-xs text-emerald-600">{m.change}</div>}
                      </div>
                    ))}
                  </section>
                ) : null}
                {report.sections?.map((s, i) => (
                  <section key={i}>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">{s.heading}</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{s.body}</p>
                  </section>
                ))}
                {report.opportunities?.length ? (
                  <section>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Opportunities ({report.opportunities.length})</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {report.opportunities.map((o, i) => (
                        <li key={i}><span className="font-semibold">{o.name}</span> — {o.thesis} <span className="text-xs text-slate-500">({o.conviction} · {o.horizon})</span></li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {report.conclusion && (
                  <section>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">Conclusion</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.conclusion}</p>
                  </section>
                )}
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">Click "Download PDF" for the fully styled, multi-page report with charts, tables, and FlowPulse branding.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
