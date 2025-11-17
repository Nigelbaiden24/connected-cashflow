import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RiskCompliance() {
  const { toast } = useToast();

  const riskMetrics = [
    { label: "Portfolio Risk Score", value: "6.5/10", status: "Medium", color: "yellow" },
    { label: "Compliance Status", value: "98%", status: "Good", color: "green" },
    { label: "Risk Alerts", value: "3 Active", status: "Attention", color: "red" },
  ];

  const handleUpload = () => {
    toast({
      title: "Upload Compliance Documents",
      description: "Admin feature to manage compliance documentation",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Risk & Compliance Hub</h1>
          <p className="text-muted-foreground mt-2">Monitor risk exposure and maintain regulatory compliance</p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {riskMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Badge 
                variant={metric.color === "green" ? "default" : metric.color === "yellow" ? "secondary" : "destructive"}
                className="mt-2"
              >
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Portfolio Stress Test</p>
                <p className="text-sm text-muted-foreground">Last run: 2 days ago</p>
              </div>
              <Button size="sm" variant="outline">Run Test</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Risk Assessment Report</p>
                <p className="text-sm text-muted-foreground">Updated: 1 week ago</p>
              </div>
              <Button size="sm" variant="outline">View Report</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Exposure Analysis</p>
                <p className="text-sm text-muted-foreground">By sector and region</p>
              </div>
              <Button size="sm" variant="outline">Analyze</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Compliance Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">KYC Verification</p>
                  <p className="text-sm text-muted-foreground">Status: Complete</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">AML Compliance</p>
                  <p className="text-sm text-muted-foreground">Status: Up to date</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Tax Reporting</p>
                  <p className="text-sm text-muted-foreground">Action required</p>
                </div>
              </div>
              <Button size="sm">Review</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulatory Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: "SEC Updates Investment Guidelines", date: "3 days ago" },
            { title: "New Crypto Regulations Announced", date: "1 week ago" },
            { title: "International Tax Treaty Changes", date: "2 weeks ago" },
          ].map((update, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{update.title}</p>
                <p className="text-sm text-muted-foreground">{update.date}</p>
              </div>
              <Button size="sm" variant="outline">Read More</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
