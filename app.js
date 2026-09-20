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

// ─── HELPERS ───────────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split('T')[0]; }
function dateKey(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}
function dayRef(key) { return doc(db, 'tracked', USER_ID, 'days', key); }
function settingsRef() { return doc(db, 'tracked', USER_ID, 'meta', 'settings'); }
function foodsCol() { return collection(db, 'tracked', USER_ID, 'foods'); }

// ─── STATE ─────────────────────────────────────────────────────────────────
let TARGETS = { cal: 2865, prot: 183, carb: 300, fat: 80, water: 8, carryover: false };
let todayData = { meals: [], water: 0, date: todayKey() };
let selectedFoodPer100 = null;
let modalSelectedFood = null;
let allFoods = [];

// ─── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  await loadToday();
  await loadFoods();
  renderToday();
  renderWater();
  drawBody();
  updateTabIndicator(document.querySelector('.tab-btn.active'));
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') window.doSearch(); });
  document.getElementById('logModalSearch').addEventListener('keydown', e => { if (e.key === 'Enter') window.doModalSearch(); });
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
}

// ─── LOAD / SAVE ───────────────────────────────────────────────────────────
async function loadSettings() {
  try {
    const snap = await getDoc(settingsRef());
    if (snap.exists()) TARGETS = { ...TARGETS, ...snap.data() };
  } catch (e) {}
  applySettingsToUI();
}

async function loadToday() {
  const key = todayKey();
  try {
    const snap = await getDoc(dayRef(key));
    todayData = snap.exists() ? snap.data() : { meals: [], water: 0, date: key };
  } catch (e) {}
  if (TARGETS.carryover) {
    try {
      const snap = await getDoc(dayRef(dateKey(-1)));
      if (snap.exists()) {
        const yd = snap.data();
        const ycal = (yd.meals || []).reduce((s, m) => s + (m.cal || 0), 0);
        const deficit = TARGETS.cal - ycal;
        if (deficit > 50) {
          document.getElementById('carryoverBanner').style.display = 'block';
          document.getElementById('carryoverText').textContent = `+${Math.round(deficit)} kcal carried over from yesterday's deficit`;
          todayData._carryover = Math.round(deficit);
        }
      }
    } catch (e) {}
  }
}

