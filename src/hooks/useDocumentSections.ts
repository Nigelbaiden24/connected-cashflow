import { useState, useEffect } from "react";

export interface HeaderSection {
  id: string;
  title: string;
  content: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isCustom?: boolean;
  type?: string;
  className?: string;
  editable?: boolean;
  placeholder?: string;
  defaultContent?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  pageId?: string;
}

export function useDocumentSections(templateSections: any[] = []) {
  const [sections, setSections] = useState<HeaderSection[]>([]);

  useEffect(() => {
    // Convert template sections to HeaderSection format with initial positioning
    const initialSections = templateSections
      .filter(s => s.editable)
      .map((section, index) => ({
        id: section.id,
        title: section.id.replace(/-/g, " ").replace(/_/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        content: section.defaultContent || "",
        order: index,
        x: 50,
        y: 50 + (index * 150), // Stack sections vertically with spacing
        width: 600,
        height: 100,
        isCustom: false,
        type: section.type,
        className: section.className,
        editable: section.editable,
        placeholder: section.placeholder || "",
        defaultContent: section.defaultContent,
        fontFamily: "Inter",
        fontSize:
          section.type === "heading"
            ? 28
            : section.type === "subheading"
              ? 20
              : 14,
        textColor: "#000000",
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
