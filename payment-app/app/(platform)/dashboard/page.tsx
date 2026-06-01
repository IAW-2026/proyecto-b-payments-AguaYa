import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import BuyerDashboard from "./buyer-view";
import SellerDashboard from "./seller-view";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = sessionClaims?.public_metadata?.lastRole;
  if (!role) redirect("/select-role");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (role === "buyer") {
    if (!profile?.buyerId) redirect("/select-role");
    return <BuyerDashboard buyerId={profile.buyerId} />;
  }

  if (role === "seller") {
    if (!profile?.sellerId) redirect("/select-role");
    return <SellerDashboard sellerId={profile.sellerId} />;
  }
}
