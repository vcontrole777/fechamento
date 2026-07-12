
import React from "react";

export default function EmptyTripeirosState() {
  return (
    <div className="text-center p-4">
      <p className="text-muted-foreground">Nenhum tripeiro encontrado.</p>
      <p className="text-sm text-muted-foreground mt-1">
        Clique no botão "Novo Tripeiro" para adicionar um tripeiro.
      </p>
    </div>
  );
}
