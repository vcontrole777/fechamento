
import React from "react";
import { useWeeklyAttendantRanking } from "@/hooks/useWeeklyAttendantRanking";
import { DateRange } from "@/components/common/date-filter/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Medal, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface WeeklyAttendantRankingProps {
  dateRange: DateRange;
}

export function WeeklyAttendantRanking({ dateRange }: WeeklyAttendantRankingProps) {
  const { user } = useAuth();
  const { data, isLoading, isError } = useWeeklyAttendantRanking(dateRange);

  // Format currency in Brazilian style (R$ 1.000,00)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ranking Semanal dos Atendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-center text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Faça login para visualizar o ranking de atendentes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ranking Semanal dos Atendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ranking Semanal dos Atendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Ocorreu um erro ao carregar o ranking. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Ranking Semanal dos Atendentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {`${data.startDate} até ${data.endDate}`}
        </p>
      </CardHeader>
      <CardContent>
        {data.ranking.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Nenhum pagamento registrado neste período.
          </p>
        ) : (
          <div className="space-y-3">
            {data.ranking.map((attendant) => (
              <div key={attendant.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  {attendant.position <= 3 && (
                    <Medal 
                      className={`h-5 w-5 mr-2 ${
                        attendant.position === 1 
                          ? "text-yellow-500" 
                          : attendant.position === 2 
                            ? "text-gray-400" 
                            : "text-amber-800"
                      }`} 
                    />
                  )}
                  <span className="font-medium">
                    {attendant.position}. {attendant.name}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(attendant.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
