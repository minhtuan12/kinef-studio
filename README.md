# Kinef Custom Phone Cases

Next.js storefront and order system for custom phone cases, now paired with a routed admin workspace inspired by the Flux Dashboard layout style.

## Current feature set

- Public storefront and custom builder
- MongoDB persistence for catalog items and orders
- SePay payment option generation (50 percent deposit or 100 percent full payment)
- Cloudinary uploads for reference images, case media, and charm media
- Flux-style admin workspace with:
  - `/admin` overview dashboard
  - `/admin/cases` case management
  - `/admin/charms` charm management
  - `/admin/orders` order management and Excel export

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill MongoDB, Cloudinary, `ADMIN_API_KEY`, and SePay credentials
3. Install dependencies
4. Start the dev server

## Scripts

- `npm run dev` - start local development
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - lint checks

## Main routes

- `/` - storefront, case builder, order creation, payment options
- `/admin` - operations dashboard overview
- `/admin/cases` - case management workspace
- `/admin/charms` - charm management workspace
- `/admin/orders` - order management workspace

## Main APIs

- `GET /api/cases` - storefront case catalog
- `GET /api/charms` - storefront charm catalog
- `POST /api/orders` - create order
- `GET /api/orders/[orderCode]/payment-options` - SePay payment options
- `POST /api/upload` - Cloudinary upload
- `GET|POST /api/admin/cases`
- `PUT|DELETE /api/admin/cases/[id]`
- `GET|POST /api/admin/charms`
- `PUT|DELETE /api/admin/charms/[id]`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/[id]`
- `GET /api/admin/orders/export`

## Admin remake notes

- The old single-file tabbed admin page was replaced with a nested App Router admin layout.
- Shared client-side admin state now lives in `src/components/admin/admin-context.tsx`.
- The UI keeps the existing CRUD, order status updates, payment edits, local key storage, uploads, and export flow.
- The visual direction follows the Flux Dashboard pattern: persistent sidebar, command-style header, KPI strip, dense tables, and sticky inspectors.

## Verification

- `npx tsc --noEmit`
- `npm.cmd run lint` (warnings only for raw `img` usage)
- `npm.cmd run build` completed successfully when rerun outside the sandbox because the sandbox build hit a Windows `spawn EPERM` restriction

## Notes

Full structure and architecture notes are in `CODEBASE_STRUCTURE.md`.
