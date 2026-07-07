/**
 * Cloudflare Worker recomendado para Euforia.
 *
 * IMPORTANTE: configurá UNA ruta en Cloudflare:
 * - viajaconeuforia.com/tienda*  -> este worker
 *
 * La raíz (/) redirige a /tienda para que el catálogo funcione con basePath.
 * Blog, nosotros, mi-cuenta de WordPress quedan fuera del worker. */

const VERCEL_HOST = "euforia-tienda.vercel.app";
const CANONICAL_HOST = "viajaconeuforia.com";
const CANONICAL_AUTH_BASE = `https://${CANONICAL_HOST}/tienda/api/auth`;
const VERCEL_AUTH_BASE = `https://${VERCEL_HOST}/api/auth`;

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const isHome = incoming.pathname === "/" || incoming.pathname === "";

    // La app Next usa basePath /tienda. En la raíz el catálogo puede no hidratar bien.
    if (isHome) {
      const target = new URL(`/tienda${incoming.search}`, incoming.origin);
      return Response.redirect(target.toString(), 302);
    }

    if (!incoming.pathname.startsWith("/tienda")) {
      return fetch(request);
    }
    const upstreamPath = incoming.pathname + incoming.search;
    const target = new URL(upstreamPath, `https://${VERCEL_HOST}`);

    const headers = new Headers(request.headers);
    headers.set("Host", VERCEL_HOST);
    headers.set("X-Forwarded-Host", CANONICAL_HOST);
    headers.set("X-Forwarded-Proto", "https");
    headers.set("X-Forwarded-Port", "443");

    const originResponse = await fetch(target.toString(), {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      redirect: "manual",
    });

    const location = originResponse.headers.get("location");
    if (location) {
      const fixedLocation = location
        .replaceAll(VERCEL_AUTH_BASE, CANONICAL_AUTH_BASE)
        .replaceAll(
          `https://${VERCEL_HOST}/tienda/api/auth`,
          CANONICAL_AUTH_BASE
        )
        .replaceAll(
          `https://${VERCEL_HOST}/tienda`,
          `https://${CANONICAL_HOST}/tienda`
        )
        .replaceAll(`https://${VERCEL_HOST}`, `https://${CANONICAL_HOST}`);

      if (fixedLocation !== location) {
        const h = new Headers(originResponse.headers);
        h.set("location", fixedLocation);
        return new Response(originResponse.body, {
          status: originResponse.status,
          statusText: originResponse.statusText,
          headers: h,
        });
      }
    }

    if (incoming.pathname === "/tienda/api/auth/providers") {
      const ct = originResponse.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const text = await originResponse.text();
        const fixed = text
          .replaceAll(VERCEL_AUTH_BASE, CANONICAL_AUTH_BASE)
          .replaceAll(
            `https://${VERCEL_HOST}/tienda/api/auth`,
            CANONICAL_AUTH_BASE
          )
          .replaceAll(
            `https://${VERCEL_HOST}/tienda`,
            `https://${CANONICAL_HOST}/tienda`
          )
          .replaceAll(`https://${VERCEL_HOST}`, `https://${CANONICAL_HOST}`);

        const h = new Headers(originResponse.headers);
        h.delete("content-length");
        return new Response(fixed, {
          status: originResponse.status,
          statusText: originResponse.statusText,
          headers: h,
        });
      }
    }

    return originResponse;
  },
};
