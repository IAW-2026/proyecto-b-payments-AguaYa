import { prisma } from "../prisma";

const EXTERNAL_FETCH_TIMEOUT_MS = 3_000;

type ExternalProfile = { id: string; name: string };

async function fetchExternalBuyerProfile(
  clerkId: string,
): Promise<ExternalProfile | null> {
  if (!process.env.BUYER_APP_URL) return null;
  try {
    const res = await fetch(`${process.env.BUYER_APP_URL}/buyer/${clerkId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, name: data.name };
  } catch {
    return null;
  }
}

async function fetchExternalSellerProfile(
  clerkId: string,
): Promise<ExternalProfile | null> {
  if (!process.env.SELLER_APP_URL) return null;
  try {
    const res = await fetch(`${process.env.SELLER_APP_URL}/seller/${clerkId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, name: data.name };
  } catch {
    return null;
  }
}

export async function resolvePaymentUser(clerkId: string) {
  // TODO: reemplazar por el bloque de fetches reales cuando las apps externas estén disponibles
  return prisma.paymentUser.upsert({
    where: { clerkId },
    create: {
      clerkId,
      buyerId: `buyer-${clerkId}`,
      buyerName: `buyer-name-${clerkId}`,
      sellerId: `seller-${clerkId}`,
      sellerName: `seller-name-${clerkId}`,
    },
    update: {},
  });
  // const existing = await prisma.paymentUser.findUnique({ where: { clerkId } });
  // if (existing?.buyerId && existing?.sellerId) return existing;
  //
  // const [buyerResult, sellerResult] = await Promise.allSettled([
  //   existing?.buyerId
  //     ? Promise.resolve({ id: existing.buyerId, name: existing.buyerName })
  //     : fetchExternalBuyerProfile(clerkId),
  //   existing?.sellerId
  //     ? Promise.resolve({ id: existing.sellerId, name: existing.sellerName })
  //     : fetchExternalSellerProfile(clerkId),
  // ]);
  //
  // const buyer  = buyerResult.status  === "fulfilled" ? buyerResult.value  : null;
  // const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null;
  //
  // return prisma.paymentUser.upsert({
  //   where: { clerkId },
  //   create: {
  //     clerkId,
  //     buyerId:    buyer?.id   ?? `buyer-${clerkId}`,
  //     buyerName:  buyer?.name ?? null,
  //     sellerId:   seller?.id  ?? `seller-${clerkId}`,
  //     sellerName: seller?.name ?? null,
  //   },
  //   update: {
  //     ...(!existing?.buyerId  && buyer  ? { buyerId:   buyer.id,   buyerName:  buyer.name  } : {}),
  //     ...(!existing?.sellerId && seller ? { sellerId:  seller.id,  sellerName: seller.name } : {}),
  //   },
  // });
}
