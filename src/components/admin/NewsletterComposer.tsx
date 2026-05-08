import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Eye, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { ContentTargetSelector, type ContentTarget } from "./ContentTargetSelector";

type TemplateId = "market_brief" | "deal_spotlight" | "weekly_roundup" | "featured_picks";

const TEMPLATES: { id: TemplateId; label: string; tagline: string; accent: string }[] = [
  { id: "market_brief", label: "Market Brief", tagline: "Macro & sector pulse", accent: "#1e40af" },
  { id: "deal_spotlight", label: "Deal Spotlight", tagline: "One deep-dive opportunity", accent: "#9333ea" },
  { id: "weekly_roundup", label: "Weekly Roundup", tagline: "Top stories of the week", accent: "#0d9488" },
  { id: "featured_picks", label: "Featured Picks", tagline: "Curated analyst picks", accent: "#c9a84c" },
];

const BRAND = {
  name: "FlowPulse",
  url: "https://flowpulse.co.uk",
  logoText: "FP",
  fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
};

function renderTemplate(t: TemplateId, fields: Record<string, string>, accent: string): string {
  const headline = fields.headline || "Headline goes here";
  const subhead = fields.subhead || "Supporting subheading with the key takeaway.";
  const body = (fields.body || "Write your main content here.").replace(/\n/g, "<br/>");
  const cta = fields.cta || "Read full briefing";
  const ctaUrl = fields.ctaUrl || BRAND.url;
  const author = fields.author || "FlowPulse Research";
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const header = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${accent};padding:28px 32px;">
      <tr>
        <td>
          <table role="presentation"><tr>
            <td style="background:#fff;color:${accent};font-weight:800;font-size:18px;width:42px;height:42px;border-radius:10px;text-align:center;line-height:42px;font-family:${BRAND.fontStack};">${BRAND.logoText}</td>
            <td style="padding-left:14px;color:#fff;font-family:${BRAND.fontStack};">
              <div style="font-weight:700;font-size:16px;letter-spacing:.3px;">${BRAND.name}</div>
              <div style="font-size:11px;opacity:.85;text-transform:uppercase;letter-spacing:1.5px;">${TEMPLATES.find(x=>x.id===t)?.label}</div>
            </td>
          </tr></table>
        </td>
        <td align="right" style="color:#fff;font-family:${BRAND.fontStack};font-size:12px;opacity:.9;">${dateStr}</td>
      </tr>
    </table>`;

  const footer = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:24px 32px;color:#cbd5e1;font-family:${BRAND.fontStack};font-size:12px;">
      <tr><td>
        <div style="color:#fff;font-weight:600;margin-bottom:4px;">${BRAND.name}</div>
        <div>Institutional-grade market intelligence.</div>
        <div style="margin-top:10px;"><a href="${BRAND.url}" style="color:#93c5fd;text-decoration:none;">${BRAND.url}</a></div>
      </td></tr>
    </table>`;

  let body_html = "";
  if (t === "market_brief") {
    body_html = `
      <h1 style="font-family:${BRAND.fontStack};font-size:28px;line-height:1.2;color:#0f172a;margin:0 0 8px;">${headline}</h1>
      <p style="font-family:${BRAND.fontStack};font-size:15px;color:#475569;margin:0 0 24px;">${subhead}</p>
      <div style="height:3px;width:48px;background:${accent};margin-bottom:24px;"></div>
      <div style="font-family:${BRAND.fontStack};font-size:15px;line-height:1.7;color:#1e293b;">${body}</div>`;
  } else if (t === "deal_spotlight") {
    body_html = `
      <div style="display:inline-block;padding:4px 10px;background:${accent}1a;color:${accent};font-family:${BRAND.fontStack};font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:700;border-radius:4px;margin-bottom:14px;">Deal Spotlight</div>
      <h1 style="font-family:${BRAND.fontStack};font-size:30px;line-height:1.15;color:#0f172a;margin:0 0 10px;">${headline}</h1>
      <p style="font-family:${BRAND.fontStack};font-size:16px;color:#475569;margin:0 0 24px;font-style:italic;">${subhead}</p>
      <div style="font-family:${BRAND.fontStack};font-size:15px;line-height:1.75;color:#1e293b;border-left:4px solid ${accent};padding-left:20px;">${body}</div>`;
  } else if (t === "weekly_roundup") {
    body_html = `
      <h1 style="font-family:${BRAND.fontStack};font-size:26px;line-height:1.2;color:#0f172a;margin:0 0 6px;">${headline}</h1>
      <p style="font-family:${BRAND.fontStack};font-size:14px;color:#64748b;margin:0 0 22px;">${subhead}</p>
      <div style="font-family:${BRAND.fontStack};font-size:15px;line-height:1.75;color:#1e293b;">${body}</div>`;
  } else {
    body_html = `
      <div style="text-align:center;font-family:${BRAND.fontStack};">
        <div style="display:inline-block;padding:6px 14px;background:${accent};color:#0f172a;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:800;border-radius:999px;margin-bottom:18px;">★ Featured Picks</div>
        <h1 style="font-size:32px;line-height:1.15;color:#0f172a;margin:0 0 10px;">${headline}</h1>
        <p style="font-size:15px;color:#475569;margin:0 0 28px;">${subhead}</p>
      </div>
      <div style="font-family:${BRAND.fontStack};font-size:15px;line-height:1.75;color:#1e293b;">${body}</div>`;
  }

  const ctaBlock = `
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${ctaUrl}" style="display:inline-block;background:${accent};color:#fff;font-family:${BRAND.fontStack};font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;text-decoration:none;">${cta} →</a>
    </div>
    <p style="font-family:${BRAND.fontStack};font-size:12px;color:#94a3b8;text-align:center;margin:18px 0 0;">— ${author}</p>`;

  return `
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
    ${header}
    <div style="padding:34px 36px 12px;">${body_html}${ctaBlock}</div>
    ${footer}
  </div>`;
}

