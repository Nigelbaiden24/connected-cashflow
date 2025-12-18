import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar, Plus, Edit2, Building2, Briefcase, Clock, CheckCircle2, ChevronLeft, ChevronRight, Bell, BellRing, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AIInsightsPanel } from "@/components/crm/AIInsightsPanel";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: string;
  priority: string;
  tags: string[];
  notes: string;
}

interface CustomColumn {
  id: string;
  column_name: string;
  column_type: string;
  is_required: boolean;
  column_options: any;
}

interface Interaction {
  id: string;
  interaction_type: string;
  subject: string;
  description: string;
  outcome: string;
  interaction_date: string;
}

interface FollowUp {
  id: string;
  title: string;
  notes: string | null;
  follow_up_date: string;
  status: string;
}

interface CRMNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

const CRMContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [allContactIds, setAllContactIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "note",
    subject: "",
    description: "",
    outcome: "",
    scheduleFollowUp: false,
    followUpDate: "",
    followUpTime: "",
    followUpNotes: "",
  });

  useEffect(() => {
    fetchContactData();
    fetchAllContactIds();
    fetchCustomColumns();
    fetchFollowUps();
    fetchNotifications();
  }, [id]);

  const fetchFollowUps = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_follow_ups")
        .select("*")
        .eq("contact_id", id)
        .eq("status", "pending")
        .order("follow_up_date", { ascending: true });

      if (error) throw error;
      setFollowUps(data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("crm_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("crm_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const completeFollowUp = async (followUpId: string) => {
    try {
      const { error } = await supabase
        .from("crm_follow_ups")
        .update({ status: "completed" })
        .eq("id", followUpId);

      if (error) throw error;
      toast.success("Follow-up marked as complete");
      fetchFollowUps();
    } catch (error) {
      console.error("Error completing follow-up:", error);
      toast.error("Failed to complete follow-up");
    }
  };

  const fetchAllContactIds = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const ids = (data || []).map(contact => contact.id);
      setAllContactIds(ids);
      
      // Find current contact's index
      const index = ids.findIndex(contactId => contactId === id);
      setCurrentIndex(index);
    } catch (error) {
      console.error("Error fetching contact IDs:", error);
    }
  };

  const fetchCustomColumns = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_custom_columns")
        .select("*")
        .order("column_order", { ascending: true });

      if (error) throw error;
      setCustomColumns(data || []);
      
      // Fetch custom data after columns are loaded
      if (data && data.length > 0) {
        fetchCustomData();
      }
    } catch (error) {
      console.error("Error fetching custom columns:", error);
    }
  };

  const fetchCustomData = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contact_data")
        .select("*")
        .eq("contact_id", id);

      if (error) throw error;

      // Organize data by column_id
      const organized: Record<string, string> = {};
      data?.forEach((item) => {
        organized[item.column_id] = item.value || "";
      });

      setCustomData(organized);
    } catch (error) {
      console.error("Error fetching custom data:", error);
    }
  };

  const fetchContactData = async () => {
    try {
      const { data: contactData, error: contactError } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (contactError) throw contactError;
      setContact(contactData);

      const { data: interactionsData, error: interactionsError } = await supabase
        .from("crm_interactions")
        .select("*")
        .eq("contact_id", id)
        .order("interaction_date", { ascending: false });

      if (interactionsError) throw interactionsError;
      setInteractions(interactionsData || []);
    } catch (error) {
      console.error("Error fetching contact:", error);
      toast.error("Failed to load contact details");
    } finally {
      setLoading(false);
    }
  };

  const updateCustomField = async (columnId: string, value: string) => {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("crm_contact_data")
        .select("id")
        .eq("contact_id", id)
        .eq("column_id", columnId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("crm_contact_data")
          .update({ value })
          .eq("contact_id", id)
          .eq("column_id", columnId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("crm_contact_data")
          .insert({
            contact_id: id,
            column_id: columnId,
            value,
          });

        if (error) throw error;
      }

      setCustomData({ ...customData, [columnId]: value });
    } catch (error) {
      console.error("Error updating custom field:", error);
      toast.error("Failed to update custom field");
    }
  };

  const updateContact = async () => {
    if (!contact) return;

    try {
      const { error } = await supabase
        .from("crm_contacts")
        .update({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          position: contact.position,
          status: contact.status,
          priority: contact.priority,
          notes: contact.notes,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Contact updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    }
  };

  const addInteraction = async () => {
    if (!newInteraction.subject) {
      toast.error("Please enter a subject");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to log interactions");
        return;
      }

      // Insert interaction
      const { data: interactionData, error: interactionError } = await supabase
        .from("crm_interactions")
        .insert({
          contact_id: id,
          interaction_type: newInteraction.interaction_type,
          subject: newInteraction.subject,
          description: newInteraction.description,
          outcome: newInteraction.outcome,
        })
        .select()
        .single();

      if (interactionError) throw interactionError;

      // Create follow-up if scheduled
      if (newInteraction.scheduleFollowUp && newInteraction.followUpDate && newInteraction.followUpTime) {
        const followUpDateTime = new Date(`${newInteraction.followUpDate}T${newInteraction.followUpTime}`);
        
        const { error: followUpError } = await supabase
          .from("crm_follow_ups")
          .insert({
            contact_id: id,
            user_id: user.id,
            interaction_id: interactionData.id,
            follow_up_date: followUpDateTime.toISOString(),
            title: `Follow-up: ${newInteraction.subject}`,
            notes: newInteraction.followUpNotes || null,
          });

        if (followUpError) {
          console.error("Error creating follow-up:", followUpError);
          toast.error("Interaction logged but failed to schedule follow-up");
        } else {
          toast.success("Interaction logged and follow-up scheduled!");
          fetchFollowUps();
        }
      } else {
        toast.success("Interaction logged successfully");
      }

      setNewInteraction({
        interaction_type: "note",
        subject: "",
        description: "",
        outcome: "",
        scheduleFollowUp: false,
        followUpDate: "",
        followUpTime: "",
        followUpNotes: "",
      });
      fetchContactData();
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast.error("Failed to log interaction");
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "phone":
        return "bg-primary/10 text-primary border-primary/20";
      case "email":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "meeting":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const quickLogInteraction = (type: string) => {
    setNewInteraction({
      ...newInteraction,
      interaction_type: type,
    });
  };

  if (loading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  if (!contact) {
    return <div className="flex-1 p-6">Contact not found</div>;
  }

  const isBusiness = window.location.pathname.startsWith('/business');

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      const previousId = allContactIds[currentIndex - 1];
      navigate(isBusiness ? `/business/crm/${previousId}` : `/finance-crm/${previousId}`);
    }
  };

  const navigateToNext = () => {
    if (currentIndex < allContactIds.length - 1) {
      const nextId = allContactIds[currentIndex + 1];
      navigate(isBusiness ? `/business/crm/${nextId}` : `/finance-crm/${nextId}`);
    }
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allContactIds.length - 1;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(isBusiness ? "/business/crm" : "/finance-crm")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 ml-2 border-l pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToPrevious}
              disabled={!hasPrevious}
              className="h-8 px-2"
              title="Previous Prospect"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentIndex + 1} of {allContactIds.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToNext}
              disabled={!hasNext}
              className="h-8 px-2"
              title="Next Prospect"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              {notifications.length > 0 ? (
                <BellRing className="h-5 w-5 text-primary animate-pulse" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.action_url) navigate(notif.action_url);
                        }}
                      >
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notif.created_at), "PPp")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Last updated {format(new Date(), "MMM d, yyyy")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Contact Information */}
        <Card className="lg:col-span-1 border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Contact Profile</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className="hover:bg-primary/10"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {editMode ? (
              <>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={contact.name}
                    onChange={(e) =>
                      setContact({ ...contact, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contact.phone || ""}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={contact.company || ""}
                    onChange={(e) =>
                      setContact({ ...contact, company: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={contact.position || ""}
                    onChange={(e) =>
                      setContact({ ...contact, position: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={contact.status}
                    onValueChange={(value) =>
                      setContact({ ...contact, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={contact.priority}
                    onValueChange={(value) =>
                      setContact({ ...contact, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={contact.notes || ""}
                    onChange={(e) =>
                      setContact({ ...contact, notes: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                {/* Custom Fields */}
                {customColumns.map((column) => (
                  <div key={column.id}>
                    <Label>
                      {column.column_name}
                      {column.is_required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {column.column_type === "select" && column.column_options ? (
                      <Select
                        value={customData[column.id] || ""}
                        onValueChange={(value) => updateCustomField(column.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${column.column_name}`} />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {(Array.isArray(column.column_options) ? column.column_options : []).map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : column.column_type === "textarea" ? (
                      <Textarea
                        value={customData[column.id] || ""}
                        onChange={(e) => updateCustomField(column.id, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type={column.column_type === "number" ? "number" : 
                              column.column_type === "date" ? "date" : 
                              column.column_type === "email" ? "email" : "text"}
                        value={customData[column.id] || ""}
                        onChange={(e) => updateCustomField(column.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                <Button onClick={updateContact} className="w-full">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                {/* Contact Header */}
                <div className="text-center space-y-3 pb-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{contact.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">{contact.position || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">{contact.company || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium truncate">{contact.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm font-medium">{contact.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status & Priority */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge 
                      variant="secondary" 
                      className="capitalize font-medium"
                    >
                      {contact.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <Badge 
                      variant={contact.priority === "high" ? "destructive" : "outline"}
                      className="capitalize font-medium"
                    >
                      {contact.priority}
                    </Badge>
                  </div>
                </div>

                {contact.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <p className="text-sm leading-relaxed p-3 rounded-lg bg-muted/30">
                        {contact.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Display Custom Fields */}
                {customColumns.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase">Additional Information</Label>
                      {customColumns.map((column) => {
                        const value = customData[column.id];
                        if (!value) return null;
                        
                        return (
                          <div key={column.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-xs text-muted-foreground">{column.column_name}</span>
                            <span className="text-sm font-medium">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <div className="lg:col-span-1">
          <AIInsightsPanel contactId={id!} contact={contact} onUpdate={fetchContactData} />
        </div>

        {/* Interaction History */}
        <Card className="lg:col-span-2 border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Interaction Timeline</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {interactions.length} total {interactions.length === 1 ? "interaction" : "interactions"}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="shadow-md hover:shadow-lg transition-shadow">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Interaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log New Interaction</DialogTitle>
                    <DialogDescription>
                      Record a phone call, email, meeting, or note
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newInteraction.interaction_type}
                        onValueChange={(value) =>
                          setNewInteraction({
                            ...newInteraction,
                            interaction_type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={newInteraction.subject}
                        onChange={(e) =>
                          setNewInteraction({
                            ...newInteraction,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Brief summary"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newInteraction.description}
                        onChange={(e) =>
                          setNewInteraction({
                            ...newInteraction,
                            description: e.target.value,
                          })
                        }
                        placeholder="Detailed notes"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Outcome</Label>
                      <Input
                        value={newInteraction.outcome}
                        onChange={(e) =>
                          setNewInteraction({
                            ...newInteraction,
                            outcome: e.target.value,
                          })
                        }
                        placeholder="Result or next steps"
                      />
                    </div>
                    
                    {/* Follow-up Scheduling */}
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-medium">Schedule Follow-up</Label>
                        </div>
                        <Switch
                          checked={newInteraction.scheduleFollowUp}
                          onCheckedChange={(checked) =>
                            setNewInteraction({
                              ...newInteraction,
                              scheduleFollowUp: checked,
                            })
                          }
                        />
                      </div>
                      
                      {newInteraction.scheduleFollowUp && (
                        <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Date</Label>
                              <Input
                                type="date"
                                value={newInteraction.followUpDate}
                                onChange={(e) =>
                                  setNewInteraction({
                                    ...newInteraction,
                                    followUpDate: e.target.value,
                                  })
                                }
                                min={new Date().toISOString().split("T")[0]}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Time</Label>
                              <Input
                                type="time"
                                value={newInteraction.followUpTime}
                                onChange={(e) =>
                                  setNewInteraction({
                                    ...newInteraction,
                                    followUpTime: e.target.value,
                                  })
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Notes for follow-up</Label>
                            <Input
                              value={newInteraction.followUpNotes}
                              onChange={(e) =>
                                setNewInteraction({
                                  ...newInteraction,
                                  followUpNotes: e.target.value,
                                })
                              }
                              placeholder="What to discuss in follow-up..."
                              className="mt-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You'll receive a reminder notification 30 minutes before
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addInteraction}>Log Interaction</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {[
                { type: "phone", label: "Phone Call", icon: Phone },
                { type: "email", label: "Email", icon: Mail },
                { type: "meeting", label: "Meeting", icon: Calendar },
                { type: "note", label: "Note", icon: MessageSquare },
              ].map((action) => (
                <Dialog key={action.type}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-auto py-3 flex-col gap-1 hover:scale-105 transition-transform",
                        getInteractionColor(action.type)
                      )}
                      onClick={() => quickLogInteraction(action.type)}
                    >
                      <action.icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <action.icon className="h-5 w-5" />
                        Log {action.label}
                      </DialogTitle>
                      <DialogDescription>
                        Record details about this interaction with {contact.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Subject *</Label>
                        <Input
                          value={newInteraction.subject}
                          onChange={(e) =>
                            setNewInteraction({
                              ...newInteraction,
                              subject: e.target.value,
                            })
                          }
                          placeholder="Brief summary of the interaction"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newInteraction.description}
                          onChange={(e) =>
                            setNewInteraction({
                              ...newInteraction,
                              description: e.target.value,
                            })
                          }
                          placeholder="Detailed notes about what was discussed..."
                          rows={4}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Outcome / Next Steps</Label>
                        <Input
                          value={newInteraction.outcome}
                          onChange={(e) =>
                            setNewInteraction({
                              ...newInteraction,
                              outcome: e.target.value,
                            })
                          }
                          placeholder="Result or action items"
                          className="mt-1.5"
                        />
                      </div>
                      
                      {/* Follow-up Scheduling */}
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-primary" />
                            <Label className="text-sm font-medium">Schedule Follow-up</Label>
                          </div>
                          <Switch
                            checked={newInteraction.scheduleFollowUp}
                            onCheckedChange={(checked) =>
                              setNewInteraction({
                                ...newInteraction,
                                scheduleFollowUp: checked,
                              })
                            }
                          />
                        </div>
                        
                        {newInteraction.scheduleFollowUp && (
                          <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Date</Label>
                                <Input
                                  type="date"
                                  value={newInteraction.followUpDate}
                                  onChange={(e) =>
                                    setNewInteraction({
                                      ...newInteraction,
                                      followUpDate: e.target.value,
                                    })
                                  }
                                  min={new Date().toISOString().split("T")[0]}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Time</Label>
                                <Input
                                  type="time"
                                  value={newInteraction.followUpTime}
                                  onChange={(e) =>
                                    setNewInteraction({
                                      ...newInteraction,
                                      followUpTime: e.target.value,
                                    })
                                  }
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Input
                                value={newInteraction.followUpNotes}
                                onChange={(e) =>
                                  setNewInteraction({
                                    ...newInteraction,
                                    followUpNotes: e.target.value,
                                  })
                                }
                                placeholder="What to discuss..."
                                className="mt-1"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Reminder 30 mins before
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addInteraction} className="w-full sm:w-auto">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Interaction
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Upcoming Follow-ups */}
            {followUps.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Scheduled Follow-ups
                </h4>
                <div className="space-y-2">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary/20"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{followUp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(followUp.follow_up_date), "PPp")}
                        </p>
                        {followUp.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{followUp.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => completeFollowUp(followUp.id)}
                        className="text-primary hover:text-primary/80"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {/* Interaction Timeline */}
            <div className="space-y-4">
              {interactions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">
                    No interactions recorded yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the quick actions above to log your first interaction
                  </p>
                </div>
              ) : (
                <div className="relative space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
                  
                  {interactions.map((interaction, index) => (
                    <div
                      key={interaction.id}
                      className="relative pl-12 group animate-in fade-in-50 slide-in-from-left-10"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute left-0 w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform",
                        getInteractionColor(interaction.interaction_type)
                      )}>
                        {getInteractionIcon(interaction.interaction_type)}
                      </div>

                      {/* Interaction card */}
                      <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-1 truncate">
                              {interaction.subject}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(interaction.interaction_date), "PPpp")}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="capitalize shrink-0"
                          >
                            {interaction.interaction_type}
                          </Badge>
                        </div>

                        {interaction.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {interaction.description}
                          </p>
                        )}

                        {interaction.outcome && (
                          <div className="bg-primary/5 border border-primary/10 rounded-md p-3 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-primary mb-1">
                                Outcome
                              </p>
                              <p className="text-sm">
                                {interaction.outcome}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMContactDetail;
