import { PaymentStatus } from "@prisma/client";
export type { PaymentStatus };

export type RecentPayment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
};

export type RecentInvoice = {
  id: string;
  paymentId: string;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: Date;
  payment: {
    orderId: string;
    status: PaymentStatus;
  };
};

export type BuyerPayment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  mpPaymentMethod: string | null;
};
