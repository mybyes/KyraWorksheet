/* Local dev / self-host entry point.
   Serves the static site from /public, the API from /api, and (in local mode)
   uploaded files from /files. On Vercel this file is NOT used — vercel.json
   serves /public statically and routes /api/* to api/index.js. */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { app as api } from "./api/index.js";
import { LOCAL_FILES_DIR, isBlob } from "./api/_lib/store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4400;

const server = express();
server.use(api); // mounts /api/* routes
if (!isBlob) server.use("/files", express.static(LOCAL_FILES_DIR)); // local uploaded PDFs
server.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(`bebomoments running → http://localhost:${PORT}`);
  console.log(`storage mode: ${isBlob ? "Vercel Blob" : "local disk (./data)"}`);
});
