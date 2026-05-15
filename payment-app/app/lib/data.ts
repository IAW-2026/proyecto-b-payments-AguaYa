import { prisma } from "./prisma";

export async function fetchLatestPayments() {
  return prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,

    select: {
      id: true,
      amount: true,
      buyerId: true,
    },
  });
}
