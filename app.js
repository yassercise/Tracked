import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, writeBatch } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA0QDm49wVArv6oJA4YNGdRCXDe9OEtkI0",
  authDomain: "ekk-hub.firebaseapp.com",
  projectId: "ekk-hub",
  storageBucket: "ekk-hub.firebasestorage.app",
  messagingSenderId: "68211752660",
  appId: "1:68211752660:web:1098c3baed22cae8b7c541"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const UID = 'yasser-tracked';

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const CATS = ['breakfast','lunch','dinner','snacks','drinks'];
const CAT_LABELS = {breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Snacks',drinks:'Drinks'};
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── AUDIO ENGINE ───────────────────────────────────────────────────────────
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, duration, type = 'sine', gain = 0.15) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}
function soundLog() { playTone(440, 0.12); setTimeout(() => playTone(554, 0.12), 80); }
function soundGoal() { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.18, 'sine', 0.12), i*80)); }
function soundWater() { playTone(660, 0.1, 'sine', 0.1); }
function soundDelete() { playTone(220, 0.15, 'sine', 0.08); }
function haptic(ms = 10) { try { navigator.vibrate(ms); } catch(e) {} }

// ── HELPERS ────────────────────────────────────────────────────────────────
function dateStr(d) { return d.toISOString().split('T')[0]; }
function today() { return dateStr(new Date()); }
function offsetDate(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function dayRef(key) { return doc(db, 'tracked', UID, 'days', key); }
function settingsRef() { return doc(db, 'tracked', UID, 'meta', 'settings'); }
function recentRef() { return doc(db, 'tracked', UID, 'meta', 'recent'); }
function foodsCol() { return collection(db, 'tracked', UID, 'foods'); }

// ── STATE ──────────────────────────────────────────────────────────────────
let T = {cal:2865,prot:183,carb:300,fat:80,water:8,carryover:false};
let dayCache = {}; // key -> dayData
let currentDayOffset = 0;
let allFoods = [];
let recentFoods = [];
let monthHistory = {}; // key -> {cal,prot}
let currentFoodDetail = null;
let editingMealIdx = null;

// ── INIT ───────────────────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  // Load today immediately
  await loadDay(today());
  renderHome();
  renderWater();
  drawBody();
  updateTabPill(document.querySelector('.tab-btn.active'));
  // Lazy load the rest
  setTimeout(async () => {
    await loadFoods();
    await loadRecent();
    await loadMonthHistory();
    renderMonthStrip();
  }, 300);
  // Event listeners
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') window.doSearch(); });
  document.getElementById('logModalSearch').addEventListener('keydown', e => { if (e.key === 'Enter') window.doModalSearch(); });
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeModalSwipe(o.id); });
  });
  // Swipe down to dismiss modals
  setupModalSwipe();
}

// ── LOAD / SAVE ────────────────────────────────────────────────────────────
async function loadSettings() {
  try { const s = await getDoc(settingsRef()); if (s.exists()) T = {...T,...s.data()}; } catch(e){}
  applySettingsToUI();
}

async function loadDay(key) {
  if (dayCache[key]) return dayCache[key];
  try {
    const s = await getDoc(dayRef(key));
    dayCache[key] = s.exists() ? s.data() : {meals:[],water:0,date:key};
  } catch(e) { dayCache[key] = {meals:[],water:0,date:key}; }
  if (!dayCache[key].meals) dayCache[key].meals = [];
  return dayCache[key];
}

async function saveDay(key) {
  try { await setDoc(dayRef(key), dayCache[key]); } catch(e){}
}

async function loadFoods() {
  try { const s = await getDocs(foodsCol()); allFoods = s.docs.map(d=>({id:d.id,...d.data()})); } catch(e){}
}

async function loadRecent() {
  try { const s = await getDoc(recentRef()); if (s.exists()) recentFoods = s.data().items||[]; } catch(e){}
}

async function saveRecent() {
  try { await setDoc(recentRef(), {items:recentFoods.slice(0,50)}); } catch(e){}
}

async function addToRecent(meal) {
  const entry = {name:meal.name,cal:meal.cal,prot:meal.prot,carb:meal.carb,fat:meal.fat,ts:Date.now()};
  recentFoods = [entry,...recentFoods.filter(r=>r.name!==meal.name)].slice(0,50);
  await saveRecent();
}

async function loadMonthHistory() {
  // Load last 60 days in parallel batches of 10
  const keys = [];
  for (let i=1;i<=60;i++) keys.push(dateStr(offsetDate(-i)));
  const batches = [];
  for (let i=0;i<keys.length;i+=10) batches.push(keys.slice(i,i+10));
  for (const batch of batches) {
    await Promise.all(batch.map(async key => {
      if (dayCache[key]) { summarizeDay(key); return; }
      try {
        const s = await getDoc(dayRef(key));
        if (s.exists()) { dayCache[key] = s.data(); summarizeDay(key); }
      } catch(e){}
    }));
  }
}

function summarizeDay(key) {
  const d = dayCache[key];
  if (!d) return;
  const meals = d.meals||[];
  const cal = meals.reduce((a,m)=>a+(m.cal||0),0);
  const prot = meals.reduce((a,m)=>a+(m.prot||0),0);
  monthHistory[key] = {cal,prot};
}

// ── TOTALS ─────────────────────────────────────────────────────────────────
function getTotals(key) {
  const d = dayCache[key]||{meals:[]};
  return (d.meals||[]).reduce((acc,m)=>({cal:acc.cal+(m.cal||0),prot:acc.prot+(m.prot||0),carb:acc.carb+(m.carb||0),fat:acc.fat+(m.fat||0)}),{cal:0,prot:0,carb:0,fat:0});
}

// ── RENDER HOME ────────────────────────────────────────────────────────────
function renderHome() {
  const key = dateStr(offsetDate(currentDayOffset));
  const d = dayCache[key]||{meals:[],water:0};
  const t = getTotals(key);
  const targetCal = T.cal + (d._carryover||0);
  const isToday = currentDayOffset === 0;

  // Day nav
  document.getElementById('dayNavLabel').textContent = isToday ? 'Today' : currentDayOffset === -1 ? 'Yesterday' : offsetDate(currentDayOffset).toLocaleDateString('en-GB',{weekday:'long'});
  document.getElementById('dayNavSub').textContent = offsetDate(currentDayOffset).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  document.getElementById('dayNavNext').style.opacity = isToday ? '0.3' : '1';
  document.getElementById('dayNavNext').style.pointerEvents = isToday ? 'none' : 'auto';

  // Macros
  document.getElementById('mCal').textContent = t.cal.toLocaleString();
  document.getElementById('mProt').innerHTML = t.prot+'<span>g</span>';
  document.getElementById('mCarb').innerHTML = t.carb+'<span>g</span>';
  document.getElementById('mFat').innerHTML = t.fat+'<span>g</span>';
  document.getElementById('mCalTarget').textContent = '/ '+targetCal.toLocaleString();
  document.getElementById('mProtTarget').textContent = '/ '+T.prot+'g';
  document.getElementById('mCarbTarget').textContent = '/ '+T.carb+'g';
  document.getElementById('mFatTarget').textContent = '/ '+T.fat+'g';
  document.getElementById('mCalBar').style.width = Math.min(100,Math.round(t.cal/targetCal*100))+'%';
  document.getElementById('mProtBar').style.width = Math.min(100,Math.round(t.prot/T.prot*100))+'%';
  document.getElementById('mCarbBar').style.width = Math.min(100,Math.round(t.carb/T.carb*100))+'%';
  document.getElementById('mFatBar').style.width = Math.min(100,Math.round(t.fat/T.fat*100))+'%';
  document.getElementById('heroCalLabel').textContent = t.cal.toLocaleString()+' / '+targetCal.toLocaleString()+' kcal';

  // Goal hit banner
  const banner = document.getElementById('goalBanner');
  if (t.cal >= targetCal * 0.98 && t.prot >= T.prot * 0.95 && isToday) {
    banner.style.display = 'flex';
  } else { banner.style.display = 'none'; }

  renderMeals(key);
  drawBody();
}

function renderWater() {
  const key = dateStr(offsetDate(currentDayOffset));
  const d = dayCache[key]||{water:0};
  const goal = T.water||8, current = d.water||0;
  document.getElementById('waterVal').textContent = (current*300)+'ml / '+(goal*300)+'ml';
  const con = document.getElementById('waterDots'); con.innerHTML='';
  for (let i=0;i<goal;i++) {
    const btn = document.createElement('button');
    btn.className = 'water-dot'+(i<current?' filled':'');
    btn.textContent = i<current ? '◉' : '○';
    btn.onclick = () => window.toggleWater(i);
    con.appendChild(btn);
  }
}

function renderMeals(key) {
  const d = dayCache[key]||{meals:[]};
  const con = document.getElementById('mealsContainer'); con.innerHTML='';
  CATS.forEach(cat => {
    const meals = (d.meals||[]).filter(m=>m.cat===cat);
    const sec = document.createElement('div'); sec.className='meal-group';
    const head = document.createElement('div'); head.className='meal-group-head';
    head.innerHTML=`<div class="meal-group-label">${CAT_LABELS[cat]}</div><button class="meal-group-add" onclick="window.openAddForCat('${cat}')">+</button>`;
    sec.appendChild(head);
    if (!meals.length) {
      const e = document.createElement('div'); e.className='meal-group-empty'; e.textContent='Nothing logged yet'; sec.appendChild(e);
    } else {
      meals.forEach((meal,idx) => {
        const gi = (d.meals||[]).indexOf(meal);
        const el = document.createElement('div'); el.className='meal-item';
        el.innerHTML=`<div class="meal-info" onclick="window.openEditMeal(${gi})"><div class="meal-name">${meal.name}</div><div class="meal-macros">${meal.cal} kcal · P:${meal.prot}g · C:${meal.carb}g · F:${meal.fat}g</div></div><button class="meal-del-btn" onclick="window.removeMeal(${gi})">×</button>`;
        sec.appendChild(el);
      });
    }
    con.appendChild(sec);
  });
}

// ── MONTH STRIP ────────────────────────────────────────────────────────────
function renderMonthStrip() {
  const strip = document.getElementById('monthStrip'); strip.innerHTML='';
  const todayKey = today();
  // Show last 14 days + today
  for (let i=-13;i<=0;i++) {
    const d = offsetDate(i), key = dateStr(d);
    const h = monthHistory[key]||{cal:0,prot:0};
    const hit = h.cal>=T.cal*0.9&&h.prot>=T.prot*0.9;
    const partial = !hit&&(h.cal>=T.cal*0.5||h.prot>=T.prot*0.5)&&h.cal>0;
    const miss = !hit&&!partial&&h.cal>0;
    const isActive = i===currentDayOffset;
    const cell = document.createElement('div');
    cell.className = 'month-day'+(key===todayKey?' today':'')+(isActive?' active':'');
    const dotColor = hit?'var(--green)':partial?'var(--amber)':miss?'var(--red)':'var(--card-border)';
    cell.innerHTML=`<div class="month-day-label">${DAYS[d.getDay()].slice(0,2)}</div><div class="month-day-num">${d.getDate()}</div><div class="month-day-dot" style="background:${dotColor}"></div>`;
    cell.onclick = () => { currentDayOffset=i; renderMonthStrip(); loadDay(dateStr(offsetDate(i))).then(()=>{renderHome();renderWater();}); };
    strip.appendChild(cell);
  }
  // Scroll to end
  setTimeout(()=>{ strip.scrollLeft=strip.scrollWidth; }, 50);
}

// ── DAY NAV ────────────────────────────────────────────────────────────────
window.changeDay = async function(dir) {
  if (currentDayOffset + dir > 0) return;
  haptic(8);
  currentDayOffset += dir;
  const key = dateStr(offsetDate(currentDayOffset));
  await loadDay(key);
  renderHome();
  renderWater();
  renderMonthStrip();
};

window.openAddForCat = function(cat) {
  document.getElementById('logCat').value = cat;
  window.showTab('log', document.querySelector('[data-tab="log"]'));
};

// ── EDIT MEAL ──────────────────────────────────────────────────────────────
window.openEditMeal = function(idx) {
  const key = dateStr(offsetDate(currentDayOffset));
  const meal = (dayCache[key]?.meals||[])[idx];
  if (!meal) return;
  editingMealIdx = idx;
  document.getElementById('editMealName').textContent = meal.name;
  document.getElementById('editMealMacros').textContent = `${meal.cal} kcal · P:${meal.prot}g · C:${meal.carb}g · F:${meal.fat}g`;
  document.getElementById('editMealCat').value = meal.cat;
  document.getElementById('editMealServing').value = meal.serving||100;
  document.getElementById('editMealModal').classList.add('open');
  window.updateEditMacros();
};

window.updateEditMacros = function() {
  const key = dateStr(offsetDate(currentDayOffset));
  const meal = (dayCache[key]?.meals||[])[editingMealIdx];
  if (!meal) return;
  const base = meal.baseServing||meal.serving||100;
  const g = parseFloat(document.getElementById('editMealServing').value)||base;
  const r = g/base;
  const cal=Math.round((meal.baseCal||meal.cal)*r),prot=Math.round((meal.baseProt||meal.prot)*r),carb=Math.round((meal.baseCarb||meal.carb)*r),fat=Math.round((meal.baseFat||meal.fat)*r);
  document.getElementById('editMealPreview').textContent=`${cal} kcal · P:${prot}g · C:${carb}g · F:${fat}g`;
};

window.saveEditMeal = async function() {
  const key = dateStr(offsetDate(currentDayOffset));
  const meal = (dayCache[key]?.meals||[])[editingMealIdx];
  if (!meal) return;
  const base=meal.baseServing||meal.serving||100;
  const g=parseFloat(document.getElementById('editMealServing').value)||base;
  const r=g/base;
  if (!meal.baseCal) { meal.baseCal=meal.cal; meal.baseProt=meal.prot; meal.baseCarb=meal.carb; meal.baseFat=meal.fat; meal.baseServing=base; }
  meal.cal=Math.round(meal.baseCal*r); meal.prot=Math.round(meal.baseProt*r); meal.carb=Math.round(meal.baseCarb*r); meal.fat=Math.round(meal.baseFat*r);
  meal.serving=g; meal.cat=document.getElementById('editMealCat').value;
  await saveDay(key); renderHome(); window.closeModal('editMealModal'); haptic(10);
};

