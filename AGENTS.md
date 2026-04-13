<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js `16.x` App Router. Before changing framework-level behavior, check the relevant guide in `node_modules/next/dist/docs/` and honor deprecations/file conventions.
<!-- END:nextjs-agent-rules -->

# Storefront + Figma Rules

## No-touch Boundaries

- IMPORTANT: Do not modify anything in `src/app/admin/*`.
- IMPORTANT: Do not modify anything in `src/app/api/*` unless explicitly requested.
- IMPORTANT: Do not modify anything in `src/models/*` unless explicitly requested.
- IMPORTANT: Storefront refactors must not break admin pages or admin APIs.

## Figma Implementation Workflow

For Figma-driven tasks, follow this order:

1. `get_design_context` for the exact node(s) being implemented.
2. `get_screenshot` for visual parity validation.
3. Convert generated React+Tailwind output into this codebase conventions.
4. Validate final UI against Figma screenshot before completion.

If `get_design_context` is too large, use `get_metadata` to split into child nodes and fetch only required sections.

## Styling and Component Rules

- Public storefront uses MUI Material + Tailwind utilities.
- Prefer MUI components for interactive controls: `Button`, `TextField`, `Select`, `FormControl`, `Typography`, `Alert`, etc.
- Use Tailwind for layout, spacing, responsive behavior, and structural utility styling.
- Use centralized tokens from `src/app/globals.css` and root font variables from `src/app/layout.tsx`.
- Avoid introducing isolated one-off color/font constants in page files when tokens already exist.

## Public Route Architecture

- Public pages live in `src/app/(storefront)/*`.
- Shared storefront state is managed by `src/app/(storefront)/_context/storefront-context.tsx`.
- Shared site shell (announcement/header/footer) is in `src/app/(storefront)/layout.tsx` + `_components/site-chrome.tsx`.
- Builder flow routes:
  - `/cart`
  - `/custom-case`
  - `/custom-case/charms`
  - `/custom-case/order`
  - `/confirmation/[orderCode]`

## SEO and Metadata Conventions

- Use route metadata exports (`metadata` or route/layout-level metadata files) for public pages.
- Root `metadataBase` must be derived from `NEXT_PUBLIC_SITE_URL` with safe fallback.
- Keep `app/robots.ts` and `app/sitemap.ts` in sync with public routes.
- Use semantic HTML (`main`, headings, meaningful link text) and descriptive image alt text.

## Documentation Sync

Whenever storefront architecture changes, update:

- `README.md` (feature/routes/setup summary)
- `CODEBASE_STRUCTURE.md` (source-of-truth structure notes)
- `AGENTS.md` / `CLAUDE.md` (rule and workflow expectations)
