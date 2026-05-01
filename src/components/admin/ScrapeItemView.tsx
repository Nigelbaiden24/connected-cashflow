import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileSpreadsheet, FileJson, Search, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Structured renderer for any scraped payload.
 * - Detects an items[] array under common keys
 * - Flattens each item into label/value pairs (objects/arrays serialized neatly)
 * - Per-field copy buttons; whole-item copy; CSV / TSV / JSON export
 */

const ITEM_KEYS = [
  "opportunities", "items", "results", "profiles", "data",
  "deals", "companies", "records", "rows",
];

// Field display order (most useful first). Anything not listed falls to the end alphabetically.
const FIELD_ORDER = [
  "name", "firm_name", "company_name", "title", "headline",
  "description", "summary", "thesis", "investment_thesis", "source_snippet",
  "category", "sector", "sectors", "industry", "stage", "stages",
  "location", "geographies", "headquarters", "address", "country",
  "website", "linkedin", "twitter", "source_url", "source_title", "source_website",
  "estimated_value", "price", "valuation", "fund_size", "aum", "cheque_size",
  "projected_returns", "analyst_rating", "risk_level",
  "general_emails", "general_phones",
  "team", "portfolio_companies", "recent_investments", "notable_exits",
  "key_metrics", "scraped_date", "founded", "firm_type",
];

// Pretty labels
const LABEL_OVERRIDES: Record<string, string> = {
  firm_name: "Firm Name",
  company_name: "Company",
  source_url: "Source URL",
  source_title: "Source Title",
  source_website: "Source Website",
  source_snippet: "Snippet",
  general_emails: "Emails",
  general_phones: "Phones",
  cheque_size: "Cheque Size",
  fund_size: "Fund Size",
  aum: "AUM",
  estimated_value: "Estimated Value",
  projected_returns: "Projected Returns",
  analyst_rating: "Analyst Rating",
  risk_level: "Risk",
  investment_thesis: "Investment Thesis",
  portfolio_companies: "Portfolio Companies",
  recent_investments: "Recent Investments",
  notable_exits: "Notable Exits",
  key_metrics: "Key Metrics",
  firm_type: "Firm Type",
  scraped_date: "Scraped",
  geographies: "Geographies",
  sectors: "Sectors",
  stages: "Stages",
};

const HIDDEN_KEYS = new Set(["id", "_id", "uuid", "created_at", "updated_at", "enriched_at", "raw", "raw_data"]);

function prettyLabel(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isUrl(v: unknown): v is string {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function formatScalar(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "";
    if (v.every((x) => typeof x === "string" || typeof x === "number")) return v.join(", ");
    return v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" | ");
  }
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${prettyLabel(k)}: ${typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}`)
      .join(" • ");
  }
  return String(v);
}

function flattenItem(item: unknown): Array<{ key: string; label: string; value: unknown; display: string }> {
  if (!item || typeof item !== "object" || Array.isArray(item)) return [];
  const entries = Object.entries(item as Record<string, unknown>)
    .filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0));

  // Sort by FIELD_ORDER
  entries.sort(([a], [b]) => {
    const ai = FIELD_ORDER.indexOf(a);
    const bi = FIELD_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return entries.map(([key, value]) => ({
    key,
    label: prettyLabel(key),
    value,
    display: formatScalar(value),
  }));
}

function detectItems(payload: unknown, opportunities: unknown): unknown[] {
  if (Array.isArray(opportunities) && opportunities.length > 0) return opportunities;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    for (const k of ITEM_KEYS) {
      const v = (payload as Record<string, unknown>)[k];
      if (Array.isArray(v) && v.length > 0) return v;
    }
    // Nested under "data"
    const data = (payload as Record<string, unknown>).data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      for (const k of ITEM_KEYS) {
        const v = (data as Record<string, unknown>)[k];
        if (Array.isArray(v) && v.length > 0) return v;
      }
    }
  }
  // Single object → wrap as one-item array
  if (payload && typeof payload === "object" && !Array.isArray(payload)) return [payload];
  return [];
}

function toCSV(items: unknown[], delimiter = ","): string {
  if (!items.length) return "";
  const headerSet = new Set<string>();
  const flat: Array<Record<string, string>> = items.map((it) => {
    const f = flattenItem(it);
    const row: Record<string, string> = {};
    for (const { key, display } of f) {
      headerSet.add(key);
      row[key] = display;
    }
    return row;
  });
  // Order headers using FIELD_ORDER
  const headers = Array.from(headerSet).sort((a, b) => {
    const ai = FIELD_ORDER.indexOf(a);
    const bi = FIELD_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const escape = (s: string) => {
    const needs = s.includes(delimiter) || s.includes("\n") || s.includes('"');
    return needs ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map((h) => escape(prettyLabel(h))).join(delimiter)];
  for (const row of flat) lines.push(headers.map((h) => escape(row[h] ?? "")).join(delimiter));
  return lines.join("\n");
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`Copied ${label}`);
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  payload: unknown;
  opportunities?: unknown;
  rawOutput?: string | null;
  marketContext?: string | null;
  source?: string | null;
  filenameStem?: string;
}

export function ScrapeItemView({ payload, opportunities, rawOutput, marketContext, source, filenameStem = "scrape" }: Props) {
  const [search, setSearch] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const items = useMemo(() => detectItems(payload, opportunities), [payload, opportunities]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((it) => {
      const hay = flattenItem(it).map((f) => `${f.label} ${f.display}`).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const handleCopyField = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(id);
    toast.success("Field copied");
    setTimeout(() => setCopiedField((cur) => (cur === id ? null : cur)), 1200);
  };

  return (
    <Tabs defaultValue="structured" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <TabsList>
          <TabsTrigger value="structured">Structured ({items.length})</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          {marketContext && <TabsTrigger value="context">Context</TabsTrigger>}
          {rawOutput && <TabsTrigger value="raw">Raw</TabsTrigger>}
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => copy(toCSV(items, ","), "as CSV")}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Copy CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => copy(toCSV(items, "\t"), "as TSV (paste into Excel/Sheets)")}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Copy TSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => download(`${filenameStem}.csv`, toCSV(items, ","), "text/csv")}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(items, null, 2), "as JSON")}>
            <FileJson className="h-3.5 w-3.5 mr-1" /> Copy JSON
          </Button>
        </div>
      </div>

      <TabsContent value="structured" className="mt-0">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Filter records by any field…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No structured records detected in this scrape.</div>
          ) : filtered.map((item, idx) => {
            const fields = flattenItem(item);
            const headline = fields.find((f) => ["name", "firm_name", "company_name", "title", "headline"].includes(f.key))?.display
              ?? `Record #${idx + 1}`;
            const itemJson = JSON.stringify(item, null, 2);
            return (
              <Card key={idx} className="p-4 border-slate-200">
                <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{headline}</div>
                    {source && <Badge variant="secondary" className="mt-1 text-[10px]">{source}</Badge>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => copy(itemJson, "record JSON")} title="Copy record JSON">
                      <FileJson className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copy(toCSV([item], "\t"), "record (TSV row)")} title="Copy as TSV row">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                  {fields.map(({ key, label, value, display }) => {
                    const id = `${idx}-${key}`;
                    return (
                      <div key={key} className="group min-w-0">
                        <dt className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">{label}</dt>
                        <dd className="text-sm text-slate-800 mt-0.5 flex items-start gap-2">
                          <div className="min-w-0 flex-1 break-words">
                            {Array.isArray(value) && value.every((v) => typeof v === "string" || typeof v === "number") ? (
                              <div className="flex flex-wrap gap-1">
                                {(value as Array<string | number>).slice(0, 30).map((v, i) => (
                                  <Badge key={i} variant="outline" className="font-normal text-xs">{String(v)}</Badge>
                                ))}
                              </div>
                            ) : isUrl(value) ? (
                              <a href={value as string} target="_blank" rel="noreferrer"
                                 className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all">
                                {display} <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ) : isEmail(value) ? (
                              <a href={`mailto:${value}`} className="text-blue-600 hover:underline break-all">{display}</a>
                            ) : typeof value === "object" ? (
                              <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-2 whitespace-pre-wrap break-words">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              <span className="whitespace-pre-wrap">{display}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopyField(id, display)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 shrink-0 mt-0.5"
                            title="Copy value"
                          >
                            {copiedField === id
                              ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                              : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <div className="rounded-lg border border-slate-200 overflow-auto max-h-[60vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {(() => {
                  const cols = new Set<string>();
                  items.forEach((it) => flattenItem(it).forEach((f) => cols.add(f.key)));
                  const ordered = Array.from(cols).sort((a, b) => {
                    const ai = FIELD_ORDER.indexOf(a); const bi = FIELD_ORDER.indexOf(b);
                    if (ai === -1 && bi === -1) return a.localeCompare(b);
                    if (ai === -1) return 1; if (bi === -1) return -1; return ai - bi;
                  }).slice(0, 10);
                  return ordered.map((k) => (
                    <th key={k} className="text-left px-3 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap">{prettyLabel(k)}</th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const cols = new Set<string>();
                items.forEach((row) => flattenItem(row).forEach((f) => cols.add(f.key)));
                const ordered = Array.from(cols).sort((a, b) => {
                  const ai = FIELD_ORDER.indexOf(a); const bi = FIELD_ORDER.indexOf(b);
                  if (ai === -1 && bi === -1) return a.localeCompare(b);
                  if (ai === -1) return 1; if (bi === -1) return -1; return ai - bi;
                }).slice(0, 10);
                const lookup = Object.fromEntries(flattenItem(it).map((f) => [f.key, f.display]));
                return (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                    {ordered.map((k) => (
                      <td key={k} className="px-3 py-2 text-xs text-slate-700 max-w-[220px] truncate" title={lookup[k] ?? ""}>
                        {lookup[k] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {marketContext && (
        <TabsContent value="context" className="mt-0">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{marketContext}</p>
        </TabsContent>
      )}

      {rawOutput && (
        <TabsContent value="raw" className="mt-0">
          <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">{rawOutput}</pre>
        </TabsContent>
      )}

      <TabsContent value="json" className="mt-0">
        <pre className="text-xs bg-slate-900 text-slate-100 rounded p-3 overflow-auto max-h-[60vh]">
          {JSON.stringify(payload ?? opportunities ?? {}, null, 2)}
        </pre>
      </TabsContent>
    </Tabs>
  );
}
