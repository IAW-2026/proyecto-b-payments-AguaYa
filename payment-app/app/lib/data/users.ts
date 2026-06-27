import { prisma } from "../prisma";
import { ProfileStatus } from "@prisma/client";
import { PAGE_SIZE } from "./payments";

function usersSearchWhere(query?: string) {
  if (!query) return {};
  const profileNumber = parseInt(query, 10);
  return {
    OR: [
      ...(!isNaN(profileNumber) ? [{ profileNumber }] : []),
      { buyerName: { contains: query, mode: "insensitive" as const } },
      { sellerName: { contains: query, mode: "insensitive" as const } },
      { clerkId: { contains: query, mode: "insensitive" as const } },
      { buyerId: { contains: query, mode: "insensitive" as const } },
      { sellerId: { contains: query, mode: "insensitive" as const } },
    ],
  };
}

export async function fetchAllUsers(query?: string, page = 1) {
  return prisma.paymentUser.findMany({
    where: usersSearchWhere(query),
    orderBy: { profileNumber: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
}

export async function countAllUsers(query?: string) {
  return prisma.paymentUser.count({ where: usersSearchWhere(query) });
}

export async function fetchUserStats() {
  const byStatus = await prisma.paymentUser.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    byStatus.map((r) => [r.status, r._count._all]),
  ) as Partial<Record<ProfileStatus, number>>;
  return {
    total: byStatus.reduce((acc, r) => acc + r._count._all, 0),
    active: counts.ACTIVE ?? 0,
    suspended: counts.SUSPENDED ?? 0,
    deleted: counts.DELETED ?? 0,
  };
}
