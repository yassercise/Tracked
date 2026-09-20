import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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
const USER_ID = 'yasser-tracked';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const CATS = ['breakfast', 'lunch', 'dinner', 'snacks', 'drinks'];
const CAT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks', drinks: 'Drinks' };

// ─── HELPERS ───────────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split('T')[0]; }
function dateKey(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().split('T')[0]; }
function dayRef(key) { return doc(db, 'tracked', USER_ID, 'days', key); }
function settingsRef() { return doc(db, 'tracked', USER_ID, 'meta', 'settings'); }
function recentRef() { return doc(db, 'tracked', USER_ID, 'meta', 'recent'); }
function foodsCol() { return collection(db, 'tracked', USER_ID, 'foods'); }

// ─── STATE ─────────────────────────────────────────────────────────────────
let TARGETS = { cal: 2865, prot: 183, carb: 300, fat: 80, water: 8, carryover: false };
let todayData = { meals: [], water: 0, date: todayKey() };
let allFoods = [];
let recentFoods = [];
let currentLogTab = 'recent';
let editingMealIndex = null;

// ─── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  await loadToday();
  await loadFoods();
  await loadRecent();
  renderToday();
  renderWater();
  drawBody();
  updateTabIndicator(document.querySelector('.tab-btn.active'));
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') window.doSearch(); });
  document.getElementById('logModalSearch').addEventListener('keydown', e => { if (e.key === 'Enter') window.doModalSearch(); });
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
}

// ─── LOAD / SAVE ───────────────────────────────────────────────────────────
async function loadSettings() {
  try { const s = await getDoc(settingsRef()); if (s.exists()) TARGETS = { ...TARGETS, ...s.data() }; } catch (e) {}
  applySettingsToUI();
}

async function loadToday() {
  const key = todayKey();
  try { const s = await getDoc(dayRef(key)); todayData = s.exists() ? s.data() : { meals: [], water: 0, date: key }; } catch (e) {}
  if (!todayData.meals) todayData.meals = [];
  if (TARGETS.carryover) {
    try {
      const s = await getDoc(dayRef(dateKey(-1)));
      if (s.exists()) {
        const ycal = (s.data().meals || []).reduce((a, m) => a + (m.cal || 0), 0);
        const deficit = TARGETS.cal - ycal;
        if (deficit > 50) {
          document.getElementById('carryoverBanner').style.display = 'block';
          document.getElementById('carryoverText').textContent = `+${Math.round(deficit)} kcal carried over from yesterday`;
          todayData._carryover = Math.round(deficit);
        }
      }
    } catch (e) {}
  }
}

async function loadFoods() {
  try { const s = await getDocs(foodsCol()); allFoods = s.docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) {}
}

async function loadRecent() {
  try { const s = await getDoc(recentRef()); if (s.exists()) recentFoods = s.data().items || []; } catch (e) {}
}

async function saveToday() {
  try { await setDoc(dayRef(todayKey()), todayData); } catch (e) {}
}

async function saveRecent() {
  try { await setDoc(recentRef(), { items: recentFoods.slice(0, 50) }); } catch (e) {}
}

async function addToRecent(meal) {
  const entry = { name: meal.name, cal: meal.cal, prot: meal.prot, carb: meal.carb, fat: meal.fat, ts: Date.now() };
  recentFoods = [entry, ...recentFoods.filter(r => r.name !== meal.name)].slice(0, 50);
  await saveRecent();
}

// ─── TOTALS ────────────────────────────────────────────────────────────────
function getTodayTotals() {
  return (todayData.meals || []).reduce((acc, m) => {
    acc.cal += m.cal || 0; acc.prot += m.prot || 0; acc.carb += m.carb || 0; acc.fat += m.fat || 0;
    return acc;
  }, { cal: 0, prot: 0, carb: 0, fat: 0 });
}

