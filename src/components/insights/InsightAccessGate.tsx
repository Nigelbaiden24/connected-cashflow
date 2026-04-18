import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "fp_insights_access_v1";

interface StoredAccess {
  unlockedAt: string;
  email: string;
  fullName: string;
}

export function getStoredInsightAccess(): StoredAccess | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAccess;
  } catch {
    return null;
  }
}

const accessSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

interface InsightAccessGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked: () => void;
  reportId?: string;
  reportTitle?: string;
  category?: string;
  sourcePage?: string;
}

export function InsightAccessGate({
  open,
  onOpenChange,
  onUnlocked,
  reportId,
  reportTitle,
  category,
  sourcePage,
}: InsightAccessGateProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = accessSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("report_access_requests").insert({
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        job_title: parsed.data.jobTitle || null,
        reason: parsed.data.reason || null,
        report_id: reportId ?? null,
        report_title: reportTitle ?? null,
        category: category ?? null,
        source_page: sourcePage ?? (typeof window !== "undefined" ? window.location.pathname : null),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error) throw error;

      const stored: StoredAccess = {
        unlockedAt: new Date().toISOString(),
        email: parsed.data.email,
        fullName: parsed.data.fullName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      toast.success("Access granted — enjoy the Insights library");
      onUnlocked();
      onOpenChange(false);
    } catch (err) {
      console.error("Insight access request failed", err);
      toast.error("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">Unlock the Insights Library</DialogTitle>
          <DialogDescription className="text-center">
            {reportTitle
              ? <>Tell us a little about yourself to access <span className="font-medium text-foreground">{reportTitle}</span> and the rest of our research.</>
              : "Tell us a little about yourself to access our institutional-grade research library."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name *</Label>
              <Input id="fullName" required value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email *</Label>
              <Input id="email" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@firm.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="FlowPulse Capital" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="Portfolio Manager" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+44 ..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">What are you looking for? (optional)</Label>
            <Textarea id="reason" rows={3} value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Sector research on private markets, ESG screening, etc." />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Your details are sent securely to the FlowPulse team. We&apos;ll only use them to follow up about the research you requested.</span>
          </div>

          <Button type="submit" disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Get instant access
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook helper: returns whether the visitor has unlocked Insights and a setter
 * to flip the state when the gate is satisfied.
 */
export function useInsightAccess() {
  const [unlocked, setUnlocked] = useState<boolean>(() => !!getStoredInsightAccess());
  useEffect(() => {
    const handler = () => setUnlocked(!!getStoredInsightAccess());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const stored = useMemo(() => getStoredInsightAccess(), [unlocked]);
  return { unlocked, setUnlocked, stored };
}
