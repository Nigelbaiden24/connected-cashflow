import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Mail, 
  FileText, 
  Calendar, 
  Send, 
  Receipt, 
  UserPlus,
  Loader2,
  Wand2,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status?: string;
}

interface NextActionAIProps {
  contacts: Contact[];
  selectedContactIds?: string[];
}

type ActionType = "ai-email" | "ai-contract" | "calendar-link" | "ai-intro" | "follow-up" | "invoice";

const actionOptions: { value: ActionType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "ai-email", label: "Send AI Email", icon: <Mail className="h-4 w-4" />, description: "Generate and send a personalized email" },
  { value: "ai-contract", label: "Send AI Contract", icon: <FileText className="h-4 w-4" />, description: "Generate a contract document" },
  { value: "calendar-link", label: "Send Calendar Link", icon: <Calendar className="h-4 w-4" />, description: "Share your booking calendar" },
  { value: "ai-intro", label: "Send AI Intro Email", icon: <UserPlus className="h-4 w-4" />, description: "Generate an introduction email" },
  { value: "follow-up", label: "Send Follow-up", icon: <Send className="h-4 w-4" />, description: "Generate a follow-up message" },
  { value: "invoice", label: "Send Invoice", icon: <Receipt className="h-4 w-4" />, description: "Create and send an invoice" },
];

