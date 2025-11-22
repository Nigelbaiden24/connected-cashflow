import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, ArrowLeft, Edit, Trash2, Download, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
  });
  const [integratedEvents, setIntegratedEvents] = useState<any[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchMeetings();
    checkCalendarConnections();
    fetchIntegratedEvents();

    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-calendar-connected') {
        setGoogleConnected(true);
        fetchIntegratedEvents();
        toast({
          title: "Success",
          description: `Google Calendar connected: ${event.data.email}`,
        });
      } else if (event.data?.type === 'outlook-calendar-connected') {
        setOutlookConnected(true);
        fetchIntegratedEvents();
        toast({
          title: "Success",
          description: `Outlook Calendar connected: ${event.data.email}`,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkCalendarConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("calendar_connections")
      .select("provider")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (data) {
      setGoogleConnected(data.some(c => c.provider === 'google'));
      setOutlookConnected(data.some(c => c.provider === 'outlook'));
    }
  };

  const fetchIntegratedEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated, skipping integrated events fetch');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-calendar-events');

      if (error) {
        console.error('Error fetching integrated events:', error);
        return;
      }

      if (data?.events) {
        setIntegratedEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch integrated events:', error);
    }
  };

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("client_meetings")
      .select("*")
      .eq("client_id", user.id)
      .order("meeting_date", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
      return;
    }

    if (data) {
      const formattedEvents = data.map((meeting) => ({
        id: meeting.id,
        title: meeting.agenda?.[0] || "Meeting",
        time: format(new Date(meeting.meeting_date), "HH:mm"),
        date: format(new Date(meeting.meeting_date), "yyyy-MM-dd"),
        type: meeting.meeting_type || "meeting",
        description: meeting.notes || "",
        provider: 'local',
      }));
      setEvents(formattedEvents);
    }
  };

  const handleConnectGoogle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Google Calendar.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth');

      if (error || !data?.authUrl) {
        console.error('Error details:', error);
        throw new Error('Failed to get authorization URL');
      }

      window.open(data.authUrl, 'google-calendar-auth', 'width=600,height=700');
    } catch (error: any) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect Google Calendar. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectOutlook = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('outlook-calendar-auth');

      if (error || !data?.authUrl) {
        throw new Error('Failed to get authorization URL');
      }

      window.open(data.authUrl, 'outlook-calendar-auth', 'width=600,height=700');
    } catch (error) {
      console.error('Error connecting Outlook Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to connect Outlook Calendar. Please ensure API credentials are configured.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create events",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = formData.time.split(":");
    const meetingDateTime = new Date(formData.date);
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const { error } = await supabase.from("client_meetings").insert({
      client_id: user.id,
      meeting_date: meetingDateTime.toISOString(),
      duration_minutes: 60,
      meeting_type: formData.type,
      status: "Scheduled",
      notes: formData.description,
      agenda: [formData.title],
    });

    if (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Event created successfully",
    });
    setDialogOpen(false);
    setFormData({
      title: "",
      date: "",
      time: "",
      type: "meeting",
      description: "",
    });
    fetchMeetings();
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = formData.time.split(":");
    const meetingDateTime = new Date(formData.date);
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const { error } = await supabase
      .from("client_meetings")
      .update({
        meeting_date: meetingDateTime.toISOString(),
        meeting_type: formData.type,
        notes: formData.description,
        agenda: [formData.title],
      })
      .eq("id", selectedEvent.id);

    if (error) {
      console.error("Error updating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Event updated successfully",
    });
    setEditDialogOpen(false);
    setSelectedEvent(null);
    setFormData({
      title: "",
      date: "",
      time: "",
      type: "meeting",
      description: "",
    });
    fetchMeetings();
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase
      .from("client_meetings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Event deleted successfully",
    });
    setEditDialogOpen(false);
    setSelectedEvent(null);
    fetchMeetings();
  };

  const handleEditEvent = (event: typeof events[0]) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      description: "",
    });
    setEditDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setFormData({
      title: "",
      date: dateStr,
      time: "",
      type: "meeting",
      description: "",
    });
    setDialogOpen(true);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  
  const calendarDays: (Date | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...daysInMonth
  ];

  const getEventColor = (type: string, provider?: string) => {
    if (provider === 'google') return "bg-blue-100 text-blue-800 border-blue-200";
    if (provider === 'outlook') return "bg-orange-100 text-orange-800 border-orange-200";
    
    switch (type) {
      case "meeting":
        return "bg-primary text-primary-foreground";
      case "presentation":
        return "bg-warning text-warning-foreground";
      case "deadline":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const allEvents = [...events, ...integratedEvents];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Connect Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Connect External Calendars</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync your FlowPulse calendar with Google Calendar or Outlook
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Google Calendar</h4>
                      {googleConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <Button 
                      variant={googleConnected ? "secondary" : "outline"} 
                      className="w-full"
                      onClick={handleConnectGoogle}
                      disabled={isConnecting || googleConnected}
                    >
                      {googleConnected ? "Connected" : "Connect Google Calendar"}
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Outlook Calendar</h4>
                      {outlookConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <Button 
                      variant={outlookConnected ? "secondary" : "outline"} 
                      className="w-full"
                      onClick={handleConnectOutlook}
                      disabled={isConnecting || outlookConnected}
                    >
                      {outlookConnected ? "Connected" : "Connect Outlook Calendar"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once connected, your meetings will automatically sync across all platforms.
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEvent}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="aspect-square p-2" />;
                }
                
                const hasEvent = allEvents.some(e => {
                  const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
                  return isSameDay(eventDate, day);
                });
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-2 rounded-lg hover:bg-accent transition-colors text-sm ${
                      isToday ? 'bg-primary text-primary-foreground font-bold' : ''
                    } ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''} ${
                      hasEvent && !isToday ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allEvents
              .filter((event) => {
                const eventDate = event.provider === 'local' ? new Date(event.date) : new Date(event.start);
                return eventDate >= new Date();
              })
              .sort((a, b) => {
                const dateA = a.provider === 'local' ? new Date(a.date) : new Date(a.start);
                const dateB = b.provider === 'local' ? new Date(b.date) : new Date(b.start);
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 10)
              .map((event) => {
                const isLocal = event.provider === 'local';
                const eventDate = isLocal ? new Date(event.date) : new Date(event.start);
                const eventTime = isLocal ? event.time : format(new Date(event.start), "HH:mm");
                
                return (
                  <div key={event.id} className="space-y-2 pb-4 border-b last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{eventTime}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(eventDate, 'PPP')}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground">
                            📍 {event.location}
                          </p>
                        )}
                        {event.email && (
                          <p className="text-xs text-muted-foreground">
                            {event.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEventColor(event.type, event.provider)}>
                          {event.provider === 'google' ? 'Google' : event.provider === 'outlook' ? 'Outlook' : event.type}
                        </Badge>
                        {isLocal && (
                          <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateEvent}>Update Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
