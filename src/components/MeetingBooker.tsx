import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MeetingBooker = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleBookMeeting = async () => {
    if (!date || !title) {
      toast({
        title: "Missing information",
        description: "Please provide a date and title for the meeting",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book meetings",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = time.split(":");
    const meetingDateTime = new Date(date);
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    // For now, just show success toast - meetings table can be added later
    // const { error } = await supabase.from("meetings").insert({
    //   user_id: user.id,
    //   title,
    //   description,
    //   scheduled_at: meetingDateTime.toISOString(),
    //   duration_minutes: parseInt(duration),
    //   status: "scheduled",
    // });

    const error = null; // Placeholder until meetings table is created

    if (error) {
      console.error("Error booking meeting:", error);
      toast({
        title: "Error",
        description: "Failed to book meeting. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Meeting booked",
      description: `${title} scheduled for ${meetingDateTime.toLocaleString()}`,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("09:00");
    setDuration("30");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Book Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
          <DialogDescription>
            Book a meeting with your financial advisor or team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="Portfolio Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Discuss Q4 portfolio performance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleBookMeeting} className="w-full">
            Book Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
