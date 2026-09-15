import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // We don't want to protect the login page itself
  if (path.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // If not authenticated, redirect to login
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on /admin routes
  matcher: ["/admin/:path*"],
};
