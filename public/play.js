/* ============================================================
   bebomoments · "Play Now" finder
   ------------------------------------------------------------
   A hand-curated, no-prep toddler activity engine.
   Mom picks: age + minutes free + energy + mess tolerance
   -> gets ONE activity using things she already has at home.

   NON-TECHY EDITING:
   - Add an activity to the ACTIVITIES list below. Copy a block.
   - age:[min,max] in years · time: minutes · energy:"calm"|"active"|"any"
   - mess:"none"|"some"|"messy" · items:[...] · how:[steps] · why:"..." · tip:"..."
   ============================================================ */

const ACTIVITIES = [
  { emoji:"🍚", title:"Scoop & Pour Rice Bin", age:[1,4], time:10, energy:"calm", mess:"some",
    skill:"Fine motor", items:["A big bin or tray","Dry rice (or lentils/pasta)","Cups & spoons"],
    how:["Pour rice into the bin.","Add cups, spoons, a funnel.","Let them scoop, pour, bury & dig."],
    why:"Scooping and pouring builds the hand control needed for holding a pencil later.",
    tip:"Put a bedsheet under the bin — sweep it back in when done." },

  { emoji:"🩹", title:"Tape Rescue", age:[1,3], time:5, energy:"calm", mess:"none",
    skill:"Fine motor", items:["Masking/washi tape","A few small toys"],
    how:["Tape small toys down to the floor or table.","Ask them to 'rescue' each toy by peeling the tape."],
    why:"Peeling tape strengthens the tiny pincer muscles in little fingers.",
    tip:"Stick tape on a window for a vertical challenge — even better for shoulders & wrists." },

  { emoji:"💦", title:"Wash the Toys", age:[1,4], time:15, energy:"calm", mess:"some",
    skill:"Practical life", items:["A bowl of water","A sponge or cloth","Plastic toys / play dishes"],
    how:["Half-fill a bowl with water.","Give a sponge and 'dirty' toys.","Let them scrub, rinse & dry."],
    why:"Real-life 'work' builds focus and independence — toddlers love being helpful.",
    tip:"A towel on the floor saves the cleanup. Add a drop of soap for bubbles." },

  { emoji:"🎈", title:"Keep the Balloon Up", age:[2,5], time:10, energy:"active", mess:"none",
    skill:"Gross motor", items:["One balloon"],
    how:["Blow up a balloon.","Tap it back and forth — don't let it touch the floor!"],
    why:"Tracking a slow-moving balloon builds hand-eye coordination and burns energy indoors.",
    tip:"Call out a body part to hit it with: 'elbow!', 'knee!', 'head!'" },

  { emoji:"🟥", title:"Color Hunt", age:[2,4], time:10, energy:"active", mess:"none",
    skill:"Colors", items:["Nothing! Just your home"],
    how:["Name a color.","Race to find something that color and bring it back.","Repeat with new colors."],
    why:"Connects color names to real objects — and sneaks in some movement.",
    tip:"For older toddlers, ask for 2 of the same color, or a shape too." },

  { emoji:"🧦", title:"Sock Match", age:[2,4], time:10, energy:"calm", mess:"none",
    skill:"Matching", items:["A pile of clean socks"],
    how:["Dump clean socks in a pile.","Find the matching pairs together.","Roll them into balls."],
    why:"Matching pairs teaches 'same vs different' — early maths thinking.",
    tip:"Turn it into laundry help. They feel useful, you get folded socks." },

  { emoji:"✂️", title:"Snip the Snakes", age:[3,5], time:10, energy:"calm", mess:"some",
    skill:"Scissor skills", items:["Strips of paper","Toddler-safe scissors"],
    how:["Cut paper into thin strips.","Let them snip each strip into pieces.","Make it a 'snake haircut'."],
    why:"Single snips are the first step to cutting — great fine-motor practice.",
    tip:"Draw lines on the strips for them to cut along as they improve." },

  { emoji:"🥣", title:"Pom-Pom Transfer", age:[2,4], time:10, energy:"calm", mess:"none",
    skill:"Fine motor", items:["Pom-poms (or cotton balls)","Two bowls","Spoon or tongs"],
    how:["Put pom-poms in one bowl.","Move them to the empty bowl with a spoon or tongs."],
    why:"Using tongs/spoons builds the grip and focus for self-feeding and writing.",
    tip:"Add color sorting: one bowl per color for an extra challenge." },

  { emoji:"📦", title:"Cardboard Box Car Ramp", age:[1,4], time:15, energy:"active", mess:"none",
    skill:"Cause & effect", items:["A cardboard box or book","Toy cars / balls"],
    how:["Lean a box lid or board against the sofa to make a ramp.","Roll cars and balls down."],
    why:"Watching things roll fast vs slow is a toddler's first physics lesson.",
    tip:"Try ramps at different heights: 'which one is faster?'" },

  { emoji:"🫧", title:"Squish Sensory Bag", age:[1,3], time:10, energy:"calm", mess:"none",
    skill:"Sensory", items:["A zip-lock bag","Hair gel or paint","Strong tape"],
    how:["Fill a zip bag with gel (add glitter/beads).","Squeeze out air, tape it shut.","Tape it to the floor or window to squish & draw."],
    why:"Mess-free sensory play — they draw shapes and letters by pushing the gel.",
    tip:"Double-bag and tape ALL edges so there are no leaks." },

  { emoji:"🪙", title:"Coin / Lid Posting", age:[1,3], time:10, energy:"calm", mess:"none",
    skill:"Fine motor", items:["A container with a lid","Large buttons / jar lids / cut coins"],
    how:["Cut a slot in a plastic lid.","Let them 'post' lids/coins through the slot.","Open and do it again."],
    why:"Lining up an object with a slot is precise, focused hand work.",
    tip:"Use big bottle caps for 1-year-olds (no small parts)." },

  { emoji:"🐻", title:"Animal Walks", age:[2,5], time:5, energy:"active", mess:"none",
    skill:"Gross motor", items:["Nothing!"],
    how:["Call out an animal: bear, bunny, crab, snake.","Move across the room like that animal."],
    why:"Big crawling/jumping movements build core strength and burn energy fast.",
    tip:"Perfect for the witching hour before dinner, or a rainy day." },

  { emoji:"🖍️", title:"Paint with Water", age:[1,3], time:15, energy:"calm", mess:"none",
    skill:"Pre-art", items:["A cup of water","A paintbrush","Paper or a wall/floor outside"],
    how:["Dip the brush in water.","'Paint' the pavement, a fence, or dark paper.","Watch it dry & disappear."],
    why:"All the joy of painting, zero mess — and great brush-grip practice.",
    tip:"Outdoors on a warm day, let them 'paint' the whole patio." },

  { emoji:"🍝", title:"Pasta Threading", age:[2,4], time:15, energy:"calm", mess:"none",
    skill:"Fine motor", items:["Dry tube pasta (penne)","A shoelace or string"],
    how:["Tie a knot at one end of the string.","Thread pasta tubes onto it.","Make a necklace!"],
    why:"Threading is tricky, focused work that builds patience and hand control.",
    tip:"Color the pasta with a little food coloring for a rainbow necklace." },

  { emoji:"🧊", title:"Ice Rescue", age:[2,5], time:15, energy:"calm", mess:"some",
    skill:"Sensory", items:["Small toys","An ice tray / bowl","Water + freezer"],
    how:["Freeze small toys in water overnight.","Give the ice block + warm water + a spoon.","Free the toys!"],
    why:"Melting ice is a calm, fascinating science moment — and lasts ages.",
    tip:"Do it in the bath or a tray to keep the puddles contained." },

  { emoji:"📮", title:"Sticker Peel & Stick", age:[1,3], time:15, energy:"calm", mess:"none",
    skill:"Fine motor", items:["Any stickers","Paper"],
    how:["Give a sheet of stickers and paper.","Peel and stick anywhere they like."],
    why:"Peeling stickers is surprisingly hard — a brilliant pincer-grip workout.",
    tip:"Stuck on the sheet? Fold it so an edge lifts for them to grab." },

  { emoji:"🎵", title:"Freeze Dance", age:[2,5], time:10, energy:"active", mess:"none",
    skill:"Listening", items:["Music / your phone"],
    how:["Play music and dance.","Pause it — everyone FREEZES.","Play again to unfreeze."],
    why:"Stopping on cue is self-control practice, hidden inside a giggle-fest.",
    tip:"Add 'freeze like a statue / animal / robot' for variety." },

  { emoji:"🧺", title:"Laundry Basket Sort", age:[1,3], time:10, energy:"active", mess:"none",
    skill:"Practical life", items:["A laundry basket","Soft toys or clothes"],
    how:["Stand back and toss soft items into the basket.","Or sort by big/small, color, type."],
    why:"Throwing builds aim; sorting builds early thinking. Two-in-one.",
    tip:"Move the basket further away as they get better at aiming." },

  { emoji:"🌙", title:"Calm-Down Jar", age:[2,5], time:10, energy:"calm", mess:"some",
    skill:"Big feelings", items:["A clear bottle","Water","Glitter / glue"],
    how:["Fill a bottle with water + glitter + a little glue.","Seal tight.","Shake it and watch the glitter settle slowly."],
    why:"Watching glitter fall gives big feelings a place to go — breathe while it settles.",
    tip:"Use it as a 5-minute reset before nap or after a meltdown." },

  { emoji:"🚧", title:"Tape Road / Shape City", age:[2,5], time:15, energy:"active", mess:"none",
    skill:"Imagination", items:["Masking tape","Toy cars"],
    how:["Stick tape 'roads' across the floor.","Add tape squares for 'houses'.","Drive cars around town."],
    why:"Open-ended pretend play — and walking the lines is balance practice.",
    tip:"Leave the tape down for days; they'll come back to it again and again." },
];