window.removeMeal = async function(idx) {
  haptic(15); soundDelete();
  const key = dateStr(offsetDate(currentDayOffset));
  (dayCache[key]?.meals||[]).splice(idx,1);
  await saveDay(key); renderHome(); summarizeDay(key); renderMonthStrip();
};

// ── WATER ──────────────────────────────────────────────────────────────────
window.toggleWater = function(idx) {
  haptic(8); soundWater();
  const key = dateStr(offsetDate(currentDayOffset));
  if (!dayCache[key]) dayCache[key]={meals:[],water:0,date:key};
  dayCache[key].water = idx < (dayCache[key].water||0) ? idx : idx+1;
  renderWater(); // instant UI update
  saveDay(key); // fire and forget
};

// ── BODY CANVAS ────────────────────────────────────────────────────────────
function drawBody() {
  const canvas = document.getElementById('bodyCanvas');
  const ctx = canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const key = dateStr(offsetDate(currentDayOffset));
  const t = getTotals(key);
  const targetCal=T.cal+((dayCache[key]||{})._carryover||0);
  const calPct=Math.min(1,t.cal/targetCal),protPct=Math.min(1,t.prot/T.prot);
  const physique=calPct<0.3?0:calPct<0.6?1:protPct>0.7?(protPct>0.9?3:2):1;
  document.getElementById('bodyStatusTag').textContent=['DEPLETED','LEAN','ATHLETIC','JACKED'][physique];
  const fillY=H-(H*calPct*0.85);
  ctx.save(); buildBody(ctx,W,H,physique); ctx.clip();
  ctx.fillStyle='rgba(18,20,26,0.06)'; ctx.fillRect(0,0,W,H);
  const grad=ctx.createLinearGradient(0,H,0,0);
  if (physique>=2){grad.addColorStop(0,'rgba(22,168,99,0.9)');grad.addColorStop(0.5,'rgba(22,168,99,0.7)');grad.addColorStop(1,'rgba(22,168,99,0.4)');}
  else{grad.addColorStop(0,'rgba(18,20,26,0.7)');grad.addColorStop(1,'rgba(18,20,26,0.3)');}
  ctx.fillStyle=grad; ctx.fillRect(0,fillY,W,H-fillY); ctx.restore();
  ctx.save(); buildBody(ctx,W,H,physique);
  ctx.strokeStyle=physique>=2?'rgba(22,168,99,0.6)':'rgba(18,20,26,0.15)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  if (physique===3){ctx.save();buildBody(ctx,W,H,physique);ctx.shadowColor='rgba(22,168,99,0.5)';ctx.shadowBlur=20;ctx.strokeStyle='rgba(22,168,99,0.4)';ctx.lineWidth=3;ctx.stroke();ctx.restore();}
}

function buildBody(ctx,W,H,physique) {
  const sc=[0.72,0.82,0.92,1.0][physique],cx=W/2;
  const sw=68*sc,ww=34*sc,hw=44*sc,nw=12,hr=22;
  const hy=28,nt=hy+hr*0.6,nb=nt+16,sy=nb+8,cy=sy+30*sc,wy=sy+70,hipY=wy+22,ty=hipY+50*sc,ky=ty+30,bot=ky+50*sc;
  ctx.beginPath();ctx.arc(cx,hy,hr,0,Math.PI*2);ctx.closePath();
  ctx.moveTo(cx-nw,nt);ctx.lineTo(cx-nw,nb);ctx.lineTo(cx-sw,sy);ctx.lineTo(cx-sw-14*sc,cy+10);ctx.lineTo(cx-ww-8,wy);ctx.lineTo(cx-ww,wy);ctx.lineTo(cx-hw,hipY);ctx.lineTo(cx-hw+6,ty);ctx.lineTo(cx-18,ky);ctx.lineTo(cx-16,bot);ctx.lineTo(cx+16,bot);ctx.lineTo(cx+18,ky);ctx.lineTo(cx+hw-6,ty);ctx.lineTo(cx+hw,hipY);ctx.lineTo(cx+ww,wy);ctx.lineTo(cx+ww+8,wy);ctx.lineTo(cx+sw+14*sc,cy+10);ctx.lineTo(cx+sw,sy);ctx.lineTo(cx+nw,nb);ctx.lineTo(cx+nw,nt);ctx.closePath();
}

// ── NAVIGATION ─────────────────────────────────────────────────────────────
window.showTab = function(tab, btn) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab-btn,.sidebar-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+tab).classList.add('active');
  document.querySelectorAll('[data-tab="'+tab+'"]').forEach(el=>el.classList.add('active'));
  if (btn?.classList.contains('tab-btn')) updateTabPill(btn);
  if (tab==='log') { renderRecent(); renderMyFoods(); }
  if (tab==='trends') renderTrends();
  if (tab==='settings') applySettingsToUI();
  haptic(6);
};

