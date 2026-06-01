import { prisma } from "../prisma";

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
export async function resolveExternalProfile(clerkId: string, userName: string) {
  const mockBuyerId = process.env.MOCK_BUYER_ID;
  const mockSellerId = process.env.MOCK_SELLER_ID;
  if (mockBuyerId || mockSellerId) {
    return prisma.externalProfile.upsert({
      where: { clerkId },
      create: { clerkId, userName, buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
      update: { buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
    });
  }

  const existing = await prisma.externalProfile.findUnique({
    where: { clerkId },
  });

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
  const sellerId = sellerResult.status === "fulfilled" ? sellerResult.value : null;

  return prisma.externalProfile.upsert({
    where: { clerkId },
    create: { clerkId, userName, buyerId, sellerId },
    update: {
      ...(!existing?.buyerId && buyerId ? { buyerId } : {}),
      ...(!existing?.sellerId && sellerId ? { sellerId } : {}),
    },
  });
}
