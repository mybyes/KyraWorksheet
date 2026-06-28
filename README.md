# bebomoments — live worksheet shop + admin upload 🧸

A toddler-activity worksheet shop with:

- 🛍️ **Storefront** (`/`) — link-in-bio shop, free Starter Pack, and a **live "Fresh worksheets"** row of everything you upload.
- 🎲 **Play Now** (`/play.html`) — the free no-prep activity finder.
- 🔐 **Admin panel** (`/admin.html`) — password-protected. Upload a PDF and it's **auto-branded** (cover page + your logo footer on every page + PDF bookmarks) and goes **live for everyone**.

Runs free on **Vercel** (static site + serverless API + Vercel Blob storage). Runs locally
on plain Node with disk storage — no accounts needed to develop.

---

## 🏃 Run it locally

```bash
npm install
ADMIN_PASSWORD=bebo-admin npm run dev
# → http://localhost:4400        (shop)
# → http://localhost:4400/admin  (admin, password: bebo-admin)
```

Locally, uploads are stored on disk in `./data/` (gitignored). On Vercel they go to
Vercel Blob automatically — same code, the storage adapter detects which to use.

---

## 🔐 How the admin upload works

1. Go to `/admin.html`, log in with your password.
2. Fill the title / age / price / etc., choose a **PDF**, hit **Brand & publish**.
3. The server:
   - adds a **branded cover page** (logo, title, age, tagline),
   - stamps a **logo + "© bebomoments · not for resale" footer + page number** on every page,
   - adds **PDF bookmarks** (outline) + document metadata,
   - stores it and adds it to the public **"Fresh worksheets"** row instantly.

> This is what makes each sheet a *marketable product* rather than a loose PDF.

To change the logo, replace `public/assets/logo.png` (and `logo.svg`).

---

## 🚀 Make it live on Vercel (free)

You need a free Vercel account. One-time setup:

```bash
npm i -g vercel        # install the CLI
cd bebomoments-live
vercel                 # log in + link the project (accept defaults)
```

**1. Add free Blob storage** (so uploads persist for everyone):
- Vercel dashboard → your project → **Storage** → **Create Database** → **Blob** → connect it.
- This auto-adds the `BLOB_READ_WRITE_TOKEN` env var. (Free tier: 1 GB.)

**2. Set your admin secrets** — project → **Settings → Environment Variables**:
- `ADMIN_PASSWORD` = a strong password
- `ADMIN_SECRET` = any long random string

**3. Ship it:**
```bash
vercel --prod
```

You'll get a live URL like `https://bebomoments.vercel.app`. Put it in your Instagram bio.
Add a custom domain later in project → **Domains** (free).

> ⚠️ **File size:** Vercel's Hobby plan caps a request body at ~4.5 MB, so uploaded PDFs
> should be under that. Most worksheet packs are fine; for very large bundles, split them
> or upgrade the plan (or switch to Blob client-upload — easy to add later).

### Prefer not to use Vercel?
This is a normal Express app (`server.js`). It also runs on Render, Fly, Railway, or any
VPS — just give it a **persistent disk** (so `./data/` survives restarts) or set
`BLOB_READ_WRITE_TOKEN` to use Blob there too.

---

## ✏️ Editing things (non-techy)

| Want to… | Do this |
|---|---|
| Add/remove worksheets | Use the **admin panel** — no code |
| Change the curated catalog cards | Edit `PRODUCTS` in `public/app.js` |
| Add activities to Play Now | Edit `ACTIVITIES` in `public/play.js` |
| Collect emails | Paste a Formspree URL into `FORMSPREE_URL` in `public/app.js` |
| Change colors/look | Edit `public/styles.css` |
| Change the logo | Replace `public/assets/logo.png` |

---

## 🗂️ Structure

```
public/        the website (static) — index, play, admin, styles, app.js, assets, worksheets
api/index.js   Express API (login, list, upload+brand, delete)
api/_lib/      store.js (disk⇄Blob), brand.js (PDF branding), auth.js (password)
server.js      local dev entry (serves public/ + api/ + /files)
vercel.json    routes /api/* to the function in production
data/          local uploads (gitignored; Blob is used in prod)
```

Made with 💛. Worksheets are for personal & classroom use — please don't resell.