function updateTabPill(btn) {
  const bar=document.querySelector('.tab-bar'),pill=document.getElementById('tabPill');
  if (!bar||!pill||!btn) return;
  const rect=btn.getBoundingClientRect(),barRect=bar.getBoundingClientRect();
  pill.style.left=(rect.left-barRect.left+4)+'px';
  pill.style.width=(rect.width-8)+'px';
}

window.switchLogTab = function(tab) {
  document.querySelectorAll('.log-tab').forEach((t,i)=>t.classList.toggle('active',['recent','myfoods','manual','scan'][i]===tab));
  ['logTabRecent','logTabMyfoods','logTabManual','logTabScan'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  const map={recent:'logTabRecent',myfoods:'logTabMyfoods',manual:'logTabManual',scan:'logTabScan'};
  const el=document.getElementById(map[tab]);if(el)el.style.display='block';
  haptic(6);
};

// ── SWIPE DOWN MODAL ───────────────────────────────────────────────────────
function setupModalSwipe() {
  document.querySelectorAll('.modal').forEach(modal => {
    let startY=0,isDragging=false;
    modal.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;isDragging=true;},{passive:true});
    modal.addEventListener('touchmove',e=>{
      if(!isDragging)return;
      const dy=e.touches[0].clientY-startY;
      if(dy>0)modal.style.transform=`translateY(${dy}px)`;
    },{passive:true});
    modal.addEventListener('touchend',e=>{
      const dy=e.changedTouches[0].clientY-startY;
      modal.style.transform='';
      if(dy>80){const overlay=modal.closest('.modal-overlay');if(overlay)closeModalSwipe(overlay.id);}
      isDragging=false;
    },{passive:true});
  });
}

function closeModalSwipe(id) {
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.remove('open');
}
window.closeModal=closeModalSwipe;

// ── FOOD SEARCH ────────────────────────────────────────────────────────────
function parseItem(item) {
  const serving=parseFloat(item.serving_size_g)||100;
  const cal=parseFloat(item.calories)||0,prot=parseFloat(item.protein_g)||0,carb=parseFloat(item.carbohydrates_total_g)||0,fat=parseFloat(item.fat_total_g)||0;
  return {name:item.name,serving,cal:Math.round(cal),prot:Math.round(prot),carb:Math.round(carb),fat:Math.round(fat),per100:{cal:Math.round(cal/serving*100),prot:Math.round(prot/serving*100),carb:Math.round(carb/serving*100),fat:Math.round(fat/serving*100)}};
}

async function fetchNutrition(q) {
  const res=await fetch('/api/search?query='+encodeURIComponent(q));
  const data=await res.json();
  return Array.isArray(data.items)?data.items:[];
}

window.doSearch = async function() {
  const q=document.getElementById('searchInput').value.trim();
  if(!q)return;
  const spinner=document.getElementById('searchSpinner'),results=document.getElementById('searchResults');
  spinner.classList.add('active');results.innerHTML='';
  try {
    const items=await fetchNutrition(q);
    spinner.classList.remove('active');
    if(!items.length){results.innerHTML='<div class="search-empty">No results.</div>';return;}
    items.forEach(item=>{
      const p=parseItem(item);
      const div=document.createElement('div');div.className='search-result-item';
      div.innerHTML=`<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · C:${p.carb}g · F:${p.fat}g · ${p.serving}g</div>`;
      div.onclick=()=>openFoodDetail(p);
      results.appendChild(div);
    });
  } catch(e){spinner.classList.remove('active');results.innerHTML='<div class="search-empty">Search unavailable.</div>';}
};

// ── FOOD DETAIL ────────────────────────────────────────────────────────────
function openFoodDetail(food) {
  currentFoodDetail={...food};
  document.getElementById('fdName').textContent=food.name;
  document.getElementById('fdServing').value=food.serving||100;
  document.getElementById('fdCat').value=document.getElementById('logCat').value||'breakfast';
  updateFoodDetailMacros();
  document.getElementById('foodDetailModal').classList.add('open');
}

window.updateFoodDetail=function(){updateFoodDetailMacros();};

function updateFoodDetailMacros() {
  if(!currentFoodDetail)return;
  const g=parseFloat(document.getElementById('fdServing').value)||100;
  const base=currentFoodDetail.serving||100,ratio=g/base;
  const cal=Math.round(currentFoodDetail.cal*ratio),prot=Math.round(currentFoodDetail.prot*ratio),carb=Math.round(currentFoodDetail.carb*ratio),fat=Math.round(currentFoodDetail.fat*ratio);
  document.getElementById('fdMacros').innerHTML=`<div class="fd-macro"><div class="fd-macro-val">${cal}</div><div class="fd-macro-label">kcal</div></div><div class="fd-macro"><div class="fd-macro-val">${prot}g</div><div class="fd-macro-label">Protein</div></div><div class="fd-macro"><div class="fd-macro-val">${carb}g</div><div class="fd-macro-label">Carbs</div></div><div class="fd-macro"><div class="fd-macro-val">${fat}g</div><div class="fd-macro-label">Fats</div></div>`;
  currentFoodDetail._scaled={cal,prot,carb,fat,serving:g};
}

