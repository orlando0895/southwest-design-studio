---
name: Southwest Design Studio
read: "Luxury interior design showroom for Scottsdale homeowners and the trade. Warm editorial language, desert rooted. DEPTH 4."
dials: { DESIGN_VARIANCE: 7, MOTION_INTENSITY: 7, VISUAL_DENSITY: 3, DEPTH: 4 }
colors:
  sand: "#F4EEE4"      # page
  sand-2: "#EAE1D3"    # alt bands
  ink: "#1B1612"       # text, dark chapters
  ink-2: "#26201A"
  ink-soft: "#4D443A"
  muted: "#6F6456"
  clay: "#9C4F2A"      # the one accent (5.6:1 on sand)
  clay-light: "#E0A27E" # accent on dark only
  line: "#DCD1C0"
typography:
  display: "Bodoni Moda, 400/500, italic for the accent word, tracking -0.02em"
  body: "Manrope 400/500/600, 17px, 1.65"
  label: "Manrope 600, 0.74rem, 0.2em tracking, uppercase (max 1 per 3 sections)"
  numerals: "font-variant-numeric: lining-nums tabular-nums"
radii: { image: 4px, card: 4px, pill: 999px }
motion:
  smooth-scroll: "Lenis 1.3 synced to GSAP ticker"
  enter: "expo.out 0.9s, stagger 0.08"
  exit: "power2.in 0.35s"
  scrub: "0.8 for camera, true for text"
depth:
  set-piece: "Showroom Walkthrough: WebGL corridor of five rooms; scroll flies the camera through, each room sharpens on arrival"
  fallbacks: "reduced motion / no WebGL / coarse low-end: static horizontal room rail with the same five rooms"
---

## Do
- One accent (clay). Brass and gold are retired; clay reads desert, not generic luxury.
- Photography carries the page. Type is quiet, large, and sparse.
- Every interactive piece works with keyboard and without JS (content readable at rest).
- Keep facts to what the studio has published: address, phone, hours, opening soon, Southwest Corridor parent group.

## Don't
- No em-dashes, no invented stats, reviews, prices, or designer names.
- No three-equal-card rows as the main layout; no more than one marquee.
- Never put the H1 or CTA inside the canvas.

## Preserved (do not change silently)
URLs (/, /about/, /portfolio/, /services/, /visit/), nav labels, the private-preview form fields
(name, phone, email, message) and its formsubmit endpoint, phone, address, hours, noindex meta.
