
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
    const percentage = isAttendant ? 
      sortedPayments[0].porcentagem_atendente : 
      sortedPayments[0].porcentagem_tripeiro;
    
    const commissionTotal = sortedPayments.reduce((sum, p) => {
      const commissionAmount = Number(p.valor) * (percentage / 100);
      return sum + commissionAmount;
    }, 0);
    
    // Título do resumo
    message += `Resumo de Pagamentos - ${personName.toUpperCase()}\n\n`;
    
    // Listar cada pagamento
    sortedPayments.forEach(payment => {
      const paymentDate = format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR });
      const paymentValue = Number(payment.valor);
      const commission = paymentValue * (percentage / 100);
      
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
      message += `Comissão Total: ${formatCurrency(commissionTotal)}\n`;
    } else {
      message += `Total a Receber: ${formatCurrency(commissionTotal)}\n`;
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
      return "Concluído";
    case "pendente":
      return "Pendente";
    case "bloqueado":
      return "Bloqueado";
    default:
      return status;
  }
}
