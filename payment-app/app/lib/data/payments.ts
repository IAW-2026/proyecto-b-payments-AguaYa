import { prisma } from "../prisma";
import { PaymentStatus } from "@prisma/client";

export const PAGE_SIZE = 10;

export type PaymentsFilters = {
  status?: PaymentStatus;
  from?: string;
  to?: string;
  query?: string;
  page?: number;
};

function paymentsFiltersWhere(filters: Omit<PaymentsFilters, "page">) {
  const { status, from, to, query } = filters;
  return {
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { orderId: { contains: query, mode: "insensitive" as const } },
            { buyerName: { contains: query, mode: "insensitive" as const } },
            { sellerName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

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
      sellerName: true,
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
      buyerName: true,
    },
  });
}

export async function fetchPaymentStats() {
  const [byStatus, revenueResult] = await Promise.all([
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: "approved" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(
    byStatus.map((row) => [row.status, row._count._all]),
  ) as Partial<Record<PaymentStatus, number>>;

  return {
    total: byStatus.reduce((acc, r) => acc + r._count._all, 0),
    approved: counts.approved ?? 0,
    pending: counts.pending ?? 0,
    rejected: counts.rejected ?? 0,
    cancelled: counts.cancelled ?? 0,
    expired: counts.expired ?? 0,
    revenue: revenueResult._sum.amount ?? 0,
  };
}

export async function fetchAllPayments(filters: PaymentsFilters = {}) {
  const { page = 1, ...rest } = filters;
  return prisma.payment.findMany({
    where: paymentsFiltersWhere(rest),
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
      mpPaymentMethod: true,
      buyerName: true,
      sellerName: true,
    },
  });
}

export async function countAllPayments(filters: Omit<PaymentsFilters, "page"> = {}) {
  return prisma.payment.count({ where: paymentsFiltersWhere(filters) });
}

export async function fetchBuyerPayments(buyerId: string, filters: PaymentsFilters = {}) {
  const { page = 1, ...rest } = filters;
  return prisma.payment.findMany({
    where: { buyerId, ...paymentsFiltersWhere(rest) },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
      mpPaymentMethod: true,
      sellerName: true,
    },
  });
}

export async function countBuyerPayments(
  buyerId: string,
  filters: Omit<PaymentsFilters, "page"> = {},
) {
  return prisma.payment.count({
    where: { buyerId, ...paymentsFiltersWhere(filters) },
  });
}

export async function fetchSellerPayments(sellerId: string, filters: PaymentsFilters = {}) {
  const { page = 1, ...rest } = filters;
  return prisma.payment.findMany({
    where: { sellerId, ...paymentsFiltersWhere(rest) },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      createdAt: true,
      mpPaymentMethod: true,
      buyerName: true,
    },
  });
}

export async function countSellerPayments(
  sellerId: string,
  filters: Omit<PaymentsFilters, "page"> = {},
) {
  return prisma.payment.count({
    where: { sellerId, ...paymentsFiltersWhere(filters) },
  });
}

export async function fetchSellerStats(sellerId: string) {
  const [byStatus, revenueResult] = await Promise.all([
    prisma.payment.groupBy({
      by: ["status"],
      where: { sellerId },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { sellerId, status: "approved" },
      _sum: { amount: true },
    }),
  ]);

  const counts = Object.fromEntries(
    byStatus.map((r) => [r.status, r._count._all]),
  ) as Partial<Record<PaymentStatus, number>>;

  return {
    total: byStatus.reduce((acc, r) => acc + r._count._all, 0),
    approved: counts.approved ?? 0,
    pending: counts.pending ?? 0,
    rejected: counts.rejected ?? 0,
    cancelled: counts.cancelled ?? 0,
    expired: counts.expired ?? 0,
    revenue: revenueResult._sum.amount ?? 0,
  };
}

export async function fetchSellerMonthlyRevenue(sellerId: string) {
  const rows = await prisma.$queryRaw<{ month: string; revenue: bigint }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
      COALESCE(SUM(amount), 0) AS revenue
    FROM "Payment"
    WHERE "sellerId" = ${sellerId}
      AND status::text = 'approved'
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt") ASC
  `;
  return rows.map((r) => ({ month: r.month, revenue: Number(r.revenue) }));
}

export async function fetchSellerTopProducts(sellerId: string) {
  const rows = await prisma.$queryRaw<
    { productName: string; total_units: number; total_revenue: number }[]
  >`
    SELECT
      pis."productName",
      SUM(pis.quantity)::int AS total_units,
      SUM(pis.subtotal)::int  AS total_revenue
    FROM "PaymentItemSnapshot" pis
    JOIN "Payment" p ON p.id = pis."paymentId"
    WHERE p."sellerId" = ${sellerId}
      AND p.status::text = 'approved'
    GROUP BY pis."productName"
  `;

  if (rows.length === 0) return { mostSold: null, topRevenue: null };

  const mostSold = rows.reduce((a, b) => (a.total_units > b.total_units ? a : b));
  const topRevenue = rows.reduce((a, b) => (a.total_revenue > b.total_revenue ? a : b));

  return {
    mostSold: { name: mostSold.productName, units: Number(mostSold.total_units) },
    topRevenue: { name: topRevenue.productName, amount: Number(topRevenue.total_revenue) },
  };
}

export async function fetchMonthlyRevenue() {
  const rows = await prisma.$queryRaw<{ month: string; revenue: bigint }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
      COALESCE(SUM(amount), 0) AS revenue
    FROM "Payment"
    WHERE status::text = 'approved'
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt") ASC
  `;
  return rows.map((r) => ({ month: r.month, revenue: Number(r.revenue) }));
}
