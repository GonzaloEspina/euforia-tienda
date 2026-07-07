/**

 * Cloudflare Worker recomendado para Euforia.

 *

 * Rutas en Cloudflare (ejemplo):

 * - viajaconeuforia.com/tienda*  -> este worker

 * - viajaconeuforia.com/         -> este worker (home de marketing)

 *

 * Mapeo público:

 * - /              -> home de marketing (Next: /tienda/inicio)

 * - /tienda        -> catálogo / tienda (Next: /tienda)

 * - /tienda/salida/*, /tienda/carrito, etc. -> sin cambios

 *

 * Blog, nosotros, mi-cuenta de WordPress quedan fuera del worker. */



const VERCEL_HOST = "euforia-tienda.vercel.app";

const CANONICAL_HOST = "viajaconeuforia.com";

const CANONICAL_AUTH_BASE = `https://${CANONICAL_HOST}/tienda/api/auth`;

const VERCEL_AUTH_BASE = `https://${VERCEL_HOST}/api/auth`;



function resolveUpstreamPath(pathname, search) {

  if (pathname === "/" || pathname === "") {

    return `/tienda/inicio${search}`;

  }



  if (pathname === "/tienda" || pathname === "/tienda/") {
    // Sin barra final: Vercel responde 308 /tienda/ -> /tienda y genera bucle infinito.
    return `/tienda${search}`;
  }



  if (pathname === "/tienda/inicio" || pathname === "/tienda/inicio/") {

    return { redirect: `https://${CANONICAL_HOST}/${search}`, status: 301 };

  }



  if (pathname.startsWith("/tienda")) {

    return `${pathname}${search}`;

  }



  return null;

}



function fixAuthLocation(location) {

  return location

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

}



async function proxyToVercel(request, upstreamPath) {

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

    const fixedLocation = fixAuthLocation(location);

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



  const incoming = new URL(request.url);

  if (incoming.pathname === "/tienda/api/auth/providers") {

    const ct = originResponse.headers.get("content-type") || "";

    if (ct.includes("application/json")) {

      const text = await originResponse.text();

      const fixed = fixAuthLocation(text);

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

}



export default {

  async fetch(request) {

    const incoming = new URL(request.url);

    const resolved = resolveUpstreamPath(incoming.pathname, incoming.search);



    if (resolved === null) {

      return fetch(request);

    }



    if (typeof resolved === "object" && resolved.redirect) {

      return Response.redirect(resolved.redirect, resolved.status);

    }



    return proxyToVercel(request, resolved);

  },

};

