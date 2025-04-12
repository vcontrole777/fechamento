
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Payment } from "@/types/payment.types";

export function formatPaymentsForWhatsApp(payments: Payment[]): string {
  if (!payments || payments.length === 0) {
    return "Nenhum pagamento encontrado.";
  }

  // Agrupar por atendente/tripeiro dependendo de quais filtros estão aplicados
  const paymentsByPerson: Record<string, Payment[]> = {};
  
  // Verificar se temos atendentes ou tripeiros
  const hasTripeiros = payments.some(p => p.tripeiro?.nome);
  const hasAttendants = payments.some(p => p.atendente?.nome);
  
  // Agrupar pagamentos por pessoa (atendente ou tripeiro)
  payments.forEach(payment => {
    let personName = '';
    let personType = '';
    
    if (hasAttendants && payment.atendente?.nome) {
      personName = payment.atendente.nome;
      personType = 'atendente';
    } else if (hasTripeiros && payment.tripeiro?.nome) {
      personName = payment.tripeiro.nome;
      personType = 'tripeiro';
    }
    
    if (personName) {
      if (!paymentsByPerson[personName]) {
        paymentsByPerson[personName] = [];
      }
      paymentsByPerson[personName].push(payment);
    }
  });
  
  let message = "";
  
  // Processar cada pessoa e seus pagamentos
  Object.entries(paymentsByPerson).forEach(([personName, personPayments]) => {
    // Ordenar pagamentos por data (mais recente primeiro)
    const sortedPayments = [...personPayments].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    
    // Calcular totais para esta pessoa
    const totalValue = sortedPayments.reduce((sum, p) => sum + Number(p.valor), 0);
    
    // Determinar se estamos lidando com comissão de atendente ou valor a receber de tripeiro
    const isAttendant = sortedPayments[0].atendente?.nome === personName;
    
    // Usar as porcentagens mais atualizadas
    let totalCommission = 0;
    
    // Título do resumo
    message += `Resumo de Pagamentos - ${personName.toUpperCase()}\n\n`;
    
    // Listar cada pagamento
    sortedPayments.forEach(payment => {
      const paymentDate = format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR });
      const paymentValue = Number(payment.valor);
      
      // Usar as porcentagens corretas
      let commission = 0;
      if (isAttendant) {
        // Para atendentes, calculamos a comissão baseada no valor a receber do tripeiro
        const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
        const attendantPercentage = payment.atendente?.porcentagem || payment.porcentagem_atendente;
        
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        const tripeiroReceivable = paymentValue - tripeiroCommission;
        
        commission = tripeiroReceivable * (attendantPercentage / 100);
      } else {
        // Para tripeiros, o valor a receber é o pagamento menos a comissão do tripeiro
        const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
        commission = paymentValue * (tripeiroPercentage / 100);
      }
      
      totalCommission += commission;
      
      message += `📅 ${paymentDate}\n`;
      message += `💰 Valor: ${formatCurrency(paymentValue)}\n`;
      
      if (isAttendant) {
        message += `💼 Comissão: ${formatCurrency(commission)}\n`;
      } else {
        message += `💼 A Receber: ${formatCurrency(commission)}\n`;
      }
      
      message += `\n`;
    });
    
    // Adicionar totais no final
    message += `Total: ${formatCurrency(totalValue)}\n`;
    if (isAttendant) {
      message += `Comissão Total: ${formatCurrency(totalCommission)}\n`;
    } else {
      message += `Total a Receber: ${formatCurrency(totalCommission)}\n`;
    }
    
    message += `\n\n`;
  });
  
  return message.trim();
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatStatus(status: string): string {
  switch (status) {
    case "concluido":
      return "Aprovado";
    case "pendente":
      return "Em análise";
    case "bloqueado":
      return "Bloqueado";
    default:
      return status;
  }
}