// ─── RENDER TODAY ──────────────────────────────────────────────────────────
function renderToday() {
  const t = getTodayTotals();
  const targetCal = TARGETS.cal + (todayData._carryover || 0);
  document.getElementById('mCal').textContent = t.cal.toLocaleString();
  document.getElementById('mProt').innerHTML = t.prot + '<span>g</span>';
  document.getElementById('mCarb').innerHTML = t.carb + '<span>g</span>';
  document.getElementById('mFat').innerHTML = t.fat + '<span>g</span>';
  document.getElementById('mCalTarget').textContent = '/ ' + targetCal.toLocaleString();
  document.getElementById('mProtTarget').textContent = '/ ' + TARGETS.prot + 'g';
  document.getElementById('mCarbTarget').textContent = '/ ' + TARGETS.carb + 'g';
  document.getElementById('mFatTarget').textContent = '/ ' + TARGETS.fat + 'g';
  document.getElementById('mCalBar').style.width = Math.min(100, Math.round(t.cal / targetCal * 100)) + '%';
  document.getElementById('mProtBar').style.width = Math.min(100, Math.round(t.prot / TARGETS.prot * 100)) + '%';
  document.getElementById('mCarbBar').style.width = Math.min(100, Math.round(t.carb / TARGETS.carb * 100)) + '%';
  document.getElementById('mFatBar').style.width = Math.min(100, Math.round(t.fat / TARGETS.fat * 100)) + '%';
  document.getElementById('heroCalLabel').textContent = t.cal.toLocaleString() + ' / ' + targetCal.toLocaleString() + ' kcal';
  renderMeals();
  drawBody();
}

function renderMeals() {
  const con = document.getElementById('mealsContainer');
  con.innerHTML = '';
  CATS.forEach(cat => {
    const meals = (todayData.meals || []).filter(m => m.cat === cat);
    const section = document.createElement('div');
    section.className = 'meal-group';
    const head = document.createElement('div');
    head.className = 'meal-group-head';
    head.innerHTML = `<div class="meal-group-label">${CAT_LABELS[cat]}</div><button class="meal-group-add" onclick="window.openAddForCat('${cat}')">+</button>`;
    section.appendChild(head);
    if (!meals.length) {
      const empty = document.createElement('div');
      empty.className = 'meal-group-empty';
      empty.textContent = 'Nothing logged yet';
      section.appendChild(empty);
    } else {
      meals.forEach((meal, idx) => {
        const globalIdx = (todayData.meals || []).indexOf(meal);
        const el = document.createElement('div');
        el.className = 'meal-item';
        el.innerHTML = `
          <div class="meal-info" onclick="window.openEditMeal(${globalIdx})">
            <div class="meal-name">${meal.name}</div>
            <div class="meal-macros">${meal.cal} kcal · P:${meal.prot}g · C:${meal.carb}g · F:${meal.fat}g${meal.servingLabel ? ' · ' + meal.servingLabel : ''}</div>
          </div>
          <button class="meal-del-btn" onclick="window.removeMeal(${globalIdx})">×</button>`;
        section.appendChild(el);
      });
    }
    con.appendChild(section);
  });
}

window.openAddForCat = function(cat) {
  document.getElementById('logCat').value = cat;
  showTab('log', document.querySelector('[data-tab="log"]'));
};

// ─── EDIT MEAL ─────────────────────────────────────────────────────────────
window.openEditMeal = function(idx) {
  const meal = (todayData.meals || [])[idx];
  if (!meal) return;
  editingMealIndex = idx;
  document.getElementById('editMealName').textContent = meal.name;
  document.getElementById('editMealMacros').textContent = `${meal.cal} kcal · P:${meal.prot}g · C:${meal.carb}g · F:${meal.fat}g`;
  document.getElementById('editMealCat').value = meal.cat;
  document.getElementById('editMealServing').value = meal.serving || 100;
  document.getElementById('editMealModal').classList.add('open');
  updateEditMacros();
};

window.updateEditMacros = function() {
  const meal = (todayData.meals || [])[editingMealIndex];
  if (!meal) return;
  const base = meal.baseServing || meal.serving || 100;
  const newServing = parseFloat(document.getElementById('editMealServing').value) || base;
  const ratio = newServing / base;
  const cal = Math.round((meal.baseCal || meal.cal) * ratio);
  const prot = Math.round((meal.baseProt || meal.prot) * ratio);
  const carb = Math.round((meal.baseCarb || meal.carb) * ratio);
  const fat = Math.round((meal.baseFat || meal.fat) * ratio);
  document.getElementById('editMealPreview').textContent = `${cal} kcal · P:${prot}g · C:${carb}g · F:${fat}g`;
};

window.saveEditMeal = async function() {
  const meal = (todayData.meals || [])[editingMealIndex];
  if (!meal) return;
  const base = meal.baseServing || meal.serving || 100;
  const newServing = parseFloat(document.getElementById('editMealServing').value) || base;
  const ratio = newServing / base;
  meal.cal = Math.round((meal.baseCal || meal.cal) * ratio);
  meal.prot = Math.round((meal.baseProt || meal.prot) * ratio);
  meal.carb = Math.round((meal.baseCarb || meal.carb) * ratio);
  meal.fat = Math.round((meal.baseFat || meal.fat) * ratio);
  meal.serving = newServing;
  meal.servingLabel = newServing + 'g';
  meal.cat = document.getElementById('editMealCat').value;
  // Store base values if not already stored
  if (!meal.baseCal) { meal.baseCal = meal.cal; meal.baseProt = meal.prot; meal.baseCarb = meal.carb; meal.baseFat = meal.fat; meal.baseServing = base; }
  await saveToday();
  renderToday();
  window.closeModal('editMealModal');
};

window.removeMeal = async function(idx) {
  (todayData.meals || []).splice(idx, 1);
  await saveToday();
  renderToday();
};

// ─── WATER ─────────────────────────────────────────────────────────────────
function renderWater() {
  const goal = TARGETS.water || 8;
  const current = todayData.water || 0;
  document.getElementById('waterVal').textContent = current + ' / ' + goal + ' glasses';
  const container = document.getElementById('waterDots');
  container.innerHTML = '';
  for (let i = 0; i < goal; i++) {
    const dot = document.createElement('button');
    dot.className = 'water-dot' + (i < current ? ' filled' : '');
    dot.textContent = i < current ? '●' : '○';
    dot.onclick = () => window.toggleWater(i);
    container.appendChild(dot);
  }
}

window.toggleWater = async function(idx) {
  todayData.water = idx < (todayData.water || 0) ? idx : idx + 1;
  await saveToday();
  renderWater();
};

// ─── BODY CANVAS ───────────────────────────────────────────────────────────
function drawBody() {
  const canvas = document.getElementById('bodyCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const t = getTodayTotals();
  const targetCal = TARGETS.cal + (todayData._carryover || 0);
  const calPct = Math.min(1, t.cal / targetCal);
  const protPct = Math.min(1, t.prot / TARGETS.prot);
  const physique = calPct < 0.3 ? 0 : calPct < 0.6 ? 1 : protPct > 0.7 ? (protPct > 0.9 ? 3 : 2) : 1;
  document.getElementById('bodyStatusTag').textContent = ['DEPLETED','LEAN','ATHLETIC','JACKED'][physique];
  const fillY = H - (H * calPct * 0.85);
  ctx.save(); buildBodyPath(ctx, W, H, physique); ctx.clip();
  ctx.fillStyle = 'rgba(18,20,26,0.06)'; ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, H, 0, 0);
  if (physique >= 2) { grad.addColorStop(0,'rgba(22,168,99,0.9)'); grad.addColorStop(0.5,'rgba(22,168,99,0.7)'); grad.addColorStop(1,'rgba(22,168,99,0.4)'); }
  else { grad.addColorStop(0,'rgba(18,20,26,0.7)'); grad.addColorStop(1,'rgba(18,20,26,0.3)'); }
  ctx.fillStyle = grad; ctx.fillRect(0, fillY, W, H - fillY);
  ctx.restore();
  ctx.save(); buildBodyPath(ctx, W, H, physique);
  ctx.strokeStyle = physique >= 2 ? 'rgba(22,168,99,0.6)' : 'rgba(18,20,26,0.15)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  if (physique === 3) { ctx.save(); buildBodyPath(ctx, W, H, physique); ctx.shadowColor='rgba(22,168,99,0.5)'; ctx.shadowBlur=20; ctx.strokeStyle='rgba(22,168,99,0.4)'; ctx.lineWidth=3; ctx.stroke(); ctx.restore(); }
}

