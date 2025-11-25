import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, Edit2, GripVertical, ExternalLink, Filter, Download, Upload, Search, CheckSquare, Columns, Minimize2, Maximize2, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ColumnManager } from "./crm/ColumnManager";
import { AILeadScoringBadge } from "./crm/AILeadScoringBadge";
import { BulkAIScoring } from "./crm/BulkAIScoring";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface CRMTable {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string>[];
  searchQuery?: string;
  filterStatus?: string;
  selectedRows?: string[];
  compactView?: boolean;
}

interface CRMBoardProps {
  initialStage?: string | null;
}

export const CRMBoard = ({ initialStage }: CRMBoardProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusiness = location.pathname.startsWith('/business');
  const [contacts, setContacts] = useState<any[]>([]);
  const [customColumns, setCustomColumns] = useState<any[]>([]);
  const [customData, setCustomData] = useState<Record<string, Record<string, string>>>({});
  const [tables, setTables] = useState<CRMTable[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>(initialStage || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [compactView, setCompactView] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "active",
    priority: "medium",
  });

  useEffect(() => {
    fetchContacts();
    fetchCustomColumns();
  }, []);

  useEffect(() => {
    if (customColumns.length > 0 && contacts.length > 0) {
      fetchCustomData();
    }
  }, [customColumns, contacts]);

  const fetchCustomColumns = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_custom_columns")
        .select("*")
        .order("column_order", { ascending: true });

      if (error) throw error;
      setCustomColumns(data || []);
    } catch (error) {
      console.error("Error fetching custom columns:", error);
    }
  };

  const fetchCustomData = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contact_data")
        .select("*");

      if (error) throw error;

      // Organize data by contact_id and column_id
      const organized: Record<string, Record<string, string>> = {};
      data?.forEach((item) => {
        if (!organized[item.contact_id]) {
          organized[item.contact_id] = {};
        }
        organized[item.contact_id][item.column_id] = item.value || "";
      });

      setCustomData(organized);
    } catch (error) {
      console.error("Error fetching custom data:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const [newTableName, setNewTableName] = useState("");
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [addingColumnTo, setAddingColumnTo] = useState<string | null>(null);

  const addContact = async () => {
    if (!newContact.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add contacts");
        return;
      }

      const { data, error } = await supabase
        .from("crm_contacts")
        .insert([{ ...newContact, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Initialize custom column data for new contact
      if (customColumns.length > 0) {
        const customDataInserts = customColumns.map((col) => ({
          contact_id: data.id,
          column_id: col.id,
          value: "",
        }));

        await supabase.from("crm_contact_data").insert(customDataInserts);
      }

      toast.success("Contact added successfully");
      setNewContact({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        status: "active",
        priority: "medium",
      });
      setShowAddContact(false);
      fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const addEmptyRow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add contacts");
        return;
      }

      const { data, error } = await supabase
        .from("crm_contacts")
        .insert([
          {
            name: "New Contact",
            status: "active",
            priority: "medium",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Initialize custom column data for new contact
      if (customColumns.length > 0) {
        const customDataInserts = customColumns.map((col) => ({
          contact_id: data.id,
          column_id: col.id,
          value: "",
        }));

        await supabase.from("crm_contact_data").insert(customDataInserts);
      }

      toast.success("Row added successfully");
      fetchContacts();
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  const updateContactField = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      setContacts(
        contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update");
    }
  };

  const updateCustomField = async (
    contactId: string,
    columnId: string,
    value: string
  ) => {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("crm_contact_data")
        .select("id")
        .eq("contact_id", contactId)
        .eq("column_id", columnId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("crm_contact_data")
          .update({ value })
          .eq("contact_id", contactId)
          .eq("column_id", columnId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from("crm_contact_data").insert({
          contact_id: contactId,
          column_id: columnId,
          value,
        });

        if (error) throw error;
      }

      // Update local state
      setCustomData((prev) => ({
        ...prev,
        [contactId]: {
          ...prev[contactId],
          [columnId]: value,
        },
      }));
    } catch (error) {
      console.error("Error updating custom field:", error);
      toast.error("Failed to update custom field");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      // Delete custom data first
      await supabase.from("crm_contact_data").delete().eq("contact_id", id);

      // Then delete contact
      const { error } = await supabase.from("crm_contacts").delete().eq("id", id);

      if (error) throw error;
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const deleteCustomColumn = async (columnId: string) => {
    try {
      // Delete all data associated with this column
      await supabase.from("crm_contact_data").delete().eq("column_id", columnId);

      // Then delete the column definition
      const { error } = await supabase.from("crm_custom_columns").delete().eq("id", columnId);

      if (error) throw error;
      toast.success("Column deleted");
      fetchCustomColumns();
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  const deleteSelected = async () => {
    if (selectedContacts.length === 0) return;

    try {
      // Delete custom data first
      await supabase
        .from("crm_contact_data")
        .delete()
        .in("contact_id", selectedContacts);

      // Then delete contacts
      const { error } = await supabase
        .from("crm_contacts")
        .delete()
        .in("id", selectedContacts);

      if (error) throw error;
      toast.success(`Deleted ${selectedContacts.length} contacts`);
      setSelectedContacts([]);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast.error("Failed to delete contacts");
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      case "prospect":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const addTable = () => {
    if (!newTableName.trim()) {
      toast.error("Please enter a table name");
      return;
    }

    const newTable: CRMTable = {
      id: Date.now().toString(),
      name: newTableName,
      columns: ["Item", "Status"],
      rows: [],
    };

    setTables([...tables, newTable]);
    setNewTableName("");
    toast.success("Table created successfully");
  };

  const deleteTable = (tableId: string) => {
    setTables(tables.filter((t) => t.id !== tableId));
    toast.success("Table deleted");
  };

  const renameTable = (tableId: string) => {
    if (!editTableName.trim()) return;

    setTables(
      tables.map((t) =>
        t.id === tableId ? { ...t, name: editTableName } : t
      )
    );
    setEditingTable(null);
    setEditTableName("");
    toast.success("Table renamed");
  };

  const addColumn = (tableId: string) => {
    if (!newColumnName.trim()) {
      toast.error("Please enter a column name");
      return;
    }

    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: [...t.columns, newColumnName],
              rows: t.rows.map((row) => ({ ...row, [newColumnName]: "" })),
            }
          : t
      )
    );
    setNewColumnName("");
    setAddingColumnTo(null);
    toast.success("Column added");
  };

  const deleteColumn = (tableId: string, columnName: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.filter((col) => col !== columnName),
              rows: t.rows.map((row) => {
                const newRow = { ...row };
                delete newRow[columnName];
                return newRow;
              }),
            }
          : t
      )
    );
    toast.success("Column deleted");
  };

  const addRow = (tableId: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              rows: [
                ...t.rows,
                {
                  id: Date.now().toString(),
                  ...t.columns.reduce((acc, col) => ({ ...acc, [col]: "" }), {}),
                },
              ],
            }
          : t
      )
    );
    toast.success("Row added");
  };

  const deleteRow = (tableId: string, rowId: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? { ...t, rows: t.rows.filter((row) => row.id !== rowId) }
          : t
      )
    );
    toast.success("Row deleted");
  };

  const updateCell = (tableId: string, rowId: string, column: string, value: string) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              rows: t.rows.map((row) =>
                row.id === rowId ? { ...row, [column]: value } : row
              ),
            }
          : t
      )
    );
  };

  const toggleTableCompactView = (tableId: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, compactView: !t.compactView } : t));
  };

  const updateTableSearch = (tableId: string, query: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, searchQuery: query } : t));
  };

  const toggleRowSelection = (tableId: string, rowId: string) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        const selected = t.selectedRows || [];
        return {
          ...t,
          selectedRows: selected.includes(rowId)
            ? selected.filter(id => id !== rowId)
            : [...selected, rowId]
        };
      }
      return t;
    }));
  };

  const toggleAllRowsSelection = (tableId: string) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        const selected = t.selectedRows || [];
        return {
          ...t,
          selectedRows: selected.length === t.rows.length ? [] : t.rows.map(r => r.id)
        };
      }
      return t;
    }));
  };

  const deleteSelectedRows = (tableId: string) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        const selected = t.selectedRows || [];
        return {
          ...t,
          rows: t.rows.filter(row => !selected.includes(row.id)),
          selectedRows: []
        };
      }
      return t;
    }));
    toast.success("Selected rows deleted");
  };

  const getFilteredTableRows = (table: CRMTable) => {
    return table.rows.filter(row => {
      const searchMatch = !table.searchQuery || 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(table.searchQuery!.toLowerCase())
        );
      return searchMatch;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* AI Scoring Panel */}
      {showAIPanel && (
        <BulkAIScoring contacts={contacts} onComplete={fetchContacts} />
      )}

      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold tracking-tight">CRM Board</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 border-border/50 focus-visible:ring-primary/20"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
          {selectedContacts.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={deleteSelected}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedContacts.length})
            </Button>
          )}
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogTrigger asChild>
              <Button className="shadow-sm hover:shadow-md transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                New Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Create a new contact in your CRM</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={newContact.position}
                    onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addContact}>Add Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            onClick={() => setShowColumnManager(true)}
            className="hover:bg-accent/50 transition-colors"
          >
            <Columns className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          <Button 
            variant={showAIPanel ? "default" : "outline"}
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="hover:bg-accent/50 transition-colors"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Scoring
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCompactView(!compactView)}
            title={compactView ? "Expand view" : "Compact view"}
            className="hover:bg-accent/50 transition-colors"
          >
            {compactView ? <Maximize2 className="h-4 w-4 mr-2" /> : <Minimize2 className="h-4 w-4 mr-2" />}
            {compactView ? "Expand" : "Compact"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-accent/50 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                New Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
                <DialogDescription>Add a custom table</DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Table name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTable()}
              />
              <DialogFooter>
                <Button onClick={addTable}>Create Table</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ColumnManager
        open={showColumnManager}
        onOpenChange={setShowColumnManager}
        onColumnAdded={() => {
          fetchCustomColumns();
          // Initialize empty data for existing contacts
          if (contacts.length > 0) {
            setTimeout(() => fetchCustomData(), 500);
          }
        }}
        existingColumns={customColumns}
      />

      {/* Enhanced Contacts Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={compactView ? "bg-gradient-to-r from-muted/40 to-muted/20 border-b h-9" : "bg-gradient-to-r from-muted/40 to-muted/20 border-b"}>
                  <th className="p-0 w-12">
                    <div className={compactView ? "flex items-center justify-center h-9" : "flex items-center justify-center h-12"}>
                      <Checkbox
                        checked={
                          filteredContacts.length > 0 &&
                          selectedContacts.length === filteredContacts.length
                        }
                        onCheckedChange={toggleSelectAll}
                        className={compactView ? "h-3 w-3" : ""}
                      />
                    </div>
                  </th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider"}>Name</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider"}>Email</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider"}>Phone</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider"}>Company</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider"}>Position</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-24" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider w-32"}>Status</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-24" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider w-32"}>Priority</th>
                  <th className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-24" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider w-28"}>AI Score</th>
                  {customColumns.map((col) => (
                    <th key={col.id} className={compactView ? "text-left p-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider relative group" : "text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider relative group"}>
                      <div className="flex items-center justify-between">
                        <span className={compactView ? "text-[10px]" : ""}>
                          {col.column_name}
                          {col.is_required && <span className="text-destructive ml-1">*</span>}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={compactView ? "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity" : "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"}
                          onClick={() => deleteCustomColumn(col.id)}
                          title="Delete column"
                        >
                          <Trash2 className={compactView ? "h-2.5 w-2.5" : "h-3 w-3"} />
                        </Button>
                      </div>
                    </th>
                  ))}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className={compactView ? "border-b hover:bg-accent/30 transition-all duration-200 group h-8" : "border-b hover:bg-accent/30 hover:shadow-sm transition-all duration-200 group"}
                    style={{ backgroundColor: index % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.03)" }}
                  >
                    <td className="p-0">
                      <div className={compactView ? "flex items-center justify-center h-8" : "flex items-center justify-center h-14"}>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContacts([...selectedContacts, contact.id]);
                            } else {
                              setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={compactView ? "h-3 w-3" : ""}
                        />
                      </div>
                    </td>
                    <td
                      className={compactView ? "p-2 cursor-pointer" : "p-4 cursor-pointer"}
                      onClick={() => navigate(isBusiness ? `/business/crm/${contact.id}` : `/finance-crm/${contact.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={compactView ? "w-2 h-2 rounded-full ring-2 ring-background" : `w-2.5 h-2.5 rounded-full ring-2 ring-background ${getPriorityColor(contact.priority)}`} style={compactView ? {backgroundColor: `var(--priority-${contact.priority})`} : undefined} />
                        {editingCell?.id === contact.id && editingCell?.field === "name" ? (
                          <Input
                            autoFocus
                            value={contact.name}
                            onChange={(e) => updateContactField(contact.id, "name", e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                            className={compactView ? "h-6 text-xs" : "h-8"}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className={compactView ? "font-medium hover:text-primary transition-colors text-xs" : "font-semibold hover:text-primary transition-colors"}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ id: contact.id, field: "name" });
                            }}
                          >
                            {contact.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={compactView ? "p-2" : "p-4"}>
                      {editingCell?.id === contact.id && editingCell?.field === "email" ? (
                        <Input
                          autoFocus
                          value={contact.email || ""}
                          onChange={(e) => updateContactField(contact.id, "email", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className={compactView ? "h-6 text-xs" : "h-8"}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ id: contact.id, field: "email" });
                          }}
                          className={compactView ? "cursor-text text-xs text-muted-foreground" : "cursor-text text-muted-foreground"}
                        >
                          {contact.email || "—"}
                        </span>
                      )}
                    </td>
                    <td className={compactView ? "p-2" : "p-4"}>
                      {editingCell?.id === contact.id && editingCell?.field === "phone" ? (
                        <Input
                          autoFocus
                          value={contact.phone || ""}
                          onChange={(e) => updateContactField(contact.id, "phone", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className={compactView ? "h-6 text-xs" : "h-8"}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ id: contact.id, field: "phone" });
                          }}
                          className={compactView ? "cursor-text text-xs" : "cursor-text"}
                        >
                          {contact.phone || "—"}
                        </span>
                      )}
                    </td>
                    <td className={compactView ? "p-2" : "p-4"}>
                      {editingCell?.id === contact.id && editingCell?.field === "company" ? (
                        <Input
                          autoFocus
                          value={contact.company || ""}
                          onChange={(e) => updateContactField(contact.id, "company", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className={compactView ? "h-6 text-xs" : "h-8"}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ id: contact.id, field: "company" });
                          }}
                          className={compactView ? "cursor-text text-xs" : "cursor-text"}
                        >
                          {contact.company || "—"}
                        </span>
                      )}
                    </td>
                    <td className={compactView ? "p-2" : "p-4"}>
                      {editingCell?.id === contact.id && editingCell?.field === "position" ? (
                        <Input
                          autoFocus
                          value={contact.position || ""}
                          onChange={(e) => updateContactField(contact.id, "position", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className={compactView ? "h-6 text-xs" : "h-8"}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ id: contact.id, field: "position" });
                          }}
                          className={compactView ? "cursor-text text-xs" : "cursor-text"}
                        >
                          {contact.position || "—"}
                        </span>
                      )}
                    </td>
                    <td className={compactView ? "p-2" : "p-4"} onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={contact.status}
                        onValueChange={(value) => updateContactField(contact.id, "status", value)}
                      >
                        <SelectTrigger className={compactView ? "h-6 border-0 bg-transparent hover:bg-accent/50 transition-colors" : "h-8 border-0 bg-transparent hover:bg-accent/50 transition-colors"}>
                          <Badge variant="outline" className={compactView ? `${getStatusColor(contact.status)} text-[10px] h-5 px-2 font-medium` : `${getStatusColor(contact.status)} font-medium`}>
                            {contact.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className={compactView ? "p-2" : "p-4"} onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={contact.priority}
                        onValueChange={(value) => updateContactField(contact.id, "priority", value)}
                      >
                        <SelectTrigger className={compactView ? "h-6 border-0 bg-transparent hover:bg-accent/50 transition-colors" : "h-8 border-0 bg-transparent hover:bg-accent/50 transition-colors"}>
                          <Badge 
                            variant="outline" 
                            className={compactView ? "capitalize text-[10px] h-5 px-2 font-medium" : "capitalize font-medium"}
                          >
                            {contact.priority}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className={compactView ? "p-2" : "p-4"}>
                      {contact.lead_score > 0 ? (
                        <AILeadScoringBadge 
                          score={contact.lead_score} 
                          conversionProbability={contact.conversion_probability}
                          size={compactView ? "sm" : "default"}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">Not scored</span>
                      )}
                    </td>
                    {customColumns.map((col) => (
                      <td key={col.id} className={compactView ? "p-2" : "p-4"}>
                        {editingCell?.id === contact.id && editingCell?.field === col.id ? (
                          col.column_type === "select" ? (
                            <Select
                              value={customData[contact.id]?.[col.id] || ""}
                              onValueChange={(value) => {
                                updateCustomField(contact.id, col.id, value);
                                setEditingCell(null);
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {col.column_options?.map((option: string) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : col.column_type === "checkbox" ? (
                            <Checkbox
                              checked={customData[contact.id]?.[col.id] === "true"}
                              onCheckedChange={(checked) => {
                                updateCustomField(contact.id, col.id, checked ? "true" : "false");
                                setEditingCell(null);
                              }}
                            />
                          ) : (
                            <Input
                              autoFocus
                              type={col.column_type === "number" ? "number" : col.column_type === "date" ? "date" : "text"}
                              value={customData[contact.id]?.[col.id] || ""}
                              onChange={(e) => updateCustomField(contact.id, col.id, e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                              className="h-8"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )
                        ) : (
                          <span
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ id: contact.id, field: col.id });
                            }}
                            className={compactView ? "cursor-text text-xs text-muted-foreground" : "cursor-text text-muted-foreground"}
                          >
                            {col.column_type === "checkbox"
                              ? customData[contact.id]?.[col.id] === "true"
                                ? "✓"
                                : "—"
                              : customData[contact.id]?.[col.id] || "—"}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className={compactView ? "p-2" : "p-4"}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={compactView ? "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent" : "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent"}
                          >
                            <MoreVertical className={compactView ? "h-3 w-3" : "h-4 w-4"} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/crm/${contact.id}`)} className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteContact(contact.id)}
                            className="text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/10 p-4">
            <Button 
              variant="ghost" 
              onClick={addEmptyRow} 
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add new row
            </Button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm text-muted-foreground">
                  Show:
                </Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="pageSize" className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length}
              </p>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Custom Tables */}
      <div className="grid gap-6">
        {tables.map((table) => {
          const filteredRows = getFilteredTableRows(table);
          const selectedRows = table.selectedRows || [];
          
          return (
          <Card key={table.id} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-muted/20 to-transparent border-b">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                {editingTable === table.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editTableName}
                      onChange={(e) => setEditTableName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameTable(table.id);
                        if (e.key === "Escape") setEditingTable(null);
                      }}
                      className="h-8 w-48"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => renameTable(table.id)}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <CardTitle>{table.name}</CardTitle>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={table.searchQuery || ""}
                    onChange={(e) => updateTableSearch(table.id, e.target.value)}
                    className="pl-9 w-48 h-8"
                  />
                </div>
                {selectedRows.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={() => deleteSelectedRows(table.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedRows.length})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleTableCompactView(table.id)}
                  title={table.compactView ? "Expand view" : "Compact view"}
                >
                  {table.compactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingTable(table.id);
                      setEditTableName(table.name);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename Table
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setAddingColumnTo(table.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteTable(table.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {addingColumnTo === table.id && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Column name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addColumn(table.id);
                      if (e.key === "Escape") setAddingColumnTo(null);
                    }}
                  />
                  <Button onClick={() => addColumn(table.id)}>Add</Button>
                  <Button
                    variant="outline"
                    onClick={() => setAddingColumnTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className={table.compactView ? "h-8" : ""}>
                      <TableHead className={table.compactView ? "w-12 p-2" : "w-12 p-4"}>
                        <Checkbox
                          checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                          onCheckedChange={() => toggleAllRowsSelection(table.id)}
                          className={table.compactView ? "h-3 w-3" : ""}
                        />
                      </TableHead>
                      {table.columns.map((column) => (
                        <TableHead key={column} className={table.compactView ? "relative group p-2 text-xs" : "relative group p-4"}>
                          <div className="flex items-center justify-between">
                            <span>{column}</span>
                            {table.columns.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={table.compactView ? "h-5 w-5 p-0 opacity-0 group-hover:opacity-100" : "h-6 w-6 p-0 opacity-0 group-hover:opacity-100"}
                                onClick={() => deleteColumn(table.id, column)}
                              >
                                <Trash2 className={table.compactView ? "h-2.5 w-2.5" : "h-3 w-3"} />
                              </Button>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={row.id} className={table.compactView ? "group h-8" : "group"}>
                        <TableCell className={table.compactView ? "p-2" : "p-4"}>
                          <Checkbox
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={() => toggleRowSelection(table.id, row.id)}
                            className={table.compactView ? "h-3 w-3" : ""}
                          />
                        </TableCell>
                        {table.columns.map((column) => (
                          <TableCell key={column} className={table.compactView ? "p-2" : "p-4"}>
                            <Input
                              value={row[column] || ""}
                              onChange={(e) =>
                                updateCell(table.id, row.id, column, e.target.value)
                              }
                              className={table.compactView ? "border-0 focus-visible:ring-1 h-6 text-xs" : "border-0 focus-visible:ring-1"}
                            />
                          </TableCell>
                        ))}
                        <TableCell className={table.compactView ? "p-2" : "p-4"}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={table.compactView ? "h-6 w-6 p-0 opacity-0 group-hover:opacity-100" : "h-8 w-8 p-0 opacity-0 group-hover:opacity-100"}
                            onClick={() => deleteRow(table.id, row.id)}
                          >
                            <Trash2 className={table.compactView ? "h-3 w-3" : "h-4 w-4"} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => addRow(table.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </CardContent>
          </Card>
        );
        })}
      </div>
    </div>
  );
};
