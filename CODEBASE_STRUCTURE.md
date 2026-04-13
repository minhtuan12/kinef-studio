# Kinef Codebase Structure

## High-level scope

This repository contains:

- Public storefront + 3-step custom builder + confirmation/payment screen
- Storefront data loading and order submission through existing APIs
- Separate admin workspace for catalog/order operations

## Stack

- Next.js 16 (App Router, TypeScript)
- React 19
- MUI Material
- Tailwind CSS v4
- MongoDB + Mongoose
- Cloudinary uploads
- SePay payment option generation

## Route architecture

### Public storefront (`src/app/(storefront)`)

- `layout.tsx` shared storefront shell + provider/theme
- `page.tsx` home
- `our-story/page.tsx`
- `cart/page.tsx` saved cart builds with resume-to-step-3 flow
- `custom-case/page.tsx`
- `custom-case/charms/page.tsx`
- `custom-case/order/page.tsx`
- `confirmation/[orderCode]/page.tsx`
- `contact/page.tsx`
- `shipping/page.tsx`
- `returns/page.tsx`

Shared storefront internals:

- `_context/storefront-context.tsx` catalog + builder state across routes
- `_context/storefront-context.tsx` now also persists cart items in `localStorage`
- `_components/site-chrome.tsx` announcement/header/footer
- `_components/stepper.tsx` step progress UI
- `_components/storefront-theme-provider.tsx` MUI theme setup
- `site-url.ts` `NEXT_PUBLIC_SITE_URL` fallback helper for metadata/sitemap/robots

### Global app files (`src/app`)

- `layout.tsx` root metadata + font variables
- `globals.css` global tokens and base styles
- `robots.ts` metadata route for robots
- `sitemap.ts` metadata route for sitemap

### Admin routes (`src/app/admin`)

Admin remains isolated:

- `layout.tsx`
- `page.tsx`
- `cases/page.tsx`
- `charms/page.tsx`
- `orders/page.tsx`

## APIs and models

### APIs (`src/app/api`)

- Public catalog/order/upload endpoints
- Admin CRUD/export endpoints

### Models (`src/models`)

- `CaseProduct.ts`
- `Charm.ts`
- `Order.ts`

## Guardrails

- Do not modify `src/app/admin/*` for storefront tasks.
- Do not modify `src/app/api/*` or `src/models/*` for purely UI/SEO changes.
- Keep order payload contract unchanged (`customer.phoneModel` required).

## SEO conventions

- Root `metadataBase` from `NEXT_PUBLIC_SITE_URL` fallback
- Route metadata on public pages/layouts
- Metadata route files (`robots.ts`, `sitemap.ts`) aligned to public pages