/* ---------- state ---------- */
const sel = { age:null, time:null, energy:null, mess:null };
let shown = [];               // ids shown this round (avoid repeats)
let current = null;

/* ---------- option buttons ---------- */
function bindOptions(){
  document.querySelectorAll(".opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.opt[data-group="${group}"]`).forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      sel[group] = btn.dataset.val;
      // enable button once age + time chosen (energy/mess optional)
      document.getElementById("go").disabled = !(sel.age && sel.time);
    });
  });
}

/* ---------- matching ---------- */
function matches(a){
  const age = +sel.age;
  if (age < a.age[0] || age > a.age[1]) return false;
  if (+sel.time < a.time) return false;                      // need enough time
  if (sel.energy && sel.energy !== "any" && a.energy !== "any" && a.energy !== sel.energy) return false;
  if (sel.mess === "none" && a.mess !== "none") return false; // tidy mode = no mess only
  return true;
}

function pick(){
  let pool = ACTIVITIES.filter(matches);
  let broadened = false;

  if (pool.length === 0){                 // nothing fits — relax mess, then energy
    pool = ACTIVITIES.filter(a => {
      const age = +sel.age;
      return age >= a.age[0] && age <= a.age[1] && +sel.time >= a.time;
    });
    broadened = true;
  }
  if (pool.length === 0){                  // still nothing — any age-appropriate
    pool = ACTIVITIES.filter(a => +sel.age >= a.age[0] && +sel.age <= a.age[1]);
    broadened = true;
  }

  let fresh = pool.filter(a => !shown.includes(a.title));
  if (fresh.length === 0){ shown = []; fresh = pool; }       // seen them all — reset

  // vary choice without Math.random: rotate by how many we've shown
  const choice = fresh[shown.length % fresh.length];
  shown.push(choice.title);
  current = choice;
  render(choice, broadened);
}

