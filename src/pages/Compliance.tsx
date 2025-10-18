import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, CheckCircle, FileText, Scale, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Compliance = () => {
  const navigate = useNavigate();
  const [complianceCheck, setComplianceCheck] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const complianceItems = [
    {
      id: 1,
      title: "Suitability Assessment",
      description: "Verify client investment suitability before recommendations",
      status: "compliant",
      lastCheck: "2 hours ago",
      severity: "high",
    },
    {
      id: 2,
      title: "Risk Disclosure Documentation",
      description: "Ensure all high-risk investment disclosures are signed",
      status: "warning",
      lastCheck: "1 day ago",
      severity: "medium",
    },
    {
      id: 3,
      title: "Portfolio Concentration Limits",
      description: "Monitor single position limits (<10% per security)",
      status: "compliant",
      lastCheck: "4 hours ago",
      severity: "high",
    },
    {
      id: 4,
      title: "KYC Documentation",
      description: "Know Your Customer information current and complete",
      status: "needs_attention",
      lastCheck: "3 days ago",
      severity: "critical",
    },
    {
      id: 5,
      title: "Trade Surveillance",
      description: "Monitor for unusual trading patterns and market abuse",
      status: "compliant",
      lastCheck: "1 hour ago",
      severity: "high",
    },
  ];

  const regulations = [
    {
      regulation: "SEC Rule 2111 (Suitability)",
      description: "Requires reasonable belief that recommendation is suitable",
      category: "Investment Advice",
      compliance_rate: "98.5%",
    },
    {
      regulation: "FINRA Rule 3110 (Books and Records)",
      description: "Maintain accurate books and records of transactions",
      category: "Record Keeping",
      compliance_rate: "99.2%",
    },
    {
      regulation: "Reg BI (Best Interest)",
      description: "Act in best interest when making investment recommendations",
      category: "Fiduciary Duty",
      compliance_rate: "97.8%",
    },
    {
      regulation: "FINRA Rule 2090 (KYC)",
      description: "Know your customer requirements and due diligence",
      category: "Client Verification",
      compliance_rate: "96.4%",
    },
  ];

  const handleComplianceCheck = async () => {
    if (!complianceCheck.trim()) return;

    setIsChecking(true);
    
    // Simulate compliance analysis
    setTimeout(() => {
      toast({
        title: "Compliance Check Complete",
        description: "Analysis completed with recommendations generated.",
      });
      setIsChecking(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "needs_attention":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-success/10 text-success";
      case "warning":
        return "bg-warning/10 text-warning-foreground";
      case "needs_attention":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive";
      case "high":
        return "bg-warning/10 text-warning-foreground";
      case "medium":
        return "bg-chart-1/10 text-chart-1";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
            <p className="text-muted-foreground">
              Monitor regulatory compliance and risk management
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          FINRA Approved
        </Badge>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All compliance checks are automatically logged and stored for regulatory audit purposes.
          Ensure all recommendations follow fiduciary standards.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="monitor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monitor">Compliance Monitor</TabsTrigger>
          <TabsTrigger value="check">AI Compliance Check</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor">
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace("_", " ")}
                        </Badge>
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last checked: {item.lastCheck}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Run Check
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="check">
          <Card>
            <CardHeader>
              <CardTitle>AI Compliance Assistant</CardTitle>
              <CardDescription>
                Submit investment recommendations for automated compliance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance-input">Investment Recommendation</Label>
                <Textarea
                  id="compliance-input"
                  placeholder="Enter your investment recommendation for compliance review. Include client profile, recommended securities, allocation percentages, and rationale..."
                  value={complianceCheck}
                  onChange={(e) => setComplianceCheck(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button
                onClick={handleComplianceCheck}
                disabled={isChecking || !complianceCheck.trim()}
                className="w-full"
              >
                {isChecking ? "Analyzing Compliance..." : "Run Compliance Check"}
              </Button>
              
              {complianceCheck && !isChecking && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sample Analysis:</strong> Recommendation appears compliant with suitability requirements. 
                    Ensure client risk tolerance documentation is current. Consider concentration limits for 
                    technology sector allocation (currently 15%). All required disclosures should be provided.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations">
          <div className="space-y-4">
            {regulations.map((reg, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reg.regulation}</CardTitle>
                    <Badge variant="outline">{reg.compliance_rate}</Badge>
                  </div>
                  <Badge className="w-fit">{reg.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{reg.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Guidelines
                    </Button>
                    <Button variant="outline" size="sm">
                      <Scale className="h-4 w-4 mr-2" />
                      Compliance History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;