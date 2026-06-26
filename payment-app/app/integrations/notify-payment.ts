type NotifyPaymentApprovedInput = {
  orderId: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  buyerPhone: string | null;
  sellerId: string;
  buyerAddress: string;
  items: { productId: string; quantity: number }[];
};

async function notifySellerApp(
  orderId: string,
  sellerId: string,
  buyerId: string,
  buyerName: string,
  buyerPhone: string | null,
  buyerAddress: string,
  items: { productId: string; quantity: number }[],
  total: number,
) {
  const sellerAppUrl = process.env.SELLER_APP_URL;
  const serviceToken = process.env.INTERNAL_API_KEY; //le paso mi key, no la del servicio del seller app porque es un token de servicio interno para autenticación entre servicios

  if (!sellerAppUrl || !serviceToken) {
    throw new Error(
      "SELLER_APP_URL or SELLER_APP_SERVICE_TOKEN is not defined",
    );
  }

  const response = await fetch(`${sellerAppUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": serviceToken,
    },
    body: JSON.stringify({
      externalId: orderId,
      vendorId: sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      address: buyerAddress,
      items,
      total,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to notify seller app: ${response.status} ${response.statusText} — ${body}`,
    );
  }
}

async function notifyBuyerApp(orderId: string) {
  const buyerAppUrl = process.env.BUYER_APP_URL;
  const serviceToken = process.env.BUYER_APP_SERVICE_TOKEN;

  if (!buyerAppUrl || !serviceToken) {
    throw new Error("BUYER_APP_URL or BUYER_APP_SERVICE_TOKEN is not defined");
  }

  const response = await fetch(`${buyerAppUrl}/api/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": serviceToken,
    },
    body: JSON.stringify({ orderStatus: "PAID" }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to notify buyer app: ${response.status} ${response.statusText} — ${body}`,
    );
  }
}

export async function notifyPaymentApproved({
  orderId,
  amount,
  buyerId,
  buyerName,
  buyerPhone,
  sellerId,
  buyerAddress,
  items,
}: NotifyPaymentApprovedInput) {
  const results = await Promise.allSettled([
    notifySellerApp(
      orderId,
      sellerId,
      buyerId,
      buyerName,
      buyerPhone,
      buyerAddress,
      items,
      amount,
    ),
    notifyBuyerApp(orderId),
  ]);

  if (results[0].status === "rejected") {
    console.error(`❌ Error al notificar a SellerApp:`, results[0].reason);
  }

  if (results[1].status === "rejected") {
    console.error(`❌ Error al notificar a BuyerApp:`, results[1].reason);
  }
}
