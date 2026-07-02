/* Curated catalog (placeholders / "coming soon"). Live uploads come from the API.
   Shared by index (app.js) and the shop page (shop.js). Edit cards here. */
window.PRODUCTS = [
  { emoji:"✨", title:"Bebo Beginnings™ Pre-Writing Adventure Pack", age:"Ages 2.5–4", cat:"Prewriting",
    meta:"100 play-based worksheets · stories, not boring lines", price:499, was:1499, tag:"FLAGSHIP",
    page:"pack.html?slug=bebo-beginnings", featured:true },

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

  { emoji:"📅", title:"Monthly Play Planner", age:"Ages 1–3", cat:"Routines",
    meta:"Weekly screen-free play themes", price:20, was:199 },

  { emoji:"🎉", title:"MEGA All-in-One Bundle", age:"Ages 2–6", cat:"Bundles",
    meta:"Everything above + bonus packs", price:249, was:899, tag:"BEST VALUE" },
];

window.tintMap = { Free:"#E8F5E9", Prewriting:"#FFF3E0", Maths:"#E3F2FD", Themes:"#FCE4EC",
  "Fine Motor":"#F3E5F5", Routines:"#FFF8E1", Bundles:"#FFEBE3" };
window.tint = (c) => window.tintMap[c] || "#FFF3E8";
window.escHtml = (s) => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* Unified product card. Uploaded items (have .id) get a cover that links to
   their detail page + a real action button. Curated items show "Coming soon". */
window.cardHTML = function (item) {
  const esc = window.escHtml;
  const free = item.free || !item.price;
  const cover = window.coverSVG({ title:item.title, age:item.age, emoji:item.emoji, free, price:item.price });
  const badge = item.tag ? `<span class="badge">${esc(item.tag)}</span>`
                         : (item.id ? `<span class="badge">NEW</span>` : "");
  const price = free ? `<span class="price free">FREE</span>`
    : `<span class="price">₹${item.price}${item.was ? `<span class="was">₹${item.was}</span>` : ""}</span>`;
  const href = item.id ? `/worksheet/${item.id}` : (item.page || null);

  const thumb = href
    ? `<a class="thumb cover-thumb" href="${esc(href)}">${badge}${cover}</a>`
    : `<div class="thumb cover-thumb">${badge}${cover}</div>`;
  const title = href
    ? `<a class="p-title-link" href="${esc(href)}"><h3 class="p-title">${esc(item.title)}</h3></a>`
    : `<h3 class="p-title">${esc(item.title)}</h3>`;

  let btn;
  if (item.id) {
    btn = free
      ? `<button class="p-btn" data-free data-file="${esc(item.file)}" data-name="${esc(item.title)}">⬇️ Get free</button>`
      : `<button class="p-btn" data-paid data-file="${esc(item.file)}" data-name="${esc(item.title)}">Get it</button>`;
  } else if (item.page) {
    btn = `<a class="p-btn" href="${esc(item.page)}">View pack →</a>`;
  } else {
    btn = `<button class="p-btn soon">Coming soon</button>`;
  }

  return `<article class="product${href ? " clickable" : ""}${item.featured ? " wide" : ""}">
    ${thumb}
    <div class="p-body">
      <span class="p-age">${esc(item.age || "")}</span>
      ${title}
      <p class="p-meta">${esc(item.meta || "")}</p>
      <div class="p-foot">${price}${btn}</div>
    </div></article>`;
};
