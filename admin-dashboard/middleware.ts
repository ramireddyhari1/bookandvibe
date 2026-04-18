import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES = new Set(["ADMIN", "PARTNER"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_dash_token")?.value;
  const role = String(request.cookies.get("admin_dash_role")?.value || "").toUpperCase();
  const isSession = request.cookies.get("admin_dash_session")?.value === "1";
  const isAuthenticated = Boolean(token && ALLOWED_ROLES.has(role) && isSession);
  const isLoginPage = pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", pathname);
    return NextResponse.redirect(target);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
