import { DocumentTemplate, TemplateSection, AIContent } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
import { useState } from "react";

interface TemplateRendererProps {
  template: DocumentTemplate;
  aiContent?: AIContent;
  editMode?: boolean;
  onSectionEdit?: (sectionId: string, content: string) => void;
}

export function TemplateRenderer({ 
  template, 
  aiContent, 
  editMode = false,
  onSectionEdit 
}: TemplateRendererProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const getContent = (section: TemplateSection): string => {
    const aiValue = aiContent?.[section.id];
    if (aiValue) return aiValue;
    if (section.defaultContent) return section.defaultContent;
    return section.placeholder;
  };

  const renderSection = (section: TemplateSection) => {
    const content = getContent(section);
    const isEditing = editMode && editingSection === section.id;

    const handleClick = () => {
      if (editMode && section.editable) {
        setEditingSection(section.id);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (onSectionEdit) {
        const content = 'textContent' in e.currentTarget ? e.currentTarget.textContent || "" : "";
        onSectionEdit(section.id, content);
      }
      setEditingSection(null);
    };

    switch (section.type) {
      case "heading":
        return (
          <h1
            key={section.id}
            className={`${section.className} ${editMode && section.editable ? 'cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
          >
            {content}
          </h1>
        );

      case "subheading":
        return (
          <h2
            key={section.id}
            className={`${section.className} ${editMode && section.editable ? 'cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
          >
            {content}
          </h2>
        );

      case "body":
        return (
          <div
            key={section.id}
            className={`${section.className} ${editMode && section.editable ? 'cursor-pointer hover:bg-primary/5 p-3 rounded transition-colors' : ''}`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
          >
            {content}
          </div>
        );

      case "bullet-list":
        const items = content.split('\n').filter(item => item.trim());
        return (
          <ul key={section.id} className={section.className}>
            {items.map((item, idx) => (
              <li
                key={`${section.id}-${idx}`}
                className={`flex items-start gap-2 ${editMode && section.editable ? 'cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors' : ''}`}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onClick={handleClick}
                onBlur={handleBlur}
              >
                <span className="text-primary mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );

      case "image":
        return (
          <div
            key={section.id}
            className={`${section.className} ${editMode && section.editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={handleClick}
          >
            {content ? (
              <img src={content} alt="Document visual" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Image className="h-12 w-12" />
                <span className="text-sm">{section.placeholder}</span>
              </div>
            )}
          </div>
        );

      case "divider":
        return <hr key={section.id} className={section.className} />;

      default:
        return null;
    }
  };

  return (
    <Card 
      className="max-w-4xl mx-auto p-8 shadow-lg"
      style={{
        backgroundColor: template.styles.backgroundColor
      }}
    >
      <div className="space-y-2">
        {template.sections.map(section => renderSection(section))}
      </div>
    </Card>
  );
}
