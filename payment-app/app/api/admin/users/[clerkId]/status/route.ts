import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ProfileStatus } from "@prisma/client";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

const VALID_STATUSES = new Set<string>(Object.values(ProfileStatus));

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clerkId } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !VALID_STATUSES.has(status)) {
    return NextResponse.json(
      { error: `Status inválido. Valores permitidos: ${Object.values(ProfileStatus).join(", ")}` },
      { status: 400 },
    );
  }

  const user = await prisma.paymentUser.findUnique({ where: { clerkId } });

  if (!user) {
    return NextResponse.json(
      { error: `No se encontró un usuario con clerkId "${clerkId}"` },
      { status: 404 },
    );
  }

  const updated = await prisma.paymentUser.update({
    where: { clerkId },
    data: { status: status as ProfileStatus },
    select: { clerkId: true, status: true },
  });

  return NextResponse.json({ ok: true, clerkId: updated.clerkId, status: updated.status });
}
