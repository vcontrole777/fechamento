
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="rounded-full bg-primary/10 p-8">
              <div className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Módulo em desenvolvimento</h2>
            <p className="text-center text-muted-foreground max-w-md">
              Esta seção está sendo desenvolvida e ficará disponível em breve.
              Enquanto isso, você pode explorar outras áreas do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
