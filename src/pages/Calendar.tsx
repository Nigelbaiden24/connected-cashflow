import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: "Team Meeting", time: "09:00", date: "2024-02-20", type: "meeting" },
    { id: 2, title: "Client Presentation", time: "14:00", date: "2024-02-20", type: "presentation" },
    { id: 3, title: "Project Deadline", time: "11:30", date: "2024-02-22", type: "deadline" },
    { id: 4, title: "Strategy Review", time: "15:00", date: "2024-02-23", type: "meeting" },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
  });

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newEvent = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      type: formData.type,
    };
    setEvents([...events, newEvent]);
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
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent || !formData.title || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setEvents(events.map(e => 
      e.id === selectedEvent.id 
        ? { ...e, title: formData.title, date: formData.date, time: formData.time, type: formData.type }
        : e
    ));
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
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
    toast({
      title: "Success",
      description: "Event deleted successfully",
    });
    setEditDialogOpen(false);
    setSelectedEvent(null);
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

  const getEventColor = (type: string) => {
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
                
                const hasEvent = events.some(e => isSameDay(new Date(e.date), day));
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
            {events.map((event) => (
              <div key={event.id} className="space-y-2 pb-4 border-b last:border-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getEventColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
