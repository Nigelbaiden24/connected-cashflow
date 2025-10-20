export interface TemplateSection {
  id: string;
  type: "heading" | "subheading" | "body" | "bullet-list" | "image" | "divider";
  placeholder: string;
  defaultContent?: string;
  className?: string;
  editable: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  sections: TemplateSection[];
  styles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
}

export interface AIContent {
  [key: string]: string;
}
