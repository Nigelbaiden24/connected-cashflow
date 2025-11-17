import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Plus
} from "lucide-react";

interface ComplianceRule {
  id: string;
  rule_name: string;
  rule_type: string;
  description: string;
  severity: string;
  enabled: boolean;
  auto_check: boolean;
  check_frequency: string;
  last_check?: string;
  next_check?: string;
}

interface RuleEngineManagerProps {
  rules: ComplianceRule[];
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onRunCheck: (ruleId: string) => void;
  onConfigureRule: (ruleId: string) => void;
  onCreateRule: () => void;
}

export function RuleEngineManager({
  rules,
  onToggleRule,
  onRunCheck,
  onConfigureRule,
  onCreateRule,
}: RuleEngineManagerProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      on_trade: "On Trade",
      on_profile_update: "On Update",
    };
    return labels[frequency] || frequency;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rule Engine</CardTitle>
          <Button onClick={onCreateRule} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <Switch
                checked={rule.enabled}
                onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rule.rule_name}</h4>
                  <Badge variant={getSeverityColor(rule.severity)}>
                    {rule.severity}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {rule.rule_type.replace("_", " ")}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{rule.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {rule.auto_check && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Auto: {getFrequencyBadge(rule.check_frequency)}
                    </div>
                  )}
                  {rule.last_check && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Last: {rule.last_check}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRunCheck(rule.id)}
                  disabled={!rule.enabled}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConfigureRule(rule.id)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
