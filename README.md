# southwest-design-studio
Southwest Design Studio: interactive showroom website (client project).
Live: https://orlando0895.github.io/southwest-design-studio/

## The site
- **Home is the walk.** Scroll plays the real tour from the front door, through the kitchen gallery (pauses for hotspots), the surfaces library and up the stairs to Level 02. Then: three held-back rooms (press and hold to peek), tap-through stories, a visit-list builder (kitchen + real material close-ups), and the visit close.
- **Visit list** follows the visitor everywhere (bottom bar + sheet) and prefills the private preview form.
- **About**: the arrival film (play on demand), crafts mosaic. **Services**: full-bleed footage chapters + process. **Portfolio**: full-screen swipe gallery. **Visit**: two-floor guide, map, booking.

## Media
- `media/walk/{d,m}/` scroll-walk frames (cut, stabilized and graded from the 69s tour).
- `media/hf/` Higgsfield camera glides from real photos (kitchens, smart home, vanity, fireplaces). `img/showroom/` Higgsfield 2K upscales of the listing photos.
- `media/clips/`, `media/stories/` tour clips (landscape / portrait). `media/film*.mp4` the arrival film.

## Editing
Page content: `src/pages/*.html`. Header, menu, footer, meta: `tools/build.py`.
```
python3 tools/build.py
```
Interactions: `js/main.js` (shared), `js/walk.js` (scroll walk). Styles: `css/style.css`. Design rules: `DESIGN.md`.
