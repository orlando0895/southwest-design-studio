---
name: Southwest Design Studio
read: "Two-floor kitchen, bath and finish showroom for Scottsdale homeowners and the trade. The site is the walk: real tour footage played by scroll. Dark-first so footage glows."
dials: { DESIGN_VARIANCE: 7, MOTION_INTENSITY: 7, VISUAL_DENSITY: 3, DEPTH: 2 }
colors:
  bg: "#0E0B09"        # page (dark-first)
  bg2: "#15110E"
  bg3: "#1E1915"       # cards, tiles
  cream: "#F1E9DC"     # text on dark (16:1)
  cream2: "#C2B6A4"    # secondary text on dark
  muted: "#968A78"     # labels on dark
  amber: "#E3A64F"     # the one accent, from the logo (8.4:1 on bg; ink text on amber 8.4:1)
  sand: "#EFE7DA"      # the one light chapter (visit list)
  ink: "#16120E"
  amber-deep: "#85540F" # accent on sand (5.6:1)
typography:
  display: "Bodoni Moda 400, italic for one word at most, tight tracking"
  numerals: "Bodoni Moda lining numerals, oversized for chapters (01 to 06) and section stops (07 to 09)"
  body: "Manrope 400/500/600, 16px phone / 17px desktop"
motif: "The logo's tile mosaic: page-load and page-to-page tile wipe, the crafts grid on About, the favicon"
motion:
  walk: "223 graded WebP frames per orientation (1440x810 landscape, 608x1080 subject-tracked portrait), coarse-to-fine loading, adjacent-frame blending"
  smooth-scroll: "Lenis on fine pointers only; touch keeps native momentum"
  reduced: "No tiles, no blending, no autoplay: the walk steps between chapter stills"
---

## Do
- Real footage and photos only. Higgsfield is used for upscales and slow camera glides from real photos, checked frame by frame against the photo: no added or changed objects.
- One accent, amber. One light section per page at most.
- Mobile first: bottom sheets for details, swipe rails for doors and kitchens, a slim visit bar after the first save.
- Hold some rooms back (wine room, closet, smart home): blurred until press-and-hold.
- Facts only from the studio, the listing, or what the footage shows.

## Don't
- No em-dashes, no invented stats, reviews, prices or designer names. No floor label where the floor is unknown.
- No headline formula repeated across sections.

## Preserved
URLs (/, /about/, /portfolio/, /services/, /visit/), nav labels, preview form fields (name, phone, email, message) and its endpoint, phone, address, hours, noindex meta.
