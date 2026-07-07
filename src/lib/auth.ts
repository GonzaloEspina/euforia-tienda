import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BASE_PATH } from "@/lib/config";

const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const CANONICAL_BASE_URL = "https://viajaconeuforia.com/tienda";
const CANONICAL_ORIGIN = "https://viajaconeuforia.com";

function toCanonicalTiendaUrl(rawUrl: string): string {
  try {
    if (rawUrl.startsWith("/")) {
      const path = rawUrl.startsWith("/tienda") ? rawUrl : `/tienda${rawUrl}`;
      return `${CANONICAL_ORIGIN}${path}`;
    }

    const parsed = new URL(rawUrl);
    const path = parsed.pathname.startsWith("/tienda")
      ? parsed.pathname
      : `/tienda${parsed.pathname}`;

    return `${CANONICAL_ORIGIN}${path}${parsed.search}${parsed.hash}`;
  } catch {
    return CANONICAL_BASE_URL;
  }
}

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
      // Normaliza SIEMPRE host + basePath para evitar saltos a vercel.app
      // o callbacks sin /tienda durante OAuth.
      return toCanonicalTiendaUrl(url);
    },
  },
};
