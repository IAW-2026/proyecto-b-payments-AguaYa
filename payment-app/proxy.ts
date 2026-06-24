import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/payments(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (req.nextUrl.pathname === "/select-role") {
    const { sessionClaims } = await auth();
    const roles = sessionClaims?.public_metadata?.roles as string[] | undefined;
    if (roles?.includes("admin_payment")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
