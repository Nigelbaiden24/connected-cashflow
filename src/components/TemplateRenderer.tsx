import { DocumentTemplate, TemplateSection, AIContent } from "@/types/template";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
import { useState, useMemo } from "react";

interface TemplateRendererProps {
  template: DocumentTemplate;
  aiContent?: AIContent;
  editMode?: boolean;
  onSectionEdit?: (sectionId: string, content: string) => void;
}

interface SectionGroup {
  type: 'hero' | 'normal';
  sections: TemplateSection[];
}

export function TemplateRenderer({ 
  template, 
  aiContent, 
  editMode = false,
  onSectionEdit 
}: TemplateRendererProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Group hero-header with subsequent z-10 sections so they render overlaid
  const sectionGroups = useMemo(() => {
    const groups: SectionGroup[] = [];
    let i = 0;
    const sections = template.sections;
    
    while (i < sections.length) {
      const section = sections[i];
      
      if (section.id === 'hero-header' || (section.className?.includes('-mt-8') && section.className?.includes('-mx-8'))) {
        // Start a hero group
        const heroGroup: SectionGroup = { type: 'hero', sections: [section] };
        i++;
        // Collect subsequent z-10 sections (titles, subtitles, badges, meta)
        while (i < sections.length && sections[i].className?.includes('z-10')) {
          heroGroup.sections.push(sections[i]);
          i++;
        }
        groups.push(heroGroup);
      } else {
        groups.push({ type: 'normal', sections: [section] });
        i++;
      }
    }
    
    return groups;
  }, [template.sections]);

  const getContent = (section: TemplateSection): string => {
    const aiValue = aiContent?.[section.id];
    if (aiValue) return aiValue;
    if (section.defaultContent) return section.defaultContent;
    return section.placeholder;
  };

  const renderSection = (section: TemplateSection, insideHero = false) => {
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

  const renderGroup = (group: SectionGroup, groupIndex: number) => {
    if (group.type === 'hero') {
      const heroSection = group.sections[0];
      const childSections = group.sections.slice(1);
      
      return (
        <div key={`hero-group-${groupIndex}`} className={heroSection.className}>
          {childSections.map(section => renderSection(section, true))}
        </div>
      );
    }
    
    return group.sections.map(section => renderSection(section));
  };

  return (
    <Card 
      className="max-w-4xl mx-auto p-8 shadow-lg"
      style={{
        backgroundColor: template.styles.backgroundColor
      }}
    >
      <div className="space-y-2 text-center">
        {sectionGroups.map((group, index) => renderGroup(group, index))}
      </div>
    </Card>
  );
}
