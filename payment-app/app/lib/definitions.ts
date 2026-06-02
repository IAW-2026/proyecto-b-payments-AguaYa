import { PaymentStatus } from "@prisma/client";
export type { PaymentStatus };

export type RecentPayment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  buyerName?: string;
  sellerName?: string;
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

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  mpPaymentMethod: string | null;
  buyerName?: string;
  sellerName?: string;
};
