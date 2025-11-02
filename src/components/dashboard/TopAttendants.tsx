
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Attendant {
  id: string;
  name: string;
  imageUrl?: string;
  sales: number;
  progress: number;
}

interface TopAttendantsProps {
  attendants: Attendant[];
  className?: string;
}

export function TopAttendants({ attendants, className }: TopAttendantsProps) {
  const maxSales = Math.max(...attendants.map((a) => a.sales));
  
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}º`;
    }
  };

  const totalSales = attendants.reduce((sum, a) => sum + a.sales, 0);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Atendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attendants.slice(0, 5).map((attendant, index) => {
            const percentage = totalSales > 0 ? (attendant.sales / totalSales) * 100 : 0;
            return (
              <div key={attendant.id} className="space-y-2">
                <div className="flex items-center">
                  <div className="text-lg mr-2 min-w-[2rem]">
                    {getRankEmoji(index)}
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={attendant.imageUrl} alt={attendant.name} />
                    <AvatarFallback>{attendant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {attendant.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {attendant.sales.toLocaleString('pt-BR')} • {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={attendant.progress} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
