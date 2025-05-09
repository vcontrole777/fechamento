
import { format, parseISO } from "date-fns";
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
    
    // Agrupar pagamentos por data
    const paymentsByDate: Record<string, Payment[]> = {};
    
    sortedPayments.forEach(payment => {
      // Garantir que a data é tratada corretamente, usando parseISO para lidar com string ISO
      let paymentDate;
      try {
        // Tenta parseISO primeiro se for string
        if (typeof payment.data === 'string') {
          paymentDate = parseISO(payment.data);
        } else {
          // Se não for string, assume que é um objeto Date
          paymentDate = new Date(payment.data);
        }
        
        // Verifica se é uma data válida
        if (isNaN(paymentDate.getTime())) {
          console.error("Data inválida:", payment.data);
          paymentDate = new Date(); // Fallback para data atual
        }
      } catch (error) {
        console.error("Erro ao processar data:", error, payment.data);
        paymentDate = new Date(); // Fallback para data atual
      }
      
      const dateKey = format(paymentDate, "dd/MM/yyyy");
      if (!paymentsByDate[dateKey]) {
        paymentsByDate[dateKey] = [];
      }
      paymentsByDate[dateKey].push(payment);
    });
    
    // Calcular totais para esta pessoa
    const totalValue = sortedPayments.reduce((sum, p) => sum + Number(p.valor), 0);
    
    // Determinar se estamos lidando com comissão de atendente ou valor a receber de tripeiro
    const isAttendant = groupingMode === 'atendente';
    
    // Valor total a receber/pagar
    let totalReceivable = 0;
    
    // Título do resumo
    message += `📊 *RESUMO DE PAGAMENTOS* 📊\n*${personName.toUpperCase()}*\n\n`;
    
    // Listar pagamentos agrupados por data
    Object.entries(paymentsByDate).forEach(([dateStr, paymentsOnDate]) => {
      let dateTotal = 0;
      let dateReceivable = 0;
      
      message += `📅 *${dateStr}*\n`;
      
      paymentsOnDate.forEach(payment => {
        const paymentValue = Number(payment.valor);
        dateTotal += paymentValue;
        
        // Calcular o valor correto com base no tipo de pessoa
        let receivableAmount = 0;
        
        if (isAttendant) {
          // Para atendentes, calculamos a comissão baseada no valor a receber do tripeiro
          const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
          const attendantPercentage = payment.atendente?.porcentagem || payment.porcentagem_atendente;
          
          message += `• R$ ${paymentValue.toFixed(2)}`; 
          
          if (payment.tripeiro?.nome) {
            message += ` - ${payment.tripeiro.nome} (${tripeiroPercentage}%)`;
          }
          
          const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
          const tripeiroReceivable = paymentValue - tripeiroCommission;
          
          receivableAmount = tripeiroReceivable * (attendantPercentage / 100);
          message += ` → Comissão ${attendantPercentage}%: ${formatCurrency(receivableAmount)}\n`;
        } else {
          // Para tripeiros, o valor a receber é o valor total menos a comissão
          const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
          
          message += `• R$ ${paymentValue.toFixed(2)}`;
          
          if (payment.atendente?.nome) {
            message += ` - ${payment.atendente.nome} (${payment.atendente.porcentagem}%)`;
          }
          
          // Valor da comissão do tripeiro
          const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
          // Valor a receber é o valor total menos a comissão
          receivableAmount = paymentValue - tripeiroCommission;
          message += ` → ${tripeiroPercentage}%: ${formatCurrency(receivableAmount)}\n`;
        }
        
        totalReceivable += receivableAmount;
        dateReceivable += receivableAmount;
      });
      
      message += `*Subtotal do dia: ${formatCurrency(dateTotal)}*\n`;
      if (isAttendant) {
        message += `*Comissão do dia: ${formatCurrency(dateReceivable)}*\n`;
      } else {
        message += `*A receber do dia: ${formatCurrency(dateReceivable)}*\n`;
      }
      message += `\n`;
    });
    
    // Adicionar totais no final
    message += `*TOTAIS*\n`;
    message += `Total de pagamentos: ${formatCurrency(totalValue)}\n`;
    if (isAttendant) {
      message += `Comissão Total: ${formatCurrency(totalReceivable)}\n`;
    } else {
      message += `Total a receber: ${formatCurrency(totalReceivable)}\n`;
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
