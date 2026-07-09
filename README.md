# Shiva Fitness Gym — Cinematic Landing Page

A dark, minimal, single-page site built around one signature element:
a chrome dumbbell rendered in Three.js that travels, rotates and
resizes uniquely through all 12 sections as the visitor scrolls,
choreographed with spring physics so it carries weight rather than
floating. Two abstract line-art "hand" glyphs bookend the story: an
open hand fades out as the visitor leaves the hero (the dumbbell has
just left its grip), and a mirrored hand fades in near the final
section (it's about to be caught).

## Files

```
index.html              — all markup, SEO tags, JSON-LD schema
assets/css/style.css    — design tokens + every section's layout
assets/js/scene.js      — the 3D dumbbell + 12-waypoint scroll choreography
assets/js/main.js       — nav, scroll-reveals, hand-glyph timing
```

Open `index.html` directly in a browser, or serve the folder with any
static server (`npx serve .`) — no build step required.

## Before this goes live — replace these placeholders

This was built without access to the gym's real photography, verified
numbers, or contact details. Nothing below is fabricated fact —
it's clearly-flagged placeholder content standing in for real assets.

- **Phone number** — currently `+91 00000 00000` / `910000000000` in
  the WhatsApp/call/footer links (`index.html`, sections 11 and 12,
  and the footer). Search for `0000000000` to find every instance.
- **Photography** — the coach photo, training-floor photo, and all 6
  gallery tiles are currently soft gradient placeholders with
  labels like "Add member photo." Replace the relevant `<div>` with
  a real `<img loading="lazy" alt="…">` once photos are available.
- **Testimonials** — the 3 quotes in the Testimonials section are
  sample copy, clearly labelled "replace with a real member
  testimonial." Swap in real, consented quotes and names.
- **Membership pricing** — ₹1,500 / ₹4,000 / ₹12,000 are illustrative
  numbers only. Confirm current rates before publishing.
- **Google Maps embed** — currently points to a text search for
  "Shiva Fitness Gym, Kaimri Road, Hisar." For pinpoint accuracy,
  drop in the gym's actual Google Maps place link.
- **Open Graph / canonical URLs** — `shivafitnesshisar.example` is a
  placeholder domain; update once the real domain is live, and add a
  real `og:image` (1200×630).
- **JSON-LD schema** (`index.html`, `<head>`) — update `telephone`
  and add `openingHoursSpecification` once hours are finalized.

## Design notes

- **Palette**: pure black (`#050505`) background, charcoal/panel
  surfaces, white/steel/gunmetal for structure, soft ice-blue as the
  one interactive accent (hover, focus, CTAs), a touch of deep
  emerald reserved only for the "Safety For Women" section to signal
  a calmer, more reassuring register. No orange or red anywhere.
- **Type**: Barlow Condensed (massive, condensed, all-caps) for every
  headline; Inter for body and UI; Fraunces (italic serif) reserved
  for pull-quotes and the coach's quote — the one editorial-fashion
  touch, used sparingly.
- **The dumbbell** is deliberately never in the same screen position,
  scale or camera distance twice in a row — see the `waypoints` array
  in `scene.js` if you want to art-direct its journey further.
- **Accessibility**: skip link, visible focus rings, semantic heading
  hierarchy, `prefers-reduced-motion` disables spring drift/parallax
  and reveal transitions, and the page still reads correctly with
  the canvas hidden entirely if WebGL isn't available.
- **Performance**: fonts and CDN are preconnected, the map iframe and
  gallery are lazy-loading-ready, and the render loop uses a single
  `requestAnimationFrame` driven by lightweight spring math rather
  than a heavy animation library.

## Honest scope note on the "hand holding the dumbbell" narrative

The brief asked for a photoreal, muscular hand that opens and releases
the dumbbell, then a second hand that catches it at the end. A
procedurally-modeled 3D hand built from primitives (spheres/cylinders,
the same technique used for the dumbbell) would read as a crude
cartoon rather than a real athlete's hand — the brief explicitly asks
to avoid a cartoon look. Getting a genuinely photoreal hand into the
WebGL scene needs either a sculpted/scanned GLB hand model or a real
photographed/filmed hand composited with the canvas — both are asset
production work outside what can be generated procedurally here.

In its place, this build uses a minimal single-line "hand" glyph as an
abstract narrative bookend (open at the top, mirrored/closing at the
bottom), which stays inside the brand's minimal-luxury language rather
than risking a cheap-looking literal hand. If you have or can
commission a rigged hand GLB, it's a drop-in replacement inside
`scene.js` — happy to wire it up if you get one made.
