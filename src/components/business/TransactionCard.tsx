import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  client: string;
  amount: number;
  date: string;
  status: string;
  category?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const statusVariant = transaction.status === "completed" ? "default" : "secondary";
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1">{transaction.client}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(transaction.date), "MMM dd, yyyy")}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-xl font-bold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {transaction.amount.toLocaleString()}
                </div>
                <Badge variant={statusVariant} className="mt-1">
                  {transaction.status}
                </Badge>
              </div>
            </div>

            {transaction.category && (
              <Badge variant="outline" className="bg-gradient-to-r from-primary/5 to-primary/10">
                {transaction.category}
              </Badge>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
