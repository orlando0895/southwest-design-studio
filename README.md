# southwest-design-studio
Southwest Design Studio: interactive showroom website (client project).
Live: https://orlando0895.github.io/southwest-design-studio/

## What's on the site
- **Arrival film** hero: 35s silent loop cut in HyperFrames from a real walkthrough of both floors (`media/film.mp4`, phone cut `media/film-portrait.mp4`), with live chapter captions.
- **3D walkthrough**: WebGL corridor through nine stations, Level 1 to the staircase to Level 2. The frame you arrive at plays its tour clip. Falls back to a swipeable rail on reduced motion or no WebGL.
- **Floor guide**: Level 1 / Level 2 map; tap a zone for footage, what's on display, and save it.
- **Kitchen hotspots**, **finish library**, **held-back rooms** (press and hold to peek), **style finder**.
- **Visit list**: saved rooms, finishes and style follow the visitor to the preview form (chips + prefilled message).

## Media
`img/showroom/` photos from the Google Business listing. `media/clips/` 720p clips + posters cut from Orlando's tour footage (graded from iPhone HDR).

## Editing
Page content lives in `src/pages/*.html`; header, footer and meta live in `tools/build.py`.
```
python3 tools/build.py
npx esbuild src/home.js --bundle --minify --format=esm --outfile=js/home.min.js   # only if src/*.js changes
```
Design tokens and rules: `DESIGN.md`. Libraries (GSAP, ScrollTrigger, Lenis, three) and fonts are self-hosted.
