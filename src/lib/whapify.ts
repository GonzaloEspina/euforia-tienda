import type { CotizacionRequest } from "@/types/cotizacion";
import {
  formatCotizacionForAgent,
  getCotizacionWebTag,
  getSalidaTagName,
} from "@/lib/cotizacion-format";

const WHAPIFY_BASE = "https://ap.whapify.ai/api";

type WhapifyAction =
  | { action: "add_tag"; tag_name: string }
  | { action: "set_field_value"; field_name: string; value: string };

interface CreateContactBody {
  phone: string;
  email?: string;
  first_name: string;
  last_name?: string;
  actions?: WhapifyAction[];
}

interface WhapifyTag {
  id: string | number;
  name: string;
}

interface WhapifyContact {
  id: string | number;
  phone?: string;
  tags?: WhapifyTag[];
  custom_fields?: Record<string, string> | unknown[];
}

interface CreateContactResponse {
  success?: boolean;
  contact_created?: boolean;
  id?: string | number;
  contact_id?: string | number;
  data?: WhapifyContact | { id?: string | number };
}

function getToken(): string {
  const token = process.env.WHAPIFY_ACCESS_TOKEN;
  if (!token) {
    throw new Error("WHAPIFY_ACCESS_TOKEN no configurado");
  }
  return token;
}

async function whapifyFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${WHAPIFY_BASE}${path}`, {
    ...init,
    headers: {
      "X-ACCESS-TOKEN": getToken(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: string }).message)
        : typeof body === "object" &&
            body &&
            "error" in body &&
            typeof (body as { error?: { message?: string } }).error?.message ===
              "string"
          ? String((body as { error: { message: string } }).error.message)
          : text || response.statusText;
    throw new Error(`Whapify ${path} (${response.status}): ${detail}`);
  }

  if (
    typeof body === "object" &&
    body &&
    "error" in body &&
    (body as { error?: { code?: number } }).error?.code
  ) {
    const message =
      (body as { error?: { message?: string } }).error?.message ??
      "Error de Whapify";
    throw new Error(`Whapify ${path}: ${message}`);
  }

  return body as T;
}

export function normalizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("54")) {
    const rest = digits.slice(2);
    const mobile =
      rest.startsWith("9") || rest.length >= 10 ? rest : `9${rest}`;
    return `+54${mobile}`;
  }

  if (digits.startsWith("0")) {
    return normalizeWhatsAppPhone(digits.slice(1));
  }

  if (digits.length === 10) {
    return `+549${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("15")) {
    return `+549${digits.slice(2)}`;
  }

  return `+${digits}`;
}

function extractContactId(response: CreateContactResponse): string | null {
  const candidates: unknown[] = [
    response.id,
    response.contact_id,
    response.data && "id" in response.data ? response.data.id : undefined,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

async function findContactByPhone(phone: string): Promise<string | null> {
  const encodedPhone = encodeURIComponent(phone);
  const result = await whapifyFetch<{ data?: WhapifyContact[] }>(
    `/contacts/find_by_custom_field?field_id=phone&value=${encodedPhone}`
  );

  const contact = result.data?.[0];
  if (!contact?.id) return null;

  return String(contact.id);
}

async function getOrCreateTagId(tagName: string): Promise<string> {
  const encodedName = encodeURIComponent(tagName);

  try {
    const existing = await whapifyFetch<WhapifyTag>(
      `/accounts/tags/name/${encodedName}`
    );
    if (existing?.id != null) return String(existing.id);
  } catch {
    // La etiqueta no existe; se crea abajo.
  }

  const created = await whapifyFetch<{ id: string | number }>("/accounts/tags", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: tagName }).toString(),
  });

  if (created?.id == null) {
    throw new Error(`No se pudo crear la etiqueta "${tagName}"`);
  }

  return String(created.id);
}

async function applyTags(contactId: string, tagNames: string[]): Promise<void> {
  const uniqueNames = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];

  for (const tagName of uniqueNames) {
    const tagId = await getOrCreateTagId(tagName);
    await whapifyFetch(`/contacts/${contactId}/tags/${tagId}`, {
      method: "POST",
    });
  }
}

const DEFAULT_CONTACT_LOCALE =
  process.env.WHAPIFY_CONTACT_LOCALE?.trim() || "es_ES";

function buildContactActions(data: CotizacionRequest): WhapifyAction[] {
  const detalle = formatCotizacionForAgent(data);

  return [
    {
      action: "set_field_value",
      field_name: "locale",
      value: DEFAULT_CONTACT_LOCALE,
    },
    {
      action: "set_field_value",
      field_name: "locale2",
      value: DEFAULT_CONTACT_LOCALE.split("_")[0] || "es",
    },
    {
      action: "set_field_value",
      field_name: "cotizacion_salida",
      value: data.salidaTitulo,
    },
    {
      action: "set_field_value",
      field_name: "cotizacion_detalle",
      value: detalle,
    },
    {
      action: "set_field_value",
      field_name: "cotizacion_pasajeros",
      value: String(data.cantidadPasajeros),
    },
    {
      action: "set_field_value",
      field_name: "cotizacion_fecha_solicitud",
      value: String(Math.floor(Date.now() / 1000)),
    },
  ];
}

async function createOrUpdateContact(
  data: CotizacionRequest,
  phone: string
): Promise<string> {
  const body: CreateContactBody = {
    phone,
    email: data.contacto.email || undefined,
    first_name: data.contacto.nombre.trim(),
    last_name: data.contacto.apellido.trim() || undefined,
    actions: buildContactActions(data),
  };

  const response = await whapifyFetch<CreateContactResponse>("/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let contactId = extractContactId(response);
  if (!contactId) {
    contactId = await findContactByPhone(phone);
  }

  if (!contactId) {
    throw new Error(
      `Whapify no devolvió el ID del contacto. Respuesta: ${JSON.stringify(response)}`
    );
  }

  await applyTags(contactId, [
    getCotizacionWebTag(),
    getSalidaTagName(data.salidaTitulo),
  ]);

  await ensureContactLocale(contactId);

  return contactId;
}

async function ensureContactLocale(contactId: string): Promise<void> {
  const locale = DEFAULT_CONTACT_LOCALE;
  const locale2 = locale.split("_")[0] || "es";

  await whapifyFetch(`/contacts/${contactId}/send_content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [],
      actions: [
        { action: "set_field_value", field_name: "locale", value: locale },
        { action: "set_field_value", field_name: "locale2", value: locale2 },
      ],
    }),
  });
}

async function createOpportunity(
  contactId: string,
  data: CotizacionRequest
): Promise<void> {
  const pipelineId = process.env.WHAPIFY_PIPELINE_ID;
  if (!pipelineId) return;

  const detalle = formatCotizacionForAgent(data);

  await whapifyFetch(`/pipelines/${pipelineId}/opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_id: contactId,
      title: `Cotización: ${data.salidaTitulo}`,
      description: detalle,
      status: "open",
      priority: "high",
    }),
  });
}

export async function submitCotizacionToWhapify(
  data: CotizacionRequest
): Promise<{ contactId: string }> {
  const phone = normalizeWhatsAppPhone(data.contacto.whatsapp);
  if (!phone || phone.length < 10) {
    throw new Error("Número de WhatsApp inválido");
  }

  const contactId = await createOrUpdateContact(data, phone);
  await createOpportunity(contactId, data);

  return { contactId };
}
