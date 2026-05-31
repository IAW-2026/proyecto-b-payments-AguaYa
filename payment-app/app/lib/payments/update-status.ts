import { prisma } from "@/app/lib/prisma";
import { PaymentStatus, Payment } from "@prisma/client";

type MpPaymentData = {
  id?: number | null;
  status?: string | null;
  payment_method_id?: string | null;
  date_approved?: string | null;
};

const terminalStatuses: PaymentStatus[] = [
  "approved",
  "rejected",
  "cancelled",
  "expired",
];

export async function updatePaymentStatus(
  payment: Payment,
  mpPayment: MpPaymentData,
): Promise<{ alreadyProcessed: boolean; newStatus: PaymentStatus }> {
  if (payment.mpStatus === mpPayment.status) {
    return { alreadyProcessed: true, newStatus: payment.status };
  }

  if (terminalStatuses.includes(payment.status)) {
    return { alreadyProcessed: true, newStatus: payment.status };
  }

  const newStatus = mapStatus(mpPayment.status ?? undefined);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      mpPaymentId: mpPayment.id != null ? String(mpPayment.id) : undefined,
      mpStatus: mpPayment.status ?? undefined,
      mpPaymentMethod: mpPayment.payment_method_id ?? undefined,
      mpPaymentDate: mpPayment.date_approved ? new Date(mpPayment.date_approved) : undefined,
      status: newStatus,
    },
  });

  console.log(`✅ Payment ${payment.id} actualizado a "${mpPayment.status}".`);

  return { alreadyProcessed: false, newStatus };
}

function mapStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}
