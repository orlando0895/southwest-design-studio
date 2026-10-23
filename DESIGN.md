---
name: Southwest Design Studio
read: "Two-floor kitchen, bath and finish showroom for Scottsdale homeowners and the trade. Real footage carries the page; warm editorial type frames it. DEPTH 4."
dials: { DESIGN_VARIANCE: 7, MOTION_INTENSITY: 7, VISUAL_DENSITY: 3, DEPTH: 4 }
colors:
  sand: "#F4EEE4"      # page
  sand-2: "#EAE1D3"    # alt bands
  ink: "#1B1612"       # text, dark chapters
  ink-2: "#26201A"
  ink-soft: "#4D443A"
  muted: "#6F6456"
  clay: "#85540F"      # brand amber from the logo, the one accent (5.6:1 on sand, white text 6.4:1)
  clay-light: "#E3A64F" # amber on dark only (8.4:1 on ink)
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
  set-piece: "Showroom Walkthrough: WebGL corridor of nine stations (Level 1, the staircase, Level 2); the arriving frame plays its real tour footage, camera climbs at the stairs"
  fallbacks: "reduced motion / no WebGL / coarse low-end: swipeable rail of the same nine stations, clips play when in view"
---

## Do
- One accent: amber, taken from the studio's logo and the brass in its kitchens.
- Real showroom photos and footage only. No stock rooms. Footage is iPhone HLG, graded warm (contrast 1.05, sat 1.08, 6000K at 0.5 mix).
- Some rooms are held back on purpose (wine room, closet, smart home): blurred until press-and-hold.
- Photography carries the page. Type is quiet, large, and sparse.
- Every interactive piece works with keyboard and without JS (content readable at rest).
- Keep facts to what the studio has published or what the footage shows: address, phone, hours, two floors, brands visible on displays, Southwest Corridor parent group.

## Don't
- No em-dashes, no invented stats, reviews, prices, or designer names.
- No three-equal-card rows as the main layout; no more than one marquee.
- Never put the H1 or CTA inside the canvas.

## Preserved (do not change silently)
URLs (/, /about/, /portfolio/, /services/, /visit/), nav labels, the private-preview form fields
(name, phone, email, message) and its formsubmit endpoint, phone, address, hours, noindex meta.
