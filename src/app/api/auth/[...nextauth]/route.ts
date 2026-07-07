import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// En producción forzamos URL canónica para evitar que Vercel/Proxy
// derive callbacks al dominio *.vercel.app sin basePath.
if (process.env.VERCEL_ENV === "production") {
  const canonicalAuthUrl = "https://viajaconeuforia.com/tienda/api/auth";
  process.env.NEXTAUTH_URL = canonicalAuthUrl;
  process.env.NEXTAUTH_URL_INTERNAL = canonicalAuthUrl;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
