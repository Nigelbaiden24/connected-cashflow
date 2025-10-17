import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, Edit2, GripVertical, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CRMTable {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string>[];
}

export const CRMBoard = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [tables, setTables] = useState<CRMTable[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
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
  }, []);

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
      const { error } = await supabase.from("crm_contacts").insert([newContact]);

      if (error) throw error;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Board</h2>
        <div className="flex gap-2">
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Create a new contact in your CRM
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={newContact.company}
                    onChange={(e) =>
                      setNewContact({ ...newContact, company: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={newContact.position}
                    onChange={(e) =>
                      setNewContact({ ...newContact, position: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addContact}>Add Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
                <DialogDescription>
                  Add a new custom table to organize your data
                </DialogDescription>
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

      {/* Contacts Table */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/crm/${contact.id}`)}
                    >
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.email || "N/A"}</TableCell>
                      <TableCell>{contact.phone || "N/A"}</TableCell>
                      <TableCell>{contact.company || "N/A"}</TableCell>
                      <TableCell>
                        <span className="capitalize">{contact.status}</span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{contact.priority}</span>
                      </TableCell>
                      <TableCell>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Tables */}

      <div className="grid gap-6">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
                    <TableRow>
                      {table.columns.map((column) => (
                        <TableHead key={column} className="relative group">
                          <div className="flex items-center justify-between">
                            <span>{column}</span>
                            {table.columns.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => deleteColumn(table.id, column)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row) => (
                      <TableRow key={row.id} className="group">
                        {table.columns.map((column) => (
                          <TableCell key={column}>
                            <Input
                              value={row[column] || ""}
                              onChange={(e) =>
                                updateCell(table.id, row.id, column, e.target.value)
                              }
                              className="border-0 focus-visible:ring-1"
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => deleteRow(table.id, row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
        ))}
      </div>
    </div>
  );
};