export function NextActionAI({ contacts, selectedContactIds = [] }: NextActionAIProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType | "">("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Invoice specific fields
  const [invoiceDetails, setInvoiceDetails] = useState({
    amount: "",
    description: "",
    dueDate: "",
    items: [{ description: "", quantity: "1", unitPrice: "" }],
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const contactsWithEmail = contacts.filter(c => c.email);

  const handleGenerate = async () => {
    if (!selectedAction || !selectedContactId) {
      toast.error("Please select an action and a contact");
      return;
    }

    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) {
      toast.error("Contact not found");
      return;
    }

    if ((selectedAction !== "calendar-link" && selectedAction !== "invoice") && !contact.email) {
      toast.error("This contact doesn't have an email address");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      let systemPrompt = "";
      let userPrompt = "";

      switch (selectedAction) {
        case "ai-email":
          systemPrompt = "You are an expert financial advisor assistant. Generate professional, personalized emails for clients.";
          userPrompt = `Generate a professional email for ${contact.name}${contact.company ? ` from ${contact.company}` : ""}. ${prompt || "The email should be warm, professional, and encourage engagement."}`;
          break;
        case "ai-intro":
          systemPrompt = "You are an expert at writing introduction emails that build rapport and establish credibility.";
          userPrompt = `Write a professional introduction email to ${contact.name}${contact.company ? ` at ${contact.company}` : ""}. ${prompt || "Introduce yourself as a financial advisor and explain how you can help."}`;
          break;
        case "follow-up":
          systemPrompt = "You are an expert at writing follow-up emails that are helpful and not pushy.";
          userPrompt = `Write a professional follow-up email to ${contact.name}${contact.company ? ` from ${contact.company}` : ""}. ${prompt || "Check in on their progress and offer continued support."}`;
          break;
        case "ai-contract":
          systemPrompt = "You are a legal document assistant. Generate professional contract templates.";
          userPrompt = `Generate a professional service agreement contract for ${contact.name}${contact.company ? ` / ${contact.company}` : ""}. ${prompt || "Include standard financial advisory terms."}`;
          break;
        case "calendar-link":
          // No AI needed for calendar link
          const calendarLink = "https://calendly.com/your-calendar"; // Placeholder
          setGeneratedContent(`Hi ${contact.name},\n\nI'd love to schedule a call with you. Please use the link below to book a time that works best for you:\n\n${calendarLink}\n\nLooking forward to speaking with you!\n\nBest regards`);
          setShowPreview(true);
          setIsGenerating(false);
          return;
        case "invoice":
          // Generate invoice content
          const totalAmount = invoiceDetails.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
          }, 0);
          
          const invoiceContent = `INVOICE

To: ${contact.name}${contact.company ? `\nCompany: ${contact.company}` : ""}
${contact.email ? `Email: ${contact.email}` : ""}

Invoice Date: ${new Date().toLocaleDateString()}
Due Date: ${invoiceDetails.dueDate || "Upon Receipt"}

Items:
${invoiceDetails.items.map((item, i) => 
  `${i + 1}. ${item.description || "Service"} - Qty: ${item.quantity} x £${item.unitPrice || "0"} = £${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}`
).join("\n")}

Total Amount: £${totalAmount.toFixed(2)}

${invoiceDetails.description ? `Notes: ${invoiceDetails.description}` : ""}

Payment Terms: Net 30 days
Please reference invoice number when making payment.

Thank you for your business!`;
          
          setGeneratedContent(invoiceContent);
          setShowPreview(true);
          setIsGenerating(false);
          return;
        default:
          toast.error("Action not supported");
          setIsGenerating(false);
          return;
      }

      const { data, error } = await supabase.functions.invoke("business-chat", {
        body: {
          message: userPrompt,
          systemPrompt,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.response || data.generatedText || "Failed to generate content");
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (selectedContact?.email) {
      const subject = selectedAction === "ai-intro" ? "Introduction" : 
                      selectedAction === "follow-up" ? "Following Up" :
                      selectedAction === "ai-contract" ? "Service Agreement" :
                      selectedAction === "invoice" ? "Invoice" : "Hello";
      
      const mailtoLink = `mailto:${selectedContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedContent)}`;
      window.open(mailtoLink, "_blank");
      toast.success("Opening email client...");
    } else {
      toast.error("This contact doesn't have an email address");
    }
  };

  const addInvoiceItem = () => {
    setInvoiceDetails(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: "1", unitPrice: "" }]
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: string) => {
    setInvoiceDetails(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceDetails.items.length > 1) {
      setInvoiceDetails(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wand2 className="h-5 w-5 text-primary" />
          Next Action AI
        </CardTitle>
        <CardDescription>
          Use AI to generate emails, contracts, and more for your contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {actionOptions.map((action) => (
            <Button
              key={action.value}
              variant={selectedAction === action.value ? "default" : "outline"}
              size="sm"
              className="justify-start gap-2 h-auto py-2 px-3"
              onClick={() => setSelectedAction(action.value)}
            >
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {selectedAction && (
          <div className="space-y-4 pt-2 border-t">
            {/* Contact Selection */}
            <div className="space-y-2">
              <Label>Select Contact</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contact..." />
                </SelectTrigger>
                <SelectContent className="bg-background max-h-60">
                  {contactsWithEmail.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No contacts with email addresses
                    </div>
                  ) : (
                    contactsWithEmail.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.email && `(${contact.email})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Details */}
            {selectedAction === "invoice" && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium">Invoice Details</Label>
                
                {invoiceDetails.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, "description", e.target.value)}
                      className="col-span-5"
                    />
                    <Input
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, "quantity", e.target.value)}
                      className="col-span-2"
                      type="number"
                    />
                    <Input
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateInvoiceItem(index, "unitPrice", e.target.value)}
                      className="col-span-4"
                      type="number"
                    />
                    {invoiceDetails.items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                        className="col-span-1 h-9 w-9 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                  + Add Item
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Due Date</Label>
                    <Input
                      type="date"
                      value={invoiceDetails.dueDate}
                      onChange={(e) => setInvoiceDetails(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Input
                      placeholder="Additional notes"
                      value={invoiceDetails.description}
                      onChange={(e) => setInvoiceDetails(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input (for AI actions) */}
            {selectedAction !== "calendar-link" && selectedAction !== "invoice" && (
              <div className="space-y-2">
                <Label>Custom Prompt (Optional)</Label>
                <Textarea
                  placeholder="Add specific instructions or context for the AI..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !selectedContactId}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {actionOptions.find(a => a.value === selectedAction)?.label}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {actionOptions.find(a => a.value === selectedAction)?.label} Preview
              </DialogTitle>
              <DialogDescription>
                Review the generated content before sending
              </DialogDescription>
            </DialogHeader>
            
            <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent}</pre>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              {selectedContact?.email && (
                <Button onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Open in Email
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}