import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentTemplate, documentTemplates, getCategoryIcon, getCategoryColor } from "./templates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate | null;
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const categories = ['contract', 'invoice', 'letter', 'agreement', 'proposal'] as const;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">Select a Template</h3>
        <p className="text-sm text-slate-500 mt-1">Choose from our professionally designed templates</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className={cn("text-xs capitalize", getCategoryColor(category))}
          >
            {getCategoryIcon(category)} {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
              "border-2",
              selectedTemplate?.id === template.id
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-slate-200 hover:border-slate-300"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs capitalize", getCategoryColor(template.category))}
                >
                  {template.category}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{template.name}</CardTitle>
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{template.fields.length} fields</span>
                <span>•</span>
                <span>{template.sections.length} sections</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
