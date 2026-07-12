import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttendantPaymentForm } from "./AttendantPaymentForm";
import { AttendantPaymentFormData } from "./schemas/attendantPaymentSchema";
import { useAuth } from "@/hooks/useAuth";

interface RegisterAttendantPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendantId: number;
  attendantName: string;
  totalCommission: number;
  totalPaid: number;
  formatCurrency: (value: number) => string;
  dateRange: { from: Date | null; to: Date | null };
  onSubmit: (data: AttendantPaymentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function RegisterAttendantPaymentDialog({
  open,
  onOpenChange,
  attendantId,
  attendantName,
  totalCommission,
  totalPaid,
  formatCurrency,
  dateRange,
  onSubmit,
  isSubmitting,
}: RegisterAttendantPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento de Comissão</DialogTitle>
          <DialogDescription>
            Registre o pagamento da comissão para {attendantName}
          </DialogDescription>
        </DialogHeader>
        <AttendantPaymentForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          totalCommission={totalCommission}
          totalPaid={totalPaid}
          formatCurrency={formatCurrency}
          attendantName={attendantName}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
