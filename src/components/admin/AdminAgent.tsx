import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Check, Loader2, Send, Trash2, X, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Proposal {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  state?: "pending" | "running" | "done" | "failed" | "dismissed";
  outcome?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  activity?: string[];
  proposals?: Proposal[];
}

const STORAGE_KEY = "flowpulse-admin-agent-v1";

const ACTIVITY_LABEL: Record<string, string> = {
  platform_status: "Checked platform status",
  ai_usage: "Checked AI usage",
  query_table: "Looked up records",
  count_rows: "Counted records",
  find_users: "Searched users",
};

const SUGGESTIONS = [
  "What needs my attention today?",
  "Why did the last pipeline run fail?",
  "How much AI have we used this week, and where?",
  "Show research reports waiting in draft",
];

const loadHistory = (): ChatMessage[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
};

interface Props {
  activeTab: string;
  onOpenTab: (tab: string) => void;
}

export function AdminAgent({ activeTab, onOpenTab }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [deep, setDeep] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch { /* storage unavailable */ }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async (history: ChatMessage[]) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-agent", {
        body: {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          context: activeTab,
          deep,
        },
      });
      if (error) throw error;
      const d = data as { reply?: string; error?: string; proposals?: Proposal[]; ui_actions?: { type: string; tab?: string }[]; activity?: string[] };
      if (d.error) throw new Error(d.error);
      for (const a of d.ui_actions ?? []) if (a.type === "open_tab" && a.tab) onOpenTab(a.tab);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: d.reply || (d.proposals?.length ? "Here's what I'd do — confirm below." : "Done."),
        activity: d.activity,
        proposals: (d.proposals ?? []).map((p) => ({ ...p, state: "pending" })),
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry — that didn't work: ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    void ask(next);
  };

  const updateProposal = (msgIndex: number, id: string, patch: Partial<Proposal>) =>
    setMessages((prev) => prev.map((m, i) => i !== msgIndex ? m : {
      ...m, proposals: m.proposals?.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const confirm = async (msgIndex: number, p: Proposal) => {
    updateProposal(msgIndex, p.id, { state: "running" });
    try {
      const { data, error } = await supabase.functions.invoke("admin-agent", { body: { execute: { tool: p.tool, args: p.args } } });
      if (error) throw error;
      const d = data as { ok: boolean; error?: string; result?: unknown };
      if (!d.ok) throw new Error(d.error ?? "Failed");
      const outcome = typeof d.result === "object" ? JSON.stringify(d.result).slice(0, 300) : String(d.result ?? "");
      updateProposal(msgIndex, p.id, { state: "done", outcome });
      // Tell the agent what happened so it can follow up in context.
      setMessages((prev) => [...prev, { role: "user", content: `[Confirmed and executed: ${p.summary}. Result: ${outcome}]` }]);
    } catch (e) {
      const msg = (e as Error).message;
      updateProposal(msgIndex, p.id, { state: "failed", outcome: msg });
      setMessages((prev) => [...prev, { role: "user", content: `[Tried to execute: ${p.summary}. It failed: ${msg}]` }]);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-12 rounded-full px-5 shadow-lg gap-2"
        aria-label="Open FlowPulse Agent"
      >
        <Bot className="h-5 w-5" /> <span className="hidden sm:inline">FlowPulse Agent</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b">
            <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> FlowPulse Agent</SheetTitle>
            <SheetDescription>
              Your operations copilot. It checks live data, explains what's happening and proposes actions — nothing changes until you confirm.
            </SheetDescription>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch id="agent-deep" checked={deep} onCheckedChange={setDeep} />
                <Label htmlFor="agent-deep" className="text-xs text-muted-foreground">Deep reasoning (slower, more credits)</Label>
              </div>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="h-7 text-xs gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="block w-full text-left text-sm rounded-lg border px-3 py-2 hover:bg-muted transition-colors">
                    <Sparkles className="inline h-3.5 w-3.5 mr-2 text-primary" />{s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              m.role === "user" ? (
                m.content.startsWith("[") ? (
                  <p key={i} className="text-xs text-muted-foreground italic">{m.content.slice(1, -1)}</p>
                ) : (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2 text-sm whitespace-pre-wrap">{m.content}</div>
                )
              ) : (
                <div key={i} className="space-y-2">
                  {m.activity?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(m.activity)].map((a) => (
                        <Badge key={a} variant="secondary" className="text-[10px] gap-1"><Search className="h-3 w-3" />{ACTIVITY_LABEL[a] ?? a}</Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {m.proposals?.map((p) => (
                    <div key={p.id} className="rounded-lg border bg-muted/40 p-3 space-y-2">
                      <p className="text-sm font-medium">{p.summary}</p>
                      {p.state === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" className="h-8 gap-1" onClick={() => confirm(i, p)}><Check className="h-4 w-4" /> Confirm</Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => updateProposal(i, p.id, { state: "dismissed" })}><X className="h-4 w-4" /> Dismiss</Button>
                        </div>
                      )}
                      {p.state === "running" && <p className="text-xs flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…</p>}
                      {p.state === "done" && <p className="text-xs text-emerald-600">Done{p.outcome ? ` — ${p.outcome}` : ""}</p>}
                      {p.state === "failed" && <p className="text-xs text-destructive">Failed — {p.outcome}</p>}
                      {p.state === "dismissed" && <p className="text-xs text-muted-foreground">Dismissed</p>}
                    </div>
                  ))}
                </div>
              )
            ))}
            {busy && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form
            className="border-t p-3 flex gap-2"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about FlowPulse, or tell me what to do…"
              className="min-h-[44px] max-h-40 resize-none"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AdminAgent;
