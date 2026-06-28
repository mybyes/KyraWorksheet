/* Admin panel: login, upload (with progress), list, delete. */

const $ = (s) => document.querySelector(s);
const tokenKey = "bebo_admin_token";
let token = localStorage.getItem(tokenKey) || "";

const loginCard = $("#loginCard");
const panel = $("#panel");

function showPanel(on) {
  loginCard.style.display = on ? "none" : "block";
  panel.style.display = on ? "block" : "none";
  if (on) loadList();
}

/* ---- login ---- */
$("#loginBtn").onclick = login;
$("#pw").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

async function login() {
  const password = $("#pw").value;
  $("#loginMsg").textContent = "Checking…";
  try {
    const r = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Login failed");
    token = data.token;
    localStorage.setItem(tokenKey, token);
    $("#loginMsg").textContent = "";
    $("#pw").value = "";
    showPanel(true);
  } catch (e) {
    $("#loginMsg").textContent = "❌ " + e.message;
  }
}

$("#logout").onclick = (e) => {
  e.preventDefault();
  token = ""; localStorage.removeItem(tokenKey); showPanel(false);
};

/* ---- upload (XHR for progress) ---- */
$("#uploadForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const btn = $("#uploadBtn");
  const msg = $("#uploadMsg");

  if (!$("#fileInput").files.length) { msg.textContent = "Please choose a PDF."; return; }

  btn.disabled = true; btn.textContent = "Uploading… 0%";
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/worksheets");
  xhr.setRequestHeader("Authorization", "Bearer " + token);

  xhr.upload.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const pct = Math.round((ev.loaded / ev.total) * 100);
      btn.textContent = pct < 100 ? `Uploading… ${pct}%` : "Branding PDF… ✨";
    }
  };
  xhr.onload = () => {
    btn.disabled = false; btn.textContent = "✨ Brand & publish";
    let data = {};
    try { data = JSON.parse(xhr.responseText); } catch {}
    if (xhr.status === 401) { msg.textContent = "Session expired — please log in again."; showPanel(false); return; }
    if (xhr.status >= 200 && xhr.status < 300) {
      msg.innerHTML = `✅ Published <b>${escapeHtml(data.worksheet.title)}</b> — it's live on the site!`;
      form.reset();
      loadList();
    } else {
      msg.textContent = "❌ " + (data.error || "Upload failed.");
    }
  };
  xhr.onerror = () => { btn.disabled = false; btn.textContent = "✨ Brand & publish"; msg.textContent = "❌ Network error."; };
  xhr.send(fd);
});

/* ---- list + delete ---- */
async function loadList() {
  const box = $("#adminList");
  try {
    const r = await fetch("/api/worksheets");
    const { worksheets } = await r.json();
    if (!worksheets.length) { box.innerHTML = `<p class="hint">No worksheets yet. Upload your first one above 👆</p>`; return; }
    box.innerHTML = worksheets.map((w) => `
      <div class="adm-row">
        <span class="adm-emoji">${w.emoji || "📄"}</span>
        <div class="adm-info">
          <b>${escapeHtml(w.title)}</b>
          <small>${escapeHtml(w.age || "")} ${w.category ? "· " + escapeHtml(w.category) : ""} · ${w.price ? "₹" + w.price : "Free"}</small>
        </div>
        <a class="adm-view" href="${w.file}" target="_blank" rel="noopener">View</a>
        <button class="adm-del" data-id="${w.id}" data-title="${escapeHtml(w.title)}">Delete</button>
      </div>`).join("");
    box.querySelectorAll(".adm-del").forEach((b) => b.onclick = () => del(b.dataset.id, b.dataset.title));
  } catch {
    box.innerHTML = `<p class="hint">Couldn't load list.</p>`;
  }
}

async function del(id, title) {
  if (!confirm(`Delete "${title}"? This removes it from the site for everyone.`)) return;
  const r = await fetch("/api/worksheets/" + id, {
    method: "DELETE", headers: { "Authorization": "Bearer " + token },
  });
  if (r.status === 401) { showPanel(false); return; }
  loadList();
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---- init: try existing token ---- */
showPanel(!!token);
