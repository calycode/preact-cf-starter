# Theming

Theming is CSS-variable based. Components never hard-code colors; they use
Tailwind utilities (`bg-primary`, `text-muted-foreground`, …) that map to CSS
custom properties via `@theme inline` in `packages/webapp/src/styles/globals.css`.

## Tokens

`globals.css` is the single source of truth for the token set:

```css
:root {
   --background: oklch(1 0 0);
   --primary: oklch(0.527 0.154 150.069); /* … */
}
.dark {
   --background: oklch(0.145 0 0); /* … */
}
@theme inline {
   --color-primary: var(--primary); /* … */
}
```

`.dark` on `<html>` (toggled by `ThemeProvider`) activates the dark tokens and
the `dark:` variant.

## Presets

The shadcn CLI owns `globals.css` and can swap the whole token set:

```bash
# full preset (components + tokens)
pnpm theme:apply -- --preset <PRESET_CODE>

# tokens only
pnpm theme:apply -- <PRESET_CODE> --only theme
```

Hand-authored presets, if any, live in `src/styles/presets/` and are `@import`ed
from `globals.css`. Do not keep a competing token file alongside `globals.css` —
the CLI writes to the file declared in `components.json`.
