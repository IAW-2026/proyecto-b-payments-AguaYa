import { prisma } from "../prisma";
import { PAGE_SIZE } from "./payments";

function invoicesSearchWhere(query?: string) {
  return query
    ? { payment: { orderId: { contains: query, mode: "insensitive" as const } } }
    : {};
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

export async function fetchBuyerInvoiceById(invoiceId: string, buyerId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, payment: { buyerId } },
    select: {
      id: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          buyerName: true,
          buyerEmail: true,
          sellerName: true,
          status: true,
          mpPaymentMethod: true,
        },
      },
    },
  });
}

export async function fetchSellerInvoiceById(invoiceId: string, sellerId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, payment: { sellerId } },
    select: {
      id: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          buyerName: true,
          buyerEmail: true,
          status: true,
          mpPaymentMethod: true,
        },
      },
    },
  });
}

export async function fetchBuyerInvoices(buyerId: string) {
  return prisma.invoice.findMany({
    where: { payment: { buyerId } },
    orderBy: { issuedAt: "desc" },
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

export async function fetchSellerInvoices(sellerId: string) {
  return prisma.invoice.findMany({
    where: { payment: { sellerId } },
    orderBy: { issuedAt: "desc" },
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

export async function fetchAdminInvoiceById(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          buyerName: true,
          buyerEmail: true,
          sellerName: true,
          status: true,
          mpPaymentMethod: true,
        },
      },
    },
  });
}

export async function fetchAllInvoices(query?: string, page = 1) {
  return prisma.invoice.findMany({
    where: invoicesSearchWhere(query),
    orderBy: { issuedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      paymentId: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: { select: { orderId: true, status: true } },
    },
  });
}

export async function countAllInvoices(query?: string) {
  return prisma.invoice.count({ where: invoicesSearchWhere(query) });
}

export async function fetchBuyerInvoicesPaged(buyerId: string, page = 1, query?: string) {
  return prisma.invoice.findMany({
    where: { payment: { buyerId }, ...invoicesSearchWhere(query) },
    orderBy: { issuedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      paymentId: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: { select: { orderId: true, status: true } },
    },
  });
}

export async function countBuyerInvoices(buyerId: string, query?: string) {
  return prisma.invoice.count({ where: { payment: { buyerId }, ...invoicesSearchWhere(query) } });
}

export async function fetchSellerInvoicesPaged(sellerId: string, page = 1, query?: string) {
  return prisma.invoice.findMany({
    where: { payment: { sellerId }, ...invoicesSearchWhere(query) },
    orderBy: { issuedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      paymentId: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: { select: { orderId: true, status: true } },
    },
  });
}

export async function countSellerInvoices(sellerId: string, query?: string) {
  return prisma.invoice.count({ where: { payment: { sellerId }, ...invoicesSearchWhere(query) } });
}
