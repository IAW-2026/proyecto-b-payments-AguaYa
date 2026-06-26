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

const ITEMS_SELECT = {
  select: {
    id: true,
    productName: true,
    quantity: true,
    unitPrice: true,
    subtotal: true,
  },
} as const;

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
      items: ITEMS_SELECT,
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
      items: ITEMS_SELECT,
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
      items: ITEMS_SELECT,
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

// ── Stats: volume ────────────────────────────────────────────────────────────

export type VolumePeriod = "daily" | "weekly" | "monthly";

const PERIOD_CONFIG: Record<VolumePeriod, { trunc: string; fmt: string; defaultDays: number }> = {
  daily:   { trunc: "day",   fmt: "YYYY-MM-DD", defaultDays: 30  },
  weekly:  { trunc: "week",  fmt: "YYYY-MM-DD", defaultDays: 84  },
  monthly: { trunc: "month", fmt: "YYYY-MM",    defaultDays: 365 },
};

export async function fetchVolumeStats(period: VolumePeriod, fromDate: Date, toDate: Date) {
  const { trunc, fmt } = PERIOD_CONFIG[period];
  // trunc and fmt come from our controlled PERIOD_CONFIG, never from user input
  const rows = await prisma.$queryRawUnsafe<{ date: string; count: bigint; amount: bigint }[]>(
    `SELECT
       TO_CHAR(DATE_TRUNC('${trunc}', "createdAt"), '${fmt}') AS date,
       COUNT(*) AS count,
       COALESCE(SUM(amount), 0) AS amount
     FROM "Payment"
     WHERE "createdAt" >= $1 AND "createdAt" <= $2
     GROUP BY DATE_TRUNC('${trunc}', "createdAt")
     ORDER BY DATE_TRUNC('${trunc}', "createdAt") ASC`,
    fromDate,
    toDate,
  );
  return rows.map((r) => ({ date: r.date, count: Number(r.count), amount: Number(r.amount) }));
}

export function volumeDefaultFrom(period: VolumePeriod): Date {
  const d = new Date();
  d.setDate(d.getDate() - PERIOD_CONFIG[period].defaultDays);
  return d;
}

// ── Stats: user conversion ───────────────────────────────────────────────────

export async function fetchUserConversionStats() {
  const [registered, withApprovedRows] = await Promise.all([
    prisma.paymentUser.count(),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "PaymentUser" pu
      WHERE pu."buyerId" IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM "Payment" p
          WHERE p."buyerId" = pu."buyerId"
            AND p.status::text = 'approved'
        )
    `,
  ]);

  const withApprovedPayment = Number(withApprovedRows[0]?.count ?? 0);
  const conversionRate =
    registered > 0 ? parseFloat(((withApprovedPayment / registered) * 100).toFixed(1)) : 0;

  return { registered, withApprovedPayment, conversionRate };
}

// ── Stats: confirmation time ─────────────────────────────────────────────────

type ConfirmationRow = {
  avg_minutes: number | null;
  median_minutes: number | null;
  bucket_0_1: bigint;
  bucket_1_5: bigint;
  bucket_5_30: bigint;
  bucket_30_plus: bigint;
};

export async function fetchConfirmationTimeStats() {
  const rows = await prisma.$queryRaw<ConfirmationRow[]>`
    SELECT
      ROUND(AVG(diff_minutes)::numeric, 1)                                          AS avg_minutes,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY diff_minutes)::numeric, 1)  AS median_minutes,
      COUNT(*) FILTER (WHERE diff_minutes < 1)::bigint                              AS bucket_0_1,
      COUNT(*) FILTER (WHERE diff_minutes >= 1  AND diff_minutes < 5)::bigint       AS bucket_1_5,
      COUNT(*) FILTER (WHERE diff_minutes >= 5  AND diff_minutes < 30)::bigint      AS bucket_5_30,
      COUNT(*) FILTER (WHERE diff_minutes >= 30)::bigint                            AS bucket_30_plus
    FROM (
      SELECT EXTRACT(EPOCH FROM ("mpPaymentDate" - "createdAt")) / 60 AS diff_minutes
      FROM "Payment"
      WHERE status::text = 'approved'
        AND "mpPaymentDate" IS NOT NULL
        AND "mpPaymentDate" > "createdAt"
    ) sub
  `;

  const r = rows[0];
  const empty = {
    avgMinutes: null as number | null,
    medianMinutes: null as number | null,
    buckets: [
      { range: "0-1 min",  count: 0 },
      { range: "1-5 min",  count: 0 },
      { range: "5-30 min", count: 0 },
      { range: "+30 min",  count: 0 },
    ],
  };

  if (!r || r.avg_minutes == null) return empty;

  return {
    avgMinutes: r.avg_minutes,
    medianMinutes: r.median_minutes,
    buckets: [
      { range: "0-1 min",  count: Number(r.bucket_0_1) },
      { range: "1-5 min",  count: Number(r.bucket_1_5) },
      { range: "5-30 min", count: Number(r.bucket_5_30) },
      { range: "+30 min",  count: Number(r.bucket_30_plus) },
    ],
  };
}
