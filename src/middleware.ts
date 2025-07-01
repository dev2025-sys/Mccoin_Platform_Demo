import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Step 1: Create middlewares
const intlMiddleware = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
]);

const combinedMiddleware = clerkMiddleware(async (auth, req) => {
  // Skip next-intl middleware for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Run next-intl middleware first
  const intlResult = intlMiddleware(req);
  if (intlResult) return intlResult;

  // Then handle Clerk auth
  if (!isPublicRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export default combinedMiddleware;

export const config = {
  matcher: [
    "/((?!_next|_vercel|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
