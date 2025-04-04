
import { DollarSign, CreditCard, UserCheck, InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentStatsProps {
  totalPayments: number;
  attendantCommission: number;
  tripeiroReceivable: number;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function PaymentStats({
  totalPayments,
  attendantCommission,
  tripeiroReceivable,
  isLoading,
  formatCurrency,
}: PaymentStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Somente pagamentos concluídos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(totalPayments)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Apenas pagamentos concluídos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            <CardTitle className="text-sm font-medium">Comissão dos Atendentes</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Somente pagamentos concluídos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(attendantCommission)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Apenas pagamentos concluídos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            <CardTitle className="text-sm font-medium">Valor a Receber do Tripeiro</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Somente pagamentos concluídos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(tripeiroReceivable)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Apenas pagamentos concluídos</p>
        </CardContent>
      </Card>
    </div>
  );
}
