/* Auto-branding for uploaded worksheets — turns any PDF into a bebomoments product:
   1. A branded COVER page (logo, title, age, tagline)
   2. A FOOTER on every content page (small logo + "© bebomoments · not for resale" + page #)
   3. Real PDF BOOKMARKS (outline) so it opens like a polished product
*/

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PDFDocument, rgb, StandardFonts, PDFName, PDFHexString, PDFArray, PDFNumber,
} from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "..", "..", "public", "assets", "logo.png");

const PEACH = rgb(1, 0.541, 0.396);   // #FF8A65
const CORAL = rgb(0.957, 0.318, 0.118); // #F4511E
const INK = rgb(0.306, 0.267, 0.235);   // #4E443C
const MUTED = rgb(0.612, 0.557, 0.494); // #9C8E7E
const CREAM = rgb(1, 0.973, 0.941);     // #FFF8F0

export async function brandPdf(inputBytes, meta = {}) {
  const src = await PDFDocument.load(inputBytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();

  out.setTitle(meta.title || "bebomoments worksheet");
  out.setAuthor("bebomoments");
  out.setCreator("bebomoments · simple play, no fancy stuff");
  out.setSubject(`Toddler activity worksheet${meta.age ? " · " + meta.age : ""}`);
  out.setKeywords(["toddler", "worksheet", "printable", "bebomoments", meta.category || ""]);

  const helv = await out.embedFont(StandardFonts.Helvetica);
  const helvB = await out.embedFont(StandardFonts.HelveticaBold);
  const logoPng = await out.embedPng(await fs.readFile(LOGO_PATH));

  // copy original pages first to learn the page size
  const copied = await out.copyPages(src, src.getPageIndices());
  const first = copied[0];
  const W = first ? first.getWidth() : 595.28;   // default A4 portrait
  const H = first ? first.getHeight() : 841.89;

  /* ---------- 1) COVER PAGE ---------- */
  const cover = out.insertPage(0, [W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
  // top color band
  cover.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: PEACH });
  cover.drawRectangle({ x: 0, y: 0, width: W, height: 10, color: PEACH });

  // logo centered
  const logoW = Math.min(W * 0.6, 320);
  const logoH = (logoPng.height / logoPng.width) * logoW;
  cover.drawImage(logoPng, { x: (W - logoW) / 2, y: H * 0.66, width: logoW, height: logoH });

  // title
  const title = meta.title || "Toddler Worksheet";
  drawCentered(cover, title, helvB, 26, INK, H * 0.5, W);
  if (meta.age) drawCentered(cover, meta.age, helv, 14, MUTED, H * 0.5 - 26, W);

  // pill
  const pillText = "Printable · Screen-free · bebomoments";
  const pw = helv.widthOfTextAtSize(pillText, 11) + 26;
  cover.drawRectangle({ x: (W - pw) / 2, y: H * 0.4, width: pw, height: 26, color: PEACH, opacity: 0.18 });
  drawCentered(cover, pillText, helvB, 11, CORAL, H * 0.4 + 8, W);

  // footer note
  drawCentered(cover, "Made with love by a mum, for mums  ·  @bebomoments", helv, 10, MUTED, 40, W);

  /* ---------- 2) CONTENT PAGES + FOOTER ---------- */
  copied.forEach((p) => {
    out.addPage(p);
    const pw2 = p.getWidth();
    // subtle footer strip
    const small = 16;
    const sw = (logoPng.width / logoPng.height) * small;
    p.drawImage(logoPng, { x: 24, y: 16, width: sw, height: small, opacity: 0.55 });
    p.drawText("© bebomoments · personal & classroom use · not for resale", {
      x: 24 + sw + 8, y: 21, size: 7.5, font: helv, color: MUTED, opacity: 0.9,
    });
  });

  // page numbers (cover excluded)
  const pages = out.getPages();
  for (let i = 1; i < pages.length; i++) {
    const p = pages[i];
    const label = `${i} / ${pages.length - 1}`;
    const lw = helv.widthOfTextAtSize(label, 7.5);
    p.drawText(label, { x: p.getWidth() - 24 - lw, y: 21, size: 7.5, font: helv, color: MUTED });
  }

  /* ---------- 3) BOOKMARKS / OUTLINE ---------- */
  try {
    addOutline(out, buildBookmarks(meta, pages.length));
  } catch {
    /* outline is a nice-to-have; never block the upload */
  }

  const bytes = await out.save();
  return { bytes, contentPages: pages.length - 1 }; // minus the cover
}

function drawCentered(page, text, font, size, color, y, W) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (W - w) / 2, y, size, font, color });
}

function buildBookmarks(meta, totalPages) {
  // Cover + a few sensible jump points across the activity pages.
  const items = [{ title: `📘 ${meta.title || "Worksheet"} — Cover`, pageIndex: 0 }];
  const contentCount = totalPages - 1;
  if (contentCount >= 1) items.push({ title: "Activity pages", pageIndex: 1 });
  if (contentCount >= 4) items.push({ title: "Middle", pageIndex: 1 + Math.floor(contentCount / 2) });
  if (contentCount >= 2) items.push({ title: "Last page", pageIndex: totalPages - 1 });
  return items;
}

/* Low-level PDF outline using pdf-lib's context. */
function addOutline(doc, items) {
  if (!items.length) return;
  const ctx = doc.context;
  const pages = doc.getPages();
  const outlinesRef = ctx.nextRef();
  const itemRefs = items.map(() => ctx.nextRef());

  items.forEach((it, i) => {
    const page = pages[Math.min(it.pageIndex, pages.length - 1)];
    const dest = PDFArray.withContext(ctx);
    dest.push(page.ref);
    dest.push(PDFName.of("XYZ"));
    dest.push(PDFName.of("null"));
    dest.push(PDFNumber.of(page.getHeight()));
    dest.push(PDFNumber.of(0));

    const dict = ctx.obj({
      Title: PDFHexString.fromText(it.title),
      Parent: outlinesRef,
      Dest: dest,
    });
    if (i > 0) dict.set(PDFName.of("Prev"), itemRefs[i - 1]);
    if (i < items.length - 1) dict.set(PDFName.of("Next"), itemRefs[i + 1]);
    ctx.assign(itemRefs[i], dict);
  });

  const outlines = ctx.obj({
    Type: "Outlines",
    First: itemRefs[0],
    Last: itemRefs[itemRefs.length - 1],
    Count: items.length,
  });
  ctx.assign(outlinesRef, outlines);
  doc.catalog.set(PDFName.of("Outlines"), outlinesRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}