export function NewsletterComposer() {
  const [tpl, setTpl] = useState<TemplateId>("market_brief");
  const [accent, setAccent] = useState<string>(TEMPLATES[0].accent);
  const [target, setTarget] = useState<ContentTarget>({ platform: "all", selectedUsers: [], allUsers: true });
  const [fields, setFields] = useState<Record<string, string>>({
    headline: "", subhead: "", body: "", cta: "Read on FlowPulse", ctaUrl: BRAND.url, author: "FlowPulse Research",
  });
  const [saving, setSaving] = useState(false);

  const html = useMemo(() => renderTemplate(tpl, fields, accent), [tpl, fields, accent]);
  const safeHtml = useMemo(() => DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }), [html]);

  const pickTemplate = (id: TemplateId) => {
    setTpl(id);
    const t = TEMPLATES.find((x) => x.id === id)!;
    setAccent(t.accent);
  };

  const save = async () => {
    if (!fields.headline.trim()) {
      toast.error("Add a headline first");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const blob = new Blob([`<!doctype html><html><body style="background:#f8fafc;padding:24px 0;">${html}</body></html>`], { type: "text/html" });
      const filePath = `composed/${Date.now()}-${fields.headline.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60)}.html`;
      const { error: upErr } = await supabase.storage.from("newsletters").upload(filePath, blob, { contentType: "text/html", upsert: false });
      if (upErr) throw upErr;

      const { error } = await supabase.from("newsletters").insert({
        title: fields.headline,
        preview: fields.subhead || fields.body.slice(0, 160),
        content: html,
        file_path: filePath,
        category: target.platform === "investor" ? "investor" : "sector",
        edition: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        read_time: `${Math.max(2, Math.round(fields.body.length / 1200))} min read`,
        published_date: new Date().toISOString(),
        uploaded_by: user?.id || null,
      });
      if (error) throw error;
      toast.success("Newsletter composed and published");
      setFields({ headline: "", subhead: "", body: "", cta: "Read on FlowPulse", ctaUrl: BRAND.url, author: "FlowPulse Research" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to publish newsletter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-secondary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
          <Mail className="h-6 w-6 text-secondary" /> Compose Branded Newsletter
        </CardTitle>
        <CardDescription className="text-slate-500">
          Pick a FlowPulse-branded template, fill in the fields, preview it live, and publish.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-wide text-slate-500">Template</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTemplate(t.id)}
                className={`text-left rounded-lg border p-3 transition-all ${tpl === t.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="h-2 w-12 rounded-full mb-2" style={{ background: t.accent }} />
                <div className="font-semibold text-sm text-slate-900">{t.label}</div>
                <div className="text-xs text-slate-500">{t.tagline}</div>
                {tpl === t.id && <Badge variant="secondary" className="mt-2 text-[10px]">Selected</Badge>}
              </button>
            ))}
          </div>
        </div>

        <ContentTargetSelector
          selectedPlatform={target.platform}
          onPlatformChange={(platform) => setTarget({ ...target, platform })}
          selectedUsers={target.selectedUsers}
          onUsersChange={(users) => setTarget({ ...target, selectedUsers: users })}
          allUsersSelected={target.allUsers}
          onAllUsersChange={(allUsers) => setTarget({ ...target, allUsers })}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <Label>Headline *</Label>
              <Input value={fields.headline} onChange={(e) => setFields({ ...fields, headline: e.target.value })} placeholder="Q2 macro: rates roll over" />
            </div>
            <div>
              <Label>Subhead</Label>
              <Input value={fields.subhead} onChange={(e) => setFields({ ...fields, subhead: e.target.value })} placeholder="Supporting line with the key takeaway" />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={9} value={fields.body} onChange={(e) => setFields({ ...fields, body: e.target.value })} placeholder="Write your newsletter content. Line breaks are preserved." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CTA label</Label>
                <Input value={fields.cta} onChange={(e) => setFields({ ...fields, cta: e.target.value })} />
              </div>
              <div>
                <Label>CTA URL</Label>
                <Input value={fields.ctaUrl} onChange={(e) => setFields({ ...fields, ctaUrl: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Author / signoff</Label>
                <Input value={fields.author} onChange={(e) => setFields({ ...fields, author: e.target.value })} />
              </div>
              <div>
                <Label>Accent colour</Label>
                <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 p-1" />
              </div>
            </div>
            <Button onClick={save} disabled={saving} className="w-full mt-2">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Newsletter
            </Button>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2"><Eye className="h-4 w-4" /> Live preview</Label>
            <div className="rounded-lg bg-slate-100 p-4 max-h-[640px] overflow-auto border">
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewsletterComposer;
