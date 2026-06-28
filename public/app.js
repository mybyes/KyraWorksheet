/* bebomoments storefront — curated catalog + LIVE admin-uploaded worksheets.
   Static catalog lives in PRODUCTS; uploaded ones come from /api/worksheets. */

const FORMSPREE_URL = ""; // paste your formspree URL to collect emails

const PRODUCTS = [
  { emoji:"✏️", title:"Prewriting & Tracing Pack", age:"Ages 2.5–4", cat:"Prewriting",
    meta:"20 pages of lines, curves & first letters", price:49, was:99, tag:"BESTSELLER" },
  { emoji:"🔢", title:"Count & Color 1–10", age:"Ages 3–5", cat:"Maths",
    meta:"Number recognition + one-to-one counting", price:39, was:99 },
  { emoji:"🐾", title:"Animals Activity Bundle", age:"Ages 2.5+", cat:"Themes",
    meta:"Match, sort, sounds & flashcards", price:49, was:99 },
  { emoji:"🍎", title:"Fruits & Veggies Worksheets", age:"Ages 2–5", cat:"Themes",
    meta:"Puzzles, posters & do-a-dot pages", price:39, was:99 },
  { emoji:"✂️", title:"Scissor Skills · Cutting Practice", age:"Ages 3–5", cat:"Fine Motor",
    meta:"Easy-to-hard cutting strips", price:29, was:99 },
  { emoji:"🌙", title:"Calm-Down & Routine Cards", age:"Ages 1.5–5", cat:"Routines",
    meta:"Morning, bedtime & big-feelings cards", price:39, was:149 },
  { emoji:"🧩", title:"Logical Thinking Workbook", age:"Ages 3–6", cat:"Maths",
    meta:"Patterns, odd-one-out & sorting", price:59, was:199 },
  { emoji:"🎉", title:"MEGA All-in-One Bundle", age:"Ages 2–6", cat:"Bundles",
    meta:"Everything above + bonus packs", price:249, was:899, tag:"BEST VALUE" },
];

const tintMap = { Free:"#E8F5E9", Prewriting:"#FFF3E0", Maths:"#E3F2FD", Themes:"#FCE4EC",
  "Fine Motor":"#F3E5F5", Routines:"#FFF8E1", Bundles:"#FFEBE3" };
const tint = (c) => tintMap[c] || "#FFF3E8";

/* ---------- LIVE uploaded worksheets ---------- */
async function loadFresh() {
  try {
    const r = await fetch("/api/worksheets");
    if (!r.ok) return;
    const { worksheets } = await r.json();
    if (!worksheets || !worksheets.length) return;
    const sec = document.getElementById("freshSec");
    const grid = document.getElementById("fresh");
    grid.innerHTML = worksheets.map(freshCard).join("");
    sec.style.display = "block";
  } catch { /* API not running (e.g. opened as static file) — silently skip */ }
}

function freshCard(w) {
  const badge = w.tag ? `<span class="badge">${esc(w.tag)}</span>` : `<span class="badge">NEW</span>`;
  const price = w.price ? `<span class="price">₹${w.price}${w.was?`<span class="was">₹${w.was}</span>`:""}</span>`
                        : `<span class="price free">FREE</span>`;
  const btn = w.free
    ? `<button class="p-btn" data-free data-file="${esc(w.file)}" data-name="${esc(w.title)}">⬇️ Get free</button>`
    : `<button class="p-btn" data-paid data-file="${esc(w.file)}" data-name="${esc(w.title)}">Get it</button>`;
  return `<article class="product">
      <div class="thumb" style="background:${tint(w.category)}">${badge}${esc(w.emoji||"📄")}</div>
      <div class="p-body">
        <span class="p-age">${esc(w.age||"")}</span>
        <h3 class="p-title">${esc(w.title)}</h3>
        <p class="p-meta">${esc(w.meta||"Printable worksheet")}</p>
        <div class="p-foot">${price}${btn}</div>
      </div></article>`;
}

/* ---------- curated catalog ---------- */
const cats = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.cat)))];
const filtersEl = document.getElementById("filters");
const gridEl = document.getElementById("grid");
let activeCat = "All";

function renderFilters(){
  filtersEl.innerHTML = cats.map(c => `<button class="chip${c===activeCat?' active':''}" data-cat="${c}">${c}</button>`).join("");
}
function priceHtml(p){
  if (p.price === 0) return `<span class="price free">FREE</span>`;
  return `<span class="price">₹${p.price}${p.was?`<span class="was">₹${p.was}</span>`:""}</span>`;
}
function renderProducts(){
  const list = PRODUCTS.filter(p => activeCat==="All" || p.cat===activeCat);
  gridEl.innerHTML = list.map(p => `
    <article class="product">
      <div class="thumb" style="background:${tint(p.cat)}">${p.tag?`<span class="badge">${p.tag}</span>`:""}${p.emoji}</div>
      <div class="p-body">
        <span class="p-age">${p.age}</span>
        <h3 class="p-title">${p.title}</h3>
        <p class="p-meta">${p.meta}</p>
        <div class="p-foot">${priceHtml(p)}<button class="p-btn soon">Coming soon</button></div>
      </div></article>`).join("");
}

/* ---------- modal + download ---------- */
const modalBg = document.getElementById("modalBg");
const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
let pending = null;

function openModal(data){
  pending = data;
  document.getElementById("modalEm").textContent = data.free ? "🎁" : "💌";
  document.getElementById("modalTitle").textContent = data.free ? "Where should I send it?" : "Almost yours!";
  document.getElementById("modalSub").textContent = data.free
    ? `Pop in your email and "${data.name}" is yours.`
    : `Enter your email to get "${data.name}". I'll send the link + payment details.`;
  document.getElementById("modalBtn").textContent = data.free ? "Send me the worksheet" : "Notify me";
  modalBg.classList.add("show");
  setTimeout(()=>emailInput.focus(), 80);
}
function closeModal(){ modalBg.classList.remove("show"); pending=null; }
document.getElementById("modalX").onclick = closeModal;
modalBg.addEventListener("click", e => { if(e.target===modalBg) closeModal(); });

emailForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if(!email) return;
  saveEmail(email, pending);
  if (FORMSPREE_URL) sendToFormspree(email, pending);
  const data = pending; closeModal(); emailInput.value = "";
  if (data.free && data.file) deliver(data.file, data.name);
  else alert("Thank you! 💛 I'll email you the worksheet & details shortly.");
});

function deliver(file, name){
  if (file.toLowerCase().endsWith(".pdf") || file.includes("/api/") || file.includes("blob")){
    const a = document.createElement("a");
    a.href = file; a.download = (name||"bebomoments-worksheet").replace(/\s+/g,"-").toLowerCase()+".pdf";
    a.target = "_blank"; document.body.appendChild(a); a.click(); a.remove();
  } else window.open(file, "_blank");
}
function saveEmail(email, data){
  try{ const s = JSON.parse(localStorage.getItem("bebo_subs")||"[]");
    s.push({email, item:data?.name||"", at:new Date().toISOString()});
    localStorage.setItem("bebo_subs", JSON.stringify(s)); }catch(_){}
}
function sendToFormspree(email, data){
  fetch(FORMSPREE_URL, { method:"POST", headers:{"Accept":"application/json","Content-Type":"application/json"},
    body: JSON.stringify({email, item:data?.name||"", source:"bebomoments site"}) }).catch(()=>{});
}

const esc = (s) => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- events ---------- */
document.body.addEventListener("click", e => {
  const fb = e.target.closest("[data-free]");
  const pd = e.target.closest("[data-paid]");
  const chip = e.target.closest(".chip");
  const shopLink = e.target.closest("#shopLink");
  if (shopLink){
    e.preventDefault();
    const fresh = document.getElementById("freshSec");
    const target = (fresh && fresh.style.display !== "none") ? fresh : document.getElementById("shop");
    target.scrollIntoView({ behavior:"smooth", block:"start" });
    return;
  }
  if (fb){ openModal({ file:fb.dataset.file, name:fb.dataset.name, free:true }); }
  else if (pd){ openModal({ file:pd.dataset.file, name:pd.dataset.name, free:false }); }
  else if (chip){ activeCat = chip.dataset.cat; renderFilters(); renderProducts(); }
});

/* ---------- init ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
renderFilters();
renderProducts();
loadFresh();
