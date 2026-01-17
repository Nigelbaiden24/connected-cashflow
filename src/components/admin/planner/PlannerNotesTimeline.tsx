import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlannerNote {
  id: string;
  note_text: string;
  created_at: string;
}

interface PlannerNotesTimelineProps {
  plannerItemId: string | null;
}

export function PlannerNotesTimeline({ plannerItemId }: PlannerNotesTimelineProps) {
  const [notes, setNotes] = useState<PlannerNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (plannerItemId) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [plannerItemId]);

  const fetchNotes = async () => {
    if (!plannerItemId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_planner_notes")
        .select("id, note_text, created_at")
        .eq("planner_item_id", plannerItemId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !plannerItemId) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_planner_notes")
        .insert({
          planner_item_id: plannerItemId,
          note_text: newNote.trim(),
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Note added");
      setNewNote("");
      fetchNotes();
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast.error(error.message || "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;

    try {
      const { error } = await supabase
        .from("admin_planner_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
      toast.success("Note deleted");
      fetchNotes();
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  if (!plannerItemId) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Save this item first to add progress notes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new note */}
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a progress note..."
          rows={2}
          className="resize-none"
        />
        <Button
          size="sm"
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          className="gap-2"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Note
        </Button>
      </div>

      {/* Notes timeline */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Progress History ({notes.length})
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No notes yet. Add your first progress update above.
          </p>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3 pt-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="relative pl-4 border-l-2 border-muted pb-3 group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                  
                  {/* Note content */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
