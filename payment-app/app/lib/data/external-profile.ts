import { prisma } from "../prisma";

const EXTERNAL_FETCH_TIMEOUT_MS = 5_000;

type ExternalProfile = { id: string; name: string };
type ExternalBuyerProfile = { buyer_id: string; name: string };
async function fetchExternalBuyerProfile(
  clerkId: string,
): Promise<ExternalBuyerProfile | null> {
  const { BUYER_APP_URL, BUYER_APP_SERVICE_TOKEN } = process.env;
  if (!BUYER_APP_URL || !BUYER_APP_SERVICE_TOKEN) return null;
  try {
    const res = await fetch(`${BUYER_APP_URL}/buyers/by-user/${clerkId}`, {
      cache: "no-store",
      headers: { "x-api-key": BUYER_APP_SERVICE_TOKEN },
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { buyer_id: data.id, name: data.name };
  } catch {
    return null;
  }
}

async function fetchExternalSellerProfile(
  clerkId: string,
): Promise<ExternalProfile | null> {
  const { SELLER_APP_URL, VENDOR_SECRET_KEY } = process.env;
  if (!SELLER_APP_URL || !VENDOR_SECRET_KEY) return null;
  try {
    const res = await fetch(
      `${SELLER_APP_URL}/api/vendors?clerkUserId=${clerkId}`,
      {
        cache: "no-store",
        headers: { "x-api-key": VENDOR_SECRET_KEY },
        signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.vendor.id, name: data.vendor.name };
  } catch {
    return null;
  }
}

export async function resolvePaymentUser(clerkId: string) {
  console.log("[resolvePaymentUser] clerkId:", clerkId);

  const existing = await prisma.paymentUser.findUnique({ where: { clerkId } });
  if (existing?.buyerId && existing?.sellerId) return existing;

  const [buyerResult, sellerResult] = await Promise.allSettled([
    existing?.buyerId
      ? Promise.resolve({ buyer_id: existing.buyerId, name: existing.buyerName })
      : fetchExternalBuyerProfile(clerkId),
    existing?.sellerId
      ? Promise.resolve({ id: existing.sellerId, name: existing.sellerName })
      : fetchExternalSellerProfile(clerkId),
  ]);

  const buyer  = buyerResult.status  === "fulfilled" ? buyerResult.value  : null;
  const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null;

  return prisma.paymentUser.upsert({
    where: { clerkId },
    create: {
      clerkId,
      buyerId:    buyer?.buyer_id   ?? null,
      buyerName:  buyer?.name       ?? null,
      sellerId:   seller?.id        ?? null,
      sellerName: seller?.name      ?? null,
    },
    update: {
      ...(!existing?.buyerId  && buyer  ? { buyerId:   buyer.buyer_id,  buyerName:  buyer.name  } : {}),
      ...(!existing?.sellerId && seller ? { sellerId:  seller.id,       sellerName: seller.name } : {}),
    },
  });
}
