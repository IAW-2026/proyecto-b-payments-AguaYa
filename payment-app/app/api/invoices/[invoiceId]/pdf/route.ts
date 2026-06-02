import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { buildPDF } from "@/app/lib/invoices/build-pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;
  const isAdmin = roles?.includes("admin_payment") ?? false;

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!isAdmin && !profile?.buyerId && !profile?.sellerId) redirect("/select-role");

  const { invoiceId } = await context.params;

  const invoice = await prisma.invoice.findFirst({
    where: isAdmin
      ? { id: invoiceId }
      : {
          id: invoiceId,
          OR: [
            ...(profile?.buyerId ? [{ payment: { buyerId: profile.buyerId } }] : []),
            ...(profile?.sellerId ? [{ payment: { sellerId: profile.sellerId } }] : []),
          ],
        },
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
          items: {
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 });
  }

  const buffer = await buildPDF(invoice);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoiceId}.pdf"`,
    },
  });
}
