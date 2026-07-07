import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BASE_PATH } from "@/lib/config";

const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const CANONICAL_BASE_URL = "https://viajaconeuforia.com/tienda";

export const authOptions: NextAuthOptions = {
  providers: hasGoogleCreds
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
      ]
    : [],
  session: { strategy: "jwt" },
  pages: {
    signIn: `${BASE_PATH}/login`,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async redirect({ url }) {
      // Fuerza siempre el dominio principal para evitar saltos a vercel.app
      // en flujos OAuth detrás de proxy.
      if (url.startsWith("/")) {
        return `${CANONICAL_BASE_URL}${url}`;
      }
      try {
        const parsed = new URL(url);
        if (parsed.hostname === "viajaconeuforia.com") {
          return url;
        }
      } catch {
        // noop
      }
      return CANONICAL_BASE_URL;
    },
  },
};
