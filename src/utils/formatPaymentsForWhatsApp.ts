
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Payment } from "@/types/payment.types";

export function formatPaymentsForWhatsApp(payments: Payment[], groupBy: 'tripeiro' | 'atendente' = 'tripeiro'): string {
  if (!payments || payments.length === 0) {
    return "Nenhum pagamento encontrado.";
  }

  // Agrupar por atendente/tripeiro dependendo do parâmetro groupBy
  const paymentsByPerson: Record<string, Payment[]> = {};
  
  // Verificar se temos atendentes ou tripeiros
  const hasTripeiros = payments.some(p => p.tripeiro?.nome);
  const hasAttendants = payments.some(p => p.atendente?.nome);
  
  // Validar o modo de agrupamento com base nos pagamentos disponíveis
  let groupingMode = groupBy;
  
  if (groupingMode === 'tripeiro' && !hasTripeiros) {
    groupingMode = 'atendente';
  } else if (groupingMode === 'atendente' && !hasAttendants) {
    groupingMode = 'tripeiro';
  }
  
  // Agrupar pagamentos de acordo com o modo selecionado
  payments.forEach(payment => {
    let personName = '';
    
    if (groupingMode === 'tripeiro' && payment.tripeiro?.nome) {
      personName = payment.tripeiro.nome;
    } else if (groupingMode === 'atendente' && payment.atendente?.nome) {
      personName = payment.atendente.nome;
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
    const isAttendant = groupingMode === 'atendente';
    
    // Valor total a receber/pagar
    let totalReceivable = 0;
    
    // Título do resumo
    message += `Resumo de Pagamentos - ${personName.toUpperCase()}\n\n`;
    
    // Listar cada pagamento
    sortedPayments.forEach(payment => {
      const paymentDate = format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR });
      const paymentValue = Number(payment.valor);
      
      // Calcular o valor correto com base no tipo de pessoa
      let receivableAmount = 0;
      if (isAttendant) {
        // Para atendentes, calculamos a comissão baseada no valor a receber do tripeiro
        const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
        const attendantPercentage = payment.atendente?.porcentagem || payment.porcentagem_atendente;
        
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        const tripeiroReceivable = paymentValue - tripeiroCommission;
        
        receivableAmount = tripeiroReceivable * (attendantPercentage / 100);
      } else {
        // Para tripeiros, o valor a ser pago é a comissão do tripeiro
        const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
        receivableAmount = paymentValue * (tripeiroPercentage / 100);
      }
      
      totalReceivable += receivableAmount;
      
      message += `📅 ${paymentDate}\n`;
      message += `💰 Valor: ${formatCurrency(paymentValue)}\n`;
      
      if (isAttendant) {
        message += `💼 Comissão: ${formatCurrency(receivableAmount)}\n`;
      } else {
        message += `💼 Valor a pagar: ${formatCurrency(receivableAmount)}\n`;
      }
      
      message += `\n`;
    });
    
    // Adicionar totais no final
    message += `Total de pagamentos: ${formatCurrency(totalValue)}\n`;
    if (isAttendant) {
      message += `Comissão Total: ${formatCurrency(totalReceivable)}\n`;
    } else {
      message += `Total a ser pago: ${formatCurrency(totalReceivable)}\n`;
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
