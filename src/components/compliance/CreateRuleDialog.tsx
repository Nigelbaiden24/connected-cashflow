import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRuleDialog({ open, onOpenChange, onSuccess }: CreateRuleDialogProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    ruleType: "",
    description: "",
    severity: "medium",
    autoCheck: true,
    checkFrequency: "daily",
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruleName || !formData.ruleType || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('compliance_rules')
        .insert({
          rule_name: formData.ruleName,
          rule_type: formData.ruleType,
          description: formData.description,
          severity: formData.severity,
          auto_check: formData.autoCheck,
          check_frequency: formData.checkFrequency,
          enabled: formData.enabled,
          created_by: user.id,
          rule_config: {},
          threshold_config: {},
        });

      if (error) throw error;

      toast({
        title: "Rule created",
        description: "Compliance rule has been created successfully",
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        ruleName: "",
        ruleType: "",
        description: "",
        severity: "medium",
        autoCheck: true,
        checkFrequency: "daily",
        enabled: true,
      });
    } catch (error: any) {
      console.error('Create rule error:', error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create rule",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Compliance Rule</DialogTitle>
            <DialogDescription>
              Define a new automated compliance rule for monitoring and enforcement
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="e.g., Client Risk Tolerance Verification"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ruleType">Rule Type *</Label>
              <Select value={formData.ruleType} onValueChange={(value) => setFormData({ ...formData, ruleType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kyc_aml">KYC/AML</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="suitability">Suitability Assessment</SelectItem>
                  <SelectItem value="trading">Trading Limits</SelectItem>
                  <SelectItem value="portfolio_risk">Portfolio Risk</SelectItem>
                  <SelectItem value="concentration">Concentration Limits</SelectItem>
                  <SelectItem value="reporting">Regulatory Reporting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this rule checks and when it should trigger..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="checkFrequency">Check Frequency</Label>
                <Select value={formData.checkFrequency} onValueChange={(value) => setFormData({ ...formData, checkFrequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="on_trade">On Trade</SelectItem>
                    <SelectItem value="on_profile_update">On Profile Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoCheck">Automatic Checking</Label>
                <p className="text-sm text-muted-foreground">
                  Run this rule automatically based on frequency
                </p>
              </div>
              <Switch
                id="autoCheck"
                checked={formData.autoCheck}
                onCheckedChange={(checked) => setFormData({ ...formData, autoCheck: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enable Rule</Label>
                <p className="text-sm text-muted-foreground">
                  Start monitoring with this rule immediately
                </p>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
