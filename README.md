# Kinef Custom Phone Cases

Next.js 16 storefront + order system for custom handmade phone cases, with a separate admin workspace.

## Public storefront (Figma-migrated)

Public pages are route-based under `src/app/(storefront)`:

- `/` home
- `/our-story`
- `/custom-case` (step 1: base case)
- `/custom-case/charms` (step 2: charms)
- `/custom-case/order` (step 3: order info)
- `/confirmation/[orderCode]` (payment options)
- `/contact`, `/shipping`, `/returns` (SEO-safe info pages)

Storefront stack:

- MUI Material components for interactive UI controls
- Tailwind utilities for layout and responsive structure
- Shared storefront flow state via route-group provider

## Admin workspace

Admin routes and components are isolated and unchanged:

- `/admin`
- `/admin/cases`
- `/admin/charms`
- `/admin/orders`

## APIs and models

Existing APIs/models are unchanged:

- `src/app/api/*`
- `src/models/*`

Main public APIs:

- `GET /api/cases`
- `GET /api/charms`
- `POST /api/orders`
- `GET /api/orders/[orderCode]/payment-options`
- `POST /api/upload`

## SEO

- Root metadata with `metadataBase` from `NEXT_PUBLIC_SITE_URL` fallback logic
- Route-level metadata for key public pages
- `src/app/robots.ts`
- `src/app/sitemap.ts`

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill MongoDB, Cloudinary, `ADMIN_API_KEY`, and SePay credentials
3. Install dependencies
4. Run:

- `npm run dev`
- `npm run lint`
- `npm run build`

## Important constraints

- Do not edit `src/app/admin/*` unless explicitly requested.
- Do not edit `src/app/api/*` or `src/models/*` for storefront-only UI work unless explicitly requested.
- Keep backend contracts stable for order + payment flows.

## Notes

Detailed architecture notes live in `CODEBASE_STRUCTURE.md`.

