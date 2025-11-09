import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Zap, Calendar, Database, Bell, FileText, Code } from "lucide-react";

interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MODULES = [
  "Dashboard", "Projects", "Tasks", "CRM", "Calendar", 
  "Analytics", "Revenue", "Payroll", "Security", "Portfolio",
  "Finance", "Compliance", "Risk Assessment"
];

const TRIGGER_TYPES = [
  { value: "schedule", label: "Schedule (Time-based)", icon: Calendar },
  { value: "event", label: "Event (Action-based)", icon: Zap },
  { value: "data_change", label: "Data Change", icon: Database },
];

const ACTION_TYPES = [
  { value: "notification", label: "Send Notification", icon: Bell },
  { value: "workflow", label: "Execute Workflow", icon: Code },
  { value: "data_sync", label: "Sync Data", icon: Database },
  { value: "report_generation", label: "Generate Report", icon: FileText },
];

const CRON_PRESETS = [
  { value: "*/5 * * * *", label: "Every 5 minutes" },
  { value: "*/15 * * * *", label: "Every 15 minutes" },
  { value: "*/30 * * * *", label: "Every 30 minutes" },
  { value: "0 * * * *", label: "Every hour" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 9 * * *", label: "Daily at 9 AM" },
  { value: "0 9 * * 1", label: "Weekly (Monday 9 AM)" },
  { value: "0 9 1 * *", label: "Monthly (1st at 9 AM)" },
];

const EVENT_SOURCES = [
  "crm_contacts", "clients", "portfolio_holdings", "financial_plans",
  "audit_logs", "client_meetings", "tasks", "crm_interactions"
];

export const CreateAutomationDialog = ({ open, onOpenChange, onSuccess }: CreateAutomationDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Settings
  const [ruleName, setRuleName] = useState("");
  const [module, setModule] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState(5);

  // Trigger Configuration
  const [triggerType, setTriggerType] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventSource, setEventSource] = useState("");

  // Action Configuration
  const [actionType, setActionType] = useState("");
  const [workflowSteps, setWorkflowSteps] = useState<Array<{
    step_type: string;
    step_config: any;
  }>>([]);
  const [notificationConfig, setNotificationConfig] = useState({
    notification_type: "in_app",
    title: "",
    message_template: ""
  });
  const [dataSyncConfig, setDataSyncConfig] = useState({
    source_table: "",
    target_table: "",
    sync_type: "upsert"
  });

  const handleCreateAutomation = async () => {
    if (!ruleName || !module || !triggerType || !actionType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build trigger configuration
      const triggerConfig: any = {};
      if (triggerType === "schedule") {
        triggerConfig.cron = cronExpression;
      } else if (triggerType === "event") {
        triggerConfig.event_type = eventType;
        triggerConfig.event_source = eventSource;
      }

      // Build action configuration
      let actionConfig: any = {};
      if (actionType === "notification") {
        actionConfig = notificationConfig;
      } else if (actionType === "workflow") {
        actionConfig = { workflow_steps: workflowSteps };
      } else if (actionType === "data_sync") {
        actionConfig = dataSyncConfig;
      }

      const { error } = await supabase.from("automation_rules").insert({
        rule_name: ruleName,
        module,
        description,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        action_type: actionType,
        action_config: actionConfig,
        priority,
        enabled,
        created_by: user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation created successfully"
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating automation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRuleName("");
    setModule("");
    setDescription("");
    setEnabled(true);
    setPriority(5);
    setTriggerType("");
    setCronExpression("");
    setEventType("");
    setEventSource("");
    setActionType("");
    setWorkflowSteps([]);
    setNotificationConfig({ notification_type: "in_app", title: "", message_template: "" });
    setDataSyncConfig({ source_table: "", target_table: "", sync_type: "upsert" });
    setActiveTab("basic");
  };

  const addWorkflowStep = () => {
    setWorkflowSteps([...workflowSteps, {
      step_type: "create_record",
      step_config: {}
    }]);
  };

  const removeWorkflowStep = (index: number) => {
    setWorkflowSteps(workflowSteps.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Create New Automation
          </DialogTitle>
          <DialogDescription>
            Build intelligent automation workflows with enterprise-grade features
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="trigger">Trigger</TabsTrigger>
            <TabsTrigger value="action">Action</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Automation Name *</Label>
              <Input
                id="ruleName"
                placeholder="e.g., Daily Client Report Generation"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">Module *</Label>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((mod) => (
                    <SelectItem key={mod} value={mod}>
                      {mod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this automation does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Priority Level</Label>
                <p className="text-sm text-muted-foreground">
                  Higher priority automations execute first (1-10)
                </p>
              </div>
              <Input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Enable on Creation</Label>
                <p className="text-sm text-muted-foreground">
                  Start automation immediately after creation
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </TabsContent>

          {/* Trigger Configuration Tab */}
          <TabsContent value="trigger" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Trigger Type *</Label>
              <div className="grid grid-cols-1 gap-2">
                {TRIGGER_TYPES.map((trigger) => {
                  const Icon = trigger.icon;
                  return (
                    <button
                      key={trigger.value}
                      onClick={() => setTriggerType(trigger.value)}
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                        triggerType === trigger.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{trigger.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {triggerType === "schedule" && (
              <div className="space-y-2">
                <Label>Schedule (Cron Expression) *</Label>
                <Select value={cronExpression} onValueChange={setCronExpression}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRON_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or enter custom cron expression"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                />
              </div>
            )}

            {triggerType === "event" && (
              <>
                <div className="space-y-2">
                  <Label>Event Source *</Label>
                  <Select value={eventSource} onValueChange={setEventSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Event Type *</Label>
                  <Input
                    placeholder="e.g., record_created, record_updated, record_deleted"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Action Configuration Tab */}
          <TabsContent value="action" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Action Type *</Label>
              <div className="grid grid-cols-1 gap-2">
                {ACTION_TYPES.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.value}
                      onClick={() => setActionType(action.value)}
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                        actionType === action.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {actionType === "notification" && (
              <>
                <div className="space-y-2">
                  <Label>Notification Type</Label>
                  <Select
                    value={notificationConfig.notification_type}
                    onValueChange={(value) =>
                      setNotificationConfig({ ...notificationConfig, notification_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app">In-App</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notification Title</Label>
                  <Input
                    placeholder="Enter notification title"
                    value={notificationConfig.title}
                    onChange={(e) =>
                      setNotificationConfig({ ...notificationConfig, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <Textarea
                    placeholder="Use {{variable}} for dynamic content"
                    value={notificationConfig.message_template}
                    onChange={(e) =>
                      setNotificationConfig({ ...notificationConfig, message_template: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            {actionType === "data_sync" && (
              <>
                <div className="space-y-2">
                  <Label>Source Table</Label>
                  <Input
                    placeholder="e.g., crm_contacts"
                    value={dataSyncConfig.source_table}
                    onChange={(e) =>
                      setDataSyncConfig({ ...dataSyncConfig, source_table: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Table</Label>
                  <Input
                    placeholder="e.g., audit_logs"
                    value={dataSyncConfig.target_table}
                    onChange={(e) =>
                      setDataSyncConfig({ ...dataSyncConfig, target_table: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sync Type</Label>
                  <Select
                    value={dataSyncConfig.sync_type}
                    onValueChange={(value) =>
                      setDataSyncConfig({ ...dataSyncConfig, sync_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsert">Upsert</SelectItem>
                      <SelectItem value="insert">Insert Only</SelectItem>
                      <SelectItem value="update">Update Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {actionType === "workflow" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Workflow Steps</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWorkflowStep}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <Badge variant="outline">Step {index + 1}</Badge>
                    <Input
                      placeholder="Step type"
                      value={step.step_type}
                      onChange={(e) => {
                        const newSteps = [...workflowSteps];
                        newSteps[index].step_type = e.target.value;
                        setWorkflowSteps(newSteps);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkflowStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateAutomation} disabled={loading}>
            {loading ? "Creating..." : "Create Automation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