/* ---------- render result card ---------- */
function render(a, broadened){
  const saved = getSaved().some(s => s.title === a.title);
  const energyLabel = a.energy === "active" ? "⚡ Active" : a.energy === "calm" ? "😌 Calm" : "🙂 Any";
  const messLabel = a.mess === "none" ? "🚫 No mess" : a.mess === "messy" ? "🌀 Messy" : "🎨 A little mess";
  const note = broadened ? `<p class="broaden">Nothing matched exactly, so here's a close one 💛</p>` : "";

  document.getElementById("result").innerHTML = `
    ${note}
    <article class="acard" id="acard">
      <div class="acard-top">
        <div class="acard-emoji">${a.emoji}</div>
        <div>
          <span class="acard-skill">${a.skill}</span>
          <h3 class="acard-title">${a.title}</h3>
        </div>
      </div>
      <div class="acard-chips">
        <span>⏱️ ${a.time} min</span><span>${energyLabel}</span><span>${messLabel}</span>
        <span>👶 Ages ${a.age[0]}–${a.age[1]}</span>
      </div>
      <div class="acard-sec">
        <h4>You'll need</h4>
        <ul class="need">${a.items.map(i=>`<li>${i}</li>`).join("")}</ul>
      </div>
      <div class="acard-sec">
        <h4>How</h4>
        <ol class="steps">${a.how.map(s=>`<li>${s}</li>`).join("")}</ol>
      </div>
      <div class="acard-why">💡 <b>Why it helps:</b> ${a.why}</div>
      <div class="acard-tip">🤫 <b>Mom tip:</b> ${a.tip}</div>
    </article>
    <div class="acard-actions">
      <button class="btn" id="again">🎲 Another idea</button>
      <button class="btn ghost" id="save">${saved ? "💖 Saved" : "🤍 Save"}</button>
      <button class="btn ghost" id="print">🖨️ Print</button>
    </div>
    <p class="funnel">Want it all planned for you? <a href="index.html#shop">Grab the printable packs →</a></p>
  `;
  document.getElementById("result").scrollIntoView({ behavior:"smooth", block:"start" });

  document.getElementById("again").onclick = pick;
  document.getElementById("print").onclick = () => printCard(a);
  document.getElementById("save").onclick = () => { toggleSave(a); render(a, false); renderSaved(); };
}

