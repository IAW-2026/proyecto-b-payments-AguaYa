import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany();

    return NextResponse.json({
      connected: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error,
    });
  }
}
