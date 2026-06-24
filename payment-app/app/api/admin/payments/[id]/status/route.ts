import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.status !== "cancelled") {
    return NextResponse.json(
      { error: "Only pending → cancelled transition is allowed from the control plane" },
      { status: 422 },
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payment.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot cancel a payment with status '${payment.status}'` },
      { status: 422 },
    );
  }

  await prisma.payment.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ ok: true });
}
