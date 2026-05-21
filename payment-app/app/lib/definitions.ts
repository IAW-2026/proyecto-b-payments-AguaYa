export type LatestPayment = {
  id: string;
  buyerId: string;
  amount: number;
};

import { PaymentStatus } from "@prisma/client";
export type { PaymentStatus };

export type BuyerPayment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  mpPaymentMethod: string | null;
};
