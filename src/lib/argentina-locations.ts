/** Códigos de provincia compatibles con WooCommerce Argentina (AR). */
export type ArProvince = {
  code: string;
  name: string;
  cities: string[];
};

export const AR_PROVINCES: ArProvince[] = [
  {
    code: "C",
    name: "Ciudad Autónoma de Buenos Aires",
    cities: ["Ciudad Autónoma de Buenos Aires"],
  },
  {
    code: "B",
    name: "Buenos Aires",
    cities: [
      "La Plata",
      "Mar del Plata",
      "Bahía Blanca",
      "Tandil",
      "Olavarría",
      "Necochea",
      "Pergamino",
      "Junín",
      "Azul",
      "Tres Arroyos",
    ],
  },
  { code: "K", name: "Catamarca", cities: ["San Fernando del Valle de Catamarca", "Andalgalá", "Belén"] },
  { code: "H", name: "Chaco", cities: ["Resistencia", "Presidencia Roque Sáenz Peña", "Charata"] },
  {
    code: "U",
    name: "Chubut",
    cities: [
      "Rawson",
      "Comodoro Rivadavia",
      "Trelew",
      "Puerto Madryn",
      "Esquel",
      "Sarmiento",
      "Gaiman",
      "Dolavon",
      "Trevelin",
      "El Maitén",
    ],
  },
  {
    code: "X",
    name: "Córdoba",
    cities: ["Córdoba", "Villa María", "Río Cuarto", "San Francisco", "Villa Carlos Paz", "Alta Gracia"],
  },
  { code: "W", name: "Corrientes", cities: ["Corrientes", "Goya", "Paso de los Libres", "Curuzú Cuatiá"] },
  {
    code: "E",
    name: "Entre Ríos",
    cities: ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Colón"],
  },
  { code: "P", name: "Formosa", cities: ["Formosa", "Clorinda", "Pirané"] },
  { code: "Y", name: "Jujuy", cities: ["San Salvador de Jujuy", "Palpalá", "Libertador General San Martín"] },
  { code: "L", name: "La Pampa", cities: ["Santa Rosa", "General Pico", "Toay"] },
  { code: "F", name: "La Rioja", cities: ["La Rioja", "Chilecito", "Aimogasta"] },
  {
    code: "M",
    name: "Mendoza",
    cities: ["Mendoza", "San Rafael", "Godoy Cruz", "Luján de Cuyo", "Malargüe", "Tunuyán"],
  },
  { code: "N", name: "Misiones", cities: ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú"] },
  { code: "Q", name: "Neuquén", cities: ["Neuquén", "San Martín de los Andes", "Villa La Angostura", "Cutral Có"] },
  {
    code: "R",
    name: "Río Negro",
    cities: ["Viedma", "San Carlos de Bariloche", "General Roca", "Cipolletti", "El Bolsón", "Allen"],
  },
  { code: "A", name: "Salta", cities: ["Salta", "Cafayate", "Tartagal", "Orán"] },
  { code: "J", name: "San Juan", cities: ["San Juan", "Rawson", "Chimbas", "Pocito"] },
  { code: "D", name: "San Luis", cities: ["San Luis", "Villa Mercedes", "Merlo"] },
  { code: "Z", name: "Santa Cruz", cities: ["Río Gallegos", "Caleta Olivia", "El Calafate", "Pico Truncado"] },
  {
    code: "S",
    name: "Santa Fe",
    cities: ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "Santo Tomé"],
  },
  { code: "G", name: "Santiago del Estero", cities: ["Santiago del Estero", "La Banda", "Termas de Río Hondo"] },
  { code: "V", name: "Tierra del Fuego", cities: ["Ushuaia", "Río Grande", "Tolhuin"] },
  { code: "T", name: "Tucumán", cities: ["San Miguel de Tucumán", "Yerba Buena", "Tafí del Valle", "Concepción"] },
];

const provinceByCode = new Map(AR_PROVINCES.map((p) => [p.code, p]));
const provinceByName = new Map(
  AR_PROVINCES.flatMap((p) => [
    [normalizeKey(p.name), p],
    [normalizeKey(p.code), p],
  ])
);

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveProvinceCode(raw?: string | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (provinceByCode.has(trimmed.toUpperCase())) return trimmed.toUpperCase();
  return provinceByName.get(normalizeKey(trimmed))?.code ?? "";
}

export function getProvinceByCode(code: string): ArProvince | undefined {
  return provinceByCode.get(code);
}

export function getCitiesForProvince(code: string, currentCity?: string): string[] {
  const province = getProvinceByCode(code);
  if (!province) return currentCity ? [currentCity] : [];
  const cities = [...province.cities];
  if (currentCity && !cities.some((c) => normalizeKey(c) === normalizeKey(currentCity))) {
    cities.unshift(currentCity);
  }
  return cities;
}

export function splitDisplayName(name?: string | null): { first: string; last: string } {
  if (!name?.trim()) return { first: "", last: "" };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export type ProfileFields = {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  state: string;
};

export function profileFromSession(session: {
  name?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
}): ProfileFields {
  const billing = session.billing ?? {};
  const fromName = splitDisplayName(session.name);

  return {
    first_name: billing.first_name?.trim() || fromName.first,
    last_name: billing.last_name?.trim() || fromName.last,
    phone: billing.phone?.trim() ?? "",
    city: billing.city?.trim() ?? "",
    state: resolveProvinceCode(billing.state),
  };
}
