import { NextResponse } from "next/server";

export function appendWooCartHeaders(
  wooResponse: Response,
  nextRes: NextResponse
): void {
  const setCookies = wooResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    nextRes.headers.append("Set-Cookie", cookie);
  }

  const cartToken = wooResponse.headers.get("Cart-Token");
  if (cartToken) {
    nextRes.headers.set("Cart-Token", cartToken);
  }

  const nonce = wooResponse.headers.get("Nonce");
  if (nonce) {
    nextRes.headers.set("Nonce", nonce);
  }

  if (cartToken || nonce) {
    nextRes.headers.set(
      "Access-Control-Expose-Headers",
      "Cart-Token, Nonce"
    );
  }
}

export function buildCartProxyHeaders(
  cookieHeader: string,
  request?: Request
): Headers {
  const headers = new Headers();
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const cartToken = request?.headers.get("Cart-Token");
  if (cartToken) headers.set("Cart-Token", cartToken);

  const nonce = request?.headers.get("Nonce");
  if (nonce) headers.set("Nonce", nonce);

  return headers;
}
