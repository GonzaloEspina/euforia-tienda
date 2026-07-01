export type PriceCurrencyMode = "ars" | "usd" | "both";

export interface MedioItem {
  url: string;
  tipo: "imagen" | "video";
  alt?: string;
  principal?: boolean;
}

export interface Salida {
  id: number;
  slug: string;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  categoria?: string;
  subcategorias: string[];
  etiquetas: string[];
  destacado: boolean;
  enPromocion: boolean;
  cupos?: number;
  destino?: string;
  pais?: string;
  origen?: string;
  transporte: string[];
  servicio: string[];
  noches?: string;
  precioListaArs?: number;
  promoEfectivoArs?: number;
  precioListaUsd?: number;
  promoEfectivoUsd?: number;
  maxCuotas?: number;
  porcentajeSena?: number;
  itinerarioUrl?: string;
  estado?: string;
  medios: MedioItem[];
  imagenes: string[];
  videos: string[];
  permalink: string;
  isPurchasable: boolean;
  isInStock: boolean;
  stockText?: string;
  searchText: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
}

export interface CatalogData {
  salidas: Salida[];
  categories: WooCategory[];
  tags: { id: number; name: string; slug: string }[];
  version: string;
  fetchedAt: string;
}

export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  permalink: string;
  images: { src: string; alt?: string }[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
  };
  totals: {
    line_subtotal: string;
    line_total: string;
  };
}

export interface CartData {
  items: CartItem[];
  itemsCount: number;
  totals: {
    total_items: string;
    total_price: string;
    currency_code: string;
    currency_symbol: string;
  };
}
