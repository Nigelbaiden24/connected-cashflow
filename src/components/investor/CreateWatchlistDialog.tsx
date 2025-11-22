import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreateWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSymbol?: {
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
  };
}

export function CreateWatchlistDialog({ open, onOpenChange, initialSymbol }: CreateWatchlistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a watchlist name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create watchlist using type assertion
      const { data: watchlist, error: watchlistError } = await (supabase as any)
        .from("watchlists")
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: isPublic,
        })
        .select()
        .single();

      if (watchlistError) throw watchlistError;

      // Add initial item if provided
      if (initialSymbol && watchlist) {
        const { error: itemError } = await (supabase as any)
          .from("watchlist_items")
          .insert({
            watchlist_id: watchlist.id,
            symbol: initialSymbol.symbol,
            name: initialSymbol.name,
            current_price: initialSymbol.price,
            change_percent: initialSymbol.change_percent,
          });

        if (itemError) throw itemError;
      }

      toast({
        title: "Success",
        description: `Watchlist "${name}" created successfully${initialSymbol ? ` with ${initialSymbol.symbol}` : ''}`,
      });

      setName("");
      setDescription("");
      setIsPublic(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to create watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Watchlist</DialogTitle>
          <DialogDescription>
            Create a new watchlist to track your investments
            {initialSymbol && ` starting with ${initialSymbol.symbol}`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Tech Stocks"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Technology sector investments..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="public">Make Public</Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Watchlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
