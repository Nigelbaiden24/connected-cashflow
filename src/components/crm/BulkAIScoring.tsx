import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface BulkAIScoringProps {
  contacts: any[];
  onComplete?: () => void;
}

export function BulkAIScoring({ contacts, onComplete }: BulkAIScoringProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [progress, setProgress] = useState(0);

  const scoreAllContacts = async () => {
    if (contacts.length === 0) {
      toast.error("No contacts to score");
      return;
    }

    setIsScoring(true);
    setProgress(0);

    try {
      // Process in batches of 10
      const batchSize = 10;
      let processed = 0;

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        
        const { data, error } = await supabase.functions.invoke('crm-ai-insights', {
          body: {
            action: 'score_leads',
            contacts: batch
          }
        });

        if (error) {
          console.error('Batch scoring error:', error);
          toast.error(`Error scoring batch ${Math.floor(i / batchSize) + 1}`);
        } else {
          processed += data.processed;
        }

        setProgress(Math.round(((i + batchSize) / contacts.length) * 100));
      }

      toast.success(`Successfully scored ${processed} contacts`);
      onComplete?.();
    } catch (error) {
      console.error('Error scoring contacts:', error);
      toast.error("Failed to score contacts");
    } finally {
      setIsScoring(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Lead Scoring
        </CardTitle>
        <CardDescription>
          Automatically score all contacts using AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contacts to analyze:</span>
            <span className="font-medium">{contacts.length}</span>
          </div>
          {isScoring && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                Processing... {progress}%
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={scoreAllContacts}
          disabled={isScoring || contacts.length === 0}
          className="w-full"
        >
          {isScoring ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Contacts...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Score All Contacts with AI
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          This will analyze engagement patterns, contact data quality, and conversion signals
          to provide predictive lead scores for all contacts.
        </p>
      </CardContent>
    </Card>
  );
}