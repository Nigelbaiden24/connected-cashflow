import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: () => void;
}

export function NewClientDialog({ open, onOpenChange, onClientCreated }: NewClientDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    dateOfBirth: "",
    annualIncome: "",
    netWorth: "",
    riskProfile: "Moderate",
    investmentExperience: "intermediate",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const clientId = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            client_id: clientId,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            occupation: formData.occupation,
            date_of_birth: formData.dateOfBirth || null,
            annual_income: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
            net_worth: formData.netWorth ? parseFloat(formData.netWorth) : null,
            aum: 0,
            risk_profile: formData.riskProfile,
            status: 'active',
            investment_experience: formData.investmentExperience,
            notes: `Client added on ${new Date().toLocaleDateString('en-GB')}`
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Client ${formData.firstName} ${formData.lastName} has been added successfully.`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        occupation: "",
        dateOfBirth: "",
        annualIncome: "",
        netWorth: "",
        riskProfile: "Moderate",
        investmentExperience: "intermediate",
      });

      onClientCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the client's basic information to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualIncome">Annual Income (£)</Label>
              <Input
                id="annualIncome"
                type="number"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netWorth">Net Worth (£)</Label>
              <Input
                id="netWorth"
                type="number"
                value={formData.netWorth}
                onChange={(e) => setFormData({ ...formData, netWorth: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskProfile">Risk Profile</Label>
              <Select value={formData.riskProfile} onValueChange={(value) => setFormData({ ...formData, riskProfile: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conservative">Conservative</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentExperience">Investment Experience</Label>
              <Select value={formData.investmentExperience} onValueChange={(value) => setFormData({ ...formData, investmentExperience: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="experienced">Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
