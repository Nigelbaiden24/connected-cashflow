import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, EyeOff, Copy, Trash2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EncryptionService } from "@/lib/encryption";
import { toast } from "sonner";

export const SecureVault = () => {
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState({
    title: "",
    category: "password",
    data: "",
    masterPassword: "",
  });

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    try {
      const { data, error } = await supabase
        .from("secure_vault")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVaultItems(data || []);
    } catch (error) {
      console.error("Error fetching vault items:", error);
    }
  };

  const addVaultItem = async () => {
    if (!newItem.title || !newItem.data || !newItem.masterPassword) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const encryptedData = await EncryptionService.encrypt(
        newItem.data,
        newItem.masterPassword
      );

      const { error } = await supabase.from("secure_vault").insert({
        title: newItem.title,
        category: newItem.category,
        encrypted_data: encryptedData,
        user_id: "00000000-0000-0000-0000-000000000000", // Placeholder
      });

      if (error) throw error;

      toast.success("Item added to vault");
      setShowAddDialog(false);
      setNewItem({ title: "", category: "password", data: "", masterPassword: "" });
      fetchVaultItems();

      // Log audit event
      await supabase.from("audit_logs").insert({
        action: "vault_item_created",
        resource_type: "secure_vault",
        severity: "info",
        details: { title: newItem.title, category: newItem.category },
      });
    } catch (error) {
      console.error("Error adding vault item:", error);
      toast.error("Failed to add item to vault");
    }
  };

  const viewItem = async (itemId: string, encryptedData: string) => {
    const password = prompt("Enter master password to decrypt:");
    if (!password) return;

    try {
      const decrypted = await EncryptionService.decrypt(encryptedData, password);
      setDecryptedData((prev) => ({ ...prev, [itemId]: decrypted }));
      setViewingItem(itemId);
      toast.success("Item decrypted");

      // Update access count and last accessed
      const currentItem = vaultItems.find((v) => v.id === itemId);
      if (currentItem) {
        await supabase
          .from("secure_vault")
          .update({
            access_count: (currentItem.access_count || 0) + 1,
            last_accessed: new Date().toISOString(),
          })
          .eq("id", itemId);
      }
    } catch (error) {
      toast.error("Failed to decrypt - incorrect password");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vault item?")) return;

    try {
      const { error } = await supabase.from("secure_vault").delete().eq("id", id);
      if (error) throw error;

      toast.success("Vault item deleted");
      fetchVaultItems();

      await supabase.from("audit_logs").insert({
        action: "vault_item_deleted",
        resource_type: "secure_vault",
        resource_id: id,
        severity: "warning",
      });
    } catch (error) {
      console.error("Error deleting vault item:", error);
      toast.error("Failed to delete item");
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Lock className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "password":
        return "bg-blue-500/10 text-blue-700";
      case "api_key":
        return "bg-purple-500/10 text-purple-700";
      case "certificate":
        return "bg-green-500/10 text-green-700";
      case "note":
        return "bg-yellow-500/10 text-yellow-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secure Vault</h2>
          <p className="text-sm text-muted-foreground">
            AES-256 encrypted storage for sensitive data
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Secure Vault</DialogTitle>
              <DialogDescription>
                Data will be encrypted with AES-256 before storage
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., AWS API Key"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="note">Secure Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data to Encrypt *</Label>
                <Textarea
                  value={newItem.data}
                  onChange={(e) => setNewItem({ ...newItem, data: e.target.value })}
                  placeholder="Enter sensitive data..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Master Password *</Label>
                <Input
                  type="password"
                  value={newItem.masterPassword}
                  onChange={(e) =>
                    setNewItem({ ...newItem, masterPassword: e.target.value })
                  }
                  placeholder="Create a strong password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Remember this password - it cannot be recovered
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addVaultItem}>Encrypt & Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vault Items ({vaultItems.length})</CardTitle>
          <CardDescription>All items are encrypted with AES-256-GCM</CardDescription>
        </CardHeader>
        <CardContent>
          {vaultItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in vault</p>
              <p className="text-sm">Add your first encrypted item to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Access Count</TableHead>
                  <TableHead>Last Accessed</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaultItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(item.category)}>
                        {getCategoryIcon(item.category)}
                        <span className="ml-1 capitalize">
                          {item.category.replace("_", " ")}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{item.access_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.last_accessed
                        ? new Date(item.last_accessed).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {viewingItem === item.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(decryptedData[item.id])}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingItem(null)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewItem(item.id, item.encrypted_data)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {viewingItem && decryptedData[viewingItem] && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Decrypted Data
            </CardTitle>
            <CardDescription>Data is temporarily visible - close when done</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
              {decryptedData[viewingItem]}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
