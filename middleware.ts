import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

// Protects the reviewer app and its API. Public pages are untouched.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/review/login" || pathname === "/api/review/login";
  if (isLogin) return NextResponse.next();

  const reviewer = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (reviewer) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/review/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/review/:path*", "/api/review/:path*"],
};
