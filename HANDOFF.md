# 🧸 bebomoments — AI / Developer Handoff

> Context dump for any future AI session, tab, or developer picking this up cold.
> Captures the *why* behind decisions, not just the code. Last updated: this is the
> state at first GitHub push.

---

## 1. What this is

**bebomoments** is a toddler-activity **worksheet shop + free activity tool**, branded for
the Instagram creator **@bebomoments (Kyra Sureka)** — *"Toddler mom figuring it out daily.
Easy meals + simple play ideas. No fancy stuff, just what works."* Warm, casual, relatable
(not polished/aspirational).

It is a **link-in-bio web app**: people land from Instagram, get a free worksheet, try a
free tool, and buy printable worksheets. The owner (non-technical) uploads new worksheets
through an admin panel; each upload is auto-branded into a sellable product and appears live
for all visitors.

Repo: `git@github.com:mybyes/KyraWorksheet.git` (GitHub: `mybyes/KyraWorksheet`, branch `main`).
Same GitHub account as the owner's other project *Cricketline* (cricketfast). Auth via SSH.

---

## 2. How we got here (chronology of the build)

1. **v1 (static):** Built a self-contained static storefront inspired by the Topmate creator
   store `kiara_tma` — link-in-bio shop, curated worksheet catalog, a real free 5-page
   "Toddler Starter Pack" (HTML → PDF via headless Chrome), free-download-with-email-capture.
   *(That first version lived in a sibling folder `bebomoments/`. This repo supersedes it.)*
2. **Differentiation pass:** Researched `preschoolerslearning.com` (20-week curriculum + 26
   animal mascots = "a system beats a pile of PDFs") and Instagram/Pinterest trends
   (screen-free +200% YoY, sensory play +1,070%, busy-bins/sensory-bags/taped activities,
   #1 pain = *"what do I do with my toddler RIGHT NOW?"*). Decided the unique angle is an
   **interactive no-prep activity finder** → built **Play Now**.
3. **Full-stack upgrade (this repo):** Owner wanted an **admin upload panel** so uploaded
   worksheets are live for everyone, each stamped with logo + bookmarks to be marketable.
   That requires a backend → built Express API + storage + PDF auto-branding, Vercel-ready
   and free.
4. **Polish:** "Shop" nav now scrolls to uploaded worksheets (with fallback); cache-busting
   on scripts; pushed to GitHub for Vercel.

---

## 3. Key decisions (and why)

| Decision | Choice | Why |
|---|---|---|
| Hosting | **Vercel (free)** | Owner pushed back on Railway's ~$5/mo. Vercel free works *if* uploads go to **Vercel Blob** (Vercel's disk is ephemeral). |
| Persistence | **Vercel Blob** in prod, **local disk** in dev | Storage adapter auto-detects via `BLOB_READ_WRITE_TOKEN`. Lets us develop with no accounts. |
| Admin auth | **Single password** (env var) | Solo owner. Token = `sha256(password + ADMIN_SECRET)`; sent as `Authorization: Bearer`. |
| Branding | **Cover page + per-page logo footer + PDF bookmarks** | Owner said "decide to make it marketable" — this turns any uploaded PDF into a product. |
| Build step | **None** (static + serverless) | Owner is non-technical; keep it editable. |
| Payments | **Not built yet** | Paid cards collect email / link out. Future: Razorpay or Gumroad. |

---

## 4. Architecture & file map

```
public/                 static site (served by Vercel CDN / express.static locally)
  index.html            storefront: profile, Play Now banner, free hero,
                        "🆕 Fresh worksheets" (live uploads), curated catalog, email modal
  app.js                storefront logic + fetches /api/worksheets; smart "Shop" scroll
  play.html / play.js   "Play Now" finder (client-only; ~20 curated activities in play.js)
  admin.html / admin.js admin panel: login, upload (XHR progress), list, delete
  styles.css            all styling (brand palette: coral/peach/mustard/sage)
  assets/logo.{svg,png} bebomoments logo (teddy + wordmark), used on site + stamped into PDFs
  worksheets/free-starter-pack.pdf   the free lead-magnet pack

api/
  index.js              Express app (default export = the app, used as Vercel function)
                        Routes: POST /api/login · GET /api/worksheets ·
                                POST /api/worksheets (admin upload) · DELETE /api/worksheets/:id
  _lib/store.js         storage adapter (Vercel Blob ⇄ local ./data); manifest + files
  _lib/brand.js         PDF auto-branding via pdf-lib (cover, footer, bookmarks, metadata)
  _lib/auth.js          single-password auth + requireAdmin middleware

server.js               LOCAL entry (node server.js). Serves public/ + api/ + /files.
                        NOT used on Vercel.
vercel.json             routes /api/(.*) → api/index.js
data/                   local-only uploads (gitignored). Prod uses Blob.
.env.example            ADMIN_PASSWORD, ADMIN_SECRET, BLOB_READ_WRITE_TOKEN
```

Stack: Node ESM, Express, multer@2.x (upload), pdf-lib (branding), @vercel/blob (prod storage).

---

## 5. Features & verification status

All verified locally (server on :4400, admin password `bebo-admin` for local dev):

- ✅ **Storefront** renders (mobile-first); profile, banners, curated catalog, filters.
- ✅ **Play Now** finder: age + minutes + energy + mess → one curated no-prep activity with
  "why it helps" + mom tip; Save (localStorage) + Print + "Another idea" rotation.
- ✅ **Admin login** — wrong password rejected; correct returns token.
- ✅ **Upload gated** by token (401 without).
- ✅ **Auto-branding** — uploaded 5-page PDF → 6 pages (cover added); per-page logo footer +
  "© bebomoments · not for resale" + page numbers; PDF bookmarks + metadata. (Rendered the
  cover & a content page to confirm visually.)
