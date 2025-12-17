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
    <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-muted-foreground mt-1">Manage your schedule and events</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 hover:border-primary/50">
                <Download className="h-4 w-4" />
                Connect Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card/95 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Connect External Calendars</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync your FlowPulse calendar with Google Calendar or Outlook
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="p-4 border rounded-xl space-y-3 bg-gradient-to-r from-blue-500/5 to-blue-500/10 border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Google Calendar</h4>
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
                  <div className="p-4 border rounded-xl space-y-3 bg-gradient-to-r from-orange-500/5 to-orange-500/10 border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Outlook Calendar</h4>
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
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background/50">
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
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEvent} className="bg-gradient-to-r from-primary to-primary/80">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Today's Events</div>
                <div className="text-2xl font-bold">{allEvents.filter(e => {
                  const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
                  return isSameDay(eventDate, new Date());
                }).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="text-2xl font-bold">{allEvents.filter(e => {
                  const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
                  const weekFromNow = new Date();
                  weekFromNow.setDate(weekFromNow.getDate() + 7);
                  return eventDate >= new Date() && eventDate <= weekFromNow;
                }).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/20">
                <CalendarIcon className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-2xl font-bold">{allEvents.filter(e => {
                  const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
                  return isSameMonth(eventDate, currentDate);
                }).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Synced Calendars</div>
                <div className="text-2xl font-bold">{(googleConnected ? 1 : 0) + (outlookConnected ? 1 : 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth} className="hover:bg-primary/10 hover:border-primary/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth} className="hover:bg-primary/10 hover:border-primary/30">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-primary py-3 bg-primary/5 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="aspect-square p-2" />;
                }
                
                const dayEvents = allEvents.filter(e => {
                  const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
                  return isSameDay(eventDate, day);
                });
                const hasEvent = dayEvents.length > 0;
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-2 rounded-xl transition-all duration-200 text-sm relative group hover:scale-105 ${
                      isToday 
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg shadow-primary/30' 
                        : hasEvent 
                          ? 'bg-primary/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/20' 
                          : 'hover:bg-muted/50 border border-transparent hover:border-border'
                    } ${!isCurrentMonth ? 'text-muted-foreground opacity-40' : ''}`}
                  >
                    <span className="relative z-10">{format(day, 'd')}</span>
                    {hasEvent && !isToday && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                    {isToday && hasEvent && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-success/10">
                <CalendarIcon className="h-5 w-5 text-success" />
              </div>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 max-h-[600px] overflow-y-auto">
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
              .map((event, index) => {
                const isLocal = event.provider === 'local';
                const eventDate = isLocal ? new Date(event.date) : new Date(event.start);
                const eventTime = isLocal ? event.time : format(new Date(event.start), "HH:mm");
                
                return (
                  <div 
                    key={event.id} 
                    className="p-4 rounded-xl border bg-gradient-to-r from-card to-muted/30 hover:shadow-md transition-all duration-200 hover:border-primary/30"
                    style={{ animationDelay: `${index * 50}ms`, animation: 'fade-in 0.3s ease-out' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <h4 className="font-bold text-base">{event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(eventDate, 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{eventTime}</Badge>
                        </div>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${getEventColor(event.type, event.provider)} text-xs`}>
                          {event.provider === 'google' ? 'Google' : event.provider === 'outlook' ? 'Outlook' : event.type}
                        </Badge>
                        {isLocal && (
                          <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)} className="h-8 w-8 hover:bg-primary/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {allEvents.filter(e => {
              const eventDate = e.provider === 'local' ? new Date(e.date) : new Date(e.start);
              return eventDate >= new Date();
            }).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming events</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
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
