/* Minimal single-password admin auth.
   Login returns a token = sha256(password + secret). Protected routes require it.
   Set ADMIN_PASSWORD (and ideally ADMIN_SECRET) in env. */

import crypto from "crypto";

const PASSWORD = process.env.ADMIN_PASSWORD || "bebo-admin"; // CHANGE in production!
const SECRET = process.env.ADMIN_SECRET || "bebomoments-secret-change-me";

export function makeToken() {
  return crypto.createHash("sha256").update(PASSWORD + SECRET).digest("hex");
}

export function checkPassword(pw) {
  if (!pw) return false;
  // constant-time-ish compare
  const a = Buffer.from(String(pw));
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkToken(token) {
  return token && token === makeToken();
}

export function requireAdmin(req, res, next) {
  const hdr = req.headers["authorization"] || "";
  const token = hdr.replace(/^Bearer\s+/i, "");
  if (!checkToken(token)) {
    res.status(401).json({ error: "Not authorized. Please log in again." });
    return;
  }
  next();
}
