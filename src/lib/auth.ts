import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth config — Personal blog admin auth.
 * Admin credentials stored in env vars (no database table needed).
 * Only 1 admin = you!
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        const isValidPassword = credentials.password === process.env.ADMIN_PASSWORD;

        if (isValidEmail && isValidPassword) {
          return {
            id: "1",
            email: credentials.email,
            name: "Zahid Hasan Tonmoy",
          };
        }
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
