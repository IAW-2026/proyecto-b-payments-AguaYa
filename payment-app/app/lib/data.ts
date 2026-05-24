import { prisma } from "./prisma";
import { PaymentStatus } from "@prisma/client";

export async function fetchLatestPayments() {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function fetchRecentBuyerPayments(buyerId: string, limit = 5) {
  return prisma.payment.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function fetchRecentSellerPayments(sellerId: string, limit = 5) {
  return prisma.payment.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function fetchRecentBuyerInvoices(buyerId: string, limit = 5) {
  return prisma.invoice.findMany({
    where: { payment: { buyerId } },
    orderBy: { issuedAt: "desc" },
    take: limit,
    select: {
      id: true,
      paymentId: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          status: true,
        },
      },
    },
  });
}

export async function fetchRecentSellerInvoices(sellerId: string, limit = 5) {
  return prisma.invoice.findMany({
    where: { payment: { sellerId } },
    orderBy: { issuedAt: "desc" },
    take: limit,
    select: {
      id: true,
      paymentId: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          status: true,
        },
      },
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
