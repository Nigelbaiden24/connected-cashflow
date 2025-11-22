import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, MessageSquare, Target, Sparkles, Loader2, Mail, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIInsightsPanelProps {
  contactId: string;
  contact: any;
  onUpdate?: () => void;
}

export function AIInsightsPanel({ contactId, contact, onUpdate }: AIInsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  const [messageType, setMessageType] = useState("email");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-ai-insights', {
        body: { action: 'get_recommendations', contactId }
      });

      if (error) throw error;
      setRecommendations(data);
      toast.success("AI recommendations generated");
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async () => {
    setGeneratingMessage(true);
    try {
      const { data, error } = await supabase.functions.invoke('crm-ai-insights', {
        body: {
          action: 'generate_message',
          contactId,
          messageContext: {
            type: messageType,
            instructions: customInstructions
          }
        }
      });

      if (error) throw error;
      setGeneratedMessage(data);
      toast.success("Message generated successfully");
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error("Failed to generate message");
    } finally {
      setGeneratingMessage(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return "destructive";
      case 'medium': return "default";
      case 'low': return "secondary";
      default: return "outline";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return "default";
      case 'medium': return "secondary";
      case 'low': return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Lead Scoring Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Lead Intelligence
          </CardTitle>
          <CardDescription>Predictive scoring and insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(contact.lead_score || 0)}`}>
                {contact.lead_score || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Lead Score</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor((contact.conversion_probability || 0) * 100)}`}>
                {((contact.conversion_probability || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Conversion</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(contact.engagement_score || 0)}`}>
                {contact.engagement_score || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Engagement</div>
            </div>
          </div>

          {contact.lead_score_factors && contact.lead_score_factors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Scoring Factors</h4>
              {contact.lead_score_factors.slice(0, 3).map((factor: any, idx: number) => (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{factor.factor}</span>
                    <Badge variant="outline" className="text-xs">{factor.score}/100</Badge>
                  </div>
                  <p className="text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          )}

          {contact.next_best_action && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium mb-1">Next Best Action</div>
                  <div className="text-sm">{contact.next_best_action}</div>
                </div>
              </div>
            </div>
          )}

          {contact.last_ai_analysis && (
            <div className="text-xs text-muted-foreground text-center">
              Last analyzed: {new Date(contact.last_ai_analysis).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => setShowMessageDialog(true)}
            className="w-full justify-start"
            variant="outline"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Generate Personalized Message
          </Button>
          <Button
            onClick={getRecommendations}
            disabled={loading}
            className="w-full justify-start"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Get Smart Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Smart Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.immediate_actions && recommendations.immediate_actions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Immediate Actions</h4>
                <div className="space-y-2">
                  {recommendations.immediate_actions.map((action: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{action.action}</span>
                        <Badge variant={getPriorityColor(action.priority)}>{action.priority}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.upsell_opportunities && recommendations.upsell_opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Upsell Opportunities</h4>
                <div className="space-y-2">
                  {recommendations.upsell_opportunities.map((opp: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{opp.opportunity}</span>
                        <Badge variant={getConfidenceColor(opp.confidence)}>{opp.confidence}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.cross_sell_opportunities && recommendations.cross_sell_opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Cross-sell Opportunities</h4>
                <div className="space-y-2">
                  {recommendations.cross_sell_opportunities.map((opp: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{opp.opportunity}</span>
                        <Badge variant={getConfidenceColor(opp.confidence)}>{opp.confidence}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.nurturing_strategy && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Nurturing Strategy</h4>
                <p className="text-sm">{recommendations.nurturing_strategy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message Generation Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Personalized Message</DialogTitle>
            <DialogDescription>
              AI will create a personalized message based on the contact's profile and interaction history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="meeting_summary">Meeting Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Custom Instructions (Optional)</Label>
              <Textarea
                placeholder="E.g., Mention our new product launch, Keep it under 200 words, etc."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={generateMessage}
              disabled={generatingMessage}
              className="w-full"
            >
              {generatingMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Message
                </>
              )}
            </Button>

            {generatedMessage && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                {generatedMessage.subject && (
                  <div>
                    <Label className="text-xs">Subject Line</Label>
                    <div className="p-3 bg-background border rounded mt-1">
                      <p className="text-sm font-medium">{generatedMessage.subject}</p>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs">{messageType === 'email' ? 'Email Body' : 'Message'}</Label>
                  <div className="p-3 bg-background border rounded mt-1">
                    <p className="text-sm whitespace-pre-wrap">
                      {generatedMessage.body || generatedMessage.message}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        generatedMessage.subject
                          ? `${generatedMessage.subject}\n\n${generatedMessage.body}`
                          : generatedMessage.message
                      );
                      toast.success("Copied to clipboard");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  {messageType === 'email' && (
                    <Button
                      onClick={() => {
                        window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(generatedMessage.subject)}&body=${encodeURIComponent(generatedMessage.body)}`;
                      }}
                      size="sm"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Open in Email
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}