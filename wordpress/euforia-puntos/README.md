# Euforia Puntos — Plugin WordPress

Programa de fidelidad para Euforia Viajes integrado con WooCommerce.

## Instalación

1. Copiá la carpeta `euforia-puntos` a `wp-content/plugins/`
2. Activá el plugin en **Plugins → Euforia Puntos**
3. Requiere **WooCommerce** activo

## Configuración

**WooCommerce → Euforia Puntos → Configuración**

- Pesos argentinos por 1 punto (ej. `1000` = 1 punto cada $1000 ARS)
- Dólares por 1 punto (ej. `1` = 1 punto por USD 1)
- Estados de pedido que acreditan puntos (por defecto: `completed`)
- Meta keys del DNI en pedidos WooCommerce

## Premios

**Euforia Puntos → Premios**

Tipos disponibles:

| Tipo | Comportamiento |
|------|----------------|
| Descuento % | Genera cupón WooCommerce de un solo uso |
| Descuento monto fijo | Cupón ARS o USD |
| Merchandising | Registra solicitud pendiente; **subí una imagen** que se muestra en la tarjeta de canje |

Cada premio tiene costo en puntos, imagen o ícono según el tipo, y puede activarse/desactivarse.

## DNI del pasajero

Los puntos se vinculan por **DNI normalizado** (solo dígitos).

El plugin usa el campo **`billing_wooccm11`** del checkout (WooCommerce Checkout Manager). También busca en los meta keys configurados en ajustes.

Al completarse un pedido elegible, se acreditan puntos automáticamente.

## Página pública

Creá una página en WordPress con:

```
[euforia_mis_puntos]
```

El usuario ingresa su DNI, ve saldo, premios disponibles e historial. Puede canjear desde ahí.

## API REST (para PWA /tienda)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/wp-json/euforia-puntos/v1/balance?dni=` | Saldo |
| GET | `/wp-json/euforia-puntos/v1/rewards` | Premios activos |
| GET | `/wp-json/euforia-puntos/v1/history?dni=` | Historial |
| POST | `/wp-json/euforia-puntos/v1/redeem` | Canje (`dni`, `reward_id`) |

POST requiere usuario logueado o header `X-WP-Nonce`.

## Ajuste manual

**Euforia Puntos → Ajuste manual** — sumar o restar puntos a un DNI con nota.

## Estructura

```
euforia-puntos/
├── euforia-puntos.php
├── includes/
│   ├── class-activator.php
│   ├── class-database.php
│   ├── class-dni.php
│   ├── class-settings.php
│   ├── class-rewards.php
│   ├── class-points-engine.php
│   ├── class-woocommerce.php
│   ├── class-rest-api.php
│   ├── class-admin.php
│   └── class-frontend.php
├── templates/
├── assets/
└── README.md
```

## Próximo paso sugerido

Integrar en la PWA `/tienda` una sección **Mis puntos** que consuma la REST API con el DNI del usuario logueado en WooCommerce.