window.addFoodFromDetail=async function(){
  if(!currentFoodDetail?._scaled)return;
  const s=currentFoodDetail._scaled,cat=document.getElementById('fdCat').value;
  const meal={cat,name:currentFoodDetail.name,cal:s.cal,prot:s.prot,carb:s.carb,fat:s.fat,serving:s.serving,baseCal:currentFoodDetail.cal,baseProt:currentFoodDetail.prot,baseCarb:currentFoodDetail.carb,baseFat:currentFoodDetail.fat,baseServing:currentFoodDetail.serving||100,ts:Date.now()};
  await addMealToDay(meal);
  closeModalSwipe('foodDetailModal');
  window.showTab('home',document.querySelector('[data-tab="home"]'));
};

async function addMealToDay(meal) {
  const key=dateStr(offsetDate(currentDayOffset));
  if(!dayCache[key])dayCache[key]={meals:[],water:0,date:key};
  dayCache[key].meals.push(meal);
  await saveDay(key);
  await addToRecent(meal);
  summarizeDay(key);
  renderHome();
  renderMonthStrip();
  soundLog();haptic(10);
  // Check goal
  const t=getTotals(key);
  if(t.cal>=T.cal*0.98&&t.prot>=T.prot*0.95){soundGoal();haptic(50);}
}

// ── RECENT ─────────────────────────────────────────────────────────────────
function renderRecent() {
  const list=document.getElementById('recentList');
  if(!recentFoods.length){list.innerHTML='<div class="search-empty">No recent foods yet.</div>';return;}
  list.innerHTML='';
  recentFoods.forEach(food=>{
    const div=document.createElement('div');div.className='food-item';
    div.innerHTML=`<div class="food-item-info" onclick="window.openFoodDetailFromRecent('${encodeURIComponent(JSON.stringify(food))}')"><div class="food-item-name">${food.name}</div><div class="food-item-meta">${food.cal} kcal · P:${food.prot}g · C:${food.carb}g · F:${food.fat}g</div></div><button class="food-item-add" onclick="window.openFoodDetailFromRecent('${encodeURIComponent(JSON.stringify(food))}')">+</button>`;
    list.appendChild(div);
  });
}

window.openFoodDetailFromRecent=function(encoded){
  const food=JSON.parse(decodeURIComponent(encoded));
  openFoodDetail({...food,serving:100,per100:{cal:food.cal,prot:food.prot,carb:food.carb,fat:food.fat}});
};

// ── MY FOODS ───────────────────────────────────────────────────────────────
function renderMyFoods() {
  const list=document.getElementById('myFoodsList');
  if(!allFoods.length){list.innerHTML='<div class="search-empty">No saved foods yet.</div>';return;}
  list.innerHTML='';
  allFoods.forEach(food=>{
    const div=document.createElement('div');div.className='food-item';
    div.innerHTML=`<div class="food-item-info" onclick="window.openFoodDetailFromSaved('${food.id}')"><div class="food-item-name">${food.name}</div><div class="food-item-meta">${food.cal} kcal · P:${food.prot}g · C:${food.carb}g · F:${food.fat}g · ${food.serving}g</div></div><button class="food-item-del" onclick="window.deleteSavedFood('${food.id}')">×</button>`;
    list.appendChild(div);
  });
}

window.openFoodDetailFromSaved=function(id){
  const food=allFoods.find(f=>f.id===id);if(!food)return;openFoodDetail(food);
};

window.deleteSavedFood=async function(id){
  if(!confirm('Delete this food?'))return;
  try{await deleteDoc(doc(db,'tracked',UID,'foods',id));allFoods=allFoods.filter(f=>f.id!==id);renderMyFoods();haptic(15);}catch(e){}
};

window.saveCustomFood=async function(){
  const name=document.getElementById('cfName').value.trim();if(!name)return;
  const source=document.getElementById('cfSource')?.value.trim()||'';
  const fullName=source?name+' ('+source+')':name;
  const food={name:fullName,serving:parseInt(document.getElementById('cfServing').value)||100,cal:parseInt(document.getElementById('cfCal').value)||0,prot:parseInt(document.getElementById('cfProt').value)||0,carb:parseInt(document.getElementById('cfCarb').value)||0,fat:parseInt(document.getElementById('cfFat').value)||0};
  try{const ref=await addDoc(foodsCol(),food);allFoods.push({id:ref.id,...food});renderMyFoods();closeModalSwipe('createFoodModal');haptic(10);}catch(e){}
};

