import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowLeft, Download, FileText } from "lucide-react";
import { DocumentTemplate, getCategoryIcon, getCategoryColor } from "./templates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TemplateFormProps {
  template: DocumentTemplate;
  fieldValues: Record<string, string | boolean | number>;
  sectionContent: Record<string, string>;
  onFieldChange: (fieldId: string, value: string | boolean | number) => void;
  onSectionChange: (sectionId: string, content: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function TemplateForm({
  template,
  fieldValues,
  sectionContent,
  onFieldChange,
  onSectionChange,
  onBack,
  onGenerate,
  isGenerating,
}: TemplateFormProps) {
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("fields");

  const replacePlaceholders = (content: string): string => {
    let result = content;
    Object.entries(fieldValues).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      let displayValue = String(value);
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        displayValue = new Date(value).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      if (typeof value === 'number') {
        displayValue = value.toString();
      }
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  const handleAIAssist = async (sectionId: string) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    setAiLoading(sectionId);

    try {
      const context = Object.entries(fieldValues)
        .filter(([_, v]) => v !== '' && v !== false)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      const prompt = `You are a professional document writer for a UK-based financial advisory firm called FlowPulse.io.

Generate professional content for the "${section.title}" section of a ${template.name} (${template.category}).

Context information:
${context}

Current section content template:
${section.content}

Requirements:
- Write in formal British English
- Be professional and legally appropriate
- Keep the tone appropriate for financial services
- Include any relevant regulatory language if applicable
- Keep it concise but comprehensive
- Do not include any placeholder brackets like {fieldName}

Generate the section content:`;

      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { messages: [{ role: 'user', content: prompt }] },
      });

      if (error) throw error;

      if (data?.content) {
        onSectionChange(sectionId, data.content);
        toast.success('AI content generated successfully');
      } else if (data?.pages?.[0]?.sections?.[0]?.content) {
        onSectionChange(sectionId, data.pages[0].sections[0].content);
        toast.success('AI content generated successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('AI assist error:', error);
      toast.error(error.message || 'Failed to generate AI content');
    } finally {
      setAiLoading(null);
    }
  };

  const renderField = (field: DocumentTemplate['fields'][0]) => {
    const value = fieldValues[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={String(value || '')}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={String(value || '')}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={String(value || '')}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={String(value || '')}
            onChange={(e) => onFieldChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            step="0.01"
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={Boolean(value)}
              onCheckedChange={(checked) => onFieldChange(field.id, Boolean(checked))}
            />
            <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
      case 'select':
        return (
          <Select
            value={String(value || '')}
            onValueChange={(v) => onFieldChange(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const shouldShowSection = (section: DocumentTemplate['sections'][0]) => {
    if (!section.conditional) return true;
    return fieldValues[section.conditional.fieldId] === section.conditional.value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(template.category)}</span>
              <h2 className="text-xl font-bold text-slate-900">{template.name}</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">{template.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("capitalize", getCategoryColor(template.category))}>
          {template.category}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Fields Tab */}
        <TabsContent value="fields" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Details</CardTitle>
              <CardDescription>Fill in the required information for your document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.fields.map((field) => (
                  <div
                    key={field.id}
                    className={cn(
                      "space-y-2",
                      field.type === 'textarea' && "md:col-span-2",
                      field.type === 'checkbox' && "flex items-center pt-6"
                    )}
                  >
                    {field.type !== 'checkbox' && (
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-6 space-y-4">
          {template.sections.filter(shouldShowSection).map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  {section.editable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist(section.id)}
                      disabled={aiLoading === section.id}
                      className="gap-2"
                    >
                      {aiLoading === section.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      AI Assist
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {section.editable ? (
                  <Textarea
                    value={sectionContent[section.id] || replacePlaceholders(section.content)}
                    onChange={(e) => onSectionChange(section.id, e.target.value)}
                    rows={5}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap">
                    {replacePlaceholders(section.content)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Preview</CardTitle>
              <CardDescription>Review your document before generating the PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white min-h-[400px] space-y-6">
                {/* Preview Header */}
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold text-primary">FlowPulse.io</h1>
                  <p className="text-sm text-slate-500">Financial Advisory Platform</p>
                </div>

                {/* Document Title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{template.name.toUpperCase()}</h2>
                  <p className="text-sm text-slate-500">
                    Generated: {new Date().toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Sections */}
                {template.sections.filter(shouldShowSection).map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="font-semibold text-primary">{section.title}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {sectionContent[section.id] || replacePlaceholders(section.content)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          Generate & Download PDF
        </Button>
      </div>
    </div>
  );
}
