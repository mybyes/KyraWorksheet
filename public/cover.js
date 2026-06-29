/* Shared cover-image generator (CLIENT version → window.coverSVG).
   Builds a worksheet "cover" as inline SVG so every card looks like a real
   product, even before a raster thumbnail exists.
   ⚠️ Keep in sync with api/_lib/cover.js (identical logic, ESM export). */
(function (global) {
  function escapeXml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function coverSVG(w) {
    w = w || {};
    const emoji = w.emoji || "📄";
    const age = w.age || "";
    const isFree = w.free || !w.price;
    const priceTxt = isFree ? "FREE" : "₹" + w.price;
    const accent = isFree ? "#2e7d32" : "#F4511E";
    const pillBg = isFree ? "#81C784" : "#FF7043";

    // wrap title to <=2 lines (~15 chars each)
    const words = String(w.title || "Worksheet").split(/\s+/);
    let lines = [], cur = "";
    for (const word of words) {
      if ((cur + " " + word).trim().length > 15) { if (cur) lines.push(cur); cur = word; }
      else cur = (cur + " " + word).trim();
    }
    if (cur) lines.push(cur);
    if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = lines[1].slice(0, 14) + "…"; }

    const lh = 34, top = 360 - (lines.length - 1) * (lh / 2);
    const titleSVG = lines.map((l, i) =>
      `<text x="210" y="${top + i * lh}" text-anchor="middle" font-size="29" font-weight="800" fill="#4E443C" font-family="'Baloo 2',cursive">${escapeXml(l)}</text>`
    ).join("");
    const ageY = top + (lines.length - 1) * lh + 30;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560" font-family="'Quicksand',system-ui,sans-serif" role="img" aria-label="${escapeXml(w.title || "Worksheet")} cover">
  <rect width="420" height="560" fill="#FFF8F0"/>
  <rect width="420" height="14" fill="#FF8A65"/><rect y="546" width="420" height="14" fill="#FF8A65"/>
  <image href="/assets/logo.png" x="105" y="42" width="210" height="58" preserveAspectRatio="xMidYMid meet"/>
  <text x="210" y="258" text-anchor="middle" font-size="128">${emoji}</text>
  ${titleSVG}
  ${age ? `<text x="210" y="${ageY}" text-anchor="middle" font-size="17" font-weight="600" fill="#9C8E7E">${escapeXml(age)}</text>` : ""}
  <rect x="150" y="462" width="120" height="40" rx="20" fill="${pillBg}" fill-opacity="0.18"/>
  <text x="210" y="489" text-anchor="middle" font-size="21" font-weight="800" fill="${accent}">${escapeXml(priceTxt)}</text>
  <text x="210" y="532" text-anchor="middle" font-size="12" font-weight="700" fill="#c2b4a2" letter-spacing="2">BEBOMOMENTS</text>
</svg>`;
  }
  global.coverSVG = coverSVG;
})(typeof window !== "undefined" ? window : globalThis);
