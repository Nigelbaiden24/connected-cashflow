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

      // Fetch upcoming meetings
      const { data: meetingsData } = await supabase
        .from('client_meetings')
        .select('id, meeting_date, meeting_type, location, clients(name)')
        .gte('meeting_date', today)
        .lte('meeting_date', threeDaysLater)
        .order('meeting_date', { ascending: true })
        .limit(3);

      // Fetch today's tasks
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-2xl font-bold">{meetings.length}</div>
            <div className="text-xs text-muted-foreground">Upcoming Meetings</div>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="text-2xl font-bold">{todayTasks}</div>
            <div className="text-xs text-muted-foreground">Tasks Due Today</div>
          </div>
        </div>

        {/* Next 3 meetings */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Next 3 Days</p>
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
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {meeting.clients?.name || 'Client Meeting'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(meeting.meeting_date), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
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
