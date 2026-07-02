/* Pack landing page — reads ?slug= from URL and renders from window.PACKS */
(function () {
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slug = new URLSearchParams(location.search).get("slug") || "bebo-beginnings";
  const pack = window.PACKS && window.PACKS[slug];
  const root = document.getElementById("packRoot");
  if (!pack || !root) {
    if (root) root.innerHTML = `<p class="hint">Pack not found. <a href="shop.html">Back to shop</a></p>`;
    return;
  }

  const base = `worksheets/${pack.slug}/level-1/`;
  const previewLevel = pack.levels.find((l) => l.status === "preview" && l.samples);
  const sampleGrid = previewLevel
    ? previewLevel.samples.map((s) => `
      <figure class="pack-sample">
        <img src="${base}${esc(s.file)}" alt="${esc(s.title)}" loading="lazy">
        <figcaption>
          <strong>${esc(s.title)}</strong>
          <span>${esc(s.prompt)}</span>
        </figcaption>
      </figure>`).join("")
    : "";

  const levelCards = pack.levels.map((l) => {
    const badge = l.status === "preview"
      ? `<span class="pack-lvl-badge live">Preview ready</span>`
      : `<span class="pack-lvl-badge soon">Coming soon</span>`;
    return `<article class="pack-level${l.status === "preview" ? " live" : ""}">
      <div class="pack-lvl-num">${l.emoji} Level ${l.n}</div>
      <h3>${esc(l.title)}</h3>
      <p>${esc(l.blurb)}</p>
      <div class="pack-lvl-meta">${l.pages} pages ${badge}</div>
    </article>`;
  }).join("");

  document.title = `${pack.fullTitle} · bebomoments`;
  root.innerHTML = `
    <a class="backlink" href="shop.html">← Back to shop</a>

    <header class="pack-hero">
      <span class="pack-tag">${esc(pack.tag)} · ${esc(pack.category)}</span>
      <h1>${esc(pack.brand)}</h1>
      <p class="pack-subtitle">${esc(pack.title)}</p>
      <p class="pack-pitch">${esc(pack.pitch)}</p>
      <div class="pack-meta-row">
        <span>👶 ${esc(pack.age)}</span>
        <span>📄 ${esc(pack.pages)}</span>
        <span class="pack-price">₹${pack.price} <s>₹${pack.was}</s></span>
      </div>
      <blockquote class="pack-usp">"${esc(pack.usp)}"</blockquote>
      <a class="btn" href="https://www.instagram.com/bebomoments/" target="_blank" rel="noopener">💬 Message to buy — ₹${pack.price}</a>
      <p class="hint">DM @bebomoments on Instagram · UPI / payment details sent there</p>
    </header>

    <section class="pack-sec">
      <div class="sec-title"><h2>🎯 What kids actually build</h2><span class="ln"></span></div>
      <div class="pack-chips">${pack.skills.map((s) => `<span class="chip on">${esc(s)}</span>`).join("")}</div>
    </section>

    ${previewLevel ? `
    <section class="pack-sec" id="preview">
      <div class="sec-title"><h2>👆 Level ${previewLevel.n}: ${esc(previewLevel.title)}</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">${esc(previewLevel.blurb)} · ${previewLevel.samples.length} sample pages below</p>
      <div class="pack-samples">${sampleGrid}</div>
    </section>` : ""}

    <section class="pack-sec">
      <div class="sec-title"><h2>📚 16-level learning system</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">Every page tells a mini story — not "trace the line."</p>
      <div class="pack-levels">${levelCards}</div>
    </section>

    <section class="pack-sec">
      <div class="sec-title"><h2>🎁 Bonus premium pages</h2><span class="ln"></span></div>
      <ul class="pack-bonus">${pack.bonuses.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    </section>

    <section class="pack-cta">
      <h2>Ready to start the adventure?</h2>
      <p>Print at home · screen-free · mom-made · not for resale</p>
      <a class="btn" href="https://www.instagram.com/bebomoments/" target="_blank" rel="noopener">💬 Get the full pack — ₹${pack.price}</a>
    </section>

    <footer class="foot">
      <p>Made with 💛 for tired-but-trying toddler parents.</p>
      <p>© ${new Date().getFullYear()} bebomoments · For personal &amp; classroom use.</p>
    </footer>`;
})();
