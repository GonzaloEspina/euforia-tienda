# Euforia Tienda PWA

Catálogo de salidas en React/Next.js para [viajaconeuforia.com/tienda](https://viajaconeuforia.com/tienda).

## Características

- Catálogo conectado a WooCommerce Store API
- Filtros por categoría, etiquetas y búsqueda de texto
- Precios en ARS, USD o ambos
- Carrito vía Store API → checkout en WooCommerce
- **Cotizaciones** con wizard multi-paso → Whapify (WhatsApp + CRM)
- PWA instalable con aviso de actualización de catálogo

## Desarrollo

Este proyecto usa **pnpm** (no npm ni yarn).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abrí [http://localhost:3000/tienda](http://localhost:3000/tienda)

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_WOO_URL` | URL de WordPress/WooCommerce |
| `WOO_CONSUMER_KEY` | (Opcional) Para meta USD, destacado |
| `WOO_CONSUMER_SECRET` | (Opcional) Par de claves REST API |
| `WHAPIFY_ACCESS_TOKEN` | Token API Whapify (`X-ACCESS-TOKEN`) |
| `WHAPIFY_PIPELINE_ID` | (Opcional) Pipeline para crear oportunidad con detalle en Descripción |
| `WHAPIFY_CONTACT_LOCALE` | (Opcional) Idioma del contacto en Whapify. Default: `es_ES` |

### Whapify — campos personalizados recomendados

Creá estos campos en Whapify para que el agente vea la info en el perfil del contacto:

- `cotizacion_salida`
- `cotizacion_detalle` (texto completo para el asesor)
- `cotizacion_pasajeros`
- `cotizacion_fecha_solicitud`

Cada cotización etiqueta al contacto con **Cotización desde Web** y el **nombre de la salida**. El detalle completo queda en la **Descripción** de la oportunidad del pipeline (sin mensaje automático por WhatsApp al cliente).

## Despliegue en /tienda

1. Build: `pnpm build`
2. Servir con `pnpm start` o desplegar en Vercel/Node
3. Configurar reverse proxy en el hosting para que `/tienda` apunte a esta app
4. Mismo dominio `viajaconeuforia.com` para compartir cookies de carrito/checkout

## Estructura

- `src/lib/woocommerce.ts` — fetch catálogo y proxy carrito
- `src/lib/whapify.ts` — envío de cotizaciones a Whapify
- `src/app/api/catalog` — API interna del catálogo
- `src/app/api/cotizacion` — recibe el formulario y crea contacto en Whapify
- `src/app/carrito` — carrito + redirect a checkout WooCommerce
- `src/app/cotizar/[slug]` — wizard de cotización
