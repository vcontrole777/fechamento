
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: string;
  status: "pending" | "completed" | "failed";
  date: string;
  name: string;
  imageUrl?: string;
  type: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  title: string;
  className?: string;
}

export function RecentTransactions({
  transactions,
  title,
  className,
}: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, 5);
  const hasMore = transactions.length > 5;

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-success/10 text-success border-success/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
      pending: "bg-warning/10 text-warning border-warning/20",
    };
    const labels = {
      completed: "Concluído",
      failed: "Falhou",
      pending: "Pendente",
    };
    return (
      <span className={cn("text-xs px-2 py-0.5 rounded-full border", variants[status as keyof typeof variants])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {hasMore && (
          <span className="text-xs text-muted-foreground">
            +{transactions.length - 5} mais
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={transaction.imageUrl} alt={transaction.name} />
                <AvatarFallback>{transaction.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3 space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {transaction.name}
                </p>
                <p className="text-xs text-muted-foreground">{transaction.type}</p>
              </div>
              <div className="ml-auto text-right space-y-1">
                <p className="text-sm font-medium">
                  {transaction.amount}
                </p>
                <div className="flex items-center justify-end gap-2">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
