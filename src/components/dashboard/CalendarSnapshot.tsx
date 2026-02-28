import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";

interface Meeting {
  id: string;
  meeting_date: string;
  meeting_type: string;
  location: string | null;
  clients: { name: string } | null;
}

export function CalendarSnapshot() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [todayTasks, setTodayTasks] = useState(0);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: meetingsData } = await supabase
        .from('client_meetings')
        .select('id, meeting_date, meeting_type, location, clients(name)')
        .gte('meeting_date', today)
        .lte('meeting_date', threeDaysLater)
        .order('meeting_date', { ascending: true })
        .limit(3);

      const { data: tasksData } = await supabase
        .from('advisor_tasks')
        .select('id')
        .eq('user_id', user.user.id)
        .lte('due_date', today)
        .in('status', ['pending', 'in_progress']);

      setMeetings(meetingsData || []);
      setTodayTasks(tasksData?.length || 0);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const getMeetingIcon = (type: string) => {
    if (type === 'virtual' || type === 'video') return Video;
    if (type === 'in_person') return MapPin;
    return Calendar;
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Calendar className="h-4 w-4 text-violet-500" />
          </div>
          Calendar Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm">
            <div className="text-2xl font-bold tracking-tight">{meetings.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Upcoming Meetings</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm">
            <div className="text-2xl font-bold tracking-tight">{todayTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">Tasks Due Today</div>
          </div>
        </div>

        {/* Next 3 meetings */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next 3 Days</p>
          {meetings.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No upcoming meetings
            </div>
          ) : (
            meetings.map((meeting) => {
              const Icon = getMeetingIcon(meeting.meeting_type);
              return (
                <div
                  key={meeting.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:border-primary/20 cursor-pointer transition-all duration-300 group"
                >
                  <div className="p-1.5 rounded-lg bg-muted/50">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {meeting.clients?.name || 'Client Meeting'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(meeting.meeting_date), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                  <Badge className="bg-muted/50 text-muted-foreground border-border/50 text-xs">
                    {meeting.meeting_type}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
