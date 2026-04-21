---
paths:
  - "frontend/**/*"
---

# Web Development Standards

## General Rules
- Semantic HTML (`<article>`, `<nav>`, `<main>`, `<section>`, etc.)
- Mobile-first responsive design with CSS Grid/Flexbox
- Progressive enhancement: base HTML works, CSS and JS enhance
- HTTPS everywhere; never mix HTTP/HTTPS content
- Never store sensitive data in `localStorage`/`sessionStorage`
- Follow REST principles for APIs

## Security Headers (backend)
Set: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`

## Performance
- Lazy load images with `loading="lazy"`
- Preload critical resources with `<link rel="preload">`
- Defer non-critical scripts: `<script defer>`
- Optimize for Core Web Vitals (LCP, CLS, FID/INP)

## Web Validation Checklist
Before considering web work complete: HTML validates, no console errors, accessibility audit passes, responsive at all breakpoints, images have `alt`, forms have labels and error handling.
