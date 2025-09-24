import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

interface CashFlowChartProps {
  data: Array<{
    age: number;
    cashFlow: number;
    cumulative: number;
    phase: string;
    milestone: string | null;
  }>;
  retirementAge?: number;
}

export function CashFlowChart({ data, retirementAge = 65 }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">Age {label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            {data.phase === "pre-retirement" ? "Pre-Retirement" : "Retirement"}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              Cash Flow: <span className={`font-medium ${data.cashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                {data.cashFlow >= 0 ? '+' : ''}{formatCurrency(data.cashFlow)}
              </span>
            </p>
            <p className="text-sm">
              Net Worth: <span className="font-medium text-financial-blue">
                {formatCurrency(data.cumulative)}
              </span>
            </p>
          </div>
          {data.milestone && (
            <Badge variant="outline" className="mt-2 text-xs">
              {data.milestone}
            </Badge>
          )}
        </div>
      );
    }
    return null;
  };

  const MilestoneMarker = ({ cx, cy, payload }: any) => {
    if (!payload.milestone) return null;
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy - 10}
          r="4"
          fill="hsl(var(--financial-orange))"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="text-xs font-medium fill-foreground"
        >
          {payload.milestone}
        </text>
      </g>
    );
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="age" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            yAxisId="cashflow"
            orientation="left"
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <YAxis 
            yAxisId="networth"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            x={retirementAge} 
            stroke="hsl(var(--financial-orange))" 
            strokeDasharray="5 5" 
            strokeWidth={2}
          />
          
          <Bar
            yAxisId="cashflow"
            dataKey="cashFlow"
            name="Annual Cash Flow"
            radius={[2, 2, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cashflow-cell-${index}`} 
                fill={entry.cashFlow >= 0 ? "hsl(var(--financial-blue))" : "hsl(var(--financial-pink))"} 
              />
            ))}
          </Bar>
          
          <Line
            yAxisId="networth"
            type="monotone"
            dataKey="cumulative"
            stroke="hsl(var(--financial-green))"
            strokeWidth={3}
            dot={<MilestoneMarker />}
            name="Net Worth"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}