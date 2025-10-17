import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Settings, Calendar, Shield } from "lucide-react";

export default function Payroll() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive payroll processing, tax calculations, and compliance automation
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Run Payroll
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Gross payroll</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£0.00</div>
              <p className="text-xs text-muted-foreground mt-1">After deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tax Withholding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Total taxes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll Runs
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Shield className="h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="timeoff" className="gap-2">
              <Calendar className="h-4 w-4" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <FileText className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>Manage employee information, pay rates, and direct deposit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employees added yet</p>
                  <Button className="mt-4">Add Employee</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>View and manage payroll runs with automatic tax calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payroll runs processed yet</p>
                  <Button className="mt-4">Create Payroll Run</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Management</CardTitle>
                <CardDescription>Health insurance, 401(k), and other employee benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No benefits configured yet</p>
                  <Button className="mt-4">Add Benefits Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeoff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Off Requests</CardTitle>
                <CardDescription>Manage PTO, sick leave, and vacation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time off requests</p>
                  <Button className="mt-4">View Calendar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Documents</CardTitle>
                <CardDescription>W-4, I-9, and other required forms with automated tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No compliance documents on file</p>
                  <Button className="mt-4">Upload Document</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure federal, state, and local tax rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Federal Tax Rate</label>
                      <p className="text-2xl font-bold">22.0%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">State Tax Rate</label>
                      <p className="text-2xl font-bold">5.0%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Social Security</label>
                      <p className="text-2xl font-bold">6.2%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Medicare</label>
                      <p className="text-2xl font-bold">1.45%</p>
                    </div>
                  </div>
                  <Button variant="outline">Edit Tax Rates</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
