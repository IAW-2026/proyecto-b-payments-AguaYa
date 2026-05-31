type NotifyPaymentApprovedInput = {
  orderId: string;
  transactionId: string;
  amount: number;
};

export async function notifyPaymentApproved({
  orderId,
  transactionId,
  amount,
}: NotifyPaymentApprovedInput) {
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

  return response.json();
}
