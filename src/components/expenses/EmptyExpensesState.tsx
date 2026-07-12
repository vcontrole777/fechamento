
import React from "react";

export default function EmptyExpensesState() {
  return (
    <div className="text-center p-4">
      <p className="text-muted-foreground">Nenhuma despesa encontrada.</p>
      <p className="text-sm text-muted-foreground mt-1">
        Clique no botão "Nova Despesa" para adicionar uma despesa.
      </p>
    </div>
  );
}
