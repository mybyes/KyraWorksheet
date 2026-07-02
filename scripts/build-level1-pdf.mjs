/* Build Level 1 sample PDF from PNG worksheets (for admin upload or direct sale). */
import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const levelDir = path.join(root, "public", "worksheets", "bebo-beginnings", "level-1");
const outPath = path.join(root, "public", "worksheets", "bebo-beginnings", "level-1-finger-warmup-samples.pdf");

const files = readdirSync(levelDir)
  .filter((f) => f.endsWith(".png"))
  .sort();

const pdf = await PDFDocument.create();
pdf.setTitle("Bebo Beginnings · Level 1 Finger Warm-up (Samples)");
pdf.setAuthor("bebomoments");
pdf.setSubject("Pre-writing finger tracing · Ages 2.5–4");

for (const file of files) {
  const bytes = readFileSync(path.join(levelDir, file));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const img = isJpeg ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
  const page = pdf.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
}

writeFileSync(outPath, await pdf.save());
console.log(`✓ ${outPath} (${files.length} pages)`);
