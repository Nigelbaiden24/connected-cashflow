import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StyleBoxProps {
  marketCap?: 'Large' | 'Mid' | 'Small' | 'Micro';
  style?: 'Deep Value' | 'Value' | 'Blend' | 'Growth' | 'Aggressive Growth';
  className?: string;
}

export function StyleBox({ marketCap, style, className }: StyleBoxProps) {
  const getCapRow = () => {
    switch (marketCap) {
      case 'Large': return 0;
      case 'Mid': return 1;
      case 'Small':
      case 'Micro': return 2;
      default: return -1;
    }
  };

  const getStyleCol = () => {
    switch (style) {
      case 'Deep Value':
      case 'Value': return 0;
      case 'Blend': return 1;
      case 'Growth':
      case 'Aggressive Growth': return 2;
      default: return -1;
    }
  };

  const capRow = getCapRow();
  const styleCol = getStyleCol();

  const capLabels = ['Large', 'Mid', 'Small'];
  const styleLabels = ['Value', 'Blend', 'Growth'];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-block cursor-help", className)}>
            <div className="text-[10px] text-muted-foreground mb-1.5 text-center font-medium uppercase tracking-wider">
              Style Box
            </div>
            <div className="grid grid-cols-3 gap-0.5 w-[52px] p-1 rounded-lg bg-muted/30 border border-border/50">
              {[0, 1, 2].map(row => (
                [0, 1, 2].map(col => (
                  <div
                    key={`${row}-${col}`}
                    className={cn(
                      "w-4 h-4 rounded-sm transition-all duration-200",
                      row === capRow && col === styleCol 
                        ? "bg-gradient-to-br from-primary to-primary/80 shadow-sm shadow-primary/30" 
                        : "bg-muted/50 border border-border/30"
                    )}
                  />
                ))
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground mt-1 px-1 font-medium">
              <span>V</span>
              <span>B</span>
              <span>G</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Investment Style Matrix</p>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div></div>
              {styleLabels.map(s => (
                <div key={s} className="text-center text-muted-foreground font-medium">{s}</div>
              ))}
              {capLabels.map((cap, row) => (
                <>
                  <div key={cap} className="text-muted-foreground font-medium">{cap}</div>
                  {styleLabels.map((_, col) => (
                    <div
                      key={`${row}-${col}`}
                      className={cn(
                        "w-5 h-5 rounded-sm flex items-center justify-center",
                        row === capRow && col === styleCol 
                          ? "bg-primary text-primary-foreground text-[10px]" 
                          : "bg-muted/50"
                      )}
                    >
                      {row === capRow && col === styleCol && "✓"}
                    </div>
                  ))}
                </>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
              {marketCap} Cap • {style}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
