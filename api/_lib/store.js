/* Storage adapter.
   - Production (Vercel): uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
   - Local dev: falls back to ./data (files on disk + manifest.json).
   Same API either way: getManifest(), saveManifest(), putFile(), deleteFile(). */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILES_DIR = path.join(DATA_DIR, "files");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const MANIFEST_KEY = "manifest.json";

/* lazy import so local dev doesn't need the package resolved at runtime */
let blob = null;
async function getBlob() {
  if (!blob) blob = await import("@vercel/blob");
  return blob;
}

/* ---------- manifest ---------- */
export async function getManifest() {
  if (useBlob) {
    const { list } = await getBlob();
    const { blobs } = await list({ prefix: MANIFEST_KEY });
    const hit = blobs.find((b) => b.pathname === MANIFEST_KEY);
    if (!hit) return { worksheets: [] };
    const res = await fetch(hit.url, { cache: "no-store" });
    return res.ok ? res.json() : { worksheets: [] };
  }
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return { worksheets: [] };
  }
}

export async function saveManifest(manifest) {
  const json = JSON.stringify(manifest, null, 2);
  if (useBlob) {
    const { put } = await getBlob();
    await put(MANIFEST_KEY, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_PATH, json);
}

/* ---------- files ---------- */
// returns a public URL for the stored file
export async function putFile(key, buffer, contentType = "application/pdf") {
  if (useBlob) {
    const { put } = await getBlob();
    const { url } = await put(`worksheets/${key}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return url;
  }
  await fs.mkdir(FILES_DIR, { recursive: true });
  await fs.writeFile(path.join(FILES_DIR, key), buffer);
  return `/files/${key}`; // served by express static in local mode
}

export async function deleteFile(fileUrl) {
  try {
    if (useBlob) {
      const { del } = await getBlob();
      await del(fileUrl);
      return;
    }
    const name = fileUrl.replace(/^\/files\//, "");
    await fs.unlink(path.join(FILES_DIR, name));
  } catch {
    /* ignore missing */
  }
}

export const LOCAL_FILES_DIR = FILES_DIR;
export const isBlob = useBlob;
