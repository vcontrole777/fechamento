
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContaBancaria } from "@/hooks/useContasBancarias";
import { EditContaBancariaDialog } from "./EditContaBancariaDialog";
import { DeleteContaBancariaDialog } from "./DeleteContaBancariaDialog";

interface ContasBancariasTableProps {
  contas: ContaBancaria[];
}

export function ContasBancariasTable({ contas }: ContasBancariasTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Agência</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma conta bancária encontrada.
              </TableCell>
            </TableRow>
          ) : (
            contas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell className="font-medium">{conta.nome}</TableCell>
                <TableCell>{conta.banco}</TableCell>
                <TableCell>{conta.agencia}</TableCell>
                <TableCell>{conta.conta}</TableCell>
                <TableCell>{conta.titular || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <EditContaBancariaDialog conta={conta} />
                    <DeleteContaBancariaDialog conta={conta} />
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
