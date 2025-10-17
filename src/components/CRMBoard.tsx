import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, Edit2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface CRMTable {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string>[];
}

export const CRMBoard = () => {
  const [tables, setTables] = useState<CRMTable[]>([
    {
      id: "1",
      name: "Leads",
      columns: ["Name", "Email", "Status", "Priority"],
      rows: [
        { id: "1", Name: "John Doe", Email: "john@example.com", Status: "New", Priority: "High" },
        { id: "2", Name: "Jane Smith", Email: "jane@example.com", Status: "Contacted", Priority: "Medium" },
      ],
    },
  ]);

  const [newTableName, setNewTableName] = useState("");
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [addingColumnTo, setAddingColumnTo] = useState<string | null>(null);

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>
                Add a new table to organize your data
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
