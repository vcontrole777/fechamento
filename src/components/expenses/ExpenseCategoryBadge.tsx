import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES } from "./ExpenseFilters";

interface ExpenseCategoryBadgeProps {
  category: string | null;
}

export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  const categoryData = EXPENSE_CATEGORIES.find(c => c.value === category);
  
  if (!categoryData) {
    return (
      <Badge variant="outline" className="gap-1">
        <div className="h-2 w-2 rounded-full bg-gray-500" />
        Sem categoria
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <div className={`h-2 w-2 rounded-full ${categoryData.color}`} />
      {categoryData.label}
    </Badge>
  );
}
