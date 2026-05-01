# BeautySale

E-commerce de belleza, cuidado personal y accesorios.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind v4**
- **Supabase** (Postgres + Auth + Storage)
- **PayPal** (`@paypal/react-paypal-js`)
- **Zustand** (carrito guest con localStorage)
- **Zod** + **react-hook-form**

## Línea gráfica — Bold & Colorful

| Color | Hex | Uso |
|---|---|---|
| Hot Pink | `#FF4D8B` | CTAs, acentos |
| Lavanda | `#B5A3E8` | Fondos, hovers |
| Butter Yellow | `#FFE066` | Badges, highlights |
| Mint | `#7DD3C0` | Categoría natural, success |
| Cream | `#FFF8F0` | Fondo base |
| Plum | `#2D1B4E` | Texto |

Tipografía: **Bricolage Grotesque** (display) + **DM Sans** (body).

## Setup

```bash
pnpm install
cp .env.example .env.local
# Completar .env.local con keys de Supabase + PayPal
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura admin

| Recurso | Quién gestiona |
|---|---|
| Productos, categorías, banners, news, ofertas | Admin (Supabase Auth) |
| Toggle plataforma activa/inactiva | Super admin (endpoint Postman con token) |
