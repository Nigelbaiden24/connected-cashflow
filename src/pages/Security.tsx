import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Key, Activity, FileText, Lock, AlertTriangle, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { SecureVault } from "@/components/security/SecureVault";
import { AuditLogs } from "@/components/security/AuditLogs";
import { RoleManagement } from "@/components/security/RoleManagement";
import { ComplianceCenter } from "@/components/security/ComplianceCenter";
import { RiskAssessments } from "@/components/security/RiskAssessments";
import { MFASettings } from "@/components/security/MFASettings";

const Security = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cybersecurity Center</h1>
            <p className="text-muted-foreground">Enterprise-grade security controls and monitoring</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vault" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Vault
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="vault">
          <SecureVault />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="mfa">
          <MFASettings />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceCenter />
        </TabsContent>

        <TabsContent value="risks">
          <RiskAssessments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Security;
