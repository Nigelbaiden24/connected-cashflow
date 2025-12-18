import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Wallet, PiggyBank, 
  ArrowUpRight, ArrowDownRight, Target, Calendar,
  Banknote, ShieldCheck, AlertTriangle, Info
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

interface CashflowDataPoint {
  age: number;
  year: number;
  assets: number;
  income: number;
  spending: number;
  surplus: number;
  deficit: number;
  phase: string;
}

interface CashflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CashflowDataPoint | null;
  allData: CashflowDataPoint[];
  formatCurrency: (amount: number) => string;
  clientName?: string;
}

export function CashflowDetailModal({ 
  isOpen, 
  onClose, 
  data, 
  allData,
  formatCurrency,
  clientName = "Client"
}: CashflowDetailModalProps) {
  if (!data) return null;

  const isRetirement = data.phase === 'Retirement';
  const yearsToRetirement = isRetirement ? 0 : 65 - data.age;
  const retirementProgress = isRetirement ? 100 : Math.max(0, ((data.age - 25) / (65 - 25)) * 100);
  
  // Calculate projections from this point
  const futureData = allData.filter(d => d.age >= data.age && d.age <= data.age + 10);
  const peakAssets = Math.max(...allData.map(d => d.assets));
  const assetRatio = (data.assets / peakAssets) * 100;
  
  // Calculate withdrawal rate for retirement
  const withdrawalRate = isRetirement && data.assets > 0 
    ? ((data.spending / data.assets) * 100).toFixed(1) 
    : null;

  // Generate detailed breakdown data
  const breakdownData = [
    { category: 'Investments', amount: data.assets * 0.45, percentage: 45 },
    { category: 'Pensions', amount: data.assets * 0.35, percentage: 35 },
    { category: 'Property Equity', amount: data.assets * 0.15, percentage: 15 },
    { category: 'Cash', amount: data.assets * 0.05, percentage: 5 },
  ];

  const spendingBreakdown = [
    { category: 'Essential', amount: data.spending * 0.55, color: 'hsl(var(--chart-1))' },
    { category: 'Lifestyle', amount: data.spending * 0.30, color: 'hsl(var(--chart-2))' },
    { category: 'Discretionary', amount: data.spending * 0.15, color: 'hsl(var(--chart-3))' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Financial Snapshot: Age {data.age}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {clientName} • Year {data.year} • {data.phase} Phase
              </p>
            </div>
            <Badge 
              variant={isRetirement ? "default" : "secondary"}
              className={isRetirement ? "bg-primary" : "bg-chart-2 text-white"}
            >
              {data.phase}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(data.assets)}</p>
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="h-5 w-5 text-chart-2" />
                    {data.income > 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(data.income)}</p>
                  <p className="text-xs text-muted-foreground">Annual Income</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <PiggyBank className="h-5 w-5 text-chart-3" />
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(data.spending)}</p>
                  <p className="text-xs text-muted-foreground">Annual Spending</p>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${data.surplus > 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {data.surplus > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    {data.surplus > 0 ? (
                      <Badge variant="outline" className="text-green-500 border-green-500/50 text-xs">Surplus</Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive/50 text-xs">Deficit</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {data.surplus > 0 ? formatCurrency(data.surplus) : formatCurrency(data.deficit)}
                  </p>
                  <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Journey Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">To Retirement</span>
                      <span className="font-medium">{isRetirement ? 'Retired' : `${yearsToRetirement} years`}</span>
                    </div>
                    <Progress value={retirementProgress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Peak Assets Ratio</span>
                      <span className="font-medium">{assetRatio.toFixed(0)}%</span>
                    </div>
                    <Progress value={assetRatio} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Financial Health Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Asset Coverage</span>
                    <Badge variant={data.assets > data.spending * 20 ? "default" : "secondary"}>
                      {(data.assets / data.spending).toFixed(1)}x annual spending
                    </Badge>
                  </div>
                  {withdrawalRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Withdrawal Rate</span>
                      <Badge variant={parseFloat(withdrawalRate) <= 4 ? "default" : "destructive"}>
                        {withdrawalRate}%
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sustainability</span>
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      {data.deficit > 0 ? 'At Risk' : 'On Track'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Insights for Age {data.age}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {!isRetirement && (
                        <li>• You have {yearsToRetirement} years remaining in the accumulation phase</li>
                      )}
                      {isRetirement && withdrawalRate && (
                        <li>• Your current withdrawal rate of {withdrawalRate}% is {parseFloat(withdrawalRate) <= 4 ? 'sustainable' : 'above the recommended 4% rule'}</li>
                      )}
                      <li>• Your assets can cover approximately {(data.assets / data.spending).toFixed(0)} years of current spending</li>
                      {data.surplus > 0 && (
                        <li>• Annual surplus of {formatCurrency(data.surplus)} is being added to your wealth</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Asset Allocation at Age {data.age}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breakdownData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.category}</span>
                        <span className="font-medium">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-3" />
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold">
                  <span>Total Assets</span>
                  <span>{formatCurrency(data.assets)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Asset Growth Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={futureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area type="monotone" dataKey="assets" stroke="hsl(var(--primary))" fill="url(#assetGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Spending Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                        <Progress value={(item.amount / data.spending) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold">
                  <span>Total Annual Spending</span>
                  <span>{formatCurrency(data.spending)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{formatCurrency(data.spending / 12)}</p>
                  <p className="text-xs text-muted-foreground">Monthly Spending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Banknote className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{formatCurrency(data.spending / 52)}</p>
                  <p className="text-xs text-muted-foreground">Weekly Spending</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">10-Year Projection from Age {data.age}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={futureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="surplus" fill="hsl(var(--chart-1))" name="Surplus" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spending" fill="hsl(var(--chart-3))" name="Spending" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Projection Assumptions</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Investment returns: 6% p.a. (pre-retirement), 4.2% (retirement)</li>
                      <li>• Inflation rate: 2.5% p.a.</li>
                      <li>• Retirement income replacement: 70% of final salary</li>
                      <li>• Life expectancy modelled to age 95</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