async function loadFoods() {
  try {
    const snap = await getDocs(foodsCol());
    allFoods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {}
}

async function saveToday() {
  try { await setDoc(dayRef(todayKey()), todayData); } catch (e) {}
}

// ─── TOTALS ────────────────────────────────────────────────────────────────
function getTodayTotals() {
  return (todayData.meals || []).reduce((acc, m) => {
    acc.cal += m.cal || 0; acc.prot += m.prot || 0;
    acc.carb += m.carb || 0; acc.fat += m.fat || 0;
    return acc;
  }, { cal: 0, prot: 0, carb: 0, fat: 0 });
}

// ─── RENDER TODAY ──────────────────────────────────────────────────────────
function renderToday() {
  const t = getTodayTotals();
  const targetCal = TARGETS.cal + (todayData._carryover || 0);
  document.getElementById('mCal').innerHTML = t.cal.toLocaleString();
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
  const groups = { breakfast: [], snack1: [], lunch: [], snack2: [], dinner: [] };
  const icons = { breakfast: '🍳 Breakfast', snack1: '🥜 Snack 1', lunch: '🍗 Lunch', snack2: '🫙 Snack 2', dinner: '🌯 Dinner' };
  (todayData.meals || []).forEach(m => {
    if (groups[m.cat]) groups[m.cat].push(m); else groups.dinner.push(m);
  });
  const con = document.getElementById('mealsContainer');
  con.innerHTML = '';
  let hasAny = false;
  Object.entries(groups).forEach(([cat, items]) => {
    if (!items.length) return;
    hasAny = true;
    const group = document.createElement('div');
    group.className = 'meal-group';
    group.innerHTML = '<div class="meal-group-label">' + icons[cat] + '</div>';
    items.forEach((meal, idx) => {
      const el = document.createElement('div');
      el.className = 'meal-item logged';
      el.innerHTML = `
        <div class="meal-icon">${meal.icon || '🍽'}</div>
        <div class="meal-info">
          <div class="meal-name">${meal.name}</div>
          <div class="meal-macros">${meal.cal} kcal · P:${meal.prot}g · C:${meal.carb}g · F:${meal.fat}g</div>
        </div>
        <div class="meal-check" onclick="window.removeMeal('${cat}',${idx})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>`;
      group.appendChild(el);
    });
    con.appendChild(group);
  });
  if (!hasAny) {
    con.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🍽</div>
      <div class="empty-state-title">Nothing logged yet</div>
      <div class="empty-state-sub">Tap + to add your first meal</div>
    </div>`;
  }
}

window.removeMeal = async function(cat, idx) {
  const meals = todayData.meals || [];
  const catMeals = meals.filter(m => m.cat === cat);
  const meal = catMeals[idx];
  if (!meal) return;
  const gi = meals.indexOf(meal);
  if (gi > -1) meals.splice(gi, 1);
  todayData.meals = meals;
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
    dot.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="' + (i < current ? '#12141A' : 'none') + '" stroke="#12141A" stroke-width="2"><path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0C19 10 12 2 12 2z"/></svg>';
    dot.onclick = () => window.toggleWater(i);
    container.appendChild(dot);
  }
}

window.toggleWater = async function(idx) {
  const current = todayData.water || 0;
  todayData.water = idx < current ? idx : idx + 1;
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
  const tags = ['DEPLETED', 'LEAN', 'ATHLETIC', 'JACKED'];
  document.getElementById('bodyStatusTag').textContent = tags[physique];
  const fillY = H - (H * calPct * 0.85);
  ctx.save();
  buildBodyPath(ctx, W, H, physique);
  ctx.clip();
  ctx.fillStyle = 'rgba(18,20,26,0.06)';
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, H, 0, 0);
  if (physique >= 2) {
    grad.addColorStop(0, 'rgba(22,168,99,0.9)');
    grad.addColorStop(0.5, 'rgba(22,168,99,0.7)');
    grad.addColorStop(1, 'rgba(22,168,99,0.4)');
  } else {
    grad.addColorStop(0, 'rgba(18,20,26,0.7)');
    grad.addColorStop(1, 'rgba(18,20,26,0.3)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, fillY, W, H - fillY);
  const shimmer = ctx.createLinearGradient(0, fillY - 4, 0, fillY + 4);
  shimmer.addColorStop(0, 'transparent');
  shimmer.addColorStop(0.5, physique >= 2 ? 'rgba(22,168,99,0.8)' : 'rgba(255,255,255,0.4)');
  shimmer.addColorStop(1, 'transparent');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, fillY - 4, W, 8);
  ctx.restore();
  ctx.save();
  buildBodyPath(ctx, W, H, physique);
  ctx.strokeStyle = physique >= 2 ? 'rgba(22,168,99,0.6)' : 'rgba(18,20,26,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  if (physique === 3) {
    ctx.save();
    buildBodyPath(ctx, W, H, physique);
    ctx.shadowColor = 'rgba(22,168,99,0.5)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(22,168,99,0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

function buildBodyPath(ctx, W, H, physique) {
  const scale = [0.72, 0.82, 0.92, 1.0][physique];
  const cx = W / 2;
  const sw = 68 * scale, ww = 34 * scale, hw = 44 * scale, nw = 12, headR = 22;
  const headY = 28, neckTop = headY + headR * 0.6, neckBot = neckTop + 16;
  const shoulderY = neckBot + 8, chestY = shoulderY + 30 * scale;
  const waistY = shoulderY + 70, hipY = waistY + 22;
  const thighY = hipY + 50 * scale, kneeY = thighY + 30, calfBot = kneeY + 50 * scale;
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.moveTo(cx - nw, neckTop);
  ctx.lineTo(cx - nw, neckBot);
  ctx.lineTo(cx - sw, shoulderY);
  ctx.lineTo(cx - sw - 14 * scale, chestY + 10);
  ctx.lineTo(cx - ww - 8, waistY);
  ctx.lineTo(cx - ww, waistY);
  ctx.lineTo(cx - hw, hipY);
  ctx.lineTo(cx - hw + 6, thighY);
  ctx.lineTo(cx - 18, kneeY);
  ctx.lineTo(cx - 16, calfBot);
  ctx.lineTo(cx + 16, calfBot);
  ctx.lineTo(cx + 18, kneeY);
  ctx.lineTo(cx + hw - 6, thighY);
  ctx.lineTo(cx + hw, hipY);
  ctx.lineTo(cx + ww, waistY);
  ctx.lineTo(cx + ww + 8, waistY);
  ctx.lineTo(cx + sw + 14 * scale, chestY + 10);
  ctx.lineTo(cx + sw, shoulderY);
  ctx.lineTo(cx + nw, neckBot);
  ctx.lineTo(cx + nw, neckTop);
  ctx.closePath();
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────
window.showTab = function(tab, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn, .sidebar-item').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');
  document.querySelectorAll('[data-tab="' + tab + '"]').forEach(el => el.classList.add('active'));
  if (btn && btn.classList.contains('tab-btn')) updateTabIndicator(btn);
  if (tab === 'history') renderHistory();
  if (tab === 'trends') renderTrends();
  if (tab === 'log') renderMyFoods();
  if (tab === 'settings') applySettingsToUI();
};

function updateTabIndicator(btn) {
  const bar = document.querySelector('.tab-bar');
  const ind = document.getElementById('tabIndicator');
  if (!bar || !ind || !btn) return;
  const rect = btn.getBoundingClientRect();
  const barRect = bar.getBoundingClientRect();
  ind.style.left = (rect.left - barRect.left) + 'px';
  ind.style.width = rect.width + 'px';
}

window.switchLogTab = function(tab) {
  document.querySelectorAll('.log-tab').forEach((t, i) => {
    t.classList.toggle('active', ['search', 'myfoods', 'manual', 'scan'][i] === tab);
  });
  ['logTabSearch', 'logTabMyfoods', 'logTabManual', 'logTabScan'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const tabMap = { search: 'logTabSearch', myfoods: 'logTabMyfoods', manual: 'logTabManual', scan: 'logTabScan' };
  const target = document.getElementById(tabMap[tab]);
  if (target) target.style.display = 'block';
};

// ─── FOOD SEARCH ───────────────────────────────────────────────────────────
// API Ninjas returns data already scaled to the query (100g default)
// Fields: calories, protein_g, carbohydrates_total_g, fat_total_g, serving_size_g
function parseItem(item) {
  const serving = parseFloat(item.serving_size_g) || 100;
  const cal = parseFloat(item.calories) || 0;
  const prot = parseFloat(item.protein_g) || 0;
  const carb = parseFloat(item.carbohydrates_total_g) || 0;
  const fat = parseFloat(item.fat_total_g) || 0;
  // Values are already for the serving size — convert to per-100g for scaling
  return {
    name: item.name,
    serving,
    per100: {
      cal: Math.round(cal / serving * 100),
      prot: Math.round(prot / serving * 100),
      carb: Math.round(carb / serving * 100),
      fat: Math.round(fat / serving * 100),
    },
    // Display values at default serving
    cal: Math.round(cal),
    prot: Math.round(prot),
    carb: Math.round(carb),
    fat: Math.round(fat),
  };
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
  spinner.classList.add('active');
  results.innerHTML = '';
  try {
    const items = await fetchNutrition(q);
    spinner.classList.remove('active');
    if (!items.length) { results.innerHTML = '<div class="search-empty">No results. Try a different term.</div>'; return; }
    items.forEach(item => {
      const p = parseItem(item);
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · C:${p.carb}g · F:${p.fat}g (per ${p.serving}g)</div>`;
      div.onclick = () => {
        openLogModal();
        setTimeout(() => { document.getElementById('logModalSearch').value = p.name; selectModalFood(item); }, 150);
        showTab('today', document.querySelector('[data-tab="today"]'));
      };
      results.appendChild(div);
    });
  } catch (e) {
    spinner.classList.remove('active');
    results.innerHTML = '<div class="search-empty">Search unavailable. Check connection.</div>';
  }
};

