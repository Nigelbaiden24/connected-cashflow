import { useState, useEffect } from "react";

export interface HeaderSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isCustom?: boolean;
  type?: string;
  className?: string;
  editable?: boolean;
  placeholder?: string;
  defaultContent?: string;
}

export function useDocumentSections(templateSections: any[] = []) {
  const [sections, setSections] = useState<HeaderSection[]>([]);

  useEffect(() => {
    // Convert template sections to HeaderSection format
    const initialSections = templateSections
      .filter(s => s.editable)
      .map((section, index) => ({
        id: section.id,
        title: section.id.replace(/-/g, " ").replace(/_/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        content: section.defaultContent || "",
        order: index,
        isCustom: false,
        type: section.type,
        className: section.className,
        editable: section.editable,
        placeholder: section.placeholder || "",
        defaultContent: section.defaultContent,
      }));
    
    setSections(initialSections);
  }, [templateSections]);

  const updateSectionContent = (sectionId: string, content: string) => {
    setSections(prev =>
      prev.map(s => (s.id === sectionId ? { ...s, content } : s))
    );
  };

  const getSectionContent = (sectionId: string): string => {
    const section = sections.find(s => s.id === sectionId);
    return section?.content || "";
  };

  return {
    sections,
    setSections,
    updateSectionContent,
    getSectionContent,
  };
}
