---
name: Design System — MUI Theme
description: Color palette, typography, spacing, and component conventions used across the forums frontend
type: project
---

MUI v7 with CSS variables API (`cssVariables: true`). Color scheme switches via `data-mui-color-scheme` attribute — no JS re-render required.

**Primary**: Indigo 600 `#4f46e5` (light mode) / Indigo 400 `#818cf8` (dark mode)
**Secondary**: Violet 600 `#7c3aed` (light) / Violet 400 `#a78bfa` (dark)
**Background default**: Slate 50 `#f8fafc` (light) / Slate 900 `#0f172a` (dark)
**Background paper**: `#ffffff` (light) / Slate 800 `#1e293b` (dark)
**Text primary**: Slate 900 `#0f172a` (light) / Slate 100 `#f1f5f9` (dark)
**Text secondary**: Slate 600 `#475569` (light) / Slate 400 `#94a3b8` (dark)
**Divider**: Slate 200 `#e2e8f0` (light) / Slate 700 `#334155` (dark)
**Error**: Red 700 `#b91c1c` (light) / Red 400 `#f87171` (dark)

**Typography**: Inter font. `h4` = 1.25rem/600 weight. `body2` = 0.875rem. `overline` = 0.6875rem/uppercase/600. Button text is not uppercased (`textTransform: none`).
**Border radius**: 8px globally. Chips use 6px.
**TextField default**: `variant: "outlined"`, `size: "small"` (overridden per-usage with `size="large"` for auth forms).

**MuiCard**: elevation 0, `border: 1px solid slate[200]`. The auth layout overrides `boxShadow` inline to `0 4px 32px rgba(0,0,0,0.08)` — this means the card has BOTH a border and a shadow.
**Focus styles**: `outline: 2px solid currentColor; outlineOffset: 2px` on buttons, icon buttons, and links.

**Auth layout**: Split-panel — indigo→violet gradient left panel (hidden on `xs`/`sm`, shown from `md` breakpoint = 900px). Form panel on right with max-width 440px card.

**Why:** Understanding this avoids suggesting changes that conflict with existing WCAG-verified contrast decisions already documented in theme.ts.
**How to apply:** Always verify suggested color changes against the palette scale. Don't suggest arbitrary hex values — use the named palette tokens.
