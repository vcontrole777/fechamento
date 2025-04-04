
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
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center space-y-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={transaction.imageUrl} alt={transaction.name} />
                <AvatarFallback>{transaction.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.name}
                </p>
                <p className="text-sm text-muted-foreground">{transaction.type}</p>
              </div>
              <div className="ml-auto text-right">
                <p
                  className={cn(
                    "text-sm font-medium",
                    transaction.status === "completed" && "text-success",
                    transaction.status === "failed" && "text-destructive",
                    transaction.status === "pending" && "text-warning"
                  )}
                >
                  {transaction.amount}
                </p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
