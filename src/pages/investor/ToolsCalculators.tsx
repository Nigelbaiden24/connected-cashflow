import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, Scale, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [time, setTime] = useState("10");
  const [frequency, setFrequency] = useState("12");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(frequency);
    const amount = p * Math.pow(1 + r / n, n * t);
    setResult(amount);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Principal Amount (£)</Label>
          <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Time Period (years)</Label>
          <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Compounding Frequency (per year)</Label>
          <Input type="number" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
      {result !== null && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Future Value</p>
            <p className="text-3xl font-bold text-primary">£{result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Total Interest: £{(result - parseFloat(principal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DCFCalculator() {
  const [cashFlows, setCashFlows] = useState(["100", "110", "120", "130", "140"]);
  const [discountRate, setDiscountRate] = useState("10");
  const [terminalGrowth, setTerminalGrowth] = useState("2");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const r = parseFloat(discountRate) / 100;
    const g = parseFloat(terminalGrowth) / 100;
    
    const pv = cashFlows.reduce((sum, cf, i) => {
      return sum + parseFloat(cf) / Math.pow(1 + r, i + 1);
    }, 0);
    
    const lastCF = parseFloat(cashFlows[cashFlows.length - 1]);
    const terminalValue = (lastCF * (1 + g)) / (r - g);
    const pvTerminal = terminalValue / Math.pow(1 + r, cashFlows.length);
    
    setResult(pv + pvTerminal);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Projected Free Cash Flows (£M)</Label>
        {cashFlows.map((cf, i) => (
          <Input
            key={i}
            type="number"
            value={cf}
            onChange={(e) => {
              const newCFs = [...cashFlows];
              newCFs[i] = e.target.value;
              setCashFlows(newCFs);
            }}
            placeholder={`Year ${i + 1}`}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Discount Rate (WACC %)</Label>
          <Input type="number" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Terminal Growth Rate (%)</Label>
          <Input type="number" value={terminalGrowth} onChange={(e) => setTerminalGrowth(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full">Calculate DCF</Button>
      {result !== null && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Enterprise Value</p>
            <p className="text-3xl font-bold text-primary">£{result.toFixed(2)}M</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RiskScoringTool() {
  const [volatility, setVolatility] = useState("3");
  const [leverage, setLeverage] = useState("2");
  const [liquidity, setLiquidity] = useState("4");
  const [concentration, setConcentration] = useState("3");

  const calculateRisk = () => {
    const score = (parseFloat(volatility) + parseFloat(leverage) + parseFloat(concentration) + (5 - parseFloat(liquidity))) / 4;
    return score;
  };

  const riskScore = calculateRisk();
  const riskLevel = riskScore <= 2 ? "Low" : riskScore <= 3.5 ? "Medium" : "High";
  const riskColor = riskScore <= 2 ? "text-green-600" : riskScore <= 3.5 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Price Volatility (1-5)</Label>
          <Input type="number" min="1" max="5" value={volatility} onChange={(e) => setVolatility(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Financial Leverage (1-5)</Label>
          <Input type="number" min="1" max="5" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Liquidity (1-5)</Label>
          <Input type="number" min="1" max="5" value={liquidity} onChange={(e) => setLiquidity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Portfolio Concentration (1-5)</Label>
          <Input type="number" min="1" max="5" value={concentration} onChange={(e) => setConcentration(e.target.value)} />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Risk Score</p>
          <p className={`text-3xl font-bold ${riskColor}`}>{riskScore.toFixed(1)} / 5.0</p>
          <p className={`text-lg font-semibold mt-2 ${riskColor}`}>{riskLevel} Risk</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialRatioCalculator() {
  const [revenue, setRevenue] = useState("1000");
  const [netIncome, setNetIncome] = useState("100");
  const [assets, setAssets] = useState("500");
  const [equity, setEquity] = useState("300");
  const [debt, setDebt] = useState("200");

  const profitMargin = (parseFloat(netIncome) / parseFloat(revenue)) * 100;
  const roe = (parseFloat(netIncome) / parseFloat(equity)) * 100;
  const roa = (parseFloat(netIncome) / parseFloat(assets)) * 100;
  const debtToEquity = parseFloat(debt) / parseFloat(equity);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Revenue (£M)</Label>
        <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Net Income (£M)</Label>
        <Input type="number" value={netIncome} onChange={(e) => setNetIncome(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Total Assets (£M)</Label>
        <Input type="number" value={assets} onChange={(e) => setAssets(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Total Equity (£M)</Label>
        <Input type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Total Debt (£M)</Label>
        <Input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Net Profit Margin</p>
            <p className="text-2xl font-bold text-primary">{profitMargin.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Return on Equity</p>
            <p className="text-2xl font-bold text-primary">{roe.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Return on Assets</p>
            <p className="text-2xl font-bold text-primary">{roa.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
            <p className="text-2xl font-bold text-primary">{debtToEquity.toFixed(2)}x</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompareCompaniesTool() {
  const [company1, setCompany1] = useState({ name: "Company A", pe: "15", marketCap: "10000", roe: "12" });
  const [company2, setCompany2] = useState({ name: "Company B", pe: "20", marketCap: "8000", roe: "15" });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={company1.name} onChange={(e) => setCompany1({ ...company1, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>P/E Ratio</Label>
              <Input type="number" value={company1.pe} onChange={(e) => setCompany1({ ...company1, pe: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Market Cap (£M)</Label>
              <Input type="number" value={company1.marketCap} onChange={(e) => setCompany1({ ...company1, marketCap: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>ROE (%)</Label>
              <Input type="number" value={company1.roe} onChange={(e) => setCompany1({ ...company1, roe: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Company 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={company2.name} onChange={(e) => setCompany2({ ...company2, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>P/E Ratio</Label>
              <Input type="number" value={company2.pe} onChange={(e) => setCompany2({ ...company2, pe: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Market Cap (£M)</Label>
              <Input type="number" value={company2.marketCap} onChange={(e) => setCompany2({ ...company2, marketCap: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>ROE (%)</Label>
              <Input type="number" value={company2.roe} onChange={(e) => setCompany2({ ...company2, roe: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lower P/E Ratio</span>
              <span className="font-semibold">{parseFloat(company1.pe) < parseFloat(company2.pe) ? company1.name : company2.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Larger Market Cap</span>
              <span className="font-semibold">{parseFloat(company1.marketCap) > parseFloat(company2.marketCap) ? company1.name : company2.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Higher ROE</span>
              <span className="font-semibold">{parseFloat(company1.roe) > parseFloat(company2.roe) ? company1.name : company2.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ToolsCalculators() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tools & Calculators</h1>
        <p className="text-muted-foreground mt-2">Financial tools to help with your investment decisions</p>
      </div>

      <Tabs defaultValue="compound" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="compound">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Compound Interest</span>
          </TabsTrigger>
          <TabsTrigger value="dcf">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">DCF</span>
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Scale className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Risk Scoring</span>
          </TabsTrigger>
          <TabsTrigger value="ratios">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Ratios</span>
          </TabsTrigger>
          <TabsTrigger value="compare">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Compare</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compound">
          <Card>
            <CardHeader>
              <CardTitle>Compound Interest Calculator</CardTitle>
              <CardDescription>Calculate the future value of your investments with compound interest</CardDescription>
            </CardHeader>
            <CardContent>
              <CompoundInterestCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dcf">
          <Card>
            <CardHeader>
              <CardTitle>DCF Calculator</CardTitle>
              <CardDescription>Discounted Cash Flow valuation model</CardDescription>
            </CardHeader>
            <CardContent>
              <DCFCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Scoring Tool</CardTitle>
              <CardDescription>Assess investment risk across multiple factors</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskScoringTool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratios">
          <Card>
            <CardHeader>
              <CardTitle>Financial Ratio Calculator</CardTitle>
              <CardDescription>Calculate key financial ratios for company analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialRatioCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Compare Two Companies</CardTitle>
              <CardDescription>Side-by-side comparison of key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <CompareCompaniesTool />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
