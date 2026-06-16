import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session-cookie";
import { verifySessionTokenEdge } from "@/lib/auth/verify-session-edge";

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await verifySessionTokenEdge(token, secret);

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
