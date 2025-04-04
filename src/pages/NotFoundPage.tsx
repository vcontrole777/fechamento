
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Página não encontrada</h2>
      <p className="mt-2 text-muted-foreground">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar ao Dashboard</Link>
      </Button>
    </div>
  );
}
