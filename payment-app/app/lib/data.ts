import { prisma } from "./prisma";
import { PaymentStatus } from "@prisma/client";

export async function fetchLatestPayments() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,

    select: {
      id: true,
      amount: true,
      buyerId: true,
    },
  });
}

export async function fetchBuyerPayments(
  buyerId: string,
  filters: { status?: PaymentStatus; from?: string; to?: string } = {}
) {
  const { status, from, to } = filters;
  return prisma.payment.findMany({
    where: {
      buyerId,
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
      mpPaymentMethod: true,
    },
  });
}
