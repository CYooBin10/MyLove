import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";

const SESSION_COOKIE = "mylove_session";

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname === "/setup" || pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (["/home", "/profile", "/memories", "/notes", "/ting-ting", "/calendar", "/gallery", "/settings"].some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
