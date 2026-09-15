import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Return next for valid requests
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If it's the login page, always allow access
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // For all other /admin routes, require a token (logged in)
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  // Match all /admin routes
  matcher: ["/admin/:path*"],
};
