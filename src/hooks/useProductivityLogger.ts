import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type ActionType = 
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "time_block_created"
  | "time_block_updated"
  | "time_block_completed"
  | "time_block_deleted"
  | "focus_started"
  | "focus_paused"
  | "focus_ended"
  | "target_created"
  | "target_updated"
  | "target_achieved"
  | "note_added"
  | "session_started"
  | "session_ended"
  | "item_viewed"
  | "report_uploaded"
  | "calendar_event_created";

interface LogActionParams {
  actionType: ActionType;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Json;
}

export function useProductivityLogger() {
  const logAction = useCallback(async ({
    actionType,
    description,
    entityType,
    entityId,
    metadata = {},
  }: LogActionParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("admin_productivity_logs").insert([{
        user_id: user.id,
        action_type: actionType,
        action_description: description,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata,
      }]);
    } catch (error) {
      console.error("Error logging productivity action:", error);
    }
  }, []);

  return { logAction };
}
