# The Crayon Box — website

A static, single-page marketing website for **The Crayon Box**, a modern
purpose-built childcare and preschool facility in Latlurcan, Monaghan, Co.
Monaghan (Eircode **H18 Y2H3**).

Built as plain **HTML + CSS + vanilla JavaScript** — no build step. Icons are
loaded at runtime from a hosted **Font Awesome** kit (the `<script>` in
`index.html`'s `<head>`), so the page needs an internet connection to display
them. Open `index.html` in a browser, or serve the folder with any static host.

## Run locally

Just open `index.html`, or for a local server:

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All page content, SEO metadata, JSON-LD, and `data-i18n` markers |
| `styles.css` | Design system + responsive, accessible styling |
| `script.js` | Mobile nav, footer year, form validation, Formspree submit |
| `i18n.js` | Translation dictionary (EN/GA/PL/LT/RU) and language switcher |
| `images/logo.png` | Brand logo (also used as favicon) |
| `images/facility-exterior.jpg` | Photo of the premises (hero + facilities) |

## Google Maps integration

The Location section (`#location`) uses a **keyless responsive iframe embed**
pointing at the business address / Eircode — no API key or billing required.
The iframe sits in a `.map-frame` wrapper with a fixed aspect ratio so it stays
responsive on all screens, and there is a text fallback link below it if the map
fails to load.

**"Get Directions"** buttons (hero, location, contact, footer area) link to
`https://www.google.com/maps/dir/?api=1&destination=...H18 Y2H3`, which opens
turn-by-turn directions to the Eircode in a new tab.

### Optional: switching to the Maps JavaScript API
If you later want the richer interactive JS map (custom markers/styling), you'll
need a Google Cloud API key. **Do not hardcode it.** Inject it from an
environment variable at build/deploy time (e.g. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
if this is ever moved into Next.js, or a server-side template variable for a
static host) and load the script with that key. The current iframe approach
needs none of this.

## Contact / enquiry form (Formspree)

The form (`#enquiryForm`) submits to **Formspree** at endpoint
`https://formspree.io/f/xzdlagrz`.

- The `<form>` has `action="https://formspree.io/f/xzdlagrz"` and `method="POST"`,
  so it still works if JavaScript is disabled (Formspree handles the response).
- With JavaScript on, `script.js` validates the fields (accessible inline errors,
  focus management, ARIA live status), then submits over AJAX with
  `fetch(... { headers: { Accept: 'application/json' } })` so the parent stays on
  the page. A success message shows only when Formspree returns `ok`; otherwise an
  error message asks them to call or email instead.
- Spam protection: a hidden `_gotcha` honeypot field and a `_subject` field that
  sets the email subject. The `email` field is used by Formspree as the reply-to.
- First-time setup: the endpoint owner must confirm the address Formspree sends to
  (Formspree emails a confirmation link on the first submission). Status messages
  are translated for every supported language.

## Languages

The site supports five languages popular in Monaghan: **English, Irish (Gaeilge),
Polish, Lithuanian and Russian.** A language switcher sits in the header (visible
at every screen size), and a multilingual welcome bar greets visitors.

- Translatable text carries a `data-i18n` attribute (or `data-i18n-html`,
  `data-i18n-ph`, `data-i18n-aria` for HTML, placeholders and aria-labels). All
  strings live in `i18n.js`.
- On first visit the language is guessed from the browser, then remembered in
  `localStorage`. The switcher updates the text, the `<html lang>` attribute and
  the page title without reloading.
- To edit a string, change it in `i18n.js` under each language key. To add a
  language, add a new block to the `translations` object and an `<option>` to the
  `#langSelect` element.

The non-English copy was translated as part of this build. **Have a native
speaker review it before launch** — automated translations can miss tone and
local idiom.

## SEO & accessibility

- Local SEO copy and keywords for childcare / preschool / ECCE / after-school in
  Monaghan & Latlurcan; address, phone, email and hours are crawlable text.
- `ChildCare` JSON-LD structured data with address, hours, and services.
- Semantic landmarks, single `<h1>`, ordered headings, skip link, visible focus
  states, labelled fields, keyboard-navigable nav, and `prefers-reduced-motion`
  support.

## Assumptions

- No framework existed in the repo, so a dependency-free static site was chosen
  for speed, reliability and easy hosting.
- `images.jpg` was renamed to `images/facility-exterior.jpg`.
- Placeholder canonical/OG URL `https://www.thecrayonbox.ie/` — update to the
  real domain before launch.
- The non-English translations were produced during the build and should be
  proofread by native speakers.
- The browser auto-detects the visitor's language on first visit (then remembers
  it); the meta description and JSON-LD stay in English for search engines.

## Recommended next steps

- Confirm the Formspree endpoint on its first submission, and have a native
  speaker review the Irish, Polish, Lithuanian and Russian copy in `i18n.js`.
- Add real interior photos for a proper facilities gallery.
- Add policies (e.g. fees, sickness, safeguarding) and any Tusla registration
  details once available.
- Add genuine parent testimonials when collected.
- Confirm the exact pin location of the Maps embed for the new Eircode.
