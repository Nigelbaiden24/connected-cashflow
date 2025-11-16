import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Upload, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SignalsAlerts = () => {
  const [alerts] = useState([
    {
      id: "1",
      type: "buy",
      asset: "Bitcoin (BTC)",
      signal: "Strong Buy Signal",
      price: "$91,500",
      change: "+5.2%",
      time: "2 hours ago",
      confidence: 95
    },
    {
      id: "2",
      type: "sell",
      asset: "Gold (XAU)",
      signal: "Take Profit Alert",
      price: "$2,650",
      change: "+2.1%",
      time: "4 hours ago",
      confidence: 88
    },
    {
      id: "3",
      type: "warning",
      asset: "S&P 500 (SPX)",
      signal: "Volatility Warning",
      price: "5,875",
      change: "-1.2%",
      time: "6 hours ago",
      confidence: 82
    },
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const handleUpload = () => {
    toast.success("Alert configuration upload ready");
  };

  const handleAISignals = () => {
    toast.info("Generating AI-powered signals...");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case "sell":
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-500";
      case "sell":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signals & Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Real-time trading signals and market alerts powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAISignals} className="bg-primary hover:bg-primary/90">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Signals
          </Button>
          <Button onClick={handleUpload} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Config
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive instant push alerts</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Active Alerts</h2>
        {alerts.map((alert) => (
          <Card key={alert.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{alert.asset}</h3>
                      <p className="text-muted-foreground">{alert.signal}</p>
                    </div>
                    <Badge className={getAlertColor(alert.type)}>
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-bold">{alert.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Change</p>
                      <p className={`font-bold ${alert.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.change}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="font-bold">{alert.confidence}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SignalsAlerts;
