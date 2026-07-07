/* Bebo Beginnings — gated product page (banner only, no worksheet pages shown) */
(function () {
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slug = new URLSearchParams(location.search).get("slug") || "bebo-beginnings";
  const pack = window.PACKS && window.PACKS[slug];
  const root = document.getElementById("packRoot");
  const buyUrl = pack?.buyUrl || "https://www.instagram.com/bebomoments/";

  if (!pack || !root) {
    if (root) root.innerHTML = `<p class="hint">Pack not found. <a href="shop.html">Back to shop</a></p>`;
    return;
  }

  const cover = window.coverSVG({
    title: pack.title,
    age: pack.age,
    emoji: pack.emoji,
    price: pack.price,
    free: false,
  });

  document.title = `${pack.fullTitle} · bebomoments`;

  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: pack.fullTitle,
    description: pack.pitch,
    brand: { "@type": "Brand", name: "bebomoments" },
    offers: {
      "@type": "Offer",
      price: pack.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: location.href,
    },
  });
  document.head.appendChild(schema);

  root.innerHTML = `
    <section class="layer layer-hero reveal in">
      <div class="layer-bg layer-bg-hero" aria-hidden="true"></div>
      <a class="backlink" href="shop.html">← Back to shop</a>

      <div class="pack-gate-banner">
        <div class="pack-gate-cover">${cover}</div>
        <div class="pack-gate-lock">
          <span class="pack-gate-lock-icon">🔒</span>
          <p><strong>Full worksheets unlock after purchase</strong></p>
          <span>Preview pages are not shown online — you'll get the complete printable PDF by DM.</span>
        </div>
      </div>

      <header class="pack-gate-head">
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
      </header>

      <div class="pack-gate-actions">
        <a class="btn pack-dl-btn" href="${esc(buyUrl)}" target="_blank" rel="noopener" id="downloadBtn">
          ⬇️ Download full pack — ₹${pack.price}
        </a>
        <p class="pack-dl-note">${esc(pack.downloadNote)}</p>
        <a class="btn ghost pack-dm-btn" href="${esc(buyUrl)}" target="_blank" rel="noopener">💬 Message @bebomoments</a>
      </div>
    </section>

    <section class="layer layer-included reveal" id="included">
      <div class="sec-title"><h2>📦 What's inside</h2><span class="ln"></span></div>
      <div class="layer-stat-grid">
        ${pack.included.map((i) => `
          <article class="layer-stat">
            <div class="layer-stat-n">${esc(i.n)}</div>
            <strong>${esc(i.label)}</strong>
            <span>${esc(i.sub)}</span>
          </article>`).join("")}
      </div>
    </section>

    <section class="layer layer-journey reveal" id="levels">
      <div class="sec-title"><h2>📚 16-level system</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">Every level is a new adventure — worksheet pages included in your download, not shown here.</p>
      <div class="layer-timeline">
        ${pack.levels.map((l) => `
          <article class="layer-step">
            <div class="layer-step-dot">${l.emoji}</div>
            <div class="layer-step-body">
              <div class="layer-step-head">
                <h3>Level ${l.n} · ${esc(l.title)}</h3>
                <span class="pack-lvl-badge soon">${l.pages} pages</span>
              </div>
              <p>${esc(l.blurb)}</p>
            </div>
          </article>`).join("")}
      </div>
    </section>

    <section class="layer layer-faq reveal" id="faq">
      <div class="sec-title"><h2>❓ Before you download</h2><span class="ln"></span></div>
      <div class="layer-faq-list">
        ${pack.faqs.map((f, i) => `
          <details class="layer-faq"${i === 0 ? " open" : ""}>
            <summary>${esc(f.q)}</summary>
            <p>${esc(f.a)}</p>
          </details>`).join("")}
      </div>
    </section>

    <section class="layer layer-final reveal">
      <div class="pack-cta">
        <h2>Get the full printable pack</h2>
        <p>Instant PDF after payment · print at home · not for resale</p>
        <a class="btn pack-final-cta" href="${esc(buyUrl)}" target="_blank" rel="noopener">⬇️ Download — ₹${pack.price}</a>
        <p class="hint" style="color:rgba(255,255,255,.85)">New here? Try the <a href="index.html" style="color:#FFE082;font-weight:700">free Starter Pack</a> first</p>
      </div>
      <footer class="foot">
        <p>Made with 💛 for tired-but-trying toddler parents.</p>
        <p>© ${new Date().getFullYear()} bebomoments · @bebomoments</p>
      </footer>
    </section>`;

  const sticky = document.getElementById("packSticky");
  const stickyTitle = document.getElementById("stickyTitle");
  const stickyPrice = document.getElementById("stickyPrice");
  const stickyCta = document.getElementById("stickyCta");
  if (sticky) {
    sticky.hidden = false;
    stickyTitle.textContent = pack.brand;
    stickyPrice.textContent = `₹${pack.price}`;
    stickyCta.href = buyUrl;
    stickyCta.textContent = `Download · ₹${pack.price}`;
  }

  root.querySelectorAll(".reveal").forEach((el) => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add("in");
    }, { threshold: 0.1 }).observe(el);
  });

  const hero = root.querySelector(".layer-hero");
  if (hero && sticky) {
    new IntersectionObserver(([e]) => {
      sticky.classList.toggle("show", !e.isIntersecting);
    }).observe(hero);
  }
})();
