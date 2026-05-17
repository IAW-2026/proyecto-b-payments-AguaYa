import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;

  return NextResponse.json({
    orderId,
    status: "approved",
  });
}
