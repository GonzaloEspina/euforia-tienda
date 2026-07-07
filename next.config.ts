import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  basePath: "/tienda",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "viajaconeuforia.com", pathname: "/**" },
      { protocol: "https", hostname: "**.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "drive.google.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: "euforia-tienda\\.vercel\\.app",
          },
        ],
        destination: "https://viajaconeuforia.com/:path*",
        permanent: false,
        basePath: false,
      },
      {
        source: "/api/auth/:path*",
        destination: "/tienda/api/auth/:path*",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default withSerwist(nextConfig);
