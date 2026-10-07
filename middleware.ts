import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that require a logged-in session. Add future profile sub-pages here.
const PROTECTED_PATHS = ["/dashboard"];

// If already logged in, these pages redirect away (no reason to see a login form twice).
const AUTH_ONLY_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("access_token")?.value);

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};