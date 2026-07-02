/* One-time asset generator — logo.png + free-starter-pack.pdf from source files. */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";
import puppeteer from "puppeteer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const assetsDir = path.join(publicDir, "assets");
const worksheetsDir = path.join(publicDir, "worksheets");

function generateLogoPng() {
  const svg = readFileSync(path.join(assetsDir, "logo.svg"), "utf8");
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 720 },
    background: "rgba(0,0,0,0)",
  }).render().asPng();
  writeFileSync(path.join(assetsDir, "logo.png"), png);
  console.log("✓ public/assets/logo.png");
}

async function generateStarterPackPdf() {
  const htmlPath = path.join(worksheetsDir, "free-starter-pack.html");
  const pdfPath = path.join(worksheetsDir, "free-starter-pack.pdf");
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    console.log("✓ public/worksheets/free-starter-pack.pdf");
  } finally {
    await browser.close();
  }
}

generateLogoPng();
await generateStarterPackPdf();
