import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MeetingSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function MeetingScheduler({ open, onOpenChange, clientId, clientName }: MeetingSchedulerProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("14:00");
  const [duration, setDuration] = useState("60");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScheduleMeeting = async () => {
    if (!date || !time || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = time.split(':');
      const meetingDateTime = new Date(date);
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('client_meetings')
        .insert({
          client_id: clientId,
          meeting_date: meetingDateTime.toISOString(),
          duration_minutes: parseInt(duration),
          meeting_type: 'Call',
          status: 'Scheduled',
          notes: title,
        });

      if (error) throw error;

      toast.success(`Meeting scheduled with ${clientName} for ${format(meetingDateTime, 'PPP')} at ${time}`);
      onOpenChange(false);
      
      // Reset form
      setDate(undefined);
      setTime("14:00");
      setDuration("60");
      setTitle("");
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error("Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Call with {clientName}</DialogTitle>
          <DialogDescription>
            Choose a date and time for your call. The meeting will be added to your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Portfolio Review Call"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleScheduleMeeting} disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Call"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
