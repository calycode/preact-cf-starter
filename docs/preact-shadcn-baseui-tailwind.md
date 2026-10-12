# Preact + shadcn (Base UI) + Tailwind v4

Distilled from the proven reference configuration. This is the source of truth
for the webapp's runtime/styling setup.

## Why the aliases look the way they do

React libraries (Base UI, lucide-react, Agentation) `import … from 'react'`.
Under Preact we redirect those to `preact/compat`. There are **two independent
resolution systems** and both must be configured:

1. **Vite** (`resolve.alias`) — runtime/build resolution.
2. **TypeScript** (`compilerOptions.paths`) — type-checking.

If Vite is configured but `tsconfig` is not, the app runs but every component
reports `Cannot find module 'react'`. If `tsconfig` is configured but the aliases
are non-absolute in Vite, esbuild fails with `Cannot read file: <root>/preact/compat`.

The webapp therefore:

- disables the Preact preset's built-in (non-absolute) aliases:
  `preact({ reactAliasesEnabled: false })`,
- declares absolute replacements via `fileURLToPath(import.meta.resolve(...))`,
- matches with RegExps (`/^react$/`, `/^react\/jsx-runtime$/`, …) so `react`
  never prefix-matches `react/jsx-runtime`,
- maps `react-dom`, `react-dom/client`, `react/jsx-runtime`,
  `react/jsx-dev-runtime`, and
- sets `define: { 'process.env.IS_PREACT': 'true' }`.

`tsconfig.json` mirrors `react`/`react-dom` to `preact/compat` and sets
`jsx: "react-jsx"` + `jsxImportSource: "preact"`. `skipLibCheck: true` is
required (React library types vs. Preact compat types).

## shadcn

- Style: `base-mira` (generates `@base-ui/react` primitives). `base-nova` is the
  same Base UI family; either works — keep both `components.json` files identical.
- Generated files are hand-editable source; shadcn is a generator, not a runtime.
- `#components/*` and `#lib/*` aliases are package `imports` in `packages/ui`.

## Base UI pitfalls

- Triggers default to rendering a `<div>`; pass `nativeButton` for real buttons.
- Floating components use `Portal → Positioner → Popup`.
- `render={<Button/>}` is Base UI's equivalent of `asChild`.
- Base UI is **not officially supported under Preact**. `Dialog` has historically
  hung under `preact/compat`. Always smoke-test Dialog / DropdownMenu / Select /
  Popover after adding components; fall back to Radix if needed (SPEC D3).

### Gate status

Smoke-tested `Dialog` (open/close, focus) under `preact/compat`: **passing**. A
dev-only Base UI warning about `nativeButton` may appear even though the rendered
element is a real `<button>`; it does not affect rendering. DropdownMenu / Select
/ Popover are not yet in the starter and remain untested.

## Tailwind v4

- `@import 'tailwindcss'` (not legacy `@tailwind` directives).
- `@custom-variant dark (&:is(.dark *))` enables `dark:*`.
- `@theme inline` bridges CSS variables to utilities.
- Animations come from `tw-animate-css`; shadcn extras from `shadcn/tailwind.css`.
- Tailwind v4's automatic content detection does **not** traverse into the
  `@caly/ui` workspace package (it lives outside the webapp root and is ignored
  like `node_modules`). Without an explicit `@source '../../../ui/src';` in
  `packages/webapp/src/styles/globals.css`, every utility class used only inside
  `packages/ui` is missing from the generated CSS — the dialog renders unstyled
  at the bottom of the page. Keep the `@source` directive whenever the UI package
  is consumed.
