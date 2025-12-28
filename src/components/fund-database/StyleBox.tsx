import { cn } from "@/lib/utils";

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

  return (
    <div className={cn("inline-block", className)}>
      <div className="text-xs text-muted-foreground mb-1 text-center">Style Box</div>
      <div className="grid grid-cols-3 gap-0.5 w-16">
        {[0, 1, 2].map(row => (
          [0, 1, 2].map(col => (
            <div
              key={`${row}-${col}`}
              className={cn(
                "w-5 h-5 border border-border rounded-sm",
                row === capRow && col === styleCol 
                  ? "bg-primary" 
                  : "bg-muted/30"
              )}
            />
          ))
        ))}
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5 px-0.5">
        <span>V</span>
        <span>B</span>
        <span>G</span>
      </div>
    </div>
  );
}