- ✅ **Persistence** across server restart (manifest on disk locally / Blob in prod).
- ✅ **Live for all** — uploaded worksheet appears in the public "🆕 Fresh worksheets" section.
- ✅ **"Shop" nav** scrolls to Fresh worksheets when uploads exist, else to curated shop.
- ✅ **Delete** removes from site + storage.

> Verification note: the preview/headless env reports 0 viewport height, so pixel-scroll
> and full-page screenshots are unreliable there — we verified scroll/list logic by
> inspecting DOM state and which element handlers target, not by screenshot position.

---

## 6. The branding pipeline (the "marketable product" part)

`api/_lib/brand.js` (pdf-lib) does, on every upload:
1. **Cover page** prepended: logo (centered), title, age, a "Printable · Screen-free" pill,
   coral top/bottom bands, "Made with love by a mum, for mums · @bebomoments" footer.
2. **Every content page:** small semi-transparent logo + `© bebomoments · personal &
   classroom use · not for resale` (bottom-left) + `n / total` page number (bottom-right).
3. **PDF outline/bookmarks** (Cover → Activity pages → Middle → Last) + document metadata
   (Title/Author/Subject/Keywords). Outline is wrapped in try/catch so it never blocks upload.

To change the logo: replace `public/assets/logo.png` (used both on-site and in PDFs).

---

## 7. Deploy status & steps

**Not yet deployed.** Code is on GitHub; owner connects Vercel:

1. vercel.com/new → import **mybyes/KyraWorksheet** → Deploy (no build step).
2. Project → **Storage → Create Database → Blob** → connect (auto-adds `BLOB_READ_WRITE_TOKEN`).
3. Project → **Settings → Environment Variables**: `ADMIN_PASSWORD`, `ADMIN_SECRET`.
4. Redeploy. Admin at `/admin.html`.

---

## 8. Known limitations / gotchas

- **Vercel free body limit ~4.5 MB** → uploaded PDFs must be under that. For larger bundles:
  split, upgrade plan, or switch to **Blob client-direct upload** (removes the cap; not yet built).
- **`undici` advisories** remain (transitive dep of `@vercel/blob`, only talks to Vercel's
  trusted API — low risk). `multer` was bumped to 2.x to clear its high-severity advisory.
- **YouTube link** in `index.html` is `@bebomoments-kyra` — **owner should confirm** this is the
  exact channel handle or it 404s.
- **Email capture** is localStorage-only until a Formspree URL is set in `public/app.js`
  (`FORMSPREE_URL`).

---

## 9. Suggested next steps (not done)

- Razorpay (₹/UPI) or Gumroad checkout for paid worksheets.
- Blob client-direct upload to remove the 4.5 MB cap.
- Grow Play Now activity DB (currently ~20) + category filters.
- "Tiny Steps" 20-week curriculum with bebomoments animal mascots (preschoolerslearning-style system).
- Custom domain in Vercel.

---

## 11. Lite web app layer (added after first push)

Evolved from pure link-in-bio to a "lite web app" while keeping the fast home page.
Decision rationale: home (Topmate-style) = the front door / fallback that Instagram lands on;
deeper pages add credibility + Google SEO. "One app, two front doors" — IG → home,
Google → per-worksheet page. Both share one checkout/brand.

Added:
- **Top nav** (`.topnav`) on home, play, shop, detail — logo + Shop / Play / Search.
- **Cover images**: `public/cover.js` (client `window.coverSVG`) + `api/_lib/cover.js`
  (server ESM `coverSVG`) — KEEP IN SYNC. Generates an SVG worksheet "cover" from metadata
  so every card looks like a real product (logo, emoji, title, age, price pill). Used in cards
  and inlined into detail pages (no PDF rasterization needed → Vercel-safe, no `sharp`).
- **Shared catalog + card renderer**: `public/products.js` (`window.PRODUCTS`, `window.cardHTML`,
  `tint`, `escHtml`). Used by both home (`app.js`) and shop (`shop.js`).
- **Shop page**: `public/shop.html` + `shop.js` — merges live uploads + curated, with
  **search** + **category filter**. Uploaded cards link to detail pages; curated = "Coming soon".
- **Worksheet detail pages (SSR)**: `GET /worksheet/:id` in `api/index.js` returns full HTML
  with `<title>`, meta description, canonical, OpenGraph, **JSON-LD Product schema**, inline
  cover SVG, feature list, price, and CTA (free→download, paid→"Message to buy" via IG DM).
  `vercel.json` rewrites `/worksheet/(.*)` → the function. Manifest now stores `pages` (content
  page count, set in `brand.js` return `{bytes, contentPages}`).
- Scripts are cache-busted with `?v=3`. Bump when editing client JS.

Verified locally: nav on all pages, cover cards on home + shop, search filtering,
SSR detail page (200 + title + JSON-LD + OG + inline cover + paid CTA), pages count stored.

Still NOT done: per-worksheet raster `og:image` (currently falls back to logo PNG — would need
`sharp` SVG→PNG; low priority). Buyer accounts / cart / payments still future.

## 10. For an AI continuing this work

- Owner is **non-technical** — keep things editable, explain plainly, avoid build complexity.
- Brand voice: warm, casual, "no fancy stuff, just what works." Mom-to-mom.
- Goal: **near-zero running cost.** Prefer free tiers.
- Run locally: `npm install && ADMIN_PASSWORD=bebo-admin npm run dev` → http://localhost:4400
  (admin at `/admin.html`). Storage falls back to `./data/` with no token set.
- When editing the storefront catalog: `PRODUCTS` in `public/app.js`. Activities: `ACTIVITIES`
  in `public/play.js`. Neither needs the backend.
