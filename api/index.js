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
    let branded, pages;
    try {
      const result = await brandPdf(req.file.buffer, meta);
      branded = Buffer.from(result);
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

export default app;
