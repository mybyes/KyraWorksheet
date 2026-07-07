/* Bebo Beginnings — layered product landing page
   Research-backed structure: hero → problem → included → preview → skills →
   curriculum journey → compare → bonuses → how-it-works → FAQ → CTA + sticky bar */
(function () {
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slug = new URLSearchParams(location.search).get("slug") || "bebo-beginnings";
  const pack = window.PACKS && window.PACKS[slug];
  const root = document.getElementById("packRoot");
  const buyUrl = "https://www.instagram.com/bebomoments/";
  const buyLabel = `💬 Message to buy — ₹${pack?.price || 499}`;

  if (!pack || !root) {
    if (root) root.innerHTML = `<p class="hint">Pack not found. <a href="shop.html">Back to shop</a></p>`;
    return;
  }

  const base = `worksheets/${pack.slug}/level-1/`;
  const previewLevel = pack.levels.find((l) => l.status === "preview" && l.samples) || null;
  const samples = previewLevel?.samples || [];
  const heroImg = base + (pack.heroSample || samples[0]?.file || "");

  document.title = `${pack.fullTitle} · bebomoments`;

  /* JSON-LD product schema */
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: pack.fullTitle,
    description: pack.pitch,
    brand: { "@type": "Brand", name: "bebomoments" },
    category: pack.category,
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
    <!-- LAYER 1 · HERO -->
    <section class="layer layer-hero reveal">
      <div class="layer-bg layer-bg-hero" aria-hidden="true"></div>
      <div class="layer-hero-grid">
        <div class="layer-hero-copy">
          <a class="backlink" href="shop.html">← Back to shop</a>
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
          <a class="btn pack-hero-cta" href="${buyUrl}" target="_blank" rel="noopener">${buyLabel}</a>
          <p class="hint">Instant PDF · print at home · DM @bebomoments</p>
        </div>
        <div class="layer-hero-visual">
          <div class="layer-float layer-float-a">👆 Level 1</div>
          <div class="layer-float layer-float-b">16 levels</div>
          <button class="layer-hero-frame" id="heroPreview" type="button" aria-label="Open worksheet preview">
            <img src="${esc(heroImg)}" alt="Rainbow Road Adventure worksheet preview">
            <span class="layer-hero-zoom">Tap to preview ↗</span>
          </button>
        </div>
      </div>
    </section>

    <!-- LAYER 2 · PROBLEM -->
    <section class="layer layer-problem reveal">
      <div class="layer-problem-in">
        <h2>${esc(pack.problem.headline)}</h2>
        <p>${esc(pack.problem.sub)}</p>
        <ul class="layer-pain-list">
          ${pack.problem.pains.map((p) => `<li>${esc(p)}</li>`).join("")}
        </ul>
      </div>
    </section>

    <!-- LAYER 3 · WHAT'S INCLUDED -->
    <section class="layer layer-included reveal">
      <div class="sec-title"><h2>📦 What's inside the pack</h2><span class="ln"></span></div>
      <div class="layer-stat-grid">
        ${pack.included.map((i) => `
          <article class="layer-stat">
            <div class="layer-stat-n">${esc(i.n)}</div>
            <strong>${esc(i.label)}</strong>
            <span>${esc(i.sub)}</span>
          </article>`).join("")}
      </div>
    </section>

    ${previewLevel ? `
    <!-- LAYER 4 · INTERACTIVE PREVIEW STUDIO -->
    <section class="layer layer-preview reveal" id="preview">
      <div class="sec-title"><h2>👀 Preview the worksheets</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">Level ${previewLevel.n}: ${esc(previewLevel.title)} — ${samples.length} sample pages. Tap any page to zoom.</p>

      <div class="layer-studio">
        <div class="layer-studio-main">
          <img id="studioMain" src="${base}${esc(samples[0].file)}" alt="${esc(samples[0].title)}">
          <div class="layer-studio-cap" id="studioCap">
            <strong id="studioTitle">${esc(samples[0].title)}</strong>
            <span id="studioPrompt">${esc(samples[0].prompt)}</span>
            <em id="studioSkill">${esc(samples[0].skill || "")}</em>
          </div>
        </div>
        <div class="layer-studio-rail" role="tablist" aria-label="Worksheet previews">
          ${samples.map((s, i) => `
            <button class="layer-thumb${i === 0 ? " on" : ""}" type="button" role="tab"
              data-i="${i}" data-src="${base}${esc(s.file)}"
              data-title="${esc(s.title)}" data-prompt="${esc(s.prompt)}"
              data-skill="${esc(s.skill || "")}" aria-selected="${i === 0}">
              <img src="${base}${esc(s.file)}" alt="${esc(s.title)}">
            </button>`).join("")}
        </div>
      </div>
      <p class="layer-preview-note">These are real pages from Level 1. The full pack has 16 levels + bonus certificates & parent guide.</p>
    </section>` : ""}

    <!-- LAYER 5 · SKILLS BENTO -->
    <section class="layer layer-skills reveal">
      <div class="sec-title"><h2>🎯 Skills kids actually build</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">All through tracing — but it never feels like "school work."</p>
      <div class="layer-skill-grid">
        ${pack.skills.map((s) => `
          <article class="layer-skill">
            <span class="layer-skill-emoji">${s.emoji}</span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </article>`).join("")}
      </div>
    </section>

    <!-- LAYER 6 · 16-LEVEL JOURNEY -->
    <section class="layer layer-journey reveal" id="levels">
      <div class="sec-title"><h2>📚 16-level learning journey</h2><span class="ln"></span></div>
      <p class="pack-sec-sub">Every page tells a mini story — not "trace the line."</p>
      <div class="layer-timeline">
        ${pack.levels.map((l) => `
          <article class="layer-step${l.status === "preview" ? " live" : ""}">
            <div class="layer-step-dot">${l.emoji}</div>
            <div class="layer-step-body">
              <div class="layer-step-head">
                <h3>Level ${l.n} · ${esc(l.title)}</h3>
                <span class="pack-lvl-badge ${l.status === "preview" ? "live" : "soon"}">${l.status === "preview" ? "Preview ready" : "Coming soon"}</span>
              </div>
              <p>${esc(l.blurb)}</p>
              <span class="layer-step-pages">${l.pages} pages</span>
            </div>
          </article>`).join("")}
      </div>
    </section>

    <!-- LAYER 7 · COMPARE -->
    <section class="layer layer-compare reveal">
      <div class="sec-title"><h2>💎 Why parents choose this</h2><span class="ln"></span></div>
      <div class="layer-compare-grid">
        <div class="layer-compare-col bad">
          <h3>Free printables</h3>
          <ul>${pack.compare.free.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
        <div class="layer-compare-col good">
          <h3>Bebo Beginnings™</h3>
          <ul>${pack.compare.ours.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>

    <!-- LAYER 8 · BONUSES -->
    <section class="layer layer-bonuses reveal">
      <div class="sec-title"><h2>🎁 Bonus premium pages</h2><span class="ln"></span></div>
      <ul class="pack-bonus">${pack.bonuses.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    </section>

    <!-- LAYER 9 · HOW IT WORKS -->
    <section class="layer layer-how reveal">
      <div class="sec-title"><h2>🖨️ How it works</h2><span class="ln"></span></div>
      <div class="layer-how-grid">
        ${pack.howItWorks.map((h, i) => `
          <article class="layer-how-card">
            <span class="layer-how-n">${i + 1}</span>
            <div class="layer-how-emoji">${h.emoji}</div>
            <h3>${esc(h.title)}</h3>
            <p>${esc(h.text)}</p>
          </article>`).join("")}
      </div>
    </section>

    <!-- LAYER 10 · FAQ -->
    <section class="layer layer-faq reveal" id="faq">
      <div class="sec-title"><h2>❓ Questions parents ask</h2><span class="ln"></span></div>
      <div class="layer-faq-list">
        ${pack.faqs.map((f, i) => `
          <details class="layer-faq"${i === 0 ? " open" : ""}>
            <summary>${esc(f.q)}</summary>
            <p>${esc(f.a)}</p>
          </details>`).join("")}
      </div>
    </section>

    <!-- LAYER 11 · FINAL CTA -->
    <section class="layer layer-final reveal">
      <div class="pack-cta">
        <h2>Ready to start the adventure?</h2>
        <p>Screen-free · mom-made · print at home · not for resale</p>
        <a class="btn pack-final-cta" href="${buyUrl}" target="_blank" rel="noopener">Get the full pack — ₹${pack.price}</a>
        <p class="hint" style="color:rgba(255,255,255,.85)">Or try the <a href="index.html" style="color:#FFE082;font-weight:700">free Starter Pack</a> first</p>
      </div>
      <footer class="foot">
        <p>Made with 💛 for tired-but-trying toddler parents.</p>
        <p>© ${new Date().getFullYear()} bebomoments · @bebomoments</p>
      </footer>
    </section>`;

  /* ---------- interactions ---------- */
  const sticky = document.getElementById("packSticky");
  const stickyTitle = document.getElementById("stickyTitle");
  const stickyPrice = document.getElementById("stickyPrice");
  const stickyCta = document.getElementById("stickyCta");
  if (sticky) {
    sticky.hidden = false;
    stickyTitle.textContent = pack.brand;
    stickyPrice.textContent = `₹${pack.price}`;
    stickyCta.href = buyUrl;
    stickyCta.textContent = `Get pack · ₹${pack.price}`;
  }

  /* scroll reveal layers */
  const reveals = root.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => io.observe(el));

  /* preview studio */
  const studioMain = document.getElementById("studioMain");
  const studioTitle = document.getElementById("studioTitle");
  const studioPrompt = document.getElementById("studioPrompt");
  const studioSkill = document.getElementById("studioSkill");
  const thumbs = root.querySelectorAll(".layer-thumb");
  let activeIdx = 0;

  function setStudio(btn) {
    activeIdx = Number(btn.dataset.i);
    studioMain.src = btn.dataset.src;
    studioMain.alt = btn.dataset.title;
    studioTitle.textContent = btn.dataset.title;
    studioPrompt.textContent = btn.dataset.prompt;
    studioSkill.textContent = btn.dataset.skill || "";
    thumbs.forEach((t) => {
      const on = t === btn;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on);
    });
  }
  thumbs.forEach((t) => t.addEventListener("click", () => setStudio(t)));

  /* lightbox */
  const lb = document.getElementById("packLightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  function openLb(idx) {
    if (!samples.length || !lb) return;
    activeIdx = (idx + samples.length) % samples.length;
    const s = samples[activeIdx];
    lbImg.src = base + s.file;
    lbImg.alt = s.title;
    lbCap.innerHTML = `<strong>${esc(s.title)}</strong><span>${esc(s.prompt)}</span>`;
    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
  }
  function closeLb() {
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
  }

  studioMain?.addEventListener("click", () => openLb(activeIdx));
  document.getElementById("heroPreview")?.addEventListener("click", () => openLb(0));
  lbClose?.addEventListener("click", closeLb);
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  lbPrev?.addEventListener("click", () => openLb(activeIdx - 1));
  lbNext?.addEventListener("click", () => openLb(activeIdx + 1));
  document.addEventListener("keydown", (e) => {
    if (lb?.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(activeIdx - 1);
    if (e.key === "ArrowRight") openLb(activeIdx + 1);
  });

  /* show sticky after hero scroll */
  const hero = root.querySelector(".layer-hero");
  if (hero && sticky) {
    const stickyIo = new IntersectionObserver(([e]) => {
      sticky.classList.toggle("show", !e.isIntersecting);
    }, { threshold: 0 });
    stickyIo.observe(hero);
  }
})();
