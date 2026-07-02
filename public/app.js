/* bebomoments home — curated catalog + LIVE admin-uploaded worksheets.
   Shares products.js (PRODUCTS, cardHTML) + cover.js (coverSVG). */

const FORMSPREE_URL = ""; // paste your formspree URL to collect emails

/* ---------- LIVE uploaded worksheets ---------- */
async function loadFresh() {
  try {
    const r = await fetch("/api/worksheets");
    if (!r.ok) return;
    const { worksheets } = await r.json();
    if (!worksheets || !worksheets.length) return;
    document.getElementById("fresh").innerHTML = worksheets.slice(0, 6).map(window.cardHTML).join("");
    document.getElementById("freshSec").style.display = "block";
  } catch { /* API not running — skip */ }
}

/* ---------- curated catalog ---------- */
const cats = ["All", ...Array.from(new Set(window.PRODUCTS.map(p => p.cat)))];
const filtersEl = document.getElementById("filters");
const gridEl = document.getElementById("grid");
let activeCat = "All";

function renderFilters(){
  filtersEl.innerHTML = cats.map(c => `<button class="chip${c===activeCat?' active':''}" data-cat="${c}">${c}</button>`).join("");
}
function renderProducts(){
  const list = window.PRODUCTS.filter(p => activeCat==="All" || p.cat===activeCat);
  gridEl.innerHTML = list.map(window.cardHTML).join("");
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
  if (file.toLowerCase().endsWith(".pdf")) {
    const a = document.createElement("a");
    a.href = file;
    a.download = (name || "bebomoments-worksheet").replace(/\s+/g, "-").toLowerCase() + ".pdf";
    document.body.appendChild(a); a.click(); a.remove();
  } else {
    window.open(file, "_blank");
  }
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

/* ---------- events ---------- */
document.body.addEventListener("click", e => {
  if (e.target.closest("[data-free],[data-paid],.chip,#shopLink")) {
    const fb = e.target.closest("[data-free]");
    const pd = e.target.closest("[data-paid]");
    const chip = e.target.closest(".chip");
    const shopLink = e.target.closest("#shopLink");
    if (shopLink){
      e.preventDefault();
      const fresh = document.getElementById("freshSec");
      const target = (fresh && fresh.style.display !== "none") ? fresh : document.getElementById("shop");
      target.scrollIntoView({ behavior:"smooth", block:"start" });
    } else if (fb){ e.preventDefault(); openModal({ file:fb.dataset.file, name:fb.dataset.name, free:true }); }
    else if (pd){ e.preventDefault(); openModal({ file:pd.dataset.file, name:pd.dataset.name, free:false }); }
    else if (chip){ activeCat = chip.dataset.cat; renderFilters(); renderProducts(); }
  }
});

/* ---------- init ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
renderFilters();
renderProducts();
loadFresh();
