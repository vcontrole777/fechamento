
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Payment } from "@/types/payment.types";

export function formatPaymentsForWhatsApp(payments: Payment[]): string {
  if (!payments || payments.length === 0) {
    return "Nenhum pagamento encontrado.";
  }

  // Agrupar por atendente/tripeiro dependendo de quais filtros estão aplicados
  const hasTripeiros = payments.some(p => p.tripeiro?.nome);
  const hasAttendants = payments.some(p => p.atendente?.nome);
  
  let message = "*RELATÓRIO DE PAGAMENTOS*\n\n";
  
  // Adicionar período, se disponível (primeiro e último pagamento)
  if (payments.length > 0) {
    const sortedByDate = [...payments].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    const firstDate = format(new Date(sortedByDate[0].data), "dd/MM/yyyy", { locale: ptBR });
    const lastDate = format(new Date(sortedByDate[sortedByDate.length - 1].data), "dd/MM/yyyy", { locale: ptBR });
    
    if (firstDate === lastDate) {
      message += `*Data:* ${firstDate}\n\n`;
    } else {
      message += `*Período:* ${firstDate} a ${lastDate}\n\n`;
    }
  }

  // Calcular totais
  const totalValue = payments.reduce((sum, p) => sum + Number(p.valor), 0);
  
  message += `*Total:* ${formatCurrency(totalValue)}\n`;
  message += `*Quantidade:* ${payments.length} pagamento${payments.length !== 1 ? 's' : ''}\n\n`;
  
  // Se há atendentes no filtro, agrupar por atendente
  if (hasAttendants) {
    message += "*PAGAMENTOS POR ATENDENTE:*\n\n";
    
    // Agrupar por atendente
    const attendantGroups: Record<string, Payment[]> = {};
    
    payments.forEach(payment => {
      if (payment.atendente?.nome) {
        const name = payment.atendente.nome;
        if (!attendantGroups[name]) {
          attendantGroups[name] = [];
        }
        attendantGroups[name].push(payment);
      }
    });
    
    // Iterar por cada atendente
    Object.entries(attendantGroups).forEach(([attendantName, attendantPayments]) => {
      const attendantTotal = attendantPayments.reduce((sum, p) => sum + Number(p.valor), 0);
      const commission = attendantPayments.reduce((sum, p) => {
        const commissionAmount = Number(p.valor) * (p.porcentagem_atendente / 100);
        return sum + commissionAmount;
      }, 0);
      
      message += `*${attendantName}*\n`;
      message += `Total: ${formatCurrency(attendantTotal)}\n`;
      message += `Comissão (${attendantPayments[0].porcentagem_atendente}%): ${formatCurrency(commission)}\n`;
      message += `Qtd: ${attendantPayments.length}\n\n`;
    });
  }
  
  // Se há tripeiros no filtro, agrupar por tripeiro
  if (hasTripeiros) {
    message += "*PAGAMENTOS POR TRIPEIRO:*\n\n";
    
    // Agrupar por tripeiro
    const tripeiroGroups: Record<string, Payment[]> = {};
    
    payments.forEach(payment => {
      if (payment.tripeiro?.nome) {
        const name = payment.tripeiro.nome;
        if (!tripeiroGroups[name]) {
          tripeiroGroups[name] = [];
        }
        tripeiroGroups[name].push(payment);
      }
    });
    
    // Iterar por cada tripeiro
    Object.entries(tripeiroGroups).forEach(([tripeiroName, tripeiroPayments]) => {
      const tripeiroTotal = tripeiroPayments.reduce((sum, p) => sum + Number(p.valor), 0);
      const receivable = tripeiroPayments.reduce((sum, p) => {
        const receivableAmount = Number(p.valor) * (p.porcentagem_tripeiro / 100);
        return sum + receivableAmount;
      }, 0);
      
      message += `*${tripeiroName}*\n`;
      message += `Total: ${formatCurrency(tripeiroTotal)}\n`;
      message += `A Receber (${tripeiroPayments[0].porcentagem_tripeiro}%): ${formatCurrency(receivable)}\n`;
      message += `Qtd: ${tripeiroPayments.length}\n\n`;
    });
  }
  
  // Se não há agrupamentos específicos, listar todos os pagamentos
  if (!hasAttendants && !hasTripeiros) {
    message += "*LISTA DE PAGAMENTOS:*\n\n";
    
    payments.forEach((payment, index) => {
      const date = format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR });
      message += `*${index + 1}. ${formatCurrency(Number(payment.valor))}*\n`;
      message += `Data: ${date}\n`;
      
      if (payment.atendente?.nome) {
        message += `Atendente: ${payment.atendente.nome}\n`;
      }
      
      if (payment.tripeiro?.nome) {
        message += `Tripeiro: ${payment.tripeiro.nome}\n`;
      }
      
      message += `Status: ${formatStatus(payment.status)}\n\n`;
    });
  }
  
  return message;
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
