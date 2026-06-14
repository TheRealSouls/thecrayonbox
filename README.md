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
| `index.html` | All page content, SEO metadata, and JSON-LD structured data |
| `styles.css` | Design system + responsive, accessible styling |
| `script.js` | Mobile nav, footer year, accessible form validation + submit |
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

## Contact / enquiry form

The form (`#enquiryForm`) is **front-end only — there is no backend connected.**

- It validates name, email, phone and message (accessible inline errors, focus
  management, ARIA live status).
- On a valid submit it opens the parent's own email client via a pre-filled
  `mailto:` to `thecrayonbox100@gmail.com`. The status message honestly says the
  email app "should now open" — it never claims the enquiry was received.
- To wire a real backend, replace the clearly-marked `>>> TO CONNECT A REAL
  BACKEND <<<` block in `script.js` with a `fetch()` POST to a form service
  (Formspree / Netlify Forms / Web3Forms) or your own endpoint. Only show a
  success message once the request actually succeeds.

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

## Recommended next steps

- Connect the enquiry form to an email/form backend.
- Add real interior photos for a proper facilities gallery.
- Add policies (e.g. fees, sickness, safeguarding) and any Tusla registration
  details once available.
- Add genuine parent testimonials when collected.
- Confirm the exact pin location of the Maps embed for the new Eircode.
