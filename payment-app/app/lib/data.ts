import { prisma } from "./prisma";
import { PaymentStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// ExternalProfile: resuelve el mapeo clerkId → buyerId / sellerId
// ---------------------------------------------------------------------------

const EXTERNAL_FETCH_TIMEOUT_MS = 3_000;

async function fetchExternalId(
  baseUrl: string | undefined,
  clerkId: string,
  field: "buyerId" | "sellerId",
): Promise<string | null> {
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/users/by-clerk-id/${clerkId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data[field] as string) ?? null;
  } catch {
    // Cubre: timeout (AbortError), red caída, JSON inválido, etc.
    // LIMITACIÓN: no distinguimos entre "la app está caída" y "el usuario no
    // existe en esa app" — en ambos casos devolvemos null. Consecuencia: si
    // la app está caída en el momento del primer login, el perfil se guarda con
    // null y el portal aparece deshabilitado hasta el próximo login exitoso.
    return null;
  }
}

/**
 * Busca en la tabla ExternalProfile el mapping para este clerkId.
 * - Si no existe: consulta ambas apps externas y crea el perfil.
 * - Si existe pero tiene IDs nulos: re-consulta solo las apps que faltan
 *   y actualiza. Esto cubre el caso en que el usuario se registró en una
 *   app después del primer login.
 * - Nunca sobreescribe un ID ya resuelto con null (evita borrar un ID
 *   válido si una app externa está temporalmente caída).
 */
export async function resolveExternalProfile(clerkId: string, username: string) {
  // Mock para desarrollo: usar IDs falsos y persistirlos en la DB para que
  // los dashboards (que leen la DB directamente) también funcionen.
  const mockBuyerId = process.env.MOCK_BUYER_ID;
  const mockSellerId = process.env.MOCK_SELLER_ID;
  if (mockBuyerId || mockSellerId) {
    return prisma.externalProfile.upsert({
      where: { clerkId },
      create: { clerkId, username, buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
      // No sobreescribir username ni status si el perfil ya existe
      update: { buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
    });
  }

  const existing = await prisma.externalProfile.findUnique({
    where: { clerkId },
  });

  // Camino rápido: ambos IDs ya están resueltos
  if (existing?.buyerId && existing?.sellerId) return existing;

  const [buyerResult, sellerResult] = await Promise.allSettled([
    existing?.buyerId
      ? Promise.resolve(existing.buyerId)
      : fetchExternalId(process.env.BUYER_APP_URL, clerkId, "buyerId"),
    existing?.sellerId
      ? Promise.resolve(existing.sellerId)
      : fetchExternalId(process.env.SELLER_APP_URL, clerkId, "sellerId"),
  ]);

  const buyerId = buyerResult.status === "fulfilled" ? buyerResult.value : null;
  const sellerId =
    sellerResult.status === "fulfilled" ? sellerResult.value : null;

  // Nunca sobreescribe username ni status de un perfil existente.
  return prisma.externalProfile.upsert({
    where: { clerkId },
    create: { clerkId, username, buyerId, sellerId },
    update: {
      ...(!existing?.buyerId && buyerId ? { buyerId } : {}),
      ...(!existing?.sellerId && sellerId ? { sellerId } : {}),
    },
  });
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

export const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

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

export async function fetchAllPayments(
  filters: PaymentsFilters = {},
) {
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

export async function countAllPayments(
  filters: Omit<PaymentsFilters, "page"> = {},
) {
  return prisma.payment.count({ where: paymentsFiltersWhere(filters) });
}

function usersSearchWhere(query?: string) {
  if (!query) return {};
  const profileNumber = parseInt(query, 10);
  return {
    OR: [
      ...(!isNaN(profileNumber) ? [{ profileNumber }] : []),
      { username: { contains: query, mode: "insensitive" as const } },
      { clerkId: { contains: query, mode: "insensitive" as const } },
      { buyerId: { contains: query, mode: "insensitive" as const } },
      { sellerId: { contains: query, mode: "insensitive" as const } },
    ],
  };
}

export async function fetchAllUsers(query?: string, page = 1) {
  return prisma.externalProfile.findMany({
    where: usersSearchWhere(query),
    orderBy: { profileNumber: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
}

export async function countAllUsers(query?: string) {
  return prisma.externalProfile.count({ where: usersSearchWhere(query) });
}

type PaymentsFilters = {
  status?: PaymentStatus;
  from?: string;
  to?: string;
  query?: string;
  page?: number;
};

function paymentsFiltersWhere(
  filters: Omit<PaymentsFilters, "page">,
) {
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

export async function fetchBuyerPayments(
  buyerId: string,
  filters: PaymentsFilters = {},
) {
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

export async function fetchSellerPayments(
  sellerId: string,
  filters: PaymentsFilters = {},
) {
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

function invoicesSearchWhere(query?: string) {
  return query
    ? { payment: { orderId: { contains: query, mode: "insensitive" as const } } }
    : {};
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
