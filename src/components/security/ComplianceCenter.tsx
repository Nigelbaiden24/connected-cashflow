import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ComplianceCenter = () => {
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from("security_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const complianceFrameworks = [
    {
      name: "GDPR",
      fullName: "General Data Protection Regulation",
      score: 90,
      status: "compliant",
      requirements: 28,
      met: 25,
    },
    {
      name: "ISO 27001",
      fullName: "Information Security Management",
      score: 85,
      status: "compliant",
      requirements: 114,
      met: 97,
    },
    {
      name: "SOC 2",
      fullName: "Service Organization Control 2",
      score: 78,
      status: "in_progress",
      requirements: 64,
      met: 50,
    },
    {
      name: "HIPAA",
      fullName: "Health Insurance Portability",
      score: 92,
      status: "compliant",
      requirements: 45,
      met: 41,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "non_compliant":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Compliance Center</h2>
        <p className="text-sm text-muted-foreground">
          GDPR & ISO 27001 aligned policies and frameworks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {complianceFrameworks.map((framework) => (
          <Card key={framework.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{framework.name}</CardTitle>
                  <CardDescription>{framework.fullName}</CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(framework.status)}
                >
                  {framework.status === "compliant" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Compliant
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      In Progress
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Compliance Score</span>
                  <span className="font-bold">{framework.score}%</span>
                </div>
                <Progress value={framework.score} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Requirements Met</span>
                <span className="font-medium">
                  {framework.met} / {framework.requirements}
                </span>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Policies</CardTitle>
          <CardDescription>Active security and compliance policies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frameworks</TableHead>
                <TableHead>Last Reviewed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No policies configured</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first security policy to get started
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.policy_name}</TableCell>
                    <TableCell className="capitalize">
                      {policy.policy_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          policy.status === "active"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-gray-500/10 text-gray-700"
                        }
                      >
                        {policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(policy.compliance_frameworks || []).map((fw: string) => (
                          <Badge key={fw} variant="secondary" className="text-xs">
                            {fw}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {policy.last_reviewed
                        ? new Date(policy.last_reviewed).toLocaleDateString()
                        : "Not reviewed"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
