# VDOSTAL — Creative Content Agency

Production-ready static one-page website. No build step, no framework, no dependencies.
Open `index.html` in a browser, or deploy the folder to any static host.

## Project structure

```
vdostal-site/
├── index.html                 # the page (semantic HTML, meta, OG/Twitter, JSON-LD)
├── 404.html                   # on-brand not-found page
├── robots.txt                 # crawl rules + sitemap reference
├── sitemap.xml                # single-URL sitemap
├── site.webmanifest           # PWA/app metadata + icons
├── _headers                   # cache + security headers (Netlify / Cloudflare Pages)
├── netlify.toml               # same headers for Netlify (optional)
├── .gitignore
└── assets/
    ├── css/styles.css         # all styles (design tokens at :root)
    ├── js/main.js             # nav, reveals, counters, FAQ, form, package prefill
    └── img/
        ├── favicon.svg        # arrow mark (brand blue)
        ├── apple-touch-icon.png   # 180×180
        ├── og-image.jpg           # 1200×630 social preview
        ├── logo.png               # 512×512 brand logo (optimized)
        └── logo.webp              # smaller WebP version
```

## Preview locally

Any static server works (needed so relative asset paths resolve):

```bash
cd vdostal-site
python3 -m http.server 8080
# open http://localhost:8080
```

Or just double-click `index.html` (file:// also works for this project).

## Deploy

Pick any static host — the folder is the site root.

- **Netlify:** drag the `vdostal-site` folder onto app.netlify.com/drop. `_headers` / `netlify.toml` apply automatically.
- **Cloudflare Pages:** create a project, upload the folder (no build command, output dir `/`). `_headers` applies.
- **Vercel:** import the folder as a static project (Framework preset: “Other”, no build).
- **GitHub Pages:** push the contents to a repo and enable Pages on the branch root.
- **Any host / S3 / nginx:** upload as-is; ensure `.html` and `assets/` are served with the caching in `_headers`.

## Edit checklist (placeholders to replace before launch)

1. **Domain** — replace `https://vdostal.com/` in: `index.html` (`<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`), `robots.txt`, `sitemap.xml`.
2. **Brand blue** — one token controls the accent. In `assets/css/styles.css`:
   - `--blue` (fills/buttons), `--blue-2` (hover), `--blue-text` (accent text on black).
3. **Portfolio** — in `index.html`, replace the four `.work-item` placeholders with real media
   (`<img loading="lazy" width height alt="…">` or `<video>`), project names, and task → result copy.
4. **Testimonials / client logos** — replace the `[ Testimonial placeholder ]` and `[ Client logo ]` blocks.
5. **Contact form** — the form is front-end only. Point it at a backend
   (Formspree/Getform/Basin, a Netlify form, or your own endpoint). See “Wire the form” below.
6. **Social links** — replace the `href="#"` links in the footer with real URLs.
7. **Contact details** — footer email/Telegram, and the note under the form.
8. **OG image** — `assets/img/og-image.jpg` is generated from the logo; swap for a custom 1200×630 if desired.

## Wire the form (example: Formspree)

In `index.html`, change the opening form tag and add a method/action:

```html
<form class="form" id="leadForm" method="POST" action="https://formspree.io/f/XXXX">
```

Then in `assets/js/main.js`, remove the `e.preventDefault()` in the submit handler
(or keep it and submit via `fetch`) so the request is actually sent. The success
state (`#formSuccess`) can be shown after a successful `fetch`.

## Accessibility & SEO (already in place)

- Single `<h1>`, ordered `<h2>/<h3>`, semantic landmarks, skip-to-content link.
- Title ~54 chars (query-first), meta description ~155 chars.
- `Organization` + `FAQPage` JSON-LD (matches on-page FAQ).
- `prefers-reduced-motion` respected; visible focus states; labeled form fields; 44px+ targets.

## Performance notes

- No JS is required to render content; `main.js` is `defer`-loaded and progressively enhances.
- Fonts load via Google Fonts with `preconnect` + `display=swap`. For maximum control you can
  self-host the three families and drop the external request.
- `_headers` sets 1-year immutable caching for `/assets/*` and revalidation for HTML.
- Enable gzip/Brotli at the host (Netlify/Cloudflare/Vercel do this automatically).

© VDOSTAL
