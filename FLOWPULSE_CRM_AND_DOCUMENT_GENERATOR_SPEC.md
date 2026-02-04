# FlowPulse CRM & Document Generator - Complete Implementation Specification

This document provides the complete architecture, logic, and implementation details for recreating the CRM and Document Generator systems.

---

## TABLE OF CONTENTS

1. [CRM System](#crm-system)
   - [Database Schema](#crm-database-schema)
   - [Core Components](#crm-core-components)
   - [Features](#crm-features)
   - [Implementation Details](#crm-implementation-details)

2. [Document Generator](#document-generator)
   - [Architecture](#document-generator-architecture)
   - [Template System](#template-system)
   - [GrapesJS Editor Integration](#grapesjs-editor-integration)
   - [PDF Export](#pdf-export)

---

# CRM SYSTEM

## CRM Database Schema

### Required Tables

```sql
-- Main contacts table
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, prospect, qualified lead, proposal, negotiation, contract sent, closed
  priority TEXT DEFAULT 'medium', -- high, medium, low
  notes TEXT,
  ai_score INTEGER, -- AI lead scoring 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom columns for contacts
CREATE TABLE public.crm_custom_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  column_name TEXT NOT NULL,
  column_type TEXT DEFAULT 'text', -- text, select, checkbox, date, number
  column_options JSONB, -- For select type: array of options
  column_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom column data for contacts
CREATE TABLE public.crm_contact_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  column_id UUID REFERENCES crm_custom_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Custom CRM boards (separate tables/views)
CREATE TABLE public.crm_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  columns JSONB DEFAULT '["Name", "Email", "Phone", "Company", "Position", "Status", "Priority"]',
  column_configs JSONB DEFAULT '{}', -- Column type configurations
  rows JSONB DEFAULT '[]', -- Row data stored as JSON
  display_order INTEGER DEFAULT 0,
  view_mode TEXT DEFAULT 'table', -- table or cards
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_boards ENABLE ROW LEVEL SECURITY;

-- RLS Policies (user-specific data)
CREATE POLICY "Users can manage their own contacts" ON public.crm_contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own columns" ON public.crm_custom_columns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own boards" ON public.crm_boards
  FOR ALL USING (auth.uid() = user_id);
```

## CRM Core Components

### 1. Main CRM Page (`src/pages/CRM.tsx`)

```typescript
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, DollarSign, ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRMBoard } from "@/components/CRMBoard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BulkImportDialog } from "@/components/crm/BulkImportDialog";

const CRM = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage');
  const [totalContacts, setTotalContacts] = useState(0);
  const [activeContacts, setActiveContacts] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: allContacts } = await supabase
      .from("crm_contacts")
      .select("id, status");

    setTotalContacts(allContacts?.length || 0);
    setActiveContacts(
      allContacts?.filter((c) => c.status === "active").length || 0
    );
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>
        {/* More stat cards... */}
      </div>

      {/* CRM Board with stage filter from URL */}
      <CRMBoard key={refreshTrigger} initialStage={stageFilter} />

      <BulkImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={() => {
          fetchStats();
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
};
```

### 2. CRMBoard Component (`src/components/CRMBoard.tsx`)

This is the main CRM component with ~2300 lines. Key features:

```typescript
// Types
interface CRMTable {
  id: string;
  name: string;
  columns: string[];
  columnConfigs?: Record<string, ColumnConfig>;
  rows: Record<string, string>[];
  searchQuery?: string;
  filterStatus?: string;
  selectedRows?: string[];
  compactView?: boolean;
  viewMode?: "table" | "cards";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ColumnConfig {
  type: "text" | "select" | "checkbox" | "date" | "number";
  required?: boolean;
  options?: string[]; // For select type
}

// Main component structure
export const CRMBoard = ({ initialStage }: { initialStage?: string | null }) => {
  // State
  const [contacts, setContacts] = useState<any[]>([]);
  const [customColumns, setCustomColumns] = useState<any[]>([]);
  const [customData, setCustomData] = useState<Record<string, Record<string, string>>>({});
  const [tables, setTables] = useState<CRMTable[]>([]); // Custom boards
  const [filterStatus, setFilterStatus] = useState<string>(initialStage || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch boards from database
  const fetchBoards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("crm_boards")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    const boardsFromDb: CRMTable[] = (data || []).map(boardData => ({
      id: boardData.id,
      name: boardData.name,
      columns: Array.isArray(boardData.columns) ? boardData.columns : ["Item", "Status"],
      columnConfigs: boardData.column_configs || {},
      rows: Array.isArray(boardData.rows) ? boardData.rows : [],
      viewMode: boardData.view_mode || "table",
    }));
    
    setTables(boardsFromDb);
  };

  // CRUD operations for contacts
  const addContact = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("crm_contacts")
      .insert([{ ...newContact, user_id: user.id }])
      .select()
      .single();
    // Initialize custom column data...
  };

  const updateContactField = async (id: string, field: string, value: string) => {
    await supabase
      .from("crm_contacts")
      .update({ [field]: value })
      .eq("id", id);
  };

  const deleteContact = async (id: string) => {
    await supabase.from("crm_contact_data").delete().eq("contact_id", id);
    await supabase.from("crm_contacts").delete().eq("id", id);
  };

  // Custom board operations
  const addTable = async () => {
    const defaultColumns = ["Name", "Email", "Phone", "Company", "Position", "Status", "Priority"];
    const defaultColumnConfigs = {
      "Name": { type: "text", required: true },
      "Status": { type: "select", options: ["active", "inactive", "prospect", "qualified lead", "proposal", "negotiation", "contract sent", "closed"] },
      "Priority": { type: "select", options: ["high", "medium", "low"] },
    };

    await supabase.from("crm_boards").insert({
      user_id: user.id,
      name: newTableName,
      columns: defaultColumns,
      column_configs: defaultColumnConfigs,
      rows: [],
      display_order: tables.length,
    });
  };

  // Filtering and sorting
  const filteredContacts = contacts.filter((contact) => {
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    const matchesSearch = searchQuery === "" ||
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aValue = a[sortBy] || "";
    const bValue = b[sortBy] || "";
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedContacts.length / pageSize);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Render includes: toolbar, filters, table/cards view, custom boards...
};
```

### 3. Next Action AI Component (`src/components/crm/NextActionAI.tsx`)

AI-powered actions for client interactions:

```typescript
type ActionType = "ai-email" | "ai-contract" | "calendar-link" | "ai-intro" | "follow-up" | "invoice";

const actionOptions = [
  { value: "ai-email", label: "Send AI Email", icon: <Mail />, description: "Generate and send a personalized email" },
  { value: "ai-contract", label: "Send AI Contract", icon: <FileText />, description: "Generate a contract document" },
  { value: "calendar-link", label: "Send Calendar Link", icon: <Calendar />, description: "Share your booking calendar" },
  { value: "ai-intro", label: "Send AI Intro Email", icon: <UserPlus />, description: "Generate an introduction email" },
  { value: "follow-up", label: "Send Follow-up", icon: <Send />, description: "Generate a follow-up message" },
  { value: "invoice", label: "Send Invoice", icon: <Receipt />, description: "Create and send an invoice" },
];

export function NextActionAI({ contacts, selectedContactIds = [] }: NextActionAIProps) {
  const handleGenerate = async () => {
    // Uses Supabase Edge Function for AI generation
    const { data } = await supabase.functions.invoke("business-chat", {
      body: {
        message: userPrompt,
        systemPrompt,
      },
    });
    setGeneratedContent(data.response);
  };

  // Opens mailto: with generated content
  const handleSend = () => {
    const mailtoLink = `mailto:${selectedContact.email}?subject=${subject}&body=${encodeURIComponent(generatedContent)}`;
    window.open(mailtoLink, "_blank");
  };
}
```

### 4. Bulk Import Dialog (`src/components/crm/BulkImportDialog.tsx`)

CSV import with column mapping:

```typescript
// Uses PapaParse for CSV parsing
import Papa from "papaparse";

// Auto-mapping based on header names
const autoMapping: ColumnMapping = {};
headers.forEach((header) => {
  const normalized = header.toLowerCase().trim();
  if (normalized.includes('name')) autoMapping[header] = 'name';
  else if (normalized.includes('email')) autoMapping[header] = 'email';
  else if (normalized.includes('phone')) autoMapping[header] = 'phone';
  else if (normalized.includes('company')) autoMapping[header] = 'company';
  else if (normalized.includes('position')) autoMapping[header] = 'position';
  else autoMapping[header] = 'skip';
});

// Batch insert with progress tracking
for (let i = 0; i < totalRows; i += batchSize) {
  const batch = parsedData.rows.slice(i, i + batchSize);
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert(contactsToInsert)
    .select();
  setImportProgress(Math.round(((i + batch.length) / totalRows) * 100));
}
```

### 5. AI Lead Scoring Badge (`src/components/crm/AILeadScoringBadge.tsx`)

```typescript
export function AILeadScoringBadge({ score, conversionProbability, size = "default" }) {
  const getScoreDetails = () => {
    if (score >= 75) return { label: "Hot Lead", variant: "default", color: "text-green-600" };
    else if (score >= 50) return { label: "Warm Lead", variant: "secondary", color: "text-yellow-600" };
    else return { label: "Cold Lead", variant: "outline", color: "text-muted-foreground" };
  };
  // Renders as a badge with tooltip showing conversion probability
}
```

## CRM Features Summary

1. **Main Contacts Table**: CRUD operations with inline editing
2. **Custom Columns**: Add dynamic columns with different types (text, select, checkbox, date, number)
3. **Custom Boards**: Create separate tables with custom structure
4. **Filtering**: By status (active, inactive, prospect, qualified lead, proposal, negotiation, contract sent, closed)
5. **Sorting**: By any column, ascending/descending
6. **Search**: Global search across name, email, company
7. **Pagination**: Configurable page size with navigation
8. **View Modes**: Table view and Cards view
9. **Bulk Operations**: Select multiple, delete selected
10. **CSV Import**: With column mapping and batch processing
11. **AI Actions**: Generate emails, contracts, invoices with AI
12. **AI Lead Scoring**: Score contacts 0-100 with conversion probability

---

# DOCUMENT GENERATOR

## Document Generator Architecture

### Types (`src/types/template.ts`)

```typescript
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
  [key: string]: string; // sectionId -> content
}
```

## Template System

### Template Definition Example (`src/data/businessTemplates.ts`)

```typescript
export const businessTemplates: DocumentTemplate[] = [
  {
    id: "contract",
    name: "Contract",
    category: "Business",
    description: "Professional contract template for agreements",
    sections: [
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "SERVICE AGREEMENT",
        className: "text-5xl font-bold text-success mb-4",
        editable: true
      },
      {
        id: "contract-number",
        type: "subheading",
        placeholder: "{{contract_number}}",
        defaultContent: "Contract No. SA-2025-001",
        className: "text-xl text-muted-foreground mb-8",
        editable: true
      },
      {
        id: "parties-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Parties",
        className: "text-2xl font-semibold text-success mb-4",
        editable: true
      },
      {
        id: "parties",
        type: "body",
        placeholder: "{{parties}}",
        defaultContent: "This Agreement is entered into on [Date] between:\n\nParty A: [Company Name]\nAddress: [Address]\n\nAND\n\nParty B: [Client Name]\nAddress: [Address]",
        className: "text-base leading-relaxed mb-8 text-foreground bg-muted/30 p-6 rounded",
        editable: true
      },
      {
        id: "services",
        type: "bullet-list",
        placeholder: "{{services}}",
        defaultContent: "Consulting and advisory services\nProject management\nOngoing support",
        className: "space-y-2 mb-8 text-base",
        editable: true
      },
      {
        id: "signatures",
        type: "body",
        placeholder: "{{signatures}}",
        defaultContent: "Party A Signature: _____________________\nDate: _____________________",
        className: "text-base mt-12 border-t pt-8",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(142 76% 36%)",
      secondaryColor: "hsl(142 70% 45%)",
      accentColor: "hsl(142 65% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  // More templates: business-invoice, business-plan, proposal, client-letter, etc.
];
```

### Template Renderer (`src/lib/templateRenderer.ts`)

Converts templates to HTML:

```typescript
export function renderTemplateToHtml(template: DocumentTemplate, aiContent: AIContent, textColors?: Record<string, string>): string {
  const { styles } = template;
  
  // Generate CSS
  const css = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a202c; }
      .template-container { max-width: 1200px; margin: 0 auto; background: ${styles.backgroundColor}; }
      h1, h2, h3 { line-height: 1.2; margin-bottom: 16px; color: ${styles.primaryColor}; }
      .editable { position: relative; min-height: 20px; }
      .editable:empty:before { content: attr(data-placeholder); color: #a0aec0; font-style: italic; }
    </style>
  `;
  
  // Render sections based on type
  const sectionsHtml = template.sections.map(section => {
    const content = aiContent[section.id] || section.defaultContent || '';
    const className = `${section.className || ''} ${section.editable ? 'editable' : ''}`;
    
    switch (section.type) {
      case 'heading':
        return `<h1 class="${className}" data-section-id="${section.id}">${content}</h1>`;
      case 'subheading':
        return `<h2 class="${className}" data-section-id="${section.id}">${content}</h2>`;
      case 'body':
        return `<div class="section ${className}" data-section-id="${section.id}"><p>${content.replace(/\n/g, '</p><p>')}</p></div>`;
      case 'bullet-list':
        const items = content.split('\n').filter(item => item.trim());
        return `<ul class="${className}" data-section-id="${section.id}">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
      case 'image':
        return content ? 
          `<img src="${content}" alt="${section.id}" class="${className}" />` :
          `<div class="${className}">📷 Image Placeholder</div>`;
      case 'divider':
        return `<hr style="border-top: 2px solid ${styles.primaryColor}; margin: 40px 0; opacity: 0.2;" />`;
      default:
        return `<div class="${className}" data-section-id="${section.id}">${content}</div>`;
    }
  }).join('\n');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${template.name}</title>
      ${css}
    </head>
    <body>
      <div class="template-container">
        <div class="content-wrapper" style="padding: 40px;">
          ${sectionsHtml}
        </div>
      </div>
    </body>
    </html>
  `;
}
```

## GrapesJS Editor Integration

### GrapesJS Editor Component (`src/components/GrapesjsEditor.tsx`)

~880 lines - Full drag-and-drop editor:

```typescript
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

interface GrapesjsEditorProps {
  initialHtml: string;
  onSave?: (html: string, css: string) => void;
  height?: string;
}

export function GrapesjsEditor({ initialHtml, onSave, height = '100vh' }: GrapesjsEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height,
      width: 'auto',
      fromElement: false,
      storageManager: false,
      plugins: [gjsPresetWebpage],
      pluginsOpts: {
        [gjsPresetWebpage]: {
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
          navbarOpts: false,
          countdownOpts: false,
          formsOpts: false,
        }
      },
      styleManager: {
        sectors: [
          { name: 'General', buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom', 'z-index'] },
          { name: 'Dimension', buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'] },
          { name: 'Typography', buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration'] },
          { name: 'Decorations', buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background'] },
        ],
      },
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              { id: 'visibility', label: '👁️', command: 'sw-visibility' },
              { id: 'fullscreen', label: '⛶', command: 'fullscreen' },
              { id: 'undo', label: '↶', command: 'core:undo' },
              { id: 'redo', label: '↷', command: 'core:redo' },
              { id: 'save', label: '💾', command: 'save-template' },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              { id: 'device-desktop', label: '🖥️', command: 'set-device-desktop', active: true },
              { id: 'device-tablet', label: '📱', command: 'set-device-tablet' },
              { id: 'device-mobile', label: '📲', command: 'set-device-mobile' },
            ],
          },
        ],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px' },
          { name: 'Mobile', width: '320px' },
        ],
      },
    });

    // Custom Commands
    editor.Commands.add('save-template', {
      run: () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        onSave?.(html, css);
      },
    });

    // Add Custom Blocks
    const bm = editor.BlockManager;

    // Text Blocks
    bm.add('text-paragraph', {
      label: '📄 Paragraph',
      content: '<p style="padding: 10px; line-height: 1.6;">Insert your text here.</p>',
      category: 'Text',
    });

    bm.add('heading-h1', {
      label: 'H1',
      content: '<h1 style="font-size: 2.5rem; font-weight: bold;">Main Heading</h1>',
      category: 'Text',
    });

    bm.add('quote-block', {
      label: '💬 Quote',
      content: '<blockquote style="padding: 20px; border-left: 4px solid #667eea; background: #f7fafc; font-style: italic;">"Quote here"</blockquote>',
      category: 'Text',
    });

    // Layout Blocks
    bm.add('container', {
      label: '📦 Container',
      content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">Container Content</div>',
      category: 'Layout',
    });

    bm.add('section', {
      label: '📋 Section',
      content: '<section style="padding: 60px 20px;"><h2>Section Title</h2><p>Content</p></section>',
      category: 'Layout',
    });

    // Component Blocks
    bm.add('card', {
      label: '🎴 Card',
      content: `<div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="font-size: 1.5rem; font-weight: 700;">Card Title</h3>
        <p style="color: #64748b;">Card content</p>
      </div>`,
      category: 'Components',
    });

    bm.add('button', {
      label: '🔘 Button',
      content: '<button style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px;">Click Me</button>',
      category: 'Components',
    });

    // Table Blocks
    bm.add('table-basic', {
      label: '📊 Table 3x3',
      content: {
        type: 'default',
        content: `<div class="table-wrapper">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 12px;">Header 1</th>
                <th style="padding: 12px;">Header 2</th>
                <th style="padding: 12px;">Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 12px;">Data 1</td><td>Data 2</td><td>Data 3</td></tr>
              <tr><td style="padding: 12px;">Data 4</td><td>Data 5</td><td>Data 6</td></tr>
            </tbody>
          </table>
        </div>`,
      },
      category: 'Tables',
    });

    bm.add('table-financial', {
      label: '💰 Financial Table',
      content: {
        type: 'default',
        content: `<div class="table-wrapper" style="box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #1e3a5f; color: white;">
                <th style="padding: 14px;">Description</th>
                <th style="padding: 14px; text-align: right;">Amount</th>
                <th style="padding: 14px; text-align: right;">%</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 12px;">Item 1</td><td style="text-align: right; font-family: monospace;">£10,000</td><td style="text-align: right;">25%</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 12px;">Item 2</td><td style="text-align: right;">£15,000</td><td style="text-align: right;">37.5%</td></tr>
            </tbody>
          </table>
        </div>`,
      },
      category: 'Tables',
    });

    // Media Blocks
    bm.add('image-responsive', {
      label: '🖼️ Image',
      content: '<img src="https://via.placeholder.com/800x400" style="width: 100%; border-radius: 8px;"/>',
      category: 'Media',
    });

    bm.add('logo-upload', {
      label: '🏢 Logo',
      content: {
        type: 'image',
        style: { 'max-width': '200px', 'display': 'block', 'margin': '20px auto' },
        attributes: { src: 'https://via.placeholder.com/200x80?text=Your+Logo' },
        // Custom trait for file upload
      },
      category: 'Media',
    });

    // Load initial HTML
    editor.setComponents(initialHtml);
    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return (
    <div className="grapesjs-editor-container h-full">
      {/* Editor panels UI */}
      <div className="editor-row flex h-full">
        <div className="editor-canvas flex-1">
          <div className="panel__top flex items-center justify-between p-2 border-b">
            <div className="panel__basic-actions flex gap-1" />
            <div className="panel__devices flex gap-1" />
          </div>
          <div ref={containerRef} className="editor-content" />
        </div>
        <div className="panel__right w-64 border-l overflow-y-auto">
          <div className="blocks-container p-2" />
          <div className="styles-container p-2" />
          <div className="traits-container p-2" />
          <div className="layers-container p-2" />
        </div>
      </div>
    </div>
  );
}
```

## PDF Export

### Document Editor Page (`src/pages/DocumentEditorPage.tsx`)

```typescript
import html2pdf from 'html2pdf.js';

const handleExportPDF = () => {
  if (!filledHtml) return;

  const element = document.createElement('div');
  element.innerHTML = filledHtml;
  
  const opt = {
    margin: 0.5,
    filename: `document_${templateId}_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};
```

## Required Dependencies

```json
{
  "dependencies": {
    "grapesjs": "^0.22.13",
    "grapesjs-preset-webpage": "^1.0.3",
    "html2pdf.js": "^0.12.1",
    "papaparse": "^5.5.3",
    "@types/papaparse": "^5.5.0"
  }
}
```

---

# IMPLEMENTATION CHECKLIST

## CRM System
- [ ] Create database tables with RLS
- [ ] Create CRM page with stats cards
- [ ] Implement CRMBoard component with:
  - [ ] Contact CRUD operations
  - [ ] Filtering (by status)
  - [ ] Sorting (any column)
  - [ ] Search (name, email, company)
  - [ ] Pagination
  - [ ] Table/Cards view toggle
  - [ ] Inline editing
  - [ ] Bulk selection and deletion
  - [ ] Custom boards/tables
- [ ] Implement BulkImportDialog with CSV parsing
- [ ] Implement NextActionAI for AI-powered actions
- [ ] Add AI Lead Scoring badges

## Document Generator
- [ ] Create template types
- [ ] Define document templates (contracts, invoices, proposals, etc.)
- [ ] Implement templateRenderer to convert templates to HTML
- [ ] Integrate GrapesJS editor with custom blocks
- [ ] Add PDF export functionality
- [ ] Create document editor page with save/load functionality

---

# NOTES

1. **RLS is critical**: All CRM data must be user-specific with proper RLS policies
2. **Boards are persistent**: Custom CRM boards save to database, not localStorage
3. **AI functions**: Use Supabase Edge Functions for AI content generation
4. **PDF capture**: Charts/images need special handling with html2canvas
5. **GrapesJS**: Requires CSS import and proper container setup
