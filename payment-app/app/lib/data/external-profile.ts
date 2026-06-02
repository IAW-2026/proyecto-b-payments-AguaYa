import { prisma } from "../prisma";

// const EXTERNAL_FETCH_TIMEOUT_MS = 3_000;
//
// async function fetchExternalId(
//   baseUrl: string | undefined,
//   clerkId: string,
//   field: "buyerId" | "sellerId",
// ): Promise<string | null> {
//   if (!baseUrl) return null;
//   try {
//     const res = await fetch(`${baseUrl}/users/by-clerk-id/${clerkId}`, {
//       cache: "no-store",
//       signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
//     });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return (data[field] as string) ?? null;
//   } catch {
//     return null;
//   }
// }

export async function resolveExternalProfile(clerkId: string, userName: string) {
  const seedClerkUser = process.env.SEED_CLERK_USER;
  const mockBuyerId   = process.env.MOCK_BUYER_ID;
  const mockSellerId  = process.env.MOCK_SELLER_ID;

  if ((mockBuyerId || mockSellerId) && clerkId === seedClerkUser) {
    return prisma.externalProfile.upsert({
      where: { clerkId },
      create: { clerkId, userName, buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
      update: { buyerId: mockBuyerId ?? null, sellerId: mockSellerId ?? null },
    });
  }

  // TODO: cuando las apps externas estén disponibles, descomentar fetchExternalId
  // y reemplazar este upsert por el bloque comentado más abajo.
  return prisma.externalProfile.upsert({
    where: { clerkId },
    create: {
      clerkId,
      userName,
      buyerId:  `mock-buyer-${clerkId}`,
      sellerId: `mock-seller-${clerkId}`,
    },
    update: {},
  });

  // const existing = await prisma.externalProfile.findUnique({ where: { clerkId } });
  // if (existing?.buyerId && existing?.sellerId) return existing;
  //
  // const [buyerResult, sellerResult] = await Promise.allSettled([
  //   existing?.buyerId
  //     ? Promise.resolve(existing.buyerId)
  //     : fetchExternalId(process.env.BUYER_APP_URL, clerkId, "buyerId"),
  //   existing?.sellerId
  //     ? Promise.resolve(existing.sellerId)
  //     : fetchExternalId(process.env.SELLER_APP_URL, clerkId, "sellerId"),
  // ]);
  //
  // const buyerId  = buyerResult.status  === "fulfilled" ? buyerResult.value  : null;
  // const sellerId = sellerResult.status === "fulfilled" ? sellerResult.value : null;
  //
  // return prisma.externalProfile.upsert({
  //   where: { clerkId },
  //   create: { clerkId, userName, buyerId, sellerId },
  //   update: {
  //     ...(!existing?.buyerId  && buyerId  ? { buyerId  } : {}),
  //     ...(!existing?.sellerId && sellerId ? { sellerId } : {}),
  //   },
  // });
}
