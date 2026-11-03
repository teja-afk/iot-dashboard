import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/tanks", "/dispensers", "/nozzles", "/stations", "/error-codes"];
const LOGIN_PATH = "/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isRoot = pathname === "/";

  if (isRoot) {
    const session = request.cookies.get("iot_session")?.value;
    if (!session) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isProtected) {
    const session = request.cookies.get("iot_session")?.value;
    if (!session) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH) {
    const session = request.cookies.get("iot_session")?.value;
    if (session) {
      const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};