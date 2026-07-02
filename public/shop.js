/* Shop page — merges live uploads + curated catalog, with search + category filter.
   Reuses cover.js (coverSVG), products.js (PRODUCTS, cardHTML) and the email modal. */

const FORMSPREE_URL = "";
let ALL = [];                 // normalized list
let activeCat = "All";

const gridEl = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const qEl = document.getElementById("q");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");

/* normalize curated + uploaded into one shape */
function normalize(uploaded) {
  const up = (uploaded || []).map(w => ({ ...w, cat: w.category || "Worksheets" }));
  const curated = window.PRODUCTS.map(p => ({ ...p }));
  return [...up, ...curated]; // uploaded (real) first
}

function categories() {
  return ["All", ...Array.from(new Set(ALL.map(x => x.cat)))];
}

function renderFilters() {
  filtersEl.innerHTML = categories()
    .map(c => `<button class="chip${c === activeCat ? " active" : ""}" data-cat="${c}">${c}</button>`).join("");
}

function render() {
  const q = qEl.value.trim().toLowerCase();
  let list = ALL.filter(x => activeCat === "All" || x.cat === activeCat);
  if (q) list = list.filter(x =>
    [x.title, x.meta, x.cat, x.age].filter(Boolean).join(" ").toLowerCase().includes(q));

  gridEl.innerHTML = list.map(window.cardHTML).join("");
  emptyEl.style.display = list.length ? "none" : "block";
  countEl.textContent = `${list.length} worksheet${list.length === 1 ? "" : "s"}` +
    (q ? ` for "${qEl.value.trim()}"` : "");
}

async function init() {
  let uploaded = [];
  try {
    const r = await fetch("/api/worksheets");
    if (r.ok) uploaded = (await r.json()).worksheets || [];
  } catch { /* offline / static */ }
  ALL = normalize(uploaded);
  renderFilters();
  render();
  if (location.hash === "#search") qEl.focus();
}

/* search + filter events */
qEl.addEventListener("input", render);
document.body.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  const fb = e.target.closest("[data-free]");
  const pd = e.target.closest("[data-paid]");
  if (chip) { activeCat = chip.dataset.cat; renderFilters(); render(); }
  else if (fb) { e.preventDefault(); openModal({ file: fb.dataset.file, name: fb.dataset.name, free: true }); }
  else if (pd) { e.preventDefault(); openModal({ file: pd.dataset.file, name: pd.dataset.name, free: false }); }
});

/* ---- email modal (same as home) ---- */
const modalBg = document.getElementById("modalBg");
const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
let pending = null;
function openModal(data) {
  pending = data;
  document.getElementById("modalEm").textContent = data.free ? "🎁" : "💌";
  document.getElementById("modalTitle").textContent = data.free ? "Where should I send it?" : "Almost yours!";
  document.getElementById("modalSub").textContent = data.free
    ? `Pop in your email and "${data.name}" is yours.`
    : `Enter your email to get "${data.name}". I'll send the link + payment details.`;
  document.getElementById("modalBtn").textContent = data.free ? "Send me the worksheet" : "Notify me";
  modalBg.classList.add("show");
  setTimeout(() => emailInput.focus(), 80);
}
function closeModal() { modalBg.classList.remove("show"); pending = null; }
document.getElementById("modalX").onclick = closeModal;
modalBg.addEventListener("click", e => { if (e.target === modalBg) closeModal(); });
emailForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;
  try {
    const s = JSON.parse(localStorage.getItem("bebo_subs") || "[]");
    s.push({ email, item: pending?.name || "", at: new Date().toISOString() });
    localStorage.setItem("bebo_subs", JSON.stringify(s));
  } catch (_) {}
  if (FORMSPREE_URL) fetch(FORMSPREE_URL, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ email, item: pending?.name || "" }) }).catch(() => {});
  const data = pending; closeModal(); emailInput.value = "";
  if (data.free && data.file) {
    if (data.file.toLowerCase().endsWith(".pdf")) {
      const a = document.createElement("a");
      a.href = data.file;
      a.download = (data.name || "worksheet").replace(/\s+/g, "-").toLowerCase() + ".pdf";
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      window.open(data.file, "_blank");
    }
  } else alert("Thank you! 💛 I'll email you the worksheet & details shortly.");
});

init();
