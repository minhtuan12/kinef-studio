# Kinef Codebase Notes

## Project scope

This project includes:

- Public storefront and custom builder
- Order creation and persistence
- SePay payment options (50 percent deposit or full 100 percent payment)
- Flux-inspired admin workspace for cases, charms, and orders
- Excel export for order management

## Stack

- Next.js 16 (App Router, TypeScript)
- MongoDB plus Mongoose
- Cloudinary image upload
- SePay API v2 for payment option generation
- Zod validation
- XLSX for Excel export
- Lucide React icons

## Key app routes

- `/` storefront plus builder plus payment flow
- `/admin` admin operations dashboard
- `/admin/cases` case management page
- `/admin/charms` charm management page
- `/admin/orders` order management page

## Admin workspace architecture

The admin UI is no longer a single page with tabs. It now uses a nested route layout:

- `src/app/admin/layout.tsx` wraps all admin pages in the shared shell
- `src/app/admin/page.tsx` renders the overview dashboard
- `src/app/admin/cases/page.tsx` renders case management
- `src/app/admin/charms/page.tsx` renders charm management
- `src/app/admin/orders/page.tsx` renders order management

Shared admin client code lives in `src/components/admin/`:

- `admin-context.tsx` stores the admin key in local storage and exposes authenticated request helpers
- `admin-shell.tsx` renders the sidebar, topbar, feedback banner, and shared UI primitives
- `admin-overview-page.tsx` derives dashboard metrics from the live admin APIs
- `cases-management-page.tsx` keeps create, update, delete, upload, and filtering behavior for cases
- `charms-management-page.tsx` keeps create, update, delete, upload, and filtering behavior for charms
- `orders-management-page.tsx` keeps order status updates, payment edits, and export behavior
- `admin.module.css` defines the Flux-style visual system for the admin workspace

## Data models

### `CaseProduct`

- `name`, `description`
- `price`, `discountPercent`
- `imageUrl`, `colorHex`
- `isActive`

### `Charm`

- `name`, `icon`
- `price`, `discountPercent`, `stock`
- `imageUrl`
- `isActive`

### `Order`

- `orderCode`
- `caseItem` snapshot (base price, discount, final)
- `charms` snapshots
- `caseTotal`, `charmTotal`, `total`
- `customer`, `notes`, `referenceImageUrl`
- `payment` state plus SePay option cache
- `status`

## Public APIs

- `GET /api/cases`
- `GET /api/charms`
- `POST /api/orders`
- `GET /api/orders/[orderCode]/payment-options`
- `POST /api/upload`

## Admin APIs

Admin APIs require `x-admin-key` to match `ADMIN_API_KEY`.

- `GET|POST /api/admin/cases`
- `PUT|DELETE /api/admin/cases/[id]`
- `GET|POST /api/admin/charms`
- `PUT|DELETE /api/admin/charms/[id]`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/[id]`
- `GET /api/admin/orders/export`

## Payment behavior

- Payment content is the order code.
- Two options are generated:
  - 50 percent deposit (`ceil(total * 0.5)`)
  - 100 percent full payment (`total`)
- SePay orders are cached in the order document to avoid duplicates.

## Environment variables

Required:

- `MONGODB_URI`
- `ADMIN_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SEPAY_API_TOKEN`
- `SEPAY_BANK_ACCOUNT_UUID`

Optional:

- `SEPAY_API_BASE_URL` (default: `https://userapi.sepay.vn/v2`)
- `SEPAY_SUCCESS_REDIRECT_URL`
- `SEPAY_CANCEL_REDIRECT_URL`
- `SEPAY_PAYMENT_METHODS` (comma-separated, default `bank_transfer`)

## Core files

```text
src/
  app/
    admin/
      layout.tsx
      page.tsx
      cases/page.tsx
      charms/page.tsx
      orders/page.tsx
    api/
      admin/
      cases/route.ts
      charms/route.ts
      orders/route.ts
      orders/[orderCode]/payment-options/route.ts
      upload/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    admin/
      admin-context.tsx
      admin-shell.tsx
      admin-overview-page.tsx
      cases-management-page.tsx
      charms-management-page.tsx
      orders-management-page.tsx
      admin-types.ts
      admin-utils.ts
      admin.module.css
  lib/
    admin-auth.ts
    catalog.ts
    cloudinary.ts
    constants.ts
    db.ts
    sepay.ts
    validators.ts
  models/
    CaseProduct.ts
    Charm.ts
    Order.ts
```