/* ---------- saved (localStorage) ---------- */
function getSaved(){ try{ return JSON.parse(localStorage.getItem("bebo_saved")||"[]"); }catch(_){ return []; } }
function toggleSave(a){
  let s = getSaved();
  s.some(x=>x.title===a.title) ? (s = s.filter(x=>x.title!==a.title)) : s.push({title:a.title, emoji:a.emoji});
  localStorage.setItem("bebo_saved", JSON.stringify(s));
}
function renderSaved(){
  const s = getSaved();
  const box = document.getElementById("saved");
  if (!s.length){ box.innerHTML=""; return; }
  box.innerHTML = `<div class="sec-title"><h2>💖 Your saved ideas</h2><span class="ln"></span></div>
    <div class="saved-list">${s.map(x=>`<span class="saved-pill">${x.emoji} ${x.title}</span>`).join("")}</div>`;
}

/* ---------- print one activity nicely ---------- */
function printCard(a){
  const w = window.open("", "_blank");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${a.title} · bebomoments</title>
  <style>
   body{font-family:system-ui,sans-serif;color:#4E443C;max-width:600px;margin:40px auto;padding:0 24px;}
   .e{font-size:64px}h1{font-family:Georgia,serif;color:#F4511E;margin:.2em 0}
   .chips span{display:inline-block;background:#FFF1E6;border:1px solid #F4D6C2;border-radius:99px;padding:4px 12px;margin:3px 4px 3px 0;font-size:13px}
   h4{margin:18px 0 6px;color:#F4511E}ul,ol{margin:0;padding-left:20px;line-height:1.7}
   .why,.tip{background:#FFF8F0;border-left:4px solid #FFB74D;padding:10px 14px;border-radius:8px;margin-top:14px}
   .brand{color:#9C8E7E;font-size:12px;margin-top:30px;border-top:2px dotted #E7DBCB;padding-top:10px}
  </style></head><body>
   <div class="e">${a.emoji}</div><h1>${a.title}</h1>
   <div class="chips"><span>⏱️ ${a.time} min</span><span>${a.skill}</span><span>Ages ${a.age[0]}–${a.age[1]}</span></div>
   <h4>You'll need</h4><ul>${a.items.map(i=>`<li>${i}</li>`).join("")}</ul>
   <h4>How</h4><ol>${a.how.map(s=>`<li>${s}</li>`).join("")}</ol>
   <div class="why">💡 <b>Why it helps:</b> ${a.why}</div>
   <div class="tip">🤫 <b>Mom tip:</b> ${a.tip}</div>
   <p class="brand">Saved from bebomoments · Play Now · @bebomoments 💛</p>
  </body></html>`);
  w.document.close(); setTimeout(()=>w.print(), 350);
}

/* ---------- init ---------- */
bindOptions();
document.getElementById("go").onclick = () => { shown = []; pick(); };
renderSaved();
document.getElementById("yr").textContent = new Date().getFullYear();