function buildBodyPath(ctx, W, H, physique) {
  const scale = [0.72,0.82,0.92,1.0][physique], cx = W/2;
  const sw=68*scale,ww=34*scale,hw=44*scale,nw=12,headR=22;
  const headY=28,neckTop=headY+headR*0.6,neckBot=neckTop+16,shoulderY=neckBot+8,chestY=shoulderY+30*scale;
  const waistY=shoulderY+70,hipY=waistY+22,thighY=hipY+50*scale,kneeY=thighY+30,calfBot=kneeY+50*scale;
  ctx.beginPath(); ctx.arc(cx,headY,headR,0,Math.PI*2); ctx.closePath();
  ctx.moveTo(cx-nw,neckTop); ctx.lineTo(cx-nw,neckBot); ctx.lineTo(cx-sw,shoulderY);
  ctx.lineTo(cx-sw-14*scale,chestY+10); ctx.lineTo(cx-ww-8,waistY); ctx.lineTo(cx-ww,waistY);
  ctx.lineTo(cx-hw,hipY); ctx.lineTo(cx-hw+6,thighY); ctx.lineTo(cx-18,kneeY); ctx.lineTo(cx-16,calfBot);
  ctx.lineTo(cx+16,calfBot); ctx.lineTo(cx+18,kneeY); ctx.lineTo(cx+hw-6,thighY); ctx.lineTo(cx+hw,hipY);
  ctx.lineTo(cx+ww,waistY); ctx.lineTo(cx+ww+8,waistY); ctx.lineTo(cx+sw+14*scale,chestY+10);
  ctx.lineTo(cx+sw,shoulderY); ctx.lineTo(cx+nw,neckBot); ctx.lineTo(cx+nw,neckTop); ctx.closePath();
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────
window.showTab = function(tab, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn, .sidebar-item').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');
  document.querySelectorAll('[data-tab="' + tab + '"]').forEach(el => el.classList.add('active'));
  if (btn && btn.classList.contains('tab-btn')) updateTabIndicator(btn);
  if (tab === 'log') { renderRecent(); renderMyFoods(); }
  if (tab === 'history') renderHistory();
  if (tab === 'trends') renderTrends();
  if (tab === 'settings') applySettingsToUI();
};

function updateTabIndicator(btn) {
  const bar = document.querySelector('.tab-bar'), ind = document.getElementById('tabIndicator');
  if (!bar || !ind || !btn) return;
  const rect = btn.getBoundingClientRect(), barRect = bar.getBoundingClientRect();
  ind.style.left = (rect.left - barRect.left) + 'px'; ind.style.width = rect.width + 'px';
}

