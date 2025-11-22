import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingUp, AlertTriangle, Activity, UserCheck, FileText, Globe, Zap, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SignalsAlerts = () => {
  const [notifications, setNotifications] = useState({
    priceSurge: true,
    volumeSpike: true,
    insiderBuying: true,
    analystRating: true,
    filings: true,
    macro: true
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertsByType = (type: string) => {
    return alerts.filter(alert => alert.alert_type === type);
  };

  const priceSurgeAlerts = getAlertsByType('price_surge');
  const volumeSpikeAlerts = getAlertsByType('volume_spike');
  const insiderBuyingAlerts = getAlertsByType('insider_buying');
  const analystRatingAlerts = getAlertsByType('analyst_rating');
  const filingAlerts = getAlertsByType('filing');
  const macroAlerts = getAlertsByType('macro');
  const handleToggleNotification = (type: keyof typeof notifications) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
    toast.success(`${type} alerts ${!notifications[type] ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signals & Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Real-time market signals, insider activity, and macro event alerts
          </p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Enable or disable specific alert types</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Price Surge Alerts</p>
                <p className="text-xs text-muted-foreground">Large price movements</p>
              </div>
            </div>
            <Switch
              checked={notifications.priceSurge}
              onCheckedChange={() => handleToggleNotification('priceSurge')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Volume Spike Alerts</p>
                <p className="text-xs text-muted-foreground">Unusual trading volume</p>
              </div>
            </div>
            <Switch
              checked={notifications.volumeSpike}
              onCheckedChange={() => handleToggleNotification('volumeSpike')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Insider Buying Alerts</p>
                <p className="text-xs text-muted-foreground">Executive transactions</p>
              </div>
            </div>
            <Switch
              checked={notifications.insiderBuying}
              onCheckedChange={() => handleToggleNotification('insiderBuying')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Analyst Rating Changes</p>
                <p className="text-xs text-muted-foreground">Upgrades & downgrades</p>
              </div>
            </div>
            <Switch
              checked={notifications.analystRating}
              onCheckedChange={() => handleToggleNotification('analystRating')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Filing Alerts</p>
                <p className="text-xs text-muted-foreground">SEC filings & disclosures</p>
              </div>
            </div>
            <Switch
              checked={notifications.filings}
              onCheckedChange={() => handleToggleNotification('filings')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Macro Alerts</p>
                <p className="text-xs text-muted-foreground">Fed, inflation, economic data</p>
              </div>
            </div>
            <Switch
              checked={notifications.macro}
              onCheckedChange={() => handleToggleNotification('macro')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Alert Types */}
      <Tabs defaultValue="price" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="price">
            <TrendingUp className="h-4 w-4 mr-2" />
            Price Surge
          </TabsTrigger>
          <TabsTrigger value="volume">
            <Activity className="h-4 w-4 mr-2" />
            Volume Spike
          </TabsTrigger>
          <TabsTrigger value="insider">
            <UserCheck className="h-4 w-4 mr-2" />
            Insider
          </TabsTrigger>
          <TabsTrigger value="analyst">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyst
          </TabsTrigger>
          <TabsTrigger value="filings">
            <FileText className="h-4 w-4 mr-2" />
            Filings
          </TabsTrigger>
          <TabsTrigger value="macro">
            <Globe className="h-4 w-4 mr-2" />
            Macro
          </TabsTrigger>
        </TabsList>

        {/* Price Surge Alerts */}
        <TabsContent value="price" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Price Surge Alerts</h2>
          </div>

          {priceSurgeAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No price surge alerts at this time
              </CardContent>
            </Card>
          ) : (
            priceSurgeAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                        <span className="font-bold text-lg">{alert.ticker}</span>
                        <span className="text-xs text-muted-foreground">{alert.alert_data?.price}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{alert.company}</h3>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.alert_data?.change?.startsWith('+') ? 'default' : 'destructive'} className="text-lg mb-2">
                        {alert.alert_data?.change}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity === 'high' ? 'High Priority' : alert.severity === 'medium' ? 'Medium Priority' : 'Low Priority'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Volume Spike Alerts */}
        <TabsContent value="volume" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Volume Spike Alerts</h2>
          </div>

          {volumeSpikeAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No volume spike alerts at this time
              </CardContent>
            </Card>
          ) : (
            volumeSpikeAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                        <span className="font-bold text-lg">{alert.ticker}</span>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {alert.alert_data?.priceChange}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{alert.company}</h3>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-lg mb-2 bg-orange-500">
                        <Zap className="h-4 w-4 mr-1" />
                        {alert.alert_data?.volumeIncrease}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Insider Buying Alerts */}
        <TabsContent value="insider" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Insider Buying Alerts</h2>
          </div>

          {insiderBuyingAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No insider buying alerts at this time
              </CardContent>
            </Card>
          ) : (
            insiderBuyingAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                        <span className="font-bold text-lg">{alert.ticker}</span>
                        <span className="text-xs text-muted-foreground">{alert.alert_data?.priceAtPurchase}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{alert.company}</h3>
                        <p className="text-sm font-medium text-primary">{alert.alert_data?.insider}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-base mb-1 bg-green-500">{alert.alert_data?.value}</Badge>
                      <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Analyst Rating Change Alerts */}
        <TabsContent value="analyst" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Analyst Rating Changes</h2>
          </div>

           {analystRatingAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No analyst rating alerts at this time
              </CardContent>
            </Card>
          ) : (
            analystRatingAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                        <span className="font-bold text-lg">{alert.ticker}</span>
                        <span className="text-xs text-muted-foreground">{alert.alert_data?.currentPrice}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{alert.company}</h3>
                        <p className="text-sm font-medium text-primary">{alert.alert_data?.analyst}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-bold text-lg">{alert.alert_data?.priceTarget}</p>
                      </div>
                      <Badge variant={alert.alert_data?.upside?.startsWith('+') ? 'default' : 'destructive'}>
                        {alert.alert_data?.upside}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Filing Alerts */}
        <TabsContent value="filings" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Filing Alerts</h2>
          </div>

          {filingAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No filing alerts at this time
              </CardContent>
            </Card>
          ) : (
            filingAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                        <span className="font-bold text-lg">{alert.ticker}</span>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {alert.alert_data?.filingType}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{alert.company}</h3>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={alert.alert_data?.impact === 'Positive' ? 'default' : alert.alert_data?.impact === 'Negative' ? 'destructive' : 'secondary'}
                        className="mb-2"
                      >
                        {alert.alert_data?.impact || 'Neutral'}
                      </Badge>
                      <p className="text-sm font-medium">{alert.alert_data?.marketReaction}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Macro Alerts */}
        <TabsContent value="macro" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Macro Economic Alerts</h2>
          </div>

          {macroAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No macro alerts at this time
              </CardContent>
            </Card>
          ) : (
            macroAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className={`h-12 w-12 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                      <div>
                        <h3 className="font-bold text-xl mb-1">{alert.title}</h3>
                        <p className="text-base font-medium text-muted-foreground mb-2">{alert.description}</p>
                        <p className="text-sm text-primary">{alert.alert_data?.impact}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="mb-2">
                        {alert.severity === 'high' ? 'High Impact' : 'Medium Impact'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {alert.alert_data?.marketReaction && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Market Reaction:</p>
                      <p className="text-sm text-muted-foreground">{alert.alert_data.marketReaction}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignalsAlerts;