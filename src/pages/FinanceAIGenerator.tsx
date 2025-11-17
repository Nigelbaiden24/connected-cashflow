import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Sparkles, Download, FileText, Upload, Image as ImageIcon, Wand2, Plus, Trash2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { documentTemplates } from "@/data/documentTemplates";
import { renderTemplateToHtml } from "@/lib/templateRenderer";
import html2pdf from "html2pdf.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocumentImageUpload } from "@/components/DocumentImageUpload";
import { DraggableImage } from "@/components/DraggableImage";

interface UploadedImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const FinanceAIGenerator = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("financial-plan");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editPrompts, setEditPrompts] = useState<Record<string, string>>({});
  const [showPrompt, setShowPrompt] = useState<string | null>(null);
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});
  const [textColors, setTextColors] = useState<Record<string, string>>({});
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [pages, setPages] = useState<number[]>([1]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [userEmail] = useState("finance@flowpulse.io");
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setEditPrompts({});
    setCustomHeaders({});
    setTextColors({});
    setBackgroundColor("#ffffff");
    setLogoUrl("");
    setUploadedImages([]);
    setPages([1]);
    setCurrentPage(1);
  };

  const handleImagePositionChange = (id: string, x: number, y: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, x, y } : img)
    );
  };

  const handleImageSizeChange = (id: string, width: number, height: number) => {
    setUploadedImages(images =>
      images.map(img => img.id === id ? { ...img, width, height } : img)
    );
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages(images => images.filter(img => img.id !== id));
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoUrl(result);
      toast({
        title: "Logo uploaded!",
        description: "Your logo has been added to the document.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddPage = () => {
    const newPageNumber = Math.max(...pages) + 1;
    setPages([...pages, newPageNumber]);
    setCurrentPage(newPageNumber);
  };

  const handleRemovePage = (pageNumber: number) => {
    if (pages.length <= 1) {
      toast({
        title: "Cannot remove page",
        description: "Document must have at least one page.",
        variant: "destructive"
      });
      return;
    }
    setPages(pages.filter(p => p !== pageNumber));
    if (currentPage === pageNumber) {
      setCurrentPage(pages[0]);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAIAssist = async (fieldId: string, customPrompt?: string) => {
    const template = documentTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const section = template.sections.find(s => s.id === fieldId);
    if (!section) return;

    setIsGeneratingField(fieldId);
    
    try {
      const basePrompt = customPrompt || `Generate professional financial content for a ${section.type} section titled "${section.id}". 
      Context: ${formData.clientName || 'Professional client'} - ${template.name}
      Requirements: 
      - ${section.type === 'heading' ? 'Create a short, impactful title (max 10 words)' : ''}
      - ${section.type === 'subheading' ? 'Create a concise section title (max 8 words)' : ''}
      - ${section.type === 'body' ? 'Write 2-3 professional paragraphs' : ''}
      - ${section.type === 'bullet-list' ? 'Create 3-5 bullet points (no bullet characters)' : ''}
      Return ONLY the content, no formatting or explanations.`;

      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { messages: [{ role: "user", content: basePrompt }] }
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.response || "";
      handleFieldChange(fieldId, content.trim());
      setShowPrompt(null);
      setEditPrompts(prev => ({ ...prev, [fieldId]: '' }));

      toast({
        title: "Content generated!",
        description: "AI has filled this field for you.",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingField(null);
    }
  };

  const handleFillEntireDocument = async (generalPrompt: string) => {
    const template = documentTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsGeneratingAll(true);
    
    try {
      const editableFields = template.sections.filter(s => s.editable && s.type !== 'image');
      
      for (const field of editableFields) {
        const contextualPrompt = generalPrompt 
          ? `${generalPrompt}\n\nNow generate content for the "${field.id}" section of this ${template.name}.`
          : '';
        await handleAIAssist(field.id, contextualPrompt);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Document generated!",
        description: "All fields have been filled with AI content.",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAll(false);
      setShowPrompt(null);
    }
  };

  const handleImageUpload = async (fieldId: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleFieldChange(fieldId, result);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image uploaded!",
        description: "Your image has been added to the document.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGenerateImage = async (fieldId: string, prompt: string) => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingField(fieldId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"]
        }
      });

      if (error) throw error;

      const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        handleFieldChange(fieldId, imageUrl);
        setShowPrompt(null);
        setEditPrompts(prev => ({ ...prev, [fieldId]: '' }));
        toast({
          title: "Image generated!",
          description: "AI has created your image.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingField(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const opt = {
      margin: 5,
      filename: `${selectedTemplate}-${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { 
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(previewRef.current).save();
      toast({
        title: "PDF downloaded!",
        description: "Your document has been saved.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    }
  };

  const template = documentTemplates.find(t => t.id === selectedTemplate);
  const editableFields = template?.sections.filter(s => s.editable) || [];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Document Generator</h1>
          </div>
              {/* Mobile Preview Toggle */}
              <Button 
                variant="outline" 
                size="sm"
                className="lg:hidden"
                onClick={() => {
                  const preview = document.getElementById('live-preview');
                  if (preview) {
                    preview.classList.toggle('hidden');
                    preview.classList.toggle('block');
                  }
                }}
              >
                Toggle Preview
              </Button>
              {template && (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1 items-center border-r pr-2">
                    {pages.map((page) => (
                      <div key={page} className="flex items-center gap-1">
                        <Button
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          Page {page}
                        </Button>
                        {pages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePage(page)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddPage}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Page
                    </Button>
                  </div>
                  <Dialog open={showPrompt === 'fill-all'} onOpenChange={(open) => setShowPrompt(open ? 'fill-all' : null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm"
                        disabled={isGeneratingAll}
                      >
                        {isGeneratingAll ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4 mr-2" />
                        )}
                        Fill Entire Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fill Entire Document</DialogTitle>
                        <DialogDescription>
                          Describe the overall context or theme for this document (optional)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="E.g., 'This is for a technology startup seeking Series A funding...' or leave empty for default generation"
                          value={editPrompts['fill-all'] || ''}
                          onChange={(e) => setEditPrompts(prev => ({ ...prev, 'fill-all': e.target.value }))}
                          rows={4}
                        />
                        <Button
                          onClick={() => handleFillEntireDocument(editPrompts['fill-all'] || '')}
                          disabled={isGeneratingAll}
                          className="w-full"
                        >
                          {isGeneratingAll ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate All Fields
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </header>

          {!template ? (
            <main className="p-6">
              <h3 className="text-xl font-semibold mb-4">Select a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {documentTemplates.map((tmpl) => (
                  <Card 
                    key={tmpl.id}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50`}
                    onClick={() => handleTemplateSelect(tmpl.id)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg mb-3 overflow-hidden">
                        {tmpl.thumbnail ? (
                          <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 h-full flex items-center justify-center">
                            <FileText className="h-12 w-12 text-primary" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          ) : (
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Input Fields */}
              <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <Card>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate("")}
                      className="mt-2"
                    >
                      Change Template
                    </Button>
                  </CardHeader>
                   <CardContent className="space-y-6">
                    {/* Document Settings */}
                    <div className="space-y-4 pb-6 border-b">
                      <h3 className="font-semibold text-sm">Document Settings</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm mb-2 block">Background Color</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground">{backgroundColor}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm mb-2 block">Company Logo</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                              }}
                              className="hidden"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {logoUrl ? "Change Logo" : "Upload Logo"}
                            </Button>
                            {logoUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLogoUrl("")}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          {logoUrl && (
                            <div className="mt-2 border rounded-md p-2 inline-block">
                              <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="pb-6 border-b">
                      <DocumentImageUpload 
                        images={uploadedImages}
                        onImagesChange={setUploadedImages}
                      />
                    </div>

                    {editableFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={customHeaders[field.id] || field.id.replace(/-/g, ' ')}
                              onChange={(e) => setCustomHeaders(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="font-medium capitalize max-w-xs"
                            />
                          </div>
                          {field.type === 'image' ? (
                            <Dialog open={showPrompt === field.id} onOpenChange={(open) => setShowPrompt(open ? field.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Add Image</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Image</DialogTitle>
                                  <DialogDescription>Upload your own image or generate one with AI</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm mb-2 block">Upload Image</Label>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(field.id, file);
                                      }}
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Choose File
                                    </Button>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                      <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm mb-2 block">Generate with AI</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Describe the image you want..."
                                        value={editPrompts[field.id] || ''}
                                        onChange={(e) => setEditPrompts(prev => ({ ...prev, [field.id]: e.target.value }))}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleGenerateImage(field.id, editPrompts[field.id] || '')}
                                        disabled={isGeneratingField === field.id}
                                      >
                                        {isGeneratingField === field.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Sparkles className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Dialog open={showPrompt === field.id} onOpenChange={(open) => setShowPrompt(open ? field.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  <span className="text-xs">Edit with AI</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit with AI</DialogTitle>
                                  <DialogDescription>
                                    Describe what you want or leave empty for auto-generation
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="E.g., 'Write about investment strategies for retirement planning' or leave empty..."
                                    value={editPrompts[field.id] || ''}
                                    onChange={(e) => setEditPrompts(prev => ({ ...prev, [field.id]: e.target.value }))}
                                    rows={3}
                                  />
                                  <Button
                                    onClick={() => handleAIAssist(field.id, editPrompts[field.id])}
                                    disabled={isGeneratingField === field.id}
                                    className="w-full"
                                  >
                                    {isGeneratingField === field.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Content
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        {field.type === 'image' ? (
                          <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-border">
                            {formData[field.id] ? (
                              <img 
                                src={formData[field.id]} 
                                alt={field.id} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  console.error('Image failed to load:', formData[field.id]);
                                  e.currentTarget.src = '';
                                }}
                              />
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No image added</p>
                              </div>
                            )}
                          </div>
                        ) : field.type === 'body' || field.type === 'bullet-list' ? (
                          <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Palette className="h-3 w-3" />
                                Text Color
                              </Label>
                              <Input
                                type="color"
                                value={textColors[field.id] || '#000000'}
                                onChange={(e) => setTextColors(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-16 h-8 p-1 cursor-pointer"
                              />
                            </div>
                            <Textarea
                              id={field.id}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              rows={field.type === 'body' ? 4 : 6}
                              className="text-sm"
                              style={{ color: textColors[field.id] || '#000000' }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Palette className="h-3 w-3" />
                                Text Color
                              </Label>
                              <Input
                                type="color"
                                value={textColors[field.id] || '#000000'}
                                onChange={(e) => setTextColors(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-16 h-8 p-1 cursor-pointer"
                              />
                            </div>
                            <Input
                              id={field.id}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="text-sm"
                              style={{ color: textColors[field.id] || '#000000' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Live Preview */}
              <div id="live-preview" className="w-full hidden lg:block">
                <Card className="max-h-[calc(100vh-120px)]">
                   <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>See your document as you type</CardDescription>
                  </CardHeader>
                   <CardContent className="overflow-visible">
                    <div className="space-y-4">
                      {pages.map((page) => (
                        <div key={page} className={page === currentPage ? 'block' : 'hidden'}>
                          <div 
                            ref={page === currentPage ? previewRef : null}
                            className="p-8 rounded-lg shadow-sm min-h-[297mm] relative"
                            style={{ backgroundColor, position: 'relative' }}
                          >
                            {logoUrl && (
                              <div className="mb-6 flex justify-start">
                                <img src={logoUrl} alt="Company Logo" className="h-16 object-contain" />
                              </div>
                            )}
                            <div dangerouslySetInnerHTML={{
                              __html: renderTemplateToHtml(template, formData, textColors)
                            }} />
                            
                            {/* Draggable Images */}
                            {uploadedImages.map((image) => (
                              <DraggableImage
                                key={image.id}
                                id={image.id}
                                src={image.url}
                                x={image.x}
                                y={image.y}
                                width={image.width}
                                height={image.height}
                                onPositionChange={handleImagePositionChange}
                                onSizeChange={handleImageSizeChange}
                                onRemove={handleRemoveImage}
                              />
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                   </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
  );
};

export default FinanceAIGenerator;
