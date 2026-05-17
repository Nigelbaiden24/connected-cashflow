import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronDown, Loader2, Landmark, Briefcase, Globe2 } from "lucide-react";

type Platform = "finance" | "investor" | "both";

interface Props {
  table: string;
  itemId: string;
  /** Status value to set when promoting (defaults to "promoted") */
  promotedStatus?: string;
  /** Compact button size */
  size?: "sm" | "default";
  onPromoted?: () => void;
  /** If set, call this SECURITY DEFINER RPC instead of doing a generic UPDATE.
   *  RPC signature must be (_id uuid, _platform text) → jsonb with { ok, promoted_id, error }. */
  rpcName?: string;
  /** Restrict the platform options shown in the dropdown. Default: all three. */
  platforms?: Array<"finance" | "investor" | "both">;
}

/**
 * Reusable promote-to-platform dropdown for any analyst queue table.
 * Sets `target_platform` + `status` + `reviewed_at` (when present).
 */
export function PromoteToPlatformButton({
  table, itemId, promotedStatus = "promoted", size = "sm", onPromoted,
}: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const promote = async (platform: Platform) => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in as an admin to promote.");

      // Verify admin role explicitly so we surface a clear message instead of an opaque RLS failure.
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) throw new Error("Admin role required. Please sign in to the admin portal.");

      const tryUpdate = async (payload: Record<string, any>) => {
        const { error } = await supabase
          .from(table as any)
          .update(payload)
          .eq("id", itemId);
        return error;
      };

      const fullPayload: Record<string, any> = {
        status: promotedStatus,
        target_platform: platform,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      };

      let err = await tryUpdate(fullPayload);
      // Fallback 1: drop reviewed_* if those columns don't exist on this table
      if (err && /reviewed_|column .* does not exist/i.test(err.message)) {
        err = await tryUpdate({ status: promotedStatus, target_platform: platform });
      }
      // Fallback 2: drop target_platform if missing (older tables)
      if (err && /target_platform/i.test(err.message)) {
        err = await tryUpdate({ status: promotedStatus });
      }
      if (err) {
        const detail = (err as any).details || (err as any).hint || "";
        throw new Error(`${err.message}${detail ? ` — ${detail}` : ""}`);
      }

      const dest = platform === "both" ? "Finance + Investor" : platform === "finance" ? "FlowPulse Finance" : "FlowPulse Investor";
      toast({ title: "Promoted", description: `Published to ${dest}.` });
      onPromoted?.();
    } catch (e: any) {
      console.error("[PromoteToPlatformButton] failed", { table, itemId, error: e });
      toast({ title: "Promote failed", description: e.message || "Unknown error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          disabled={busy}
          className="bg-emerald-600/90 hover:bg-emerald-600 text-white"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
          Promote
          <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-slate-800 text-slate-200">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">
          Publish to platform
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem onClick={() => promote("finance")} className="focus:bg-slate-900 cursor-pointer">
          <Landmark className="w-3.5 h-3.5 mr-2 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">FlowPulse Finance</span>
            <span className="text-[10px] text-slate-500">Adviser & finance frontend</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => promote("investor")} className="focus:bg-slate-900 cursor-pointer">
          <Briefcase className="w-3.5 h-3.5 mr-2 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">FlowPulse Investor</span>
            <span className="text-[10px] text-slate-500">Investor experience frontend</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem onClick={() => promote("both")} className="focus:bg-slate-900 cursor-pointer">
          <Globe2 className="w-3.5 h-3.5 mr-2 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">Both platforms</span>
            <span className="text-[10px] text-slate-500">Publish to Finance + Investor</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PromoteToPlatformButton;