// ── MANUAL MEAL ────────────────────────────────────────────────────────────
window.saveManualMeal=async function(){
  const name=document.getElementById('manualName').value.trim();if(!name)return;
  const source=document.getElementById('manualSource')?.value.trim()||'';
  const fullName=source?name+' ('+source+')':name;
  const meal={cat:document.getElementById('manualCat').value,name:fullName,cal:parseInt(document.getElementById('manualCal').value)||0,prot:parseInt(document.getElementById('manualProt').value)||0,carb:parseInt(document.getElementById('manualCarb').value)||0,fat:parseInt(document.getElementById('manualFat').value)||0,serving:100,baseServing:100,ts:Date.now()};
  meal.baseCal=meal.cal;meal.baseProt=meal.prot;meal.baseCarb=meal.carb;meal.baseFat=meal.fat;
  await addMealToDay(meal);
  window.showTab('home',document.querySelector('[data-tab="home"]'));
  ['manualName','manualSource','manualCal','manualProt','manualCarb','manualFat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
};

// ── MODAL SEARCH ───────────────────────────────────────────────────────────
window.doModalSearch=async function(){
  const q=document.getElementById('logModalSearch').value.trim();if(!q)return;
  const results=document.getElementById('logModalResults');
  results.innerHTML='<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">Searching...</div>';
  try{
    const items=await fetchNutrition(q);results.innerHTML='';
    if(!items.length){results.innerHTML='<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">No results</div>';return;}
    items.slice(0,6).forEach(item=>{
      const p=parseItem(item);const div=document.createElement('div');div.className='search-result-item';div.style.marginBottom='4px';
      div.innerHTML=`<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · ${p.serving}g</div>`;
      div.onclick=()=>{closeModalSwipe('logModal');openFoodDetail(p);};
      results.appendChild(div);
    });
  }catch(e){results.innerHTML='<div style="text-align:center;padding:12px;color:var(--red);font-size:13px;">Search failed</div>';}
};

window.openLogModal=function(){
  document.getElementById('logModalSearch').value='';document.getElementById('logModalResults').innerHTML='';
  document.getElementById('logModal').classList.add('open');
};

// ── TRENDS ─────────────────────────────────────────────────────────────────
async function renderTrends() {
  const days=[];
  for(let i=6;i>=0;i--){
    const key=dateStr(offsetDate(-i)),d=offsetDate(-i);
    const label=d.toLocaleDateString('en-GB',{weekday:'short'}).slice(0,2);
    if(dayCache[key]){const meals=dayCache[key].meals||[];days.push({label,cal:meals.reduce((a,m)=>a+(m.cal||0),0),prot:meals.reduce((a,m)=>a+(m.prot||0),0),water:dayCache[key].water||0});}
    else{try{const s=await getDoc(dayRef(key));if(s.exists()){dayCache[key]=s.data();const meals=dayCache[key].meals||[];days.push({label,cal:meals.reduce((a,m)=>a+(m.cal||0),0),prot:meals.reduce((a,m)=>a+(m.prot||0),0),water:dayCache[key].water||0});}else days.push({label,cal:0,prot:0,water:0});}catch(e){days.push({label,cal:0,prot:0,water:0});}}
  }
  renderBarChart('calChart',days,'cal',T.cal,'#12141A');
  renderBarChart('protChart',days,'prot',T.prot,'#378ADD');
  renderBarChart('waterChart',days,'water',T.water,'#378ADD');
}

function renderBarChart(id,days,key,target,color) {
  const el=document.getElementById(id);el.innerHTML='';
  const max=Math.max(target*1.1,...days.map(d=>d[key]),1);
  days.forEach(d=>{
    const pct=Math.round(d[key]/max*100),hit=d[key]>=target*0.9;
    const col=document.createElement('div');col.className='bar-col';
    col.innerHTML=`<div class="bar-val">${d[key]}</div><div class="bar" style="height:${pct}%;background:${hit?'rgba(22,168,99,0.85)':color};opacity:0.8;"></div><div class="bar-label">${d.label}</div>`;
    el.appendChild(col);
  });
}

// ── SETTINGS ───────────────────────────────────────────────────────────────
function applySettingsToUI() {
  document.getElementById('setCal').value=T.cal;document.getElementById('setProt').value=T.prot;
  document.getElementById('setCarb').value=T.carb;document.getElementById('setFat').value=T.fat;
  document.getElementById('setWater').value=T.water||8;document.getElementById('setCarryover').checked=T.carryover||false;
}

window.saveSettings=async function(){
  T={cal:parseInt(document.getElementById('setCal').value)||2865,prot:parseInt(document.getElementById('setProt').value)||183,carb:parseInt(document.getElementById('setCarb').value)||300,fat:parseInt(document.getElementById('setFat').value)||80,water:parseInt(document.getElementById('setWater').value)||8,carryover:document.getElementById('setCarryover').checked};
  try{await setDoc(settingsRef(),T);}catch(e){}
  applySettingsToUI();renderHome();renderWater();drawBody();soundLog();haptic(20);
  alert('Settings saved');
};

// ── AI SCAN ────────────────────────────────────────────────────────────────
window._scanImages=[];

function compressImage(file,maxW,q) {
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        let w=img.width,h=img.height;
        if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
        canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        const compressed=canvas.toDataURL('image/jpeg',q);
        resolve({data:compressed.split(',')[1],mediaType:'image/jpeg',preview:compressed});
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

window.handleScanImages=async function(input){
  const files=Array.from(input.files).slice(0,4);
  const thumbs=document.getElementById('scanThumbnails');thumbs.innerHTML='';window._scanImages=[];
  for(let i=0;i<files.length;i++){
    const c=await compressImage(files[i],800,0.7);
    window._scanImages.push({data:c.data,mediaType:c.mediaType});
    const wrap=document.createElement('div');wrap.style.cssText='position:relative;width:72px;height:72px;flex-shrink:0;';
    const img=document.createElement('img');img.src=c.preview;
    img.style.cssText='width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid var(--card-border);';
    const xBtn=document.createElement('button');
    xBtn.style.cssText='position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#12141A;color:white;border:none;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:700;line-height:1;';
    xBtn.textContent='×';
    const idx=i;
    xBtn.onclick=()=>{window._scanImages.splice(idx,1);wrap.remove();};
    wrap.appendChild(img);wrap.appendChild(xBtn);thumbs.appendChild(wrap);
  }
};

window.reanalyzeMeal=async function(){
  const feedback=document.getElementById('scanFeedback').value.trim();
  if(!feedback){alert('Please write your feedback first.');return;}
  const currentName=document.getElementById('scanEditName').value;
  const currentCal=document.getElementById('scanEditCal').value;
  const currentProt=document.getElementById('scanEditProt').value;
  const status=document.getElementById('scanStatusLog');
  status.textContent='Re-analyzing with your feedback...';
  try{
    const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({images:window._scanImages,description:`Previous estimate: ${currentName}, ${currentCal} kcal, ${currentProt}g protein. User feedback: ${feedback}. Please re-estimate based on this correction.`})});
    if(!response.ok)throw new Error('Server error');
    const result=await response.json();if(result.error)throw new Error(result.error);
    status.textContent='';
    document.getElementById('scanEditName').value=result.name;
    document.getElementById('scanEditCal').value=result.cal;
    document.getElementById('scanEditProt').value=result.prot;
    document.getElementById('scanEditCarb').value=result.carb;
    document.getElementById('scanEditFat').value=result.fat;
    document.getElementById('scanResultNotesLog').textContent=result.notes||'';
    document.getElementById('scanFeedback').value='';
    soundLog();haptic(15);
  }catch(e){status.textContent='Re-analysis failed: '+e.message;}
};

