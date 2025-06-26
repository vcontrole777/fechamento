import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Recebimento } from "@/hooks/useRecebimentos";
import { EditRecebimentoDialog } from "./EditRecebimentoDialog";
import { DeleteRecebimentoDialog } from "./DeleteRecebimentoDialog";
import { ViewRecebimentoDetailsDialog } from "./ViewRecebimentoDetailsDialog";
import { GroupedRecebimentoActions } from "./GroupedRecebimentoActions";
import { useContasBancarias } from "@/hooks/useContasBancarias";

interface RecebimentosTableProps {
  recebimentos: Recebimento[];
  formatCurrency: (value: number) => string;
}

interface GroupedRecebimento {
  key: string;
  tripeiro: { id: number; nome: string } | undefined;
  data: string;
  conta: string;
  banco: string;
  totalValor: number;
  recebimentos: Recebimento[];
  tipos: string[];
  observacoes: string[];
}

export function RecebimentosTable({ recebimentos, formatCurrency }: RecebimentosTableProps) {
  const { data: contasBancarias = [] } = useContasBancarias();

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTipoDeposito = (tipo: string | null) => {
    if (!tipo) return "-";
    
    const tipos: { [key: string]: string } = {
      deposito: "Depósito",
      transferencia: "Transferência",
      pix: "PIX",
      ted: "TED",
      especie: "Espécie",
    };
    
    return tipos[tipo] || tipo;
  };

  const getTitularByRecebimento = (recebimento: Recebimento) => {
    console.log("🔍 Debug getTitularByRecebimento DETALHADO:");
    console.log("📋 Recebimento:", {
      id: recebimento.id,
      tipo_deposito: recebimento.tipo_deposito,
      conta_depositada: recebimento.conta_depositada,
      banco: recebimento.banco,
      responsavel: recebimento.responsavel
    });
    console.log("🏦 Contas bancárias disponíveis:", contasBancarias);
    
    // Para recebimentos em espécie, mostrar o responsável
    if (recebimento.tipo_deposito === "especie") {
      console.log("💰 Recebimento em espécie, responsável:", recebimento.responsavel?.nome);
      return recebimento.responsavel?.nome || "Responsável não informado";
    }
    
    // Para outros tipos, buscar pela conta bancária
    if (!recebimento.conta_depositada) {
      console.log("❌ Sem conta depositada");
      return "Conta não informada";
    }
    
    console.log("🔍 Buscando conta para:", recebimento.conta_depositada);
    console.log("📊 Total de contas bancárias:", contasBancarias.length);
    
    // Estratégia 1: Correspondência exata do nome
    let conta = contasBancarias.find(c => {
      const match = c.nome === recebimento.conta_depositada;
      console.log(`🔍 Comparando "${c.nome}" === "${recebimento.conta_depositada}": ${match}`);
      return match;
    });
    
    if (conta) {
      console.log("✅ Encontrou por nome exato:", conta);
      return conta.titular || "Titular não informado";
    }
    
    // Estratégia 2: Formato "banco - agencia/conta"
    conta = contasBancarias.find(c => {
      const formatoCompleto = `${c.banco} - ${c.agencia}/${c.conta}`;
      const match = formatoCompleto === recebimento.conta_depositada;
      console.log(`🔍 Comparando formato completo "${formatoCompleto}" === "${recebimento.conta_depositada}": ${match}`);
      return match;
    });
    
    if (conta) {
      console.log("✅ Encontrou por formato completo:", conta);
      return conta.titular || "Titular não informado";
    }
    
    // Estratégia 3: Busca apenas pelo nome do banco
    conta = contasBancarias.find(c => {
      const match = c.banco === recebimento.conta_depositada;
      console.log(`🔍 Comparando banco "${c.banco}" === "${recebimento.conta_depositada}": ${match}`);
      return match;
    });
    
    if (conta) {
      console.log("✅ Encontrou por banco:", conta);
      return conta.titular || "Titular não informado";
    }
    
    // Estratégia 4: Busca flexível (contém)
    conta = contasBancarias.find(c => {
      const nomeContains = c.nome.toLowerCase().includes(recebimento.conta_depositada.toLowerCase());
      const bancoContains = c.banco.toLowerCase().includes(recebimento.conta_depositada.toLowerCase());
      const match = nomeContains || bancoContains;
      console.log(`🔍 Busca flexível para "${recebimento.conta_depositada}":`, {
        nome: c.nome,
        banco: c.banco,
        nomeContains,
        bancoContains,
        match
      });
      return match;
    });
    
    if (conta) {
      console.log("✅ Encontrou por busca flexível:", conta);
      return conta.titular || "Titular não informado";
    }
    
    console.log("❌ NENHUMA conta encontrada para:", recebimento.conta_depositada);
    console.log("📋 Lista completa de contas para debug:", contasBancarias.map(c => ({
      id: c.id,
      nome: c.nome,
      banco: c.banco,
      titular: c.titular
    })));
    
    return "Conta não encontrada";
  };

  // Função para agrupar recebimentos
  const groupRecebimentos = (recebimentos: Recebimento[]): GroupedRecebimento[] => {
    const groups = new Map<string, GroupedRecebimento>();

    recebimentos.forEach(recebimento => {
      const key = `${recebimento.id_tripeiro}-${recebimento.data}-${recebimento.conta_depositada || 'sem-conta'}`;
      
      if (groups.has(key)) {
        const existing = groups.get(key)!;
        existing.totalValor += Number(recebimento.valor);
        existing.recebimentos.push(recebimento);
        
        // Adicionar tipos únicos
        const tipoFormatado = formatTipoDeposito(recebimento.tipo_deposito);
        if (tipoFormatado !== "-" && !existing.tipos.includes(tipoFormatado)) {
          existing.tipos.push(tipoFormatado);
        }
        
        // Adicionar observações únicas
        if (recebimento.observacoes && !existing.observacoes.includes(recebimento.observacoes)) {
          existing.observacoes.push(recebimento.observacoes);
        }
      } else {
        groups.set(key, {
          key,
          tripeiro: recebimento.tripeiro,
          data: recebimento.data,
          conta: recebimento.conta_depositada || "-",
          banco: recebimento.banco || "-",
          totalValor: Number(recebimento.valor),
          recebimentos: [recebimento],
          tipos: recebimento.tipo_deposito ? [formatTipoDeposito(recebimento.tipo_deposito)] : [],
          observacoes: recebimento.observacoes ? [recebimento.observacoes] : []
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const groupedRecebimentos = groupRecebimentos(recebimentos);

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead>Tipos</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-40">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedRecebimentos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum recebimento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            groupedRecebimentos.map((group) => (
              <TableRow key={group.key}>
                <TableCell>{formatDate(group.data)}</TableCell>
                <TableCell>{group.tripeiro?.nome || "N/A"}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(group.totalValor)}
                  {group.recebimentos.length > 1 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({group.recebimentos.length} registros)
                    </span>
                  )}
                </TableCell>
                <TableCell>{group.banco}</TableCell>
                <TableCell>
                  {getTitularByRecebimento(group.recebimentos[0])}
                </TableCell>
                <TableCell>
                  {group.tipos.length > 0 ? group.tipos.join(", ") : "-"}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  {group.observacoes.length > 0 ? (
                    <div className="truncate" title={group.observacoes.join(" | ")}>
                      {group.observacoes.join(" | ")}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <ViewRecebimentoDetailsDialog 
                      recebimentos={group.recebimentos}
                      formatCurrency={formatCurrency}
                    />
                    {group.recebimentos.length > 1 ? (
                      <>
                        <GroupedRecebimentoActions 
                          recebimentos={group.recebimentos}
                          formatCurrency={formatCurrency}
                        />
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                          Agrupado
                        </span>
                      </>
                    ) : (
                      <>
                        <EditRecebimentoDialog recebimento={group.recebimentos[0]} />
                        <DeleteRecebimentoDialog recebimento={group.recebimentos[0]} />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