window.doModalSearch = async function() {
  const q = document.getElementById('logModalSearch').value.trim();
  if (!q) return;
  const results = document.getElementById('logModalResults');
  results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">Searching...</div>';
  try {
    const items = await fetchNutrition(q);
    results.innerHTML = '';
    if (!items.length) { results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-faint);font-size:13px;">No results</div>'; return; }
    items.slice(0, 6).forEach(item => {
      const p = parseItem(item);
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.style.marginBottom = '4px';
      div.innerHTML = `<div class="search-result-name">${p.name}</div><div class="search-result-meta">${p.cal} kcal · P:${p.prot}g · C:${p.carb}g · F:${p.fat}g (per ${p.serving}g)</div>`;
      div.onclick = () => selectModalFood(item);
      results.appendChild(div);
    });
  } catch (e) {
    results.innerHTML = '<div style="text-align:center;padding:12px;color:var(--red);font-size:13px;">Search failed</div>';
  }
};

function selectModalFood(item) {
  const p = parseItem(item);
  selectedFoodPer100 = p.per100;
  selectedFoodPer100.name = p.name;
  document.getElementById('logModalResults').innerHTML = '';
  document.getElementById('logModalServing').value = p.serving;
  document.getElementById('logModalSelectedWrap').style.display = 'block';
  window.updateModalServing();
}

