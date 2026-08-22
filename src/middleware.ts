import { NextRequest, NextResponse } from "next/server";

// Lightweight edge-safe guard: redirects requests that have no session cookie
// at all away from protected sections. Full authentication + role checks
// (admin vs customer, disabled accounts, etc.) are always re-verified
// server-side in the corresponding layout/page server components using the
// database — this middleware is only a fast first line of defense and must
// never be the sole authorization mechanism.
const SESSION_COOKIE = "xperaone_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
