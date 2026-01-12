import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ReportModuleSelector } from './ReportModuleSelector';
import { ReportViewer, OrchestatedReport } from './ReportViewer';

interface ReportOrchestratorProps {
  assetData?: {
    id: string;
    name: string;
    type: string;
    symbol?: string;
  };
  existingResearch?: any;
}

export function ReportOrchestrator({ assetData, existingResearch }: ReportOrchestratorProps) {
  const [step, setStep] = useState<'config' | 'generating' | 'view'>('config');
  const [selectedModules, setSelectedModules] = useState<string[]>(['asset-research']);
  const [assetName, setAssetName] = useState(assetData?.name || '');
  const [assetType, setAssetType] = useState(assetData?.type || 'fund');
  const [customContext, setCustomContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<OrchestatedReport | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (selectedModules.length === 0) {
      toast.error('Please select at least one report module');
      return;
    }

    if (!assetName.trim()) {
      toast.error('Please enter an asset name');
      return;
    }

    setIsGenerating(true);
    setStep('generating');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('orchestrate-report', {
        body: {
          asset_name: assetName,
          asset_type: assetType,
          asset_id: assetData?.id,
          selected_modules: selectedModules,
          existing_research: existingResearch,
          custom_context: customContext,
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setProgress(100);
      setGeneratedReport(data.report);
      setTimeout(() => setStep('view'), 500);
      toast.success('Research report generated successfully');
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Report generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      toast.error(message);
      setStep('config');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewReport = () => {
    setGeneratedReport(null);
    setStep('config');
    setProgress(0);
  };

  if (step === 'view' && generatedReport) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleNewReport}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
        <ReportViewer report={generatedReport} />
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse delay-150" />
              <div className="absolute inset-4 rounded-full bg-primary/30 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Generating Your Research Report</h3>
              <p className="text-muted-foreground">
                Our AI is analyzing data and compiling your {selectedModules.length} selected module{selectedModules.length !== 1 ? 's' : ''}...
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {selectedModules.map((moduleId) => (
                <Badge key={moduleId} variant="secondary" className="gap-1">
                  {progress > 80 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {moduleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Research Report Generator</h2>
          <p className="text-muted-foreground">
            Create institutional-grade, FCA-compliant research reports
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected
        </Badge>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">1. Select Modules</TabsTrigger>
          <TabsTrigger value="asset">2. Asset Details</TabsTrigger>
          <TabsTrigger value="context">3. Additional Context</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <ReportModuleSelector
            selectedModules={selectedModules}
            onModulesChange={setSelectedModules}
          />
        </TabsContent>

        <TabsContent value="asset">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>
                Enter the details of the asset for your research report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name *</Label>
                  <Input
                    id="assetName"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g., Vanguard S&P 500 ETF"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fund">Fund</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="multi-asset">Multi-Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle>Additional Context (Optional)</CardTitle>
              <CardDescription>
                Provide any additional context or specific areas of focus for the report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g., Focus on ESG factors, recent management changes, or specific market conditions..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || selectedModules.length === 0 || !assetName.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Report
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Compliance Notice */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Compliance Notice:</strong> All generated reports are for informational and research purposes only. 
            They do not constitute investment advice, recommendations, or suitability assessments. 
            Reports are automatically formatted with FCA-compliant disclaimers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
