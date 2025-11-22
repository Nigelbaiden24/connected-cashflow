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
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar, Plus, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface Interaction {
  id: string;
  interaction_type: string;
  subject: string;
  description: string;
  outcome: string;
  interaction_date: string;
}

const CRMContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "note",
    subject: "",
    description: "",
    outcome: "",
  });

  useEffect(() => {
    fetchContactData();
  }, [id]);

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
      const { error } = await supabase.from("crm_interactions").insert({
        contact_id: id,
        ...newInteraction,
      });

      if (error) throw error;
      toast.success("Interaction logged successfully");
      setNewInteraction({
        interaction_type: "note",
        subject: "",
        description: "",
        outcome: "",
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
        return "bg-blue-500/10 text-blue-500";
      case "email":
        return "bg-purple-500/10 text-purple-500";
      case "meeting":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (loading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  if (!contact) {
    return <div className="flex-1 p-6">Contact not found</div>;
  }

  const isBusiness = window.location.pathname.startsWith('/business');

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(isBusiness ? "/business/crm" : "/finance-crm")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Information */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contact Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
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
                <Button onClick={updateContact} className="w-full">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-2xl font-bold">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {contact.position} at {contact.company}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.phone || "N/A"}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Badge variant="secondary">{contact.status}</Badge>
                  <Badge variant="outline">{contact.priority} priority</Badge>
                </div>
                {contact.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contact.notes}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Interaction History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Interaction History</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
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
                  </div>
                  <DialogFooter>
                    <Button onClick={addInteraction}>Log Interaction</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No interactions recorded yet
                </p>
              ) : (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${getInteractionColor(
                            interaction.interaction_type
                          )}`}
                        >
                          {getInteractionIcon(interaction.interaction_type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{interaction.subject}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(interaction.interaction_date),
                              "PPpp"
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {interaction.interaction_type}
                      </Badge>
                    </div>
                    {interaction.description && (
                      <p className="text-sm text-muted-foreground">
                        {interaction.description}
                      </p>
                    )}
                    {interaction.outcome && (
                      <div className="bg-muted/50 p-2 rounded text-sm">
                        <strong>Outcome:</strong> {interaction.outcome}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMContactDetail;