window.updateModalServing = function() {
  if (!selectedFoodPer100) return;
  const g = parseFloat(document.getElementById('logModalServing').value) || 100;
  const r = g / 100, f = selectedFoodPer100;
  modalSelectedFood = {
    name: f.name, icon: '🍽',
    cal: Math.round(f.cal * r), prot: Math.round(f.prot * r),
    carb: Math.round(f.carb * r), fat: Math.round(f.fat * r)
  };
  document.getElementById('logModalSelected').innerHTML = `
    <div class="selected-preview-name">${f.name} (${g}g)</div>
    <div class="selected-preview-meta">${modalSelectedFood.cal} kcal · P:${modalSelectedFood.prot}g · C:${modalSelectedFood.carb}g · F:${modalSelectedFood.fat}g</div>`;
};

// ─── AI MEAL SCANNER ───────────────────────────────────────────────────────
window.openScanModal = function() {
  document.getElementById('scanModal').classList.add('open');
  document.getElementById('scanResult').style.display = 'none';
  document.getElementById('scanPreview').style.display = 'none';
  document.getElementById('scanStatus').textContent = '';
  document.getElementById('scanWeight').value = '';
  document.getElementById('scanImageInput').value = '';
};

window.handleScanImage = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('scanPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.analyzeMeal = async function() {
  const input = document.getElementById('scanImageInput');
  const weight = document.getElementById('scanWeight').value.trim();
  const status = document.getElementById('scanStatus');
  if (!input.files[0]) { status.textContent = 'Please select a photo first.'; return; }
  status.textContent = 'Analyzing meal...';
  document.getElementById('scanResult').style.display = 'none';

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    const mediaType = input.files[0].type || 'image/jpeg';
    const weightText = weight ? ` The total weight of the meal is approximately ${weight}g.` : '';
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: `Analyze this meal photo and estimate the nutritional content.${weightText} Respond ONLY with a JSON object in this exact format, no other text: {"name":"meal name","cal":0,"prot":0,"carb":0,"fat":0,"notes":"brief note about accuracy"}` }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);
      status.textContent = '';
      document.getElementById('scanResult').style.display = 'block';
      document.getElementById('scanResultName').textContent = result.name;
      document.getElementById('scanResultMacros').textContent = `${result.cal} kcal · P:${result.prot}g · C:${result.carb}g · F:${result.fat}g`;
      document.getElementById('scanResultNotes').textContent = result.notes || '';
      // Store for adding
      window._scanResult = result;
    } catch (e) {
      status.textContent = 'Analysis failed. Try again.';
    }
  };
  reader.readAsDataURL(input.files[0]);
};

