---
paths:
  - "frontend/**/*.{ts,tsx,css}"
---

# Premium Frontend UI

When building premium or visually rich UI (landing pages, hero sections, showcases):

## Motion & Animation
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `margin` (causes layout recalculation)
- Apply `will-change: transform` on complex moving elements; remove it post-animation
- Wrap heavy animations in `@media (prefers-reduced-motion: no-preference)`
- Wrap cursor/hover animations in `@media (hover: hover) and (pointer: fine)`
- For React: use **Framer Motion** for layout transitions and spring physics
- For smooth scrolling: **Lenis** (`@studio-freight/lenis`)
- For 3D: **React Three Fiber** (`@react-three/fiber`)

## Typography
- Use `clamp()` for fluid type scales
- Headlines: extreme sizing (up to `12vw`); body: minimum `16px-18px`
- Variable fonts over system defaults when polish matters

## CSS Patterns
- Use `backdrop-filter: blur()` with semi-transparent borders for glassmorphism
- CSS noise overlays: `mix-blend-mode: overlay`, opacity `0.02-0.05` for texture
- Container queries (`@container`) and CSS subgrid for modern layouts
- `@media (forced-colors: active)` with system color keywords when box-shadow focus styles are used
