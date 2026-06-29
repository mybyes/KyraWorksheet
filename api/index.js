/* Express API — shared by local dev (server.js) and Vercel (catch-all function).
   Routes:
     POST   /api/login            { password } -> { token }
     GET    /api/worksheets       public list
     POST   /api/worksheets       [admin] multipart upload (file + fields) -> branded + stored
     DELETE /api/worksheets/:id   [admin] remove
*/

import express from "express";
import multer from "multer";
import crypto from "crypto";
import { getManifest, saveManifest, putFile, deleteFile } from "./_lib/store.js";
import { brandPdf } from "./_lib/brand.js";
import { checkPassword, makeToken, requireAdmin } from "./_lib/auth.js";
import { coverSVG } from "./_lib/cover.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const app = express();
app.use(express.json());

/* ---- auth ---- */
app.post("/api/login", (req, res) => {
  if (!checkPassword(req.body?.password))
    return res.status(401).json({ error: "Wrong password." });
  res.json({ token: makeToken() });
});

/* ---- public list ---- */
app.get("/api/worksheets", async (_req, res) => {
  try {
    const m = await getManifest();
    res.json({ worksheets: m.worksheets || [] });
  } catch (e) {
    res.status(500).json({ error: "Could not load worksheets." });
  }
});

/* ---- admin upload ---- */
app.post("/api/worksheets", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    if (req.file.mimetype !== "application/pdf" && !req.file.originalname.toLowerCase().endsWith(".pdf"))
      return res.status(400).json({ error: "Please upload a PDF." });

    const b = req.body || {};
    const meta = {
      title: (b.title || req.file.originalname.replace(/\.pdf$/i, "")).slice(0, 120),
      age: (b.age || "").slice(0, 40),
      category: (b.category || "Worksheets").slice(0, 40),
      emoji: (b.emoji || "📄").slice(0, 4),
      price: Number(b.price) || 0,
      was: b.was ? Number(b.was) : null,
      tag: (b.tag || "").slice(0, 24),
      meta: (b.meta || "").slice(0, 160),
    };

    // brand the PDF (cover + footer + bookmarks)
    let branded, contentPages = 0;
    try {
      const result = await brandPdf(req.file.buffer, meta);
      branded = Buffer.from(result.bytes);
      contentPages = result.contentPages;
    } catch (e) {
      return res.status(422).json({ error: "Couldn't process that PDF. Is it a valid, unlocked file?" });
    }

    const id = crypto.randomUUID();
    const url = await putFile(`${id}.pdf`, branded, "application/pdf");

    const manifest = await getManifest();
    manifest.worksheets = manifest.worksheets || [];
    const record = {
      id,
      ...meta,
      free: meta.price === 0,
      file: url,
      pages: contentPages,
      uploadedAt: new Date().toISOString(),
    };
    manifest.worksheets.unshift(record); // newest first
    await saveManifest(manifest);

    res.json({ ok: true, worksheet: record });
  } catch (e) {
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
});

/* ---- admin delete ---- */
app.delete("/api/worksheets/:id", requireAdmin, async (req, res) => {
  try {
    const manifest = await getManifest();
    const list = manifest.worksheets || [];
    const found = list.find((w) => w.id === req.params.id);
    if (!found) return res.status(404).json({ error: "Not found." });
    manifest.worksheets = list.filter((w) => w.id !== req.params.id);
    await saveManifest(manifest);
    await deleteFile(found.file);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Delete failed." });
  }
});

/* ---- server-rendered worksheet detail page (SEO-friendly, own URL) ---- */
const NAV = `
<nav class="topnav">
  <a class="topnav-brand" href="/"><img src="/assets/logo.png" alt="bebomoments"></a>
  <div class="topnav-links">
    <a href="/shop.html">🛍️ Shop</a>
    <a href="/play.html">🎲 Play</a>
    <a href="/shop.html#search">🔎 Search</a>
  </div>
</nav>`;

function esc(s){ return String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function detailHtml(w, origin){
  const priceLabel = w.free ? "Free" : `₹${w.price}` + (w.was ? ` <s>₹${w.was}</s>` : "");
  const pagesLine = w.pages ? `${w.pages} printable page${w.pages>1?"s":""}` : "Printable worksheet";
  const cta = w.free
    ? `<a class="btn" href="${esc(w.file)}" download>⬇️ Download free</a>`
    : `<a class="btn" href="https://www.instagram.com/bebomoments/" target="_blank" rel="noopener">💬 Message to buy — ₹${w.price}</a>`;
  const desc = `${w.title}${w.age ? " · " + w.age : ""} — ${w.meta || pagesLine} from bebomoments. Screen-free, printable, auto-branded.`;
  const url = `${origin}/worksheet/${w.id}`;
  const jsonld = {
    "@context":"https://schema.org","@type":"Product",
    name:w.title, description:w.meta||pagesLine, category:w.category,
    brand:{"@type":"Brand",name:"bebomoments"},
    offers:{"@type":"Offer",price:w.price||0,priceCurrency:"INR",availability:"https://schema.org/InStock",url}
  };
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(w.title)} · bebomoments</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="product"><meta property="og:title" content="${esc(w.title)} · bebomoments">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${origin}/assets/logo.png">
<meta name="theme-color" content="#FF7043">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${encodeURIComponent(w.emoji||"📄")}</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head><body>
${NAV}
<div class="wrap detail-wrap">
  <a class="backlink" href="/shop.html">← Back to shop</a>
  <div class="detail">
    <div class="detail-cover">${coverSVG(w)}</div>
    <div class="detail-info">
      <span class="p-age">${esc(w.category||"")}</span>
      <h1 class="detail-title">${esc(w.title)}</h1>
      ${w.age?`<p class="detail-age">👶 ${esc(w.age)}</p>`:""}
      <p class="detail-meta">${esc(w.meta||"")}</p>
      <ul class="detail-feats">
        <li>📄 ${esc(pagesLine)}</li>
        <li>🖨️ Print at home on plain A4</li>
        <li>📵 Screen-free · reusable</li>
        <li>💛 Branded by bebomoments</li>
      </ul>
      <div class="detail-price">${priceLabel}</div>
      ${cta}
      <p class="detail-note">For personal &amp; classroom use. Please don't resell.</p>
    </div>
  </div>
</div>
</body></html>`;
}

app.get("/worksheet/:id", async (req, res) => {
  try {
    const m = await getManifest();
    const w = (m.worksheets || []).find((x) => x.id === req.params.id);
    const origin = `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`;
    if (!w) {
      res.status(404).type("html").send(`<!doctype html><meta charset=utf-8><link rel=stylesheet href=/styles.css>${NAV}<div class="wrap" style="text-align:center;padding-top:40px"><h1>Worksheet not found 🙈</h1><p><a class="btn" href="/shop.html">Browse the shop</a></p></div>`);
      return;
    }
    res.type("html").send(detailHtml(w, origin));
  } catch (e) {
    res.status(500).type("html").send("Something went wrong.");
  }
});

export default app;
