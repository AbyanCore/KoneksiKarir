import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("koneksi_karir_token")?.value;
  const { pathname } = request.nextUrl;

  console.log("🔒 [Middleware] Request to:", pathname);
  console.log("🍪 [Middleware] Token exists:", !!token);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/health",
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow access to public routes
  if (isPublicRoute) {
    console.log("✅ [Middleware] Public route, allowing access");
    return NextResponse.next();
  }

  // Protected routes: /s/* (all authenticated pages)
  if (pathname.startsWith("/s/")) {
    console.log("🔐 [Middleware] Protected route detected");

    if (!token) {
      console.log("❌ [Middleware] No token, redirecting to signin");
      // Redirect to signin if not authenticated
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Verify token using Edge-compatible function (async)
    console.log("🔍 [Middleware] Verifying token...");
    const user = await verifyTokenEdge(token);

    if (!user) {
      console.log("❌ [Middleware] Token invalid, redirecting to signin");
      // Token invalid or expired - redirect to signin
      // Note: Don't delete cookie here (stateless middleware)
      // Cookie will be cleaned up by client-side on next action
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    console.log(
      "✅ [Middleware] Token valid, user:",
      user.email,
      "role:",
      user.role
    );

    // Role-based access control
    if (pathname.startsWith("/s/admin") && user.role !== "ADMIN") {
      console.log(
        "⚠️ [Middleware] Non-admin accessing admin route, redirecting"
      );
      // Non-admin trying to access admin routes
      return NextResponse.redirect(new URL("/s/hub", request.url));
    }

    console.log("✅ [Middleware] Allowing access to protected route");
    // Allow access (stateless - pass through without modifying)
    return NextResponse.next();
  }

  console.log("✅ [Middleware] Unprotected route, allowing access");
  // Allow all other routes (home, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