window.switchLogTab = function(tab) {
  currentLogTab = tab;
  document.querySelectorAll('.log-tab').forEach((t, i) => {
    t.classList.toggle('active', ['recent','myfoods','manual','scan'][i] === tab);
  });
  ['logTabRecent','logTabMyfoods','logTabManual','logTabScan'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  const map = { recent:'logTabRecent', myfoods:'logTabMyfoods', manual:'logTabManual', scan:'logTabScan' };
  const el = document.getElementById(map[tab]); if (el) el.style.display = 'block';
};

// ─── FOOD SEARCH ───────────────────────────────────────────────────────────
function parseItem(item) {
  const serving = parseFloat(item.serving_size_g) || 100;
  const cal = parseFloat(item.calories) || 0;
  const prot = parseFloat(item.protein_g) || 0;
  const carb = parseFloat(item.carbohydrates_total_g) || 0;
  const fat = parseFloat(item.fat_total_g) || 0;
  return { name: item.name, serving, cal: Math.round(cal), prot: Math.round(prot), carb: Math.round(carb), fat: Math.round(fat),
    per100: { cal: Math.round(cal/serving*100), prot: Math.round(prot/serving*100), carb: Math.round(carb/serving*100), fat: Math.round(fat/serving*100) } };
}

async function fetchNutrition(q) {
  const res = await fetch('/api/search?query=' + encodeURIComponent(q));
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

window.doSearch = async function() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const spinner = document.getElementById('searchSpinner');
  const results = document.getElementById('searchResults');
  spinner.classList.add('active'); results.innerHTML = '';
  try {
    const items = await fetchNutrition(q);
    spinner.classList.remove('active');
    if (!items.length) { results.innerHTML = '<div class="search-empty">No results. Try a different term.</div>'; return; }
    items.forEach(item => {
      const p = parseItem(item);
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · C:${p.carb}g · F:${p.fat}g · ${p.serving}g serving</div>`;
      div.onclick = () => openFoodDetail(p, 'search');
      results.appendChild(div);
    });
  } catch (e) { spinner.classList.remove('active'); results.innerHTML = '<div class="search-empty">Search unavailable.</div>'; }
};

// ─── FOOD DETAIL MODAL ─────────────────────────────────────────────────────
let currentFoodDetail = null;

function openFoodDetail(food, source) {
  currentFoodDetail = { ...food, source };
  document.getElementById('fdName').textContent = food.name;
  document.getElementById('fdServing').value = food.serving || 100;
  document.getElementById('fdCat').value = document.getElementById('logCat').value || 'breakfast';
  updateFoodDetailMacros();
  document.getElementById('foodDetailModal').classList.add('open');
}

window.updateFoodDetail = function() { updateFoodDetailMacros(); };

function updateFoodDetailMacros() {
  if (!currentFoodDetail) return;
  const g = parseFloat(document.getElementById('fdServing').value) || 100;
  const base = currentFoodDetail.serving || 100;
  const ratio = g / base;
  const cal = Math.round(currentFoodDetail.cal * ratio);
  const prot = Math.round(currentFoodDetail.prot * ratio);
  const carb = Math.round(currentFoodDetail.carb * ratio);
  const fat = Math.round(currentFoodDetail.fat * ratio);
  document.getElementById('fdMacros').innerHTML = `
    <div class="fd-macro"><div class="fd-macro-val">${cal}</div><div class="fd-macro-label">kcal</div></div>
    <div class="fd-macro"><div class="fd-macro-val">${prot}g</div><div class="fd-macro-label">Protein</div></div>
    <div class="fd-macro"><div class="fd-macro-val">${carb}g</div><div class="fd-macro-label">Carbs</div></div>
    <div class="fd-macro"><div class="fd-macro-val">${fat}g</div><div class="fd-macro-label">Fats</div></div>`;
  currentFoodDetail._scaled = { cal, prot, carb, fat, serving: g };
}

window.addFoodFromDetail = async function() {
  if (!currentFoodDetail || !currentFoodDetail._scaled) return;
  const s = currentFoodDetail._scaled;
  const cat = document.getElementById('fdCat').value;
  const meal = {
    cat, name: currentFoodDetail.name, cal: s.cal, prot: s.prot, carb: s.carb, fat: s.fat,
    serving: s.serving, servingLabel: s.serving + 'g',
    baseCal: currentFoodDetail.cal, baseProt: currentFoodDetail.prot,
    baseCarb: currentFoodDetail.carb, baseFat: currentFoodDetail.fat,
    baseServing: currentFoodDetail.serving || 100, ts: Date.now()
  };
  todayData.meals = [...(todayData.meals || []), meal];
  await saveToday();
  await addToRecent(meal);
  renderToday();
  window.closeModal('foodDetailModal');
  showTab('today', document.querySelector('[data-tab="today"]'));
};

// ─── RECENT ────────────────────────────────────────────────────────────────
function renderRecent() {
  const list = document.getElementById('recentList');
  if (!recentFoods.length) {
    list.innerHTML = '<div class="search-empty">No recent foods yet.<br>Log something to see it here.</div>';
    return;
  }
  list.innerHTML = '';
  recentFoods.forEach(food => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <div class="food-item-info" onclick="window.openFoodDetailFromRecent('${encodeURIComponent(JSON.stringify(food))}')">
        <div class="food-item-name">${food.name}</div>
        <div class="food-item-meta">${food.cal} kcal · P:${food.prot}g · C:${food.carb}g · F:${food.fat}g</div>
      </div>
      <button class="food-item-add" onclick="window.quickAddRecent('${encodeURIComponent(JSON.stringify(food))}')">+</button>`;
    list.appendChild(div);
  });
}

window.openFoodDetailFromRecent = function(encoded) {
  const food = JSON.parse(decodeURIComponent(encoded));
  openFoodDetail({ ...food, serving: 100 }, 'recent');
};

window.quickAddRecent = function(encoded) {
  const food = JSON.parse(decodeURIComponent(encoded));
  // Show category picker then add
  const cat = document.getElementById('logCat').value || 'breakfast';
  openFoodDetail({ ...food, serving: 100 }, 'recent');
};

// ─── MY FOODS ──────────────────────────────────────────────────────────────
function renderMyFoods() {
  const list = document.getElementById('myFoodsList');
  if (!allFoods.length) { list.innerHTML = '<div class="search-empty">No saved foods yet.</div>'; return; }
  list.innerHTML = '';
  allFoods.forEach(food => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <div class="food-item-info" onclick="window.openFoodDetailFromSaved('${food.id}')">
        <div class="food-item-name">${food.name}</div>
        <div class="food-item-meta">${food.cal} kcal · P:${food.prot}g · C:${food.carb}g · F:${food.fat}g · ${food.serving}g</div>
      </div>
      <button class="food-item-del" onclick="window.deleteSavedFood('${food.id}')">×</button>`;
    list.appendChild(div);
  });
}

window.openFoodDetailFromSaved = function(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food) return;
  openFoodDetail(food, 'saved');
};

window.deleteSavedFood = async function(id) {
  if (!confirm('Delete this food?')) return;
  try { await deleteDoc(doc(db, 'tracked', USER_ID, 'foods', id)); allFoods = allFoods.filter(f => f.id !== id); renderMyFoods(); } catch (e) {}
};

window.saveCustomFood = async function() {
  const name = document.getElementById('cfName').value.trim();
  if (!name) return;
  const food = { name, serving: parseInt(document.getElementById('cfServing').value)||100, cal: parseInt(document.getElementById('cfCal').value)||0, prot: parseInt(document.getElementById('cfProt').value)||0, carb: parseInt(document.getElementById('cfCarb').value)||0, fat: parseInt(document.getElementById('cfFat').value)||0 };
  try { const ref = await addDoc(foodsCol(), food); allFoods.push({ id: ref.id, ...food }); renderMyFoods(); window.closeModal('createFoodModal'); } catch (e) {}
};

// ─── MANUAL MEAL ───────────────────────────────────────────────────────────
window.saveManualMeal = async function() {
  const name = document.getElementById('manualName').value.trim();
  if (!name) return;
  const meal = { cat: document.getElementById('manualCat').value, name, cal: parseInt(document.getElementById('manualCal').value)||0, prot: parseInt(document.getElementById('manualProt').value)||0, carb: parseInt(document.getElementById('manualCarb').value)||0, fat: parseInt(document.getElementById('manualFat').value)||0, serving: 100, baseServing: 100, ts: Date.now() };
  meal.baseCal=meal.cal; meal.baseProt=meal.prot; meal.baseCarb=meal.carb; meal.baseFat=meal.fat;
  todayData.meals = [...(todayData.meals||[]), meal];
  await saveToday(); await addToRecent(meal); renderToday();
  showTab('today', document.querySelector('[data-tab="today"]'));
  ['manualName','manualCal','manualProt','manualCarb','manualFat'].forEach(id => document.getElementById(id).value='');
};

// ─── MODAL SEARCH (legacy, still used) ────────────────────────────────────
window.doModalSearch = async function() {
  const q = document.getElementById('logModalSearch').value.trim();
  if (!q) return;
  const results = document.getElementById('logModalResults');
  results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">Searching...</div>';
  try {
    const items = await fetchNutrition(q);
    results.innerHTML = '';
    if (!items.length) { results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">No results</div>'; return; }
    items.slice(0,6).forEach(item => {
      const p = parseItem(item);
      const div = document.createElement('div');
      div.className = 'search-result-item'; div.style.marginBottom = '4px';
      div.innerHTML = `<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · ${p.serving}g</div>`;
      div.onclick = () => { window.closeModal('logModal'); openFoodDetail(p, 'search'); };
      results.appendChild(div);
    });
  } catch (e) { results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--red);font-size:13px;">Search failed</div>'; }
};

window.openLogModal = function() {
  document.getElementById('logModalSearch').value = '';
  document.getElementById('logModalResults').innerHTML = '';
  document.getElementById('logModal').classList.add('open');
};

// ─── HISTORY ───────────────────────────────────────────────────────────────
async function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '<div class="search-empty">Loading...</div>';
  const results = [];
  for (let i = 1; i <= 30; i++) {
    const key = dateKey(-i);
    try { const s = await getDoc(dayRef(key)); if (s.exists() && (s.data().meals||[]).length) results.push({ key, ...s.data() }); } catch (e) {}
  }
  if (!results.length) { list.innerHTML = '<div class="search-empty">No history yet.</div>'; return; }
  list.innerHTML = '';
  results.forEach(day => {
    const meals = day.meals || [];
    const t = meals.reduce((a,m) => { a.cal+=m.cal||0; a.prot+=m.prot||0; a.carb+=m.carb||0; a.fat+=m.fat||0; return a; }, {cal:0,prot:0,carb:0,fat:0});
    const hitCal = t.cal >= TARGETS.cal*0.9, hitProt = t.prot >= TARGETS.prot*0.9;
    const badge = hitCal&&hitProt?'hit':(hitCal||hitProt?'partial':'miss');
    const d = new Date(day.key + 'T12:00:00');
    const el = document.createElement('div'); el.className = 'history-day';
    el.innerHTML = `
      <div class="history-day-head" onclick="this.nextElementSibling.classList.toggle('open')">
        <div><div class="history-day-date">${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div><div class="history-day-cal">${t.cal} kcal · ${meals.length} items</div></div>
        <div style="display:flex;align-items:center;gap:8px;"><div class="history-day-badge badge-${badge}">${{hit:'On Target',partial:'Partial',miss:'Missed'}[badge]}</div></div>
      </div>
      <div class="history-day-detail">
        <div class="history-progress-row">
          <div class="history-progress-item"><div class="history-progress-label">Calories</div><div class="history-progress-bar"><div class="history-progress-fill" style="width:${Math.min(100,Math.round(t.cal/TARGETS.cal*100))}%;background:var(--accent)"></div></div><div class="history-progress-val">${t.cal} / ${TARGETS.cal}</div></div>
          <div class="history-progress-item"><div class="history-progress-label">Protein</div><div class="history-progress-bar"><div class="history-progress-fill" style="width:${Math.min(100,Math.round(t.prot/TARGETS.prot*100))}%;background:var(--blue)"></div></div><div class="history-progress-val">${t.prot}g / ${TARGETS.prot}g</div></div>
        </div>
        ${meals.map(m=>`<div class="history-meal-row"><span class="history-meal-name">${m.name}</span><span class="history-meal-cal">${m.cal} kcal</span></div>`).join('')}
      </div>`;
    list.appendChild(el);
  });
}

// ─── TRENDS ────────────────────────────────────────────────────────────────
async function renderTrends() {
  const days = [];
  for (let i=6;i>=0;i--) {
    const key=dateKey(-i), d=new Date(); d.setDate(d.getDate()-i);
    const label=d.toLocaleDateString('en-GB',{weekday:'short'}).slice(0,2);
    try { const s=await getDoc(dayRef(key)); if(s.exists()){const data=s.data(),meals=data.meals||[]; days.push({label,cal:meals.reduce((a,m)=>a+(m.cal||0),0),prot:meals.reduce((a,m)=>a+(m.prot||0),0),water:data.water||0});} else days.push({label,cal:0,prot:0,water:0}); } catch(e){days.push({label,cal:0,prot:0,water:0});}
  }
  renderBarChart('calChart',days,'cal',TARGETS.cal,'#12141A');
  renderBarChart('protChart',days,'prot',TARGETS.prot,'#378ADD');
  renderBarChart('waterChart',days,'water',TARGETS.water,'#378ADD');
}

function renderBarChart(id,days,key,target,color) {
  const el=document.getElementById(id); el.innerHTML='';
  const max=Math.max(target*1.1,...days.map(d=>d[key]),1);
  days.forEach(d=>{const pct=Math.round(d[key]/max*100),hit=d[key]>=target*0.9;const col=document.createElement('div');col.className='bar-col';col.innerHTML=`<div class="bar-val">${d[key]}</div><div class="bar" style="height:${pct}%;background:${hit?'rgba(22,168,99,0.85)':color};opacity:0.85;"></div><div class="bar-label">${d.label}</div>`;el.appendChild(col);});
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────
function applySettingsToUI() {
  document.getElementById('setCal').value=TARGETS.cal;
  document.getElementById('setProt').value=TARGETS.prot;
  document.getElementById('setCarb').value=TARGETS.carb;
  document.getElementById('setFat').value=TARGETS.fat;
  document.getElementById('setWater').value=TARGETS.water||8;
  document.getElementById('setCarryover').checked=TARGETS.carryover||false;
}

window.saveSettings = async function() {
  TARGETS={cal:parseInt(document.getElementById('setCal').value)||2865,prot:parseInt(document.getElementById('setProt').value)||183,carb:parseInt(document.getElementById('setCarb').value)||300,fat:parseInt(document.getElementById('setFat').value)||80,water:parseInt(document.getElementById('setWater').value)||8,carryover:document.getElementById('setCarryover').checked};
  try{await setDoc(settingsRef(),TARGETS);}catch(e){}
  applySettingsToUI();renderToday();renderWater();drawBody();alert('Settings saved');
};

// ─── MODALS ────────────────────────────────────────────────────────────────
window.closeModal=function(id){document.getElementById(id).classList.remove('open');};
window.openCreateFoodModal=function(){['cfName','cfServing','cfCal','cfProt','cfCarb','cfFat'].forEach(i=>document.getElementById(i).value='');document.getElementById('createFoodModal').classList.add('open');};

// ─── AI SCAN IMAGES ────────────────────────────────────────────────────────
window._scanImages = [];
window.handleScanImages = function(input) {
  const files = Array.from(input.files).slice(0,4);
  const thumbs = document.getElementById('scanThumbnails');
  thumbs.innerHTML=''; window._scanImages=[];
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      window._scanImages.push({data:e.target.result.split(',')[1],mediaType:file.type||'image/jpeg'});
      const img=document.createElement('img');
      img.src=e.target.result;
      img.style.cssText='width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid var(--card-border);';
      thumbs.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
};

window.analyzeMealLog=async function(){
  const desc=document.getElementById('scanDescLog').value.trim();
  const status=document.getElementById('scanStatusLog');
  if(!window._scanImages.length&&!desc){status.textContent='Please add a photo or description.';return;}
  status.textContent='Analyzing with AI...';
  document.getElementById('scanResultLog').style.display='none';
  try{
    const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({images:window._scanImages,description:desc})});
    const result=await response.json();
    if(result.error) throw new Error(result.error);
    status.textContent='';
    document.getElementById('scanResultLog').style.display='block';
    document.getElementById('scanEditName').value=result.name;
    document.getElementById('scanEditCal').value=result.cal;
    document.getElementById('scanEditProt').value=result.prot;
    document.getElementById('scanEditCarb').value=result.carb;
    document.getElementById('scanEditFat').value=result.fat;
    document.getElementById('scanResultNotesLog').textContent=result.notes||'';
  }catch(e){status.textContent='Analysis failed. Please try again.';}
};

window.addScannedMealLog=async function(){
  const meal={cat:document.getElementById('scanCatLog').value,name:document.getElementById('scanEditName').value||'Scanned meal',cal:parseInt(document.getElementById('scanEditCal').value)||0,prot:parseInt(document.getElementById('scanEditProt').value)||0,carb:parseInt(document.getElementById('scanEditCarb').value)||0,fat:parseInt(document.getElementById('scanEditFat').value)||0,serving:100,baseServing:100,ts:Date.now()};
  meal.baseCal=meal.cal;meal.baseProt=meal.prot;meal.baseCarb=meal.carb;meal.baseFat=meal.fat;
  todayData.meals=[...(todayData.meals||[]),meal];
  await saveToday();await addToRecent(meal);renderToday();
  showTab('today',document.querySelector('[data-tab="today"]'));
};

// ─── BOOT ──────────────────────────────────────────────────────────────────
window.addPendingMeal=async function(){
  if(!window._pendingMeal)return;
  todayData.meals=[...(todayData.meals||[]),window._pendingMeal];
  await saveToday();await addToRecent(window._pendingMeal);renderToday();
  window._pendingMeal=null;showTab('today',document.querySelector('[data-tab="today"]'));
};

init();
