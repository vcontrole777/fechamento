
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Atendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {attendants.map((attendant) => (
            <div key={attendant.id} className="space-y-2">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={attendant.imageUrl} alt={attendant.name} />
                  <AvatarFallback>{attendant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {attendant.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {attendant.sales.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <Progress value={attendant.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
