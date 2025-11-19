import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  Plus,
  Settings,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedPlatform {
  id: string;
  name: string;
  type: "social" | "analytics" | "ads";
  icon: any;
  connected: boolean;
  apiKey?: string;
}

export default function AnalyticsDashboard() {
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([
    { id: "ga", name: "Google Analytics", type: "analytics", icon: Globe, connected: false },
    { id: "custom", name: "Custom Website Analytics", type: "analytics", icon: BarChart3, connected: false },
    { id: "fb", name: "Facebook Ads", type: "ads", icon: Facebook, connected: false },
    { id: "ig", name: "Instagram", type: "social", icon: Instagram, connected: false },
    { id: "li", name: "LinkedIn Analytics", type: "analytics", icon: Linkedin, connected: false },
    { id: "tw", name: "Twitter/X Analytics", type: "analytics", icon: Twitter, connected: false },
  ]);

  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<ConnectedPlatform | null>(null);
  const [apiKey, setApiKey] = useState("");

  const handleConnect = (platform: ConnectedPlatform) => {
    setSelectedPlatform(platform);
    setApiKey("");
    setShowConnectDialog(true);
  };

  const handleSaveConnection = () => {
    if (!selectedPlatform || !apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setPlatforms(platforms.map(p => 
      p.id === selectedPlatform.id 
        ? { ...p, connected: true, apiKey }
        : p
    ));

    toast.success(`Successfully connected to ${selectedPlatform.name}`);
    setShowConnectDialog(false);
    setSelectedPlatform(null);
    setApiKey("");
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(platforms.map(p => 
      p.id === platformId 
        ? { ...p, connected: false, apiKey: undefined }
        : p
    ));
    toast.success("Platform disconnected");
  };

  const connectedPlatforms = platforms.filter(p => p.connected);
  const availablePlatforms = platforms.filter(p => !p.connected);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Connect and monitor your external analytics platforms
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedPlatforms.length}</div>
            <p className="text-xs text-muted-foreground">
              {availablePlatforms.length} available to connect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Connect platforms to see data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Connect platforms to see data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Spend</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Connect ad platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="connected" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connected">Connected Platforms</TabsTrigger>
          <TabsTrigger value="available">Available Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          {connectedPlatforms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Platforms Connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your analytics platforms to start tracking performance
                </p>
                <Button onClick={() => setShowConnectDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Platform
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Card key={platform.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          <div>
                            <CardTitle className="text-base">{platform.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {platform.type}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-500">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(platform.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availablePlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {platform.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleConnect(platform)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedPlatform?.name}</DialogTitle>
            <DialogDescription>
              Enter your API key or authentication credentials to connect this platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Access Token</Label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                You can find this in your {selectedPlatform?.name} account settings.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection}>
              Connect Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
