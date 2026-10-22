# southwest-design-studio
Southwest Design Studio: interactive interior design showroom website (client project).
Live: https://orlando0895.github.io/southwest-design-studio/

## What's on the site
- **Showroom film** hero: 16s silent loop rendered with HyperFrames (`media/`), poster fallback, pause control.
- **3D walkthrough**: WebGL gallery corridor of five rooms; scroll flies the camera through. Falls back to a swipeable room rail on reduced motion, low-end phones, or no WebGL.
- **Detail hotspots** on the kitchen, **material library** (stone, wood, textile, metal), **style finder** quiz that pre-fills the private preview form (`visit/?style=...`).
- Portfolio filters + lightbox (keyboard and swipe), services and process with sticky image swaps.

## Editing
Page content lives in `src/pages/*.html`; header, footer and meta live in `tools/build.py`.
```
python3 tools/build.py                       # regenerates the five index.html files
npx esbuild src/home.js --bundle --minify --format=esm --outfile=js/home.min.js   # only if src/*.js changes
```
Design tokens and rules: `DESIGN.md`. Libraries (GSAP, ScrollTrigger, Lenis, three) and fonts are self-hosted.
