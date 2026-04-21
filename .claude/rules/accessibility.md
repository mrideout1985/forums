---
paths:
  - "frontend/**/*.{ts,tsx,css}"
---

# Accessibility Standards (WCAG 2.2 Level AA)

## Non-Negotiables
- WCAG 2.2 Level AA minimum — go beyond when it meaningfully improves usability
- Use component library patterns if available; don't recreate them
- Prefer native HTML over ARIA; use ARIA only when necessary
- Correct accessible name, role, value, states, and properties on all elements
- All interactive elements keyboard operable; visible focus; no keyboard traps
- Never claim output is "fully accessible"

## Page Structure
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- No skipped heading levels; one `<h1>` per page (first heading in `<main>`)
- Skip link as first focusable element:
  ```html
  <a href="#maincontent" class="sr-only">Skip to main content</a>
  ```

## Contrast
- Text: ≥ 4.5:1 (large text: ≥ 3:1)
- Focus indicators and control boundaries: ≥ 3:1
- Never use color alone to convey information

## Colors
- Use CSS design tokens only — never arbitrary hex values
- Avoid alpha channels on text/key UI affordances
- Use system color keywords in `@media (forced-colors: active)`
- Never use `forced-color-adjust: none` without explicit justification

## Icons and Images
- Informative graphics: `alt` text or `aria-label`
- Decorative: `alt=""` or `aria-hidden="true"`
- SVGs: `fill: currentColor; stroke: currentColor`

## Forms
- Every control: `<label for="...">`
- Required fields: visible indicator + `aria-required="true"`
- Errors: `aria-invalid="true"`, `aria-describedby` for error message, focus first invalid on submit

## Navigation
- `<nav>` with lists and links — do not use `role="menu"` for site nav
- `aria-expanded` on toggle buttons

## Reflow (SC 1.4.10)
- Multi-line text must reflow at 320px without horizontal scroll
- Use flex/grid with fluid sizing; `min-width: 0` on flex/grid children
- `overflow-wrap: anywhere` for long strings

## Pre-Output Verification
Before finalizing any UI output, check: landmarks + headings, keyboard operability, visible focus, form labels + error associations, contrast ratios, forced colors, reflow at 320px, graphics alternatives.
