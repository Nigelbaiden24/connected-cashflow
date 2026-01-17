import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Download, CheckCircle2, RefreshCw, Unlink, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CalendarColorLegend, getEventCategory, getEventDotColor, EVENT_CATEGORIES } from "@/components/calendar/CalendarColorLegend";
import { cn } from "@/lib/utils";
export function AdminCalendar() {
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);

  const isEmbeddedPreview = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  useEffect(() => {
    fetchMeetings();
    checkCalendarConnections();
    fetchIntegratedEvents();

    const refreshConnectionsAndEvents = () => {
      checkCalendarConnections();
      fetchIntegratedEvents();
    };

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
    window.addEventListener('focus', refreshConnectionsAndEvents);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshConnectionsAndEvents();
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', refreshConnectionsAndEvents);
    };
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

  const fetchIntegratedEvents = async (showToast = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (showToast) setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-calendar-events');

      if (error) {
        console.error('Error fetching integrated events:', error);
        if (showToast) {
          toast({
            title: "Sync Error",
            description: "Failed to sync calendar events. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.events) {
        setIntegratedEvents(data.events);
        if (showToast) {
          toast({
            title: "Synced Successfully",
            description: `Fetched ${data.events.length} events from connected calendars.`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch integrated events:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectCalendar = async (provider: 'google' | 'outlook') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("calendar_connections")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("provider", provider);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to disconnect ${provider === 'google' ? 'Google' : 'Outlook'} Calendar.`,
        variant: "destructive",
      });
      return;
    }

    if (provider === 'google') {
      setGoogleConnected(false);
    } else {
      setOutlookConnected(false);
    }

    toast({
      title: "Disconnected",
      description: `${provider === 'google' ? 'Google' : 'Outlook'} Calendar has been disconnected.`,
    });

    fetchIntegratedEvents();
  };

  const handleSyncNow = () => {
    fetchIntegratedEvents(true);
  };

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("client_meetings")
      .select("*")
      .eq("user_id", user.id)
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

    if (isEmbeddedPreview) {
      const opened = window.open(window.location.href, "_blank", "noopener,noreferrer");
      if (!opened) {
        toast({
          title: "Open in a new tab",
          description: "Please open this page in a new browser tab to connect Google Calendar.",
        });
      } else {
        toast({
          title: "Opened in new tab",
          description: "Complete the Google connection in the new tab.",
        });
      }
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth');

      if (error || !data?.authUrl) {
        throw new Error('Failed to get authorization URL');
      }

      const authTab = window.open(data.authUrl, '_blank', 'noopener,noreferrer');
      if (!authTab) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to connect Google Calendar.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectOutlook = async () => {
    if (isEmbeddedPreview) {
      const opened = window.open(window.location.href, "_blank", "noopener,noreferrer");
      if (!opened) {
        toast({
          title: "Open in a new tab",
          description: "Please open this page in a new browser tab to connect Outlook.",
        });
      } else {
        toast({
          title: "Opened in new tab",
          description: "Complete the Outlook connection in the new tab.",
        });
      }
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('outlook-calendar-auth');

      if (error || !data?.authUrl) {
        throw new Error('Failed to get authorization URL');
      }

      const authTab = window.open(data.authUrl, '_blank', 'noopener,noreferrer');
      if (!authTab) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to connect Outlook Calendar.",
          variant: "destructive",
        });
      }
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
      user_id: user.id,
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

  // Using imported getEventCategory from CalendarColorLegend

  const allEvents = [...events, ...integratedEvents];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Manage your schedule and events</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 hover:border-primary/50"
            onClick={() => setShowSyncPanel(!showSyncPanel)}
          >
            <Link2 className="h-4 w-4" />
            Sync Calendars
            {(googleConnected || outlookConnected) && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {(googleConnected ? 1 : 0) + (outlookConnected ? 1 : 0)}
              </Badge>
            )}
          </Button>
          {(googleConnected || outlookConnected) && (
            <Button 
              variant="outline" 
              className="gap-2 hover:border-primary/50"
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
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
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", getEventDotColor(formData.type))} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", cat.dotColor)} />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
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

      {/* Calendar Sync Panel */}
      {showSyncPanel && (
        <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 border-primary/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-5 w-5 text-primary" />
                Connect Your Calendars
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSyncPanel(false)}>
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sync your Google Calendar and Outlook Calendar to see all your events in one place.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Calendar */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                googleConnected 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Google Calendar</h4>
                    <p className="text-xs text-muted-foreground">
                      {googleConnected ? 'Connected and syncing' : 'Connect to sync events'}
                    </p>
                  </div>
                  {googleConnected && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                </div>
                {googleConnected ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDisconnectCalendar('google')}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
                  </Button>
                )}
              </div>

              {/* Outlook Calendar */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                outlookConnected 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path fill="#0078D4" d="M23 12.5V23H12V12.5L17.5 9L23 12.5Z"/>
                      <path fill="#0078D4" d="M12 1V12.5L1 6.75V1H12Z" opacity="0.8"/>
                      <path fill="#28A8EA" d="M12 12.5V23H1V6.75L12 12.5Z"/>
                      <path fill="#50D9FF" d="M23 1V12.5L12 6.75V1H23Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Outlook Calendar</h4>
                    <p className="text-xs text-muted-foreground">
                      {outlookConnected ? 'Connected and syncing' : 'Connect to sync events'}
                    </p>
                  </div>
                  {outlookConnected && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                </div>
                {outlookConnected ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDisconnectCalendar('outlook')}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleConnectOutlook}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Outlook Calendar'}
                  </Button>
                )}
              </div>
            </div>
            
            {(googleConnected || outlookConnected) && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {integratedEvents.length} events synced from external calendars
                </div>
                <Button variant="ghost" size="sm" onClick={handleSyncNow} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
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
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/20">
                <CalendarIcon className="h-5 w-5 text-amber-500" />
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
                        {dayEvents.slice(0, 3).map((evt, idx) => (
                          <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", getEventDotColor(evt.type, evt.provider))} />
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
            {/* Color Legend */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <CalendarColorLegend showProviders={googleConnected || outlookConnected} compact />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CalendarIcon className="h-5 w-5 text-green-500" />
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
                        <Badge className={cn(getEventCategory(event.type, event.provider).color, "text-xs")}>
                          {event.provider === 'google' ? 'Google' : event.provider === 'outlook' ? 'Outlook' : getEventCategory(event.type).label}
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
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", getEventDotColor(formData.type))} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", cat.dotColor)} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
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
}