window.addScannedMeal = async function() {
  if (!window._scanResult) return;
  const cat = document.getElementById('scanCat').value;
  const meal = {
    cat, name: window._scanResult.name, icon: '📷',
    cal: window._scanResult.cal, prot: window._scanResult.prot,
    carb: window._scanResult.carb, fat: window._scanResult.fat,
    ts: Date.now()
  };
  todayData.meals = [...(todayData.meals || []), meal];
  await saveToday();
  renderToday();
  window.closeModal('scanModal');
  showTab('today', document.querySelector('[data-tab="today"]'));
};

// ─── MY FOODS ──────────────────────────────────────────────────────────────
function renderMyFoods() {
  const list = document.getElementById('myFoodsList');
  if (!allFoods.length) {
    list.innerHTML = '<div class="search-empty">No saved foods yet.<br>Tap "Create Food" to add one.</div>';
    return;
  }
  list.innerHTML = '';
  allFoods.forEach(food => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <div style="font-size:22px">${food.icon || '🍽'}</div>
      <div class="food-item-info">
        <div class="food-item-name">${food.name}</div>
        <div class="food-item-meta">${food.cal} kcal · P:${food.prot}g · C:${food.carb}g · F:${food.fat}g (${food.serving}g)</div>
      </div>
      <button class="food-item-add" onclick="window.addSavedFood('${food.id}')">+</button>
      <button class="food-item-del" onclick="window.deleteSavedFood('${food.id}')">×</button>`;
    list.appendChild(div);
  });
}

window.addSavedFood = async function(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food) return;
  const cat = prompt('Category?\nbreakfast / snack1 / lunch / snack2 / dinner', 'lunch') || 'lunch';
  const meal = { cat, name: food.name, icon: food.icon || '🍽', cal: food.cal, prot: food.prot, carb: food.carb, fat: food.fat, ts: Date.now() };
  todayData.meals = [...(todayData.meals || []), meal];
  await saveToday();
  renderToday();
  showTab('today', document.querySelector('[data-tab="today"]'));
};

window.deleteSavedFood = async function(id) {
  if (!confirm('Delete this food?')) return;
  try {
    await deleteDoc(doc(db, 'tracked', USER_ID, 'foods', id));
    allFoods = allFoods.filter(f => f.id !== id);
    renderMyFoods();
  } catch (e) {}
};

window.saveCustomFood = async function() {
  const name = document.getElementById('cfName').value.trim();
  if (!name) return;
  const food = {
    name, icon: document.getElementById('cfIcon').value.trim() || '🍽',
    serving: parseInt(document.getElementById('cfServing').value) || 100,
    cal: parseInt(document.getElementById('cfCal').value) || 0,
    prot: parseInt(document.getElementById('cfProt').value) || 0,
    carb: parseInt(document.getElementById('cfCarb').value) || 0,
    fat: parseInt(document.getElementById('cfFat').value) || 0,
  };
  try {
    const ref = await addDoc(foodsCol(), food);
    allFoods.push({ id: ref.id, ...food });
    renderMyFoods();
    window.closeModal('createFoodModal');
  } catch (e) {}
};

// ─── MANUAL MEAL ───────────────────────────────────────────────────────────
window.saveManualMeal = async function() {
  const name = document.getElementById('manualName').value.trim();
  if (!name) return;
  const meal = {
    cat: document.getElementById('manualCat').value,
    name, icon: document.getElementById('manualIcon').value.trim() || '🍽',
    cal: parseInt(document.getElementById('manualCal').value) || 0,
    prot: parseInt(document.getElementById('manualProt').value) || 0,
    carb: parseInt(document.getElementById('manualCarb').value) || 0,
    fat: parseInt(document.getElementById('manualFat').value) || 0,
    ts: Date.now()
  };
  todayData.meals = [...(todayData.meals || []), meal];
  await saveToday();
  renderToday();
  showTab('today', document.querySelector('[data-tab="today"]'));
  ['manualName','manualIcon','manualCal','manualProt','manualCarb','manualFat'].forEach(id => document.getElementById(id).value = '');
};

// ─── LOG MODAL ─────────────────────────────────────────────────────────────
window.openLogModal = function() {
  selectedFoodPer100 = null;
  modalSelectedFood = null;
  document.getElementById('logModalSearch').value = '';
  document.getElementById('logModalResults').innerHTML = '';
  document.getElementById('logModalSelectedWrap').style.display = 'none';
  document.getElementById('logModal').classList.add('open');
};

window.saveLogMeal = async function() {
  if (!modalSelectedFood) { alert('Please search and select a food first.'); return; }
  const meal = { ...modalSelectedFood, cat: document.getElementById('logCat').value, ts: Date.now() };
  todayData.meals = [...(todayData.meals || []), meal];
  await saveToday();
  renderToday();
  window.closeModal('logModal');
};

// ─── HISTORY ───────────────────────────────────────────────────────────────
async function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '<div class="search-empty">Loading...</div>';
  const results = [];
  for (let i = 1; i <= 30; i++) {
    const key = dateKey(-i);
    try {
      const snap = await getDoc(dayRef(key));
      if (snap.exists()) {
        const d = snap.data();
        if ((d.meals || []).length || (d.water || 0) > 0) results.push({ key, ...d });
      }
    } catch (e) {}
  }
  if (!results.length) {
    list.innerHTML = '<div class="search-empty">No history yet.<br>Start logging today!</div>';
    return;
  }
  list.innerHTML = '';
  results.forEach(day => {
    const meals = day.meals || [];
    const t = meals.reduce((a, m) => { a.cal+=m.cal||0; a.prot+=m.prot||0; a.carb+=m.carb||0; a.fat+=m.fat||0; return a; }, {cal:0,prot:0,carb:0,fat:0});
    const hitCal = t.cal >= TARGETS.cal * 0.9;
    const hitProt = t.prot >= TARGETS.prot * 0.9;
    const badge = hitCal && hitProt ? 'hit' : (hitCal || hitProt ? 'partial' : 'miss');
    const badgeText = { hit: '✓ On Target', partial: '~ Partial', miss: '✗ Missed' }[badge];
    const d = new Date(day.key + 'T12:00:00');
    const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const calPct = Math.min(100, Math.round(t.cal / TARGETS.cal * 100));
    const protPct = Math.min(100, Math.round(t.prot / TARGETS.prot * 100));
    const el = document.createElement('div');
    el.className = 'history-day';
    el.innerHTML = `
      <div class="history-day-head" onclick="this.nextElementSibling.classList.toggle('open')">
        <div>
          <div class="history-day-date">${dateStr}</div>
          <div class="history-day-cal">${t.cal} kcal · ${meals.length} meal${meals.length !== 1 ? 's' : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="history-day-badge badge-${badge}">${badgeText}</div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      <div class="history-day-detail">
        <div class="history-progress-row">
          <div class="history-progress-item">
            <div class="history-progress-label">Calories</div>
            <div class="history-progress-bar"><div class="history-progress-fill" style="width:${calPct}%;background:var(--accent)"></div></div>
            <div class="history-progress-val">${t.cal} / ${TARGETS.cal}</div>
          </div>
          <div class="history-progress-item">
            <div class="history-progress-label">Protein</div>
            <div class="history-progress-bar"><div class="history-progress-fill" style="width:${protPct}%;background:var(--blue)"></div></div>
            <div class="history-progress-val">${t.prot}g / ${TARGETS.prot}g</div>
          </div>
        </div>
        <div class="history-macro-row"><span class="history-macro-label">Carbs</span><span class="history-macro-val">${t.carb}g / ${TARGETS.carb}g</span></div>
        <div class="history-macro-row"><span class="history-macro-label">Fats</span><span class="history-macro-val">${t.fat}g / ${TARGETS.fat}g</span></div>
        <div class="history-macro-row"><span class="history-macro-label">Water</span><span class="history-macro-val">${day.water || 0} / ${TARGETS.water} glasses</span></div>
        ${meals.map(m => `<div class="history-meal-row"><span class="history-meal-icon">${m.icon||'🍽'}</span><span class="history-meal-name">${m.name}</span><span class="history-meal-cal">${m.cal} kcal</span></div>`).join('')}
      </div>`;
    list.appendChild(el);
  });
}

// ─── TRENDS ────────────────────────────────────────────────────────────────
async function renderTrends() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const key = dateKey(-i);
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
    try {
      const snap = await getDoc(dayRef(key));
      if (snap.exists()) {
        const data = snap.data();
        const meals = data.meals || [];
        days.push({ label, cal: meals.reduce((s,m)=>s+(m.cal||0),0), prot: meals.reduce((s,m)=>s+(m.prot||0),0), water: data.water||0 });
      } else { days.push({ label, cal: 0, prot: 0, water: 0 }); }
    } catch (e) { days.push({ label, cal: 0, prot: 0, water: 0 }); }
  }
  renderBarChart('calChart', days, 'cal', TARGETS.cal, '#12141A');
  renderBarChart('protChart', days, 'prot', TARGETS.prot, '#378ADD');
  renderBarChart('waterChart', days, 'water', TARGETS.water, '#378ADD');
}

function renderBarChart(id, days, key, target, color) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  const max = Math.max(target * 1.1, ...days.map(d => d[key]), 1);
  days.forEach(d => {
    const pct = Math.round(d[key] / max * 100);
    const hitColor = d[key] >= target * 0.9 ? 'rgba(22,168,99,0.85)' : color;
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar-val">${d[key]}</div>
      <div class="bar" style="height:${pct}%;background:${hitColor};opacity:0.85;"></div>
      <div class="bar-label">${d.label}</div>`;
    el.appendChild(col);
  });
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────
function applySettingsToUI() {
  document.getElementById('setCal').value = TARGETS.cal;
  document.getElementById('setProt').value = TARGETS.prot;
  document.getElementById('setCarb').value = TARGETS.carb;
  document.getElementById('setFat').value = TARGETS.fat;
  document.getElementById('setWater').value = TARGETS.water || 8;
  document.getElementById('setCarryover').checked = TARGETS.carryover || false;
}

window.saveSettings = async function() {
  TARGETS = {
    cal: parseInt(document.getElementById('setCal').value) || 2865,
    prot: parseInt(document.getElementById('setProt').value) || 183,
    carb: parseInt(document.getElementById('setCarb').value) || 300,
    fat: parseInt(document.getElementById('setFat').value) || 80,
    water: parseInt(document.getElementById('setWater').value) || 8,
    carryover: document.getElementById('setCarryover').checked
  };
  try { await setDoc(settingsRef(), TARGETS); } catch (e) {}
  applySettingsToUI();
  renderToday();
  renderWater();
  drawBody();
  alert('Settings saved ✓');
};

// ─── MODALS ────────────────────────────────────────────────────────────────
window.closeModal = function(id) { document.getElementById(id).classList.remove('open'); };
window.openCreateFoodModal = function() {
  ['cfName','cfIcon','cfServing','cfCal','cfProt','cfCarb','cfFat'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('createFoodModal').classList.add('open');
};

// ─── BOOT ──────────────────────────────────────────────────────────────────
init();

// ─── PENDING MEAL (for AI scanner) ─────────────────────────────────────────
window.addPendingMeal = async function() {
  if (!window._pendingMeal) return;
  todayData.meals = [...(todayData.meals || []), window._pendingMeal];
  await saveToday();
  renderToday();
  window._pendingMeal = null;
  showTab('today', document.querySelector('[data-tab="today"]'));
};
