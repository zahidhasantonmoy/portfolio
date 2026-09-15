export { default } from "next-auth/middleware";

/**
 * NextAuth middleware — protects all /admin routes automatically.
 * Unauthenticated users → redirected to /admin/login
 * Login page is excluded from matching (NextAuth handles it).
 */
export const config = {
  matcher: ["/admin/((?!login).*)"],
};
