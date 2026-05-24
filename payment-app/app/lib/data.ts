import { prisma } from "./prisma";
import { PaymentStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// ExternalProfile: resuelve el mapeo clerkId → buyerId / sellerId
// ---------------------------------------------------------------------------

const EXTERNAL_FETCH_TIMEOUT_MS = 3_000;

async function fetchExternalId(
  baseUrl: string | undefined,
  clerkId: string,
  field: "buyerId" | "sellerId"
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
export async function resolveExternalProfile(clerkId: string) {
  const existing = await prisma.externalProfile.findUnique({
    where: { clerkId },
  });

  // Camino rápido: ambos IDs ya están resueltos
  if (existing?.buyerId && existing?.sellerId) return existing;

  // Consultar solo las apps que todavía no tienen ID resuelto.
  // allSettled garantiza que un fallo en una no cancela la otra.
  const [buyerResult, sellerResult] = await Promise.allSettled([
    existing?.buyerId
      ? Promise.resolve(existing.buyerId)
      : fetchExternalId(process.env.BUYER_APP_URL, clerkId, "buyerId"),
    existing?.sellerId
      ? Promise.resolve(existing.sellerId)
      : fetchExternalId(process.env.SELLER_APP_URL, clerkId, "sellerId"),
  ]);

  const buyerId  = buyerResult.status  === "fulfilled" ? buyerResult.value  : null;
  const sellerId = sellerResult.status === "fulfilled" ? sellerResult.value : null;

  // Crear o actualizar (upsert) — solo actualiza campos que pasaron de null a valor
  return prisma.externalProfile.upsert({
    where: { clerkId },
    create: { clerkId, buyerId, sellerId },
    update: {
      ...(!existing?.buyerId  && buyerId  ? { buyerId }  : {}),
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
