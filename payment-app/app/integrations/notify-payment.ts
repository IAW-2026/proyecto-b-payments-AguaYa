type NotifyPaymentApprovedInput = {
  orderId: string;
  transactionId: string;
  amount: number;
  buyerId: string;
};

async function notifySellerApp(
  orderId: string,
  transactionId: string,
  amount: number,
) {
  const sellerAppUrl = process.env.SELLER_APP_URL;
  const serviceToken = process.env.SELLER_APP_SERVICE_TOKEN;

  if (!sellerAppUrl || !serviceToken) {
    throw new Error("SELLER_APP_URL or SELLER_APP_SERVICE_TOKEN is not defined");
  }

  const response = await fetch(`${sellerAppUrl}/api/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Token": serviceToken,
    },
    body: JSON.stringify({ transactionId, amount }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to notify seller app: ${response.status} ${response.statusText}`,
    );
  }
}

async function notifyBuyerApp(
  orderId: string,
  transactionId: string,
  amount: number,
  buyerId: string,
) {
  const buyerAppUrl = process.env.BUYER_APP_URL;
  const serviceToken = process.env.BUYER_APP_SERVICE_TOKEN;

  if (!buyerAppUrl || !serviceToken) {
    throw new Error("BUYER_APP_URL or BUYER_APP_SERVICE_TOKEN is not defined");
  }

  const response = await fetch(`${buyerAppUrl}/api/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Token": serviceToken,
    },
    body: JSON.stringify({ transactionId, amount, buyerId }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to notify buyer app: ${response.status} ${response.statusText}`,
    );
  }
}

export async function notifyPaymentApproved({
  orderId,
  transactionId,
  amount,
  buyerId,
}: NotifyPaymentApprovedInput) {
  const results = await Promise.allSettled([
    notifySellerApp(orderId, transactionId, amount),
    notifyBuyerApp(orderId, transactionId, amount, buyerId),
  ]);

  if (results[0].status === "fulfilled") {
    console.log(`📦 SellerApp notificada para la orden ${orderId}.`);
  } else {
    console.error(`❌ Error al notificar a SellerApp:`, results[0].reason);
  }

  if (results[1].status === "fulfilled") {
    console.log(`🛒 BuyerApp notificada para la orden ${orderId}.`);
  } else {
    console.error(`❌ Error al notificar a BuyerApp:`, results[1].reason);
  }
}