window.analyzeMealLog=async function(){
  const desc=document.getElementById('scanDescLog').value.trim();
  const status=document.getElementById('scanStatusLog');
  if(!window._scanImages.length&&!desc){status.textContent='Please add a photo or description.';return;}
  status.textContent='Analyzing with AI...';document.getElementById('scanResultLog').style.display='none';
  try{
    const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({images:window._scanImages,description:desc})});
    if(!response.ok)throw new Error('Server error: '+response.status);
    const result=await response.json();if(result.error)throw new Error(result.error);
    status.textContent='';document.getElementById('scanResultLog').style.display='block';
    document.getElementById('scanEditName').value=result.name;document.getElementById('scanEditCal').value=result.cal;
    document.getElementById('scanEditProt').value=result.prot;document.getElementById('scanEditCarb').value=result.carb;
    document.getElementById('scanEditFat').value=result.fat;document.getElementById('scanResultNotesLog').textContent=result.notes||'';
    soundLog();haptic(15);
  }catch(e){status.textContent='Analysis failed: '+e.message;}
};

window.addScannedMealLog=async function(){
  const source=document.getElementById('scanEditSource')?.value.trim()||'';
  const name=document.getElementById('scanEditName').value||'Scanned meal';
  const meal={cat:document.getElementById('scanCatLog').value,name:source?name+' ('+source+')':name,cal:parseInt(document.getElementById('scanEditCal').value)||0,prot:parseInt(document.getElementById('scanEditProt').value)||0,carb:parseInt(document.getElementById('scanEditCarb').value)||0,fat:parseInt(document.getElementById('scanEditFat').value)||0,serving:100,baseServing:100,ts:Date.now()};
  meal.baseCal=meal.cal;meal.baseProt=meal.prot;meal.baseCarb=meal.carb;meal.baseFat=meal.fat;
  await addMealToDay(meal);window.showTab('home',document.querySelector('[data-tab="home"]'));
};

window.openCreateFoodModal=function(){['cfName','cfServing','cfCal','cfProt','cfCarb','cfFat'].forEach(i=>document.getElementById(i).value='');document.getElementById('createFoodModal').classList.add('open');};
window.addPendingMeal=async function(){if(!window._pendingMeal)return;await addMealToDay(window._pendingMeal);window._pendingMeal=null;window.showTab('home',document.querySelector('[data-tab="home"]'));};

init();
