import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, Save } from "lucide-react";

export const TaxSettings = () => {
  const [taxSettings, setTaxSettings] = useState({
    id: "",
    year: new Date().getFullYear(),
    state: "",
    federal_rate: 0.22,
    state_rate: 0.05,
    social_security_rate: 0.062,
    medicare_rate: 0.0145,
    unemployment_rate: 0.006,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("tax_settings")
        .select("*")
        .eq("year", new Date().getFullYear())
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setTaxSettings({
          id: data.id,
          year: data.year,
          state: data.state || "",
          federal_rate: data.federal_rate,
          state_rate: data.state_rate,
          social_security_rate: data.social_security_rate,
          medicare_rate: data.medicare_rate,
          unemployment_rate: data.unemployment_rate,
        });
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error);
      toast.error("Failed to load tax settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        year: taxSettings.year,
        state: taxSettings.state,
        federal_rate: taxSettings.federal_rate,
        state_rate: taxSettings.state_rate,
        social_security_rate: taxSettings.social_security_rate,
        medicare_rate: taxSettings.medicare_rate,
        unemployment_rate: taxSettings.unemployment_rate,
      };

      if (taxSettings.id) {
        const { error } = await supabase
          .from("tax_settings")
          .update(payload)
          .eq("id", taxSettings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("tax_settings")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        setTaxSettings({ ...taxSettings, id: data.id });
      }

      toast.success("Tax settings saved successfully");
    } catch (error: any) {
      console.error("Error saving tax settings:", error);
      toast.error(error.message || "Failed to save tax settings");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tax settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">UK Payroll Tax Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure PAYE, National Insurance, and other UK-specific tax rates for automatic payroll calculations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>PAYE Taxes</CardTitle>
            <CardDescription>
              PAYE income tax and National Insurance rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>PAYE Income Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={(taxSettings.federal_rate * 100).toFixed(2)}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    federal_rate: parseFloat(e.target.value) / 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current: {(taxSettings.federal_rate * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <Label>National Insurance Rate (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={(taxSettings.social_security_rate * 100).toFixed(3)}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    social_security_rate: parseFloat(e.target.value) / 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard: 12% (Employee and Employer combined)
              </p>
            </div>
            <div>
              <Label>Workplace Pension Contribution Rate (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={(taxSettings.medicare_rate * 100).toFixed(3)}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    medicare_rate: parseFloat(e.target.value) / 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard: 8% (3% employee, 5% employer minimum)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional UK Deductions</CardTitle>
            <CardDescription>UK-specific payroll deductions and levies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tax Year</Label>
              <Select
                value={taxSettings.year.toString()}
                onValueChange={(value) =>
                  setTaxSettings({ ...taxSettings, year: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Input
                value={taxSettings.state}
                onChange={(e) =>
                  setTaxSettings({ ...taxSettings, state: e.target.value })
                }
                placeholder="e.g., England, Scotland, Wales"
              />
            </div>
            <div>
              <Label>Student Loan Deduction Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={(taxSettings.state_rate * 100).toFixed(2)}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    state_rate: parseFloat(e.target.value) / 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Plan 1: 9%, Plan 2: 9%, Plan 4: 9% (varies by plan)
              </p>
            </div>
            <div>
              <Label>Apprenticeship Levy Rate (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={(taxSettings.unemployment_rate * 100).toFixed(3)}
                onChange={(e) =>
                  setTaxSettings({
                    ...taxSettings,
                    unemployment_rate: parseFloat(e.target.value) / 100,
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard: 0.5% of annual payroll over £3 million
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation Preview</CardTitle>
          <CardDescription>
            See how these rates apply to a sample £5,000 monthly salary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Gross Pay</div>
              <div className="text-2xl font-bold">£5,000</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">PAYE Tax</div>
              <div className="text-2xl font-bold text-destructive">
                -£{(5000 * taxSettings.federal_rate).toFixed(0)}
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Student Loan</div>
              <div className="text-2xl font-bold text-destructive">
                -£{(5000 * taxSettings.state_rate).toFixed(0)}
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">NI + Pension</div>
              <div className="text-2xl font-bold text-destructive">
                -£
                {(
                  5000 *
                  (taxSettings.social_security_rate + taxSettings.medicare_rate)
                ).toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Net Pay</div>
                <div className="text-xs text-muted-foreground">Take-home after deductions</div>
              </div>
              <div className="text-3xl font-bold">
                £
                {(
                  5000 -
                  5000 * taxSettings.federal_rate -
                  5000 * taxSettings.state_rate -
                  5000 * (taxSettings.social_security_rate + taxSettings.medicare_rate)
                ).toFixed(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Tax Settings
        </Button>
      </div>
    </div>
  );
};