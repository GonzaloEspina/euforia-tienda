export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tienda";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}

export function staticUrl(path: string): string {
  return apiUrl(path);
}
