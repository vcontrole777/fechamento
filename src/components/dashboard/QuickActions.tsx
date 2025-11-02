import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Receipt, StickyNote } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button 
          onClick={() => navigate('/pagamentos')} 
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <DollarSign className="h-6 w-6" />
          <span className="text-sm">Novo Pagamento</span>
        </Button>
        <Button 
          onClick={() => navigate('/despesas')} 
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <Receipt className="h-6 w-6" />
          <span className="text-sm">Nova Despesa</span>
        </Button>
        <Button 
          onClick={() => {}} 
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <StickyNote className="h-6 w-6" />
          <span className="text-sm">Novo Lembrete</span>
        </Button>
      </CardContent>
    </Card>
  );
}