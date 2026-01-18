import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, History, Settings } from "lucide-react";
import { DocumentTemplate } from "./pdf-generator/templates";
import { TemplateSelector } from "./pdf-generator/TemplateSelector";
import { TemplateForm } from "./pdf-generator/TemplateForm";
import { generatePDFDocument } from "./pdf-generator/PDFDocumentGenerator";
import { toast } from "sonner";
import { useProductivityLogger } from "@/hooks/useProductivityLogger";

interface GeneratedDocument {
  id: string;
  templateName: string;
  category: string;
  generatedAt: Date;
  clientName?: string;
}

export function PDFGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean | number>>({});
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const { logAction } = useProductivityLogger();

  // Load generated documents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flowpulse_generated_documents');
    if (saved) {
      try {
        const docs = JSON.parse(saved);
        setGeneratedDocuments(docs.map((d: any) => ({
          ...d,
          generatedAt: new Date(d.generatedAt)
        })));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Initialize field values when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const initialValues: Record<string, string | boolean | number> = {};
      selectedTemplate.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialValues[field.id] = field.defaultValue;
        } else if (field.type === 'checkbox') {
          initialValues[field.id] = false;
        } else if (field.type === 'number') {
          initialValues[field.id] = 0;
        } else {
          initialValues[field.id] = '';
        }
      });
      setFieldValues(initialValues);
      setSectionContent({});
    }
  }, [selectedTemplate]);

  const handleFieldChange = (fieldId: string, value: string | boolean | number) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSectionChange = (sectionId: string, content: string) => {
    setSectionContent((prev) => ({ ...prev, [sectionId]: content }));
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    logAction({
      actionType: 'document_template_selected',
      description: `Selected template: ${template.name}`,
      entityType: 'document_template',
      entityId: template.id,
      metadata: { template_category: template.category }
    });
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setFieldValues({});
    setSectionContent({});
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const missingFields = selectedTemplate.fields
      .filter((f) => f.required && !fieldValues[f.id])
      .map((f) => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsGenerating(true);

    try {
      // Generate the PDF
      generatePDFDocument({
        template: selectedTemplate,
        fieldValues,
        sectionContent,
      });

      // Save to history
      const newDoc: GeneratedDocument = {
        id: Date.now().toString(),
        templateName: selectedTemplate.name,
        category: selectedTemplate.category,
        generatedAt: new Date(),
        clientName: String(fieldValues.clientName || fieldValues.partyName || ''),
      };

      const updatedDocs = [newDoc, ...generatedDocuments].slice(0, 50); // Keep last 50
      setGeneratedDocuments(updatedDocs);
      localStorage.setItem('flowpulse_generated_documents', JSON.stringify(updatedDocs));

      // Log the action
      await logAction({
        actionType: 'document_generated',
        description: `Generated ${selectedTemplate.name} for ${newDoc.clientName || 'client'}`,
        entityType: 'document',
        entityId: newDoc.id,
        metadata: {
          template_id: selectedTemplate.id,
          template_category: selectedTemplate.category,
          client_name: newDoc.clientName
        }
      });

      toast.success('PDF generated and downloaded successfully!');
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
        <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
          <FileText className="h-6 w-6 text-violet-600" />
          PDF Document Generator
        </CardTitle>
        <CardDescription className="text-slate-500">
          Create professional documents with AI assistance - contracts, invoices, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create" className="gap-2">
              <FileText className="h-4 w-4" />
              Create Document
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History ({generatedDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            {selectedTemplate ? (
              <TemplateForm
                template={selectedTemplate}
                fieldValues={fieldValues}
                sectionContent={sectionContent}
                onFieldChange={handleFieldChange}
                onSectionChange={handleSectionChange}
                onBack={handleBack}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            ) : (
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleSelectTemplate}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {generatedDocuments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents generated yet</p>
                  <p className="text-sm">Documents you generate will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {generatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="py-4 flex items-center justify-between hover:bg-slate-50 px-4 -mx-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.templateName}</p>
                          <p className="text-sm text-slate-500">
                            {doc.clientName && `${doc.clientName} • `}
                            {doc.generatedAt.toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {doc.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
