
import React from "react";

export default function EmptyAttendantsState() {
  return (
    <div className="text-center p-4">
      <p className="text-muted-foreground">Nenhum atendente encontrado.</p>
      <p className="text-sm text-muted-foreground mt-1">
        Clique no botão "Novo Atendente" para adicionar um atendente.
      </p>
    </div>
  );
}
