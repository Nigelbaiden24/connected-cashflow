import { useState, useEffect } from "react";

export interface SectionStyling {
  backgroundColor?: string;
  borderLeftColor?: string;
  borderLeftWidth?: string;
  borderRadius?: string;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  isHero?: boolean;
  padding?: string;
}

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
  styling?: SectionStyling;
}

// Extract color from Tailwind class patterns
function extractColor(className: string, pattern: RegExp): string | undefined {
  const match = className.match(pattern);
  if (!match) return undefined;
  const colorName = match[1];
  return tailwindColorToHex(colorName);
}

// Map common Tailwind color names to hex
function tailwindColorToHex(color: string): string {
  const colorMap: Record<string, string> = {
    // Slate
    'slate-900': '#0f172a', 'slate-800': '#1e293b', 'slate-950': '#020617',
    // Indigo
    'indigo-900': '#312e81', 'indigo-500': '#6366f1', 'indigo-950': '#1e1b4b',
    // Blue
    'blue-900': '#1e3a8a', 'blue-500': '#3b82f6', 'blue-950': '#172554', 'blue-800': '#1e40af',
    // Purple
    'purple-900': '#581c87', 'purple-500': '#a855f7', 'purple-600': '#9333ea',
    // Violet
    'violet-500': '#8b5cf6', 'violet-900': '#4c1d95', 'violet-950': '#2e1065',
    // Emerald
    'emerald-900': '#064e3b', 'emerald-500': '#10b981', 'emerald-800': '#065f46',
    // Teal
    'teal-500': '#14b8a6', 'teal-800': '#115e59', 'teal-900': '#134e4a',
    // Green
    'green-500': '#22c55e',
    // Amber
    'amber-500': '#f59e0b', 'amber-900': '#78350f', 'amber-400': '#fbbf24',
    // Orange
    'orange-500': '#f97316', 'orange-800': '#9a3412', 'orange-950': '#431407',
    // Red
    'red-500': '#ef4444', 'red-900': '#7f1d1d', 'red-950': '#450a0a',
    // Rose
    'rose-500': '#f43f5e', 'rose-900': '#881337', 'rose-950': '#4c0519',
    // Pink
    'pink-500': '#ec4899', 'pink-900': '#831843',
    // Fuchsia
    'fuchsia-500': '#d946ef', 'fuchsia-900': '#701a75', 'fuchsia-950': '#4a044e',
    // Sky
    'sky-500': '#0ea5e9', 'sky-900': '#0c4a6e',
    // Cyan
    'cyan-500': '#06b6d4', 'cyan-950': '#083344',
    // Lime
    'lime-500': '#84cc16',
    // Zinc
    'zinc-700': '#3f3f46', 'zinc-800': '#27272a',
    // Neutral
    'neutral-700': '#404040',
    // Gray
    'gray-900': '#111827',
    // Primary (fallback)
    'primary': '#6366f1',
  };
  return colorMap[color] || undefined;
}

function extractStylingFromClassName(className: string | undefined, sectionId: string, sectionType: string): SectionStyling {
  if (!className) return {};
  
  const styling: SectionStyling = {};

  // Detect hero-header sections
  if (sectionId === 'hero-header' || (className.includes('-mt-8') && className.includes('-mx-8'))) {
    styling.isHero = true;
    
    // Extract gradient colors from hero
    const fromMatch = className.match(/from-([a-z]+-\d+)/);
    const toMatch = className.match(/to-([a-z]+-\d+)/);
    if (fromMatch) styling.gradientFrom = tailwindColorToHex(fromMatch[1]) || '#1e293b';
    if (toMatch) styling.gradientTo = tailwindColorToHex(toMatch[1]) || '#0f172a';
    
    return styling;
  }

  // Detect border-left accent
  const borderMatch = className.match(/border-l-(\d+)\s+border-([a-z]+-\d+)/);
  if (borderMatch) {
    styling.borderLeftWidth = `${borderMatch[1]}px`;
    styling.borderLeftColor = tailwindColorToHex(borderMatch[2]) || '#6366f1';
  }

  // Detect background tint from bg-gradient-to-br from-X/N patterns
  const bgTintMatch = className.match(/bg-gradient-to-br\s+from-([a-z]+-\d+)\/(\d+)/);
  if (bgTintMatch) {
    const baseColor = tailwindColorToHex(bgTintMatch[1]);
    const opacity = parseInt(bgTintMatch[2]) / 100;
    if (baseColor) {
      styling.backgroundColor = hexToRgba(baseColor, opacity * 0.6); // Subtle tint
    }
  }

  // Detect solid-ish background tints like bg-emerald-500/5
  const solidBgMatch = className.match(/bg-([a-z]+-\d+)\/(\d+)/);
  if (!styling.backgroundColor && solidBgMatch) {
    const baseColor = tailwindColorToHex(solidBgMatch[1]);
    const opacity = parseInt(solidBgMatch[2]) / 100;
    if (baseColor) {
      styling.backgroundColor = hexToRgba(baseColor, opacity * 0.6);
    }
  }

  // Detect rounded
  if (className.includes('rounded-2xl') || className.includes('rounded-xl')) {
    styling.borderRadius = '12px';
  } else if (className.includes('rounded-3xl')) {
    styling.borderRadius = '16px';
  }

  // Detect padding
  if (className.includes('p-8') || className.includes('p-10')) {
    styling.padding = '24px';
  } else if (className.includes('p-6')) {
    styling.padding = '20px';
  } else if (className.includes('p-5')) {
    styling.padding = '16px';
  }

  // Extract accent color from after: pseudo elements (heading underlines)
  const afterFromMatch = className.match(/after:from-([a-z]+-\d+)/);
  if (afterFromMatch) {
    styling.accentColor = tailwindColorToHex(afterFromMatch[1]);
  }

  return styling;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useDocumentSections(templateSections: any[] = []) {
  const [sections, setSections] = useState<HeaderSection[]>([]);

  useEffect(() => {
    // Convert template sections to HeaderSection format with initial positioning
    const initialSections = templateSections
      .filter(s => s.editable)
      .map((section, index) => {
        const styling = extractStylingFromClassName(section.className, section.id, section.type);
        
        // Determine text color based on section context
        let textColor = "#1f2937";
        if (section.className?.includes('text-white') || section.className?.includes('text-transparent')) {
          textColor = "#ffffff";
        }
        if (styling.accentColor && (section.type === 'heading' || section.type === 'subheading')) {
          textColor = styling.accentColor;
        }

        // Smart height based on content type
        const isHero = styling.isHero;
        const contentLength = (section.defaultContent || "").length;
        let autoHeight = section.type === 'heading' ? 50 
          : section.type === 'subheading' ? 40 
          : section.type === 'divider' ? 20
          : section.type === 'bullet-list' ? Math.max(80, Math.ceil(contentLength / 80) * 22)
          : Math.max(60, Math.ceil(contentLength / 80) * 18);
        
        if (isHero) autoHeight = 120;

        return {
          id: section.id,
          title: section.id.replace(/-/g, " ").replace(/_/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          content: section.defaultContent || "",
          order: index,
          x: isHero ? 0 : 30,
          y: 0, // will be computed below
          width: isHero ? 700 : 640,
          height: autoHeight,
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
          textColor,
          styling,
        };
      });
    
    // Compute y positions with tight stacking
    let currentY = 0;
    for (const section of initialSections) {
      section.y = currentY;
      currentY += section.height + 8; // 8px gap between sections
    }
    
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
