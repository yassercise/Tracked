import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0QDm49wVArv6oJA4YNGdRCXDe9OEtkI0",
  authDomain: "ekk-hub.firebaseapp.com",
  projectId: "ekk-hub",
  storageBucket: "ekk-hub.firebasestorage.app",
  messagingSenderId: "68211752660",
  appId: "1:68211752660:web:1098c3baed22cae8b7c541"
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

/* ============================================================
   SEED DATA
   ============================================================ */

const RAW_TASKS_KDR = JSON.parse(`[{"id":"t1","title":"Finalize Launch Video","cat":"Video Production","owner":"Videography","priority":"high","status":"progress","due":"2026-08-02","notes":"","subtasks":[{"id":"s1","text":"Swap vehicle CGI animation","done":true},{"id":"s17860042296393v4","text":"Review Video & Send Feedback","done":false}],"deps":["t1784183589084uznq"],"links":[]},{"id":"t2","title":"Finalize Influencer Selection","cat":"Influencers","owner":"Yasir","priority":"high","status":"progress","due":"2026-07-28","notes":"","subtasks":[{"id":"s178418572598187q","text":"Contact Eman to Inquire on GCC Influencers","done":true},{"id":"s17852206933576hb","text":"Send GCC Influencer Brief to Eman","done":true},{"id":"s1785650674992xkj","text":"Send Full Bahrain Influencer List to Hasan","done":true},{"id":"s1785650690900n9s","text":"Get 5osh Fkra Quotations Approved","done":true}],"deps":[],"links":[]},{"id":"t1784183589084uznq","title":"Secure Brand Prize Sponsorship","cat":"Brand Collaborations","owner":"Yasir","priority":"high","status":"done","due":"2026-08-10","notes":"","subtasks":[{"id":"a1","text":"Send Proposal to Automotive Brands","done":true},{"id":"a2","text":"Meet With Team to Discuss Proposal","done":true},{"id":"a3","text":"Get Confirmation from Teams on Sponsorships","done":true},{"id":"a4","text":"Meet With Teams on Prize Restructure","done":true},{"id":"a5","text":"Confirm New Prize Structure","done":true},{"id":"a6","text":"Create Quotations to Each Brand On Sponsorship","done":true},{"id":"a7","text":"Send Quotation to Suresh for Review & Confirmation With Legal","done":true},{"id":"a8","text":"Send Quotations to Automotive Brands","done":true},{"id":"a9","text":"Receive LPOs from all Brands","done":true}],"deps":[],"links":[]},{"id":"t5","title":"Allign With Automotive Brand on Timeline & Activations","cat":"Brand Collaborations","owner":"Yasir","priority":"high","status":"done","due":"2026-07-16","notes":"Deepal=Platinum, Jetour=Gold, Toyota=Gold, Lexus=Gold, iCAUR=Silver. All raffle sponsors.","subtasks":[{"id":"s1","text":"Have Meeting With All Brands on Timeline","done":true}],"deps":[],"links":[]},{"id":"t7","title":"Setup CRM Email Flow & Database","cat":"Email / CRM","owner":"CRM","priority":"high","status":"progress","due":"2026-08-08","notes":"","subtasks":[{"id":"b1","text":"Send Email to CRM Team to Brief Them on Project","done":true},{"id":"b2","text":"Meet With CRM Team","done":true},{"id":"b3","text":"Contact Digital Solutions to Edit Welcome Email","done":true},{"id":"b4","text":"Edit Welcome Email Content & Send to Sree","done":true},{"id":"b5","text":"Test Registration & Welcome Email","done":true},{"id":"b6","text":"Send Campaign Brief to CRM Team With Visuals, Texts & Overall Details","done":false}],"deps":[],"links":[]},{"id":"t8","title":"Create 1st Pre-Teaser Post","cat":"Pre-Teaser Phase","owner":"Yasir","priority":"high","status":"done","due":"2026-07-09","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t11","title":"Plan & Setup BSC event activation (Aug 14-20)","cat":"Bahrain Sports City","owner":"Yasir","priority":"medium","status":"progress","due":"2026-08-13","notes":"iCAUR exclusive branding at eSports section. Game playable on screens. Possible booth setup.","subtasks":[{"id":"c1","text":"Go to Sports City for Sight Visit","done":false},{"id":"c2","text":"Design BSC event banners","done":false},{"id":"c3","text":"Set up screens and game terminals","done":false},{"id":"c4","text":"Brief Videography Team to Shoot Recap Video","done":false}],"deps":[],"links":[]},{"id":"t13","title":"Brief Creative Team on Designs","cat":"Design","owner":"Yasir","priority":"high","status":"done","due":"2026-07-15","notes":"","subtasks":[{"id":"d1","text":"Meet With Creative Team","done":true},{"id":"d2","text":"Create & Send Detailed Brief to Ismael","done":true},{"id":"d3","text":"Send Creative Brief to Miracle","done":true}],"deps":[],"links":[]},{"id":"t1783939377826t96r","title":"Create 2nd Pre-Teaser Post","cat":"Pre-Teaser Phase","owner":"Yasir","priority":"high","status":"done","due":"2026-07-16","notes":"","subtasks":[{"id":"e1","text":"Create Artwork","done":true},{"id":"e2","text":"Send to Georgiana for Approval","done":true},{"id":"e3","text":"Create Caption","done":true},{"id":"e4","text":"Publish the Post","done":true}],"deps":[],"links":[]},{"id":"t1783939422159rsgh","title":"Create 3rd Pre-Teaser Post","cat":"Pre-Teaser Phase","owner":"Yasir","priority":"low","status":"done","due":"2026-07-23","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t1783939440325eshi","title":"Create 4th Pre-Teaser Post","cat":"Pre-Teaser Phase","owner":"Yasir","priority":"low","status":"done","due":"2026-07-30","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t17839405220978x5t","title":"Publish 1st Teaser Post","cat":"Teaser Phase","owner":"Yasir","priority":"medium","status":"done","due":"2026-08-04","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t1783940566379extm","title":"Publish 2nd Teaser Post","cat":"Teaser Phase","owner":"Yasir","priority":"medium","status":"todo","due":"2026-08-06","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t1783940595862i6ww","title":"Publish 3rd Teaser Post","cat":"Teaser Phase","owner":"Yasir","priority":"medium","status":"todo","due":"2026-08-11","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t178591983618073o5","title":"Teaser Phase Visuals","cat":"Design","owner":"Design Team","priority":"high","status":"done","due":"","notes":"","subtasks":[{"id":"f1","text":"Review & Leave Feedback on Artwork","done":true},{"id":"f2","text":"Request Various Sizes for Artwork","done":true},{"id":"f3","text":"Confirm & Approve Artworks","done":true}],"deps":[],"links":[]},{"id":"t1785220358635oxpx","title":"Main Campaign Visuals","cat":"Design","owner":"Design Team","priority":"high","status":"done","due":"2026-07-30","notes":"","subtasks":[{"id":"g1","text":"Have Meeting With Miracle to Review Visual Concepts","done":true},{"id":"g2","text":"Review With Georgiana & Send Feedback","done":true},{"id":"g3","text":"Inform Miracle to Design Main Visual in Various Formats","done":true},{"id":"g4","text":"Review & Send Feedback for Edits","done":true},{"id":"g5","text":"Confirm & Approve Main Visuals","done":true}],"deps":[],"links":[]},{"id":"t1785918663067rqu8","title":"Khosh Fkra Video","cat":"Influencers","owner":"Yasir","priority":"high","status":"progress","due":"2026-08-10","notes":"","subtasks":[{"id":"h1","text":"Send Supplier Details to Sreejith","done":true},{"id":"h2","text":"Have Meeting With Khosh Fkra Team","done":false}],"deps":[],"links":[]},{"id":"t1785918678350sepr","title":"Gulf Insider Video","cat":"Influencers","owner":"Yasir","priority":"medium","status":"progress","due":"2026-08-10","notes":"","subtasks":[{"id":"i1","text":"Confirm Video Concept","done":true},{"id":"i2","text":"Send Video Feedback to Hasan","done":true},{"id":"i3","text":"Brief Script & Idea With Georgiana","done":true}],"deps":[],"links":[]},{"id":"t1785918693300ctvs","title":"Tekken Master Video","cat":"Influencers","owner":"Yasir","priority":"medium","status":"todo","due":"2026-08-11","notes":"","subtasks":[],"deps":[],"links":[]},{"id":"t1785918861149wbjq","title":"KDR Sports City Media Launch","cat":"Bahrain Sports City","owner":"Corporate Comms","priority":"high","status":"progress","due":"2026-08-10","notes":"","subtasks":[{"id":"j1","text":"Contact Hasan to Arrange for Media Coverage","done":true},{"id":"j2","text":"Receive Media Agency Quotations from Hasan","done":false}],"deps":[],"links":[]},{"id":"t1785919069225rkuk","title":"Teaser Phase Sponsor Ads","cat":"Sponsored Ads","owner":"Yasir","priority":"medium","status":"progress","due":"2026-08-05","notes":"","subtasks":[{"id":"k1","text":"Have Meeting With Digital Ads Team","done":true},{"id":"k2","text":"Create Media Plan & Get Approval","done":true},{"id":"k3","text":"Send Sreejith Media Plan Quotation for PR","done":true},{"id":"k4","text":"Send PR to Marketing Accounts for LPO","done":true},{"id":"k5","text":"Send LPO to Digital Ads Team Alongside Teaser 1 Link","done":true},{"id":"k6","text":"Brief & Discuss Sponsored Ad Audience Change With Georgiana","done":true},{"id":"k7","text":"Send Email Reply on Change to Nada","done":true}],"deps":[],"links":[]},{"id":"t1785919211306x7ln","title":"Terms & Conditions","cat":"Game","owner":"Yasir","priority":"high","status":"progress","due":"","notes":"","subtasks":[{"id":"l1","text":"Review Current Terms & Conditions","done":true},{"id":"l2","text":"Edit Terms & Conditions to Include 3 New Clauses","done":true},{"id":"l3","text":"Review Updated Terms & Conditions With Matthew & Georgiana","done":true},{"id":"l4","text":"Send Updated Document to Legal for Review","done":true},{"id":"l5","text":"Confirm Prize Money Details & Make Edits to Document","done":false},{"id":"l6","text":"Send Final Terms & Conditions to Digital Solutions","done":false}],"deps":[],"links":[]},{"id":"t1785919334521cexw","title":"In-Game Banners (TyrePlus)","cat":"Brand Collaborations","owner":"Yasir","priority":"high","status":"progress","due":"","notes":"","subtasks":[{"id":"m1","text":"Send Banner Selection Document to TyrePlus","done":true},{"id":"m2","text":"Receive Selected Banners & LPO","done":true},{"id":"m3","text":"Send Reference Sizes for Banners & Request Artwork from TyrePlus","done":true},{"id":"m4","text":"Receive 4 Banner Artwork From TyrePlus","done":false},{"id":"m5","text":"Send Banner Artworks to Sree","done":false}],"deps":[],"links":[]},{"id":"t1785919344187hjxf","title":"In-Game Banners (KVL & KPV)","cat":"Brand Collaborations","owner":"Yasir","priority":"high","status":"progress","due":"","notes":"","subtasks":[{"id":"n1","text":"Confirm KVL & KPV Banner Selections","done":true},{"id":"n2","text":"Send Email to Suresh to Create LPO","done":true},{"id":"n3","text":"Create Banner Artwork for KPV","done":false},{"id":"n4","text":"Create Banner Artwork for KVL","done":false}],"deps":[],"links":[]},{"id":"t1785919934428k67w","title":"Landing Page","cat":"Game","owner":"Digital Solutions","priority":"high","status":"progress","due":"","notes":"","subtasks":[{"id":"o1","text":"Review & Approve Concept & Content of Landing Page With Georgiana","done":true},{"id":"o2","text":"Send Content & Assets to Sree for Landing Page","done":false}],"deps":[],"links":[]},{"id":"t1785920002300yvxn","title":"Individual Vehicle Visuals","cat":"Design","owner":"Design Team","priority":"high","status":"progress","due":"","notes":"","subtasks":[{"id":"p1","text":"Review & Leave Feedback on Artwork","done":true},{"id":"p2","text":"Review Updated Artwork With Georgiana","done":false},{"id":"p3","text":"Send Artwork to Each Automotive Brand for Approval","done":false}],"deps":[],"links":[]},{"id":"t1785920254959t22m","title":"Website Banner","cat":"Game","owner":"Digital Solutions","priority":"high","status":"todo","due":"","notes":"","subtasks":[{"id":"q1","text":"Send Main Visual as Landscape to Digital Solutions to Keep as Website Banner","done":false}],"deps":[],"links":[]}]`);
RAW_TASKS_KDR.forEach(t => { t.projectId = 'racing-game'; t.subtasks.forEach(s => { s.due = ''; s.notes = ''; s.completedAt = null; }); });

const RAW_TIMELINE_KDR = JSON.parse(`[{"task":"Weekly build-up post #1 (cryptic)","owner":"Yasir","cat":"Pre-Launch Content","dates":["2026-07-09"]},{"task":"Weekly build-up post #2 (cryptic)","owner":"Yasir","cat":"Pre-Launch Content","dates":["2026-07-16"]},{"task":"Weekly build-up post #3 (cryptic)","owner":"Yasir","cat":"Pre-Launch Content","dates":["2026-07-23"]},{"task":"Weekly build-up post #4 (cryptic)","owner":"Yasir","cat":"Pre-Launch Content","dates":["2026-07-30"]},{"task":"Teaser post #1 — Helmet","owner":"Design Team","cat":"Teaser Phase","dates":["2026-08-04"]},{"task":"Teaser post #2 — Circuit","owner":"Design Team","cat":"Teaser Phase","dates":["2026-08-06"]},{"cat":"Teaser Phase","task":"Teaser post #3 — Tomorrow.","owner":"Design Team","dates":["2026-08-11"]},{"cat":"Launch","task":"Game goes LIVE","owner":"Digital Solutions","dates":["2026-08-12"]},{"task":"Launch video posted — KDR channels","owner":"Yasir","cat":"Launch","dates":["2026-08-12"]},{"task":"KDR launch post","owner":"Design Team","cat":"Launch","dates":["2026-08-12"]},{"task":"Deepal — collab post live","owner":"Corporate Comms","cat":"Brand Collaborations","dates":["2026-08-12"]},{"cat":"Brand Collaborations","task":"Deepal Races Completed With Vehicle Post","owner":"Design Team","dates":["2026-08-19","2026-08-26","2026-09-02","2026-09-09"]},{"task":"Jetour — collab post live","owner":"Corporate Comms","cat":"Brand Collaborations","dates":["2026-08-12"]},{"task":"Jetour Races Completed With Vehicle Post","owner":"Design Team","cat":"Brand Collaborations","dates":["2026-08-19","2026-08-26","2026-09-02","2026-09-09"]},{"task":"iCAUR — collab post live","owner":"Corporate Comms","cat":"Brand Collaborations","dates":["2026-08-12"]},{"cat":"Brand Collaborations","task":"iCAUR Races Completed With Vehicle Post","owner":"Design Team","dates":["2026-08-19","2026-08-26","2026-09-02","2026-09-09"]},{"task":"Toyota — collab post","owner":"Corporate Comms","cat":"Brand Collaborations","dates":["2026-08-12"]},{"cat":"Brand Collaborations","task":"Toyota Races Completed With Vehicle Post","owner":"Design Team","dates":["2026-08-19","2026-08-26","2026-09-02","2026-09-09"]},{"task":"Lexus — collab post live","owner":"Corporate Comms","cat":"Brand Collaborations","dates":["2026-08-12"]},{"cat":"Influencers","task":"Tekkenmaster — reel + story live","owner":"Corporate Comms","dates":["2026-08-12"]},{"cat":"Influencers","task":"5osh Fkra — reel + story live","owner":"Corporate Comms","dates":["2026-08-12"]},{"cat":"Influencers","task":"Charlie / Gulf Insider — reel + story live","owner":"Corporate Comms","dates":["2026-08-12"]},{"cat":"Influencers","task":"GCC Influencer #1 (Qatar) — reel live","owner":"Corporate Comms","dates":["2026-08-14"]},{"cat":"Influencers","task":"GCC Influencer #2 (Kuwait) — reel live","owner":"Corporate Comms","dates":["2026-08-16"]},{"cat":"Influencers","task":"Influencer follow-up story (leaderboard)","owner":"Corporate Comms","dates":["2026-08-26"]},{"cat":"Bahrain Sports City","task":"BSC Event — KDR booth activation","owner":"Design Team","dates":["2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21"]},{"cat":"Bahrain Sports City","task":"BSC social coverage posts","owner":"Design Team","dates":["2026-08-14","2026-08-17","2026-08-19","2026-08-21"]},{"cat":"Competition & Leaderboard","task":"Leaderboard competition open","owner":"Digital Solutions","dates":["2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31","2026-09-01","2026-09-02","2026-09-03","2026-09-04","2026-09-05","2026-09-06","2026-09-07","2026-09-08","2026-09-09","2026-09-10","2026-09-11","2026-09-12"]},{"task":"Leaderboard update post — Week 1","owner":"Design Team","cat":"Competition & Leaderboard","dates":["2026-08-20"]},{"task":"Leaderboard update post — Week 2","owner":"Design Team","cat":"Competition & Leaderboard","dates":["2026-08-27"]},{"task":"Leaderboard update post — Week 3","owner":"Design Team","cat":"Competition & Leaderboard","dates":["2026-09-03"]},{"task":"Last chance urgency posts","owner":"Design Team","cat":"Competition & Leaderboard","dates":["2026-09-10"]},{"cat":"Competition & Leaderboard","task":"Leaderboard closes","owner":"Digital Solutions","dates":["2026-09-12"]},{"task":"Winners announced — collab post","owner":"Design Team","cat":"Competition & Leaderboard","dates":["2026-09-13"]},{"cat":"UGC","task":"UGC bonus draw open","owner":"Design Team","dates":["2026-08-12"]},{"cat":"UGC","task":"UGC reshares — ongoing","owner":"KDR Channel","dates":["2026-08-13","2026-08-20","2026-08-27","2026-09-03","2026-09-10"]},{"task":"UGC bonus draw winner announced","owner":"Design Team","cat":"UGC","dates":["2026-09-13"]},{"cat":"Email / CRM","task":"Email 1 — Welcome (auto on sign-up)","owner":"CRM","dates":["2026-08-12"]},{"cat":"Email / CRM","task":"Email 2 — Midway leaderboard update","owner":"CRM","dates":["2026-08-26"]},{"task":"Email 3 — Last chance","owner":"CRM","cat":"Email / CRM","dates":["2026-09-10"]},{"task":"Email 4 — Winners + consolation offer","owner":"CRM","cat":"Email / CRM","dates":["2026-09-13"]},{"cat":"Post-Campaign","task":"Campaign performance report","owner":"Design Team","dates":["2026-09-16","2026-09-17","2026-09-18","2026-09-21","2026-09-22","2026-09-23","2026-09-24","2026-09-25"]},{"cat":"Post-Campaign","task":"CRM database handoff to rental team","owner":"CRM","dates":["2026-09-16","2026-09-17","2026-09-18","2026-09-21"]},{"cat":"Brand Collaborations","task":"Lexus Races Completed With Vehicle Post","owner":"Design Team","dates":["2026-08-19","2026-08-26","2026-09-02","2026-09-09"]}]`);

const SEED = {
  kdr: { projects: [{ id: 'racing-game', name: 'Racing Game — Marketing Campaign', startDate: '2026-08-12', endDate: '2026-12-15', type: 'Campaign', status: 'active', files: [] }], tasks: RAW_TASKS_KDR, timeline: RAW_TIMELINE_KDR },
  kvl: { projects: [], tasks: [], timeline: [] },
  kpv: { projects: [], tasks: [], timeline: [] },
  gst: { projects: [], tasks: [], timeline: [] },
  gtg: { projects: [], tasks: [], timeline: [] }
};
const BRAND_KEYS = ['kdr', 'kvl', 'kpv', 'gst', 'gtg'];
const BRAND_META = {
  kdr: { color: '#14161B', soft: 'rgba(20,22,27,0.08)', label: 'KDR · DAILY RENTAL' },
  kvl: { color: '#565C68', soft: 'rgba(86,92,104,0.10)', label: 'KVL · VEHICLE LEASING' },
  kpv: { color: '#868D99', soft: 'rgba(134,141,153,0.12)', label: 'KPV · PRE-OWNED VEHICLES' },
  gst: { color: '#2B2E35', soft: 'rgba(43,46,53,0.09)', label: 'GST · GOLDEN STITCH' },
  gtg: { color: '#9DA3AD', soft: 'rgba(157,163,173,0.14)', label: 'GTG · GOLDEN TAG' }
};
const NEUTRAL = { color: '#12141A', soft: 'rgba(18,20,26,0.08)' };

/* ============================================================
   DATA LAYER
   ============================================================ */

const Store = {
  async loadAll() {
    const result = {};
    for (const brandKey of BRAND_KEYS) {
      const ref = doc(db, 'ekkhub', brandKey);
      const snap = await getDoc(ref);
      let data;
      if (snap.exists()) {
        data = snap.data();
        if (!data.projects && data.campaigns) { data.projects = data.campaigns; }
        if (!data.projects) data.projects = [];
        data.projects.forEach(p => {
          if (!p.files) p.files = [];
          if (!p.status) p.status = 'active';
          if (p.healthStatus === undefined) p.healthStatus = null;
          if (!p.startDate) {
            if (p.id === 'racing-game') { p.startDate = '2026-08-12'; p.endDate = '2026-12-15'; }
            else { p.startDate = todayISO(); p.endDate = fmt(addDays(new Date(), 90)); }
          }
        });
        (data.tasks || []).forEach(t => {
          if (data.projects.length === 1 && !t.projectId) t.projectId = data.projects[0].id;
          (t.subtasks || []).forEach(s => { if (s.due === undefined) s.due = ''; if (s.notes === undefined) s.notes = ''; if (s.completedAt === undefined) s.completedAt = null; });
          recomputeTaskStatus(t);
        });
      } else {
        data = structuredClone(SEED[brandKey]);
        await setDoc(ref, data);
      }
      result[brandKey] = data;
    }
    const todosRef = doc(db, 'ekkhub', 'todos');
    const todosSnap = await getDoc(todosRef);
    if (todosSnap.exists()) { result.todos = todosSnap.data().items || []; }
    else { result.todos = []; await setDoc(todosRef, { items: [] }); }
    return result;
  },
  async saveBrand(brandKey) { await setDoc(doc(db, 'ekkhub', brandKey), DATA[brandKey]); },
  async saveTodos() { await setDoc(doc(db, 'ekkhub', 'todos'), { items: DATA.todos }); }
};

let DATA = null;

/* ============================================================
   STATE + DATE HELPERS
   ============================================================ */

const state = { brand: 'kdr', view: 'global-overview', projectId: null, projectTab: 'timeline', taskFilter: 'all', expandedTask: null, selectedDate: null, todoMode: 'day', expandedMonth: null };

function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function todayISO() { return fmt(new Date()); }
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(dISOorDate, n) { const d = typeof dISOorDate === 'string' ? parseISO(dISOorDate) : new Date(dISOorDate); d.setDate(d.getDate() + n); return d; }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function weekStartOf(dateISO) { const d = parseISO(dateISO); return addDays(d, -d.getDay()); }
function inRange(dISO, startISO, endISO) { return dISO >= startISO && dISO <= endISO; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function fmtDateShort(iso) { return iso ? parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

const YEAR_ANCHOR = '2026-09-16';
const YEAR_TARGET = fmt(addDays(YEAR_ANCHOR, 365));

function groupConsecutive(dates) {
  const ds = [...dates].sort();
  const runs = [];
  let start = ds[0], prev = ds[0];
  for (let i = 1; i < ds.length; i++) {
    const d = ds[i];
    if (daysBetween(parseISO(prev), parseISO(d)) === 1) { prev = d; }
    else { runs.push([start, prev]); start = d; prev = d; }
  }
  runs.push([start, prev]);
  return runs;
}

function brandData() { return DATA[state.brand]; }
function currentProject() { return brandData().projects.find(p => p.id === state.projectId); }
function projectNameFor(brandKey, projectId) { const p = DATA[brandKey].projects.find(x => x.id === projectId); return p ? p.name : null; }

/* ============================================================
   DUE UNITS — the single source of truth for "what's actionable
   and when." A unit is a subtask (preferred) or, for a task with
   no subtasks, the task itself as a fallback so nothing gets lost.
   ============================================================ */

function recomputeTaskStatus(t) {
  if (!t.subtasks || !t.subtasks.length) return;
  if (t.status === 'done') return;
  const doneCount = t.subtasks.filter(s => s.done).length;
  t.status = doneCount === 0 ? 'todo' : 'progress';
}

function dueUnitsForBrand(brandKey) {
  const units = [];
  DATA[brandKey].tasks.forEach(task => {
    (task.subtasks || []).forEach(sub => units.push({ kind: 'subtask', ref: sub, parentTask: task, brand: brandKey }));
  });
  return units;
}
function unitDone(u) { return u.kind === 'subtask' ? !!u.ref.done : u.ref.status === 'done'; }
function unitDue(u) { return u.ref.due || ''; }
function unitCompletedAt(u) { return u.ref.completedAt || null; }
function unitTitle(u) { return u.kind === 'subtask' ? u.ref.text : u.ref.title; }
function unitProjectId(u) { return u.kind === 'subtask' ? u.parentTask.projectId : u.ref.projectId; }

function setUnitDone(u, brandKey, done, dateForCompletion) {
  if (u.kind === 'subtask') { u.ref.done = done; u.ref.completedAt = done ? dateForCompletion : null; }
  else { if (done) { u.ref._prevStatus = u.ref.status; u.ref.status = 'done'; } else { u.ref.status = u.ref._prevStatus || 'progress'; } u.ref.completedAt = done ? dateForCompletion : null; }
  Store.saveBrand(brandKey);
}

/* ============================================================
   SOUND + CURSOR + RIPPLE
   ============================================================ */

let audioCtx;
function tone(freq, dur, vol) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq; gain.gain.value = vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio unsupported, ignore */ }
}
const clickTick = () => tone(600, 0.05, 0.025);
const completeChime = () => { tone(660, 0.09, 0.05); setTimeout(() => tone(880, 0.12, 0.05), 70); };
const uncheckTick = () => tone(320, 0.08, 0.035);

function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  const hoverables = 'button, .campaign-row, .task-row, .check, .subtask-check, .nav-item, .brand-tab, .filter-tab, .view-tab, .day-tab, .task-complete-btn';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverables)) ring.classList.add('hover'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverables)) ring.classList.remove('hover'); });
}
function initRipple() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, .campaign-row, .day-tab, .nav-item, .brand-tab');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.style.overflow || 'hidden';
    el.appendChild(r);
    setTimeout(() => r.remove(), 560);
  });
}

/* ============================================================
   STATS
   ============================================================ */

function computeStats(brandKey) {
  const tasks = DATA[brandKey].tasks;
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const units = dueUnitsForBrand(brandKey);
  const dueToday = units.filter(u => unitDue(u) === todayISO() && !unitDone(u)).length;
  const overdue = units.filter(u => unitDue(u) && unitDue(u) < todayISO() && !unitDone(u)).length;
  return { activeProjects: DATA[brandKey].projects.filter(p => p.status !== 'closed').length, pctDone: total ? Math.round((done / total) * 100) : 0, dueToday, overdue, total, done };
}
function computeGlobalStats() {
  let totalProjects = 0, totalTasks = 0, totalDone = 0, dueToday = 0, overdue = 0;
  BRAND_KEYS.forEach(b => { const s = computeStats(b); totalProjects += s.activeProjects; totalTasks += s.total; totalDone += s.done; dueToday += s.dueToday; overdue += s.overdue; });
  return { totalProjects, pctDone: totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0, dueToday, overdue };
}
function computeStatusBreakdown(brandKey) {
  const tasks = DATA[brandKey].tasks;
  const c = { todo: 0, progress: 0, done: 0 };
  tasks.forEach(t => c[t.status]++);
  return { ...c, total: tasks.length };
}
function computeHealth(brandKey) {
  const tasks = DATA[brandKey].tasks;
  const byCat = {};
  tasks.forEach(t => { byCat[t.cat] = byCat[t.cat] || { done: 0, total: 0 }; byCat[t.cat].total++; if (t.status === 'done') byCat[t.cat].done++; });
  return Object.entries(byCat).map(([name, v]) => ({ name, pct: Math.round((v.done / v.total) * 100) }));
}
function computeProjectCounts(brandKey, projectId) {
  const tasks = DATA[brandKey].tasks.filter(t => t.projectId === projectId);
  const mainDone = tasks.filter(t => t.status === 'done').length;
  let subTotal = 0, subDone = 0;
  tasks.forEach(t => { subTotal += t.subtasks.length; subDone += t.subtasks.filter(s => s.done).length; });
  return { mainTotal: tasks.length, mainDone, subTotal, subRemaining: subTotal - subDone, pct: tasks.length ? Math.round((mainDone / tasks.length) * 100) : 0 };
}

/* ============================================================
   DAILY TO-DO: item resolution + completion tracking
   ============================================================ */

function itemsForDate(dateISO) {
  const items = [];
  (DATA.todos || []).forEach(t => { if (t.date === dateISO || (t.done && t.completedAt === dateISO)) items.push({ kind: 'todo', ref: t, brand: t.brand || null }); });
  BRAND_KEYS.forEach(brandKey => {
    dueUnitsForBrand(brandKey).forEach(u => {
      const due = unitDue(u), done = unitDone(u), completedAt = unitCompletedAt(u);
      if (due === dateISO) items.push({ ...u, overdue: false });
      else if (due && done && completedAt === dateISO) items.push({ ...u, overdue: false });
      else if (dateISO === todayISO() && due && due < todayISO() && !done) items.push({ ...u, overdue: true });
    });
  });
  const isDone = (it) => it.kind === 'todo' ? it.ref.done : unitDone(it);
  const active = items.filter(it => !isDone(it));
  const done = items.filter(it => isDone(it));
  active.sort((a, b) => {
    const overdueDiff = (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0);
    if (overdueDiff !== 0) return overdueDiff;
    const oa = a.ref.order !== undefined ? a.ref.order : Infinity;
    const ob = b.ref.order !== undefined ? b.ref.order : Infinity;
    return oa - ob;
  });
  return { active, done };
}
function unscheduledTodos() { return (DATA.todos || []).filter(t => !t.date && !t.done).sort((a, b) => (a.order !== undefined ? a.order : Infinity) - (b.order !== undefined ? b.order : Infinity)); }

function toggleItem(item) {
  const ctxDate = state.selectedDate || todayISO();
  if (item.kind === 'todo') {
    item.ref.done = !item.ref.done;
    item.ref.completedAt = item.ref.done ? ctxDate : null;
    Store.saveTodos();
    item.ref.done ? completeChime() : uncheckTick();
  } else {
    const nowDone = !unitDone(item);
    setUnitDone(item, item.brand, nowDone, ctxDate);
    nowDone ? completeChime() : uncheckTick();
  }
}

function completedCountInRange(startISO, endISO) {
  let n = 0;
  (DATA.todos || []).forEach(t => { if (t.completedAt && inRange(t.completedAt, startISO, endISO)) n++; });
  BRAND_KEYS.forEach(b => dueUnitsForBrand(b).forEach(u => { const c = unitCompletedAt(u); if (unitDue(u) && c && inRange(c, startISO, endISO)) n++; }));
  return n;
}

/* ============================================================
   SIDEBAR SYNC
   ============================================================ */

function slidePill(pillEl, activeEl, container) {
  if (!activeEl) { pillEl.style.opacity = '0'; return; }
  pillEl.style.opacity = '1';
  const cRect = container.getBoundingClientRect(), aRect = activeEl.getBoundingClientRect();
  pillEl.style.transform = `translateY(${aRect.top - cRect.top}px)`;
  pillEl.style.height = aRect.height + 'px';
}
function syncSidebar() {
  const brandActive = (state.view === 'overview' || state.view === 'project');
  document.querySelectorAll('.brand-tab').forEach(t => t.classList.toggle('active', brandActive && t.dataset.brand === state.brand));
  document.querySelectorAll('.nav-item').forEach(t => t.classList.toggle('active', (t.dataset.nav === 'overview' && state.view === 'global-overview') || (t.dataset.nav === 'todo' && state.view === 'todo') || (t.dataset.nav === 'all' && state.view === 'all')));
  const brandRail = document.getElementById('brandRail'), brandPill = document.getElementById('brandPill');
  slidePill(brandPill, brandActive ? document.querySelector('.brand-tab.active') : null, brandRail);
  const mainNav = document.getElementById('mainNav'), navPill = document.getElementById('navPill');
  slidePill(navPill, document.querySelector('.nav-item.active'), mainNav);
  const root = document.documentElement;
  const meta = brandActive ? BRAND_META[state.brand] : NEUTRAL;
  root.style.setProperty('--accent', meta.color);
  root.style.setProperty('--accent-soft', meta.soft);
}

/* ============================================================
   YEAR COUNTDOWN
   ============================================================ */

function renderYearCountdown() {
  const totalSpan = daysBetween(parseISO(YEAR_ANCHOR), parseISO(YEAR_TARGET));
  const daysLeft = Math.max(0, daysBetween(parseISO(todayISO()), parseISO(YEAR_TARGET)));
  const pctRemaining = Math.max(0, Math.min(1, daysLeft / totalSpan));
  const clipRight = (1 - pctRemaining) * 100;
  document.getElementById('infOverlay').style.clipPath = `inset(0 ${clipRight}% 0 0)`;
  document.getElementById('infWrap').title = `${daysLeft} days left until ${parseISO(YEAR_TARGET).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

/* ============================================================
   SHARED RENDER HELPERS
   ============================================================ */

function countUp(el, target, suffix) {
  const t0 = performance.now(), duration = 700;
  function tick(now) {
    const p = Math.min((now - t0) / duration, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + (suffix || '');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function fillStatCards(container, defs) {
  container.innerHTML = '';
  defs.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card stat-card hoverable';
    card.innerHTML = `<div class="stat-label">${s.label}</div><div class="stat-value"><span class="cu">0</span></div>`;
    container.appendChild(card);
    countUp(card.querySelector('.cu'), s.value, s.suffix);
  });
}
function statusBreakdownHTML(sb) {
  const pct = (n) => sb.total ? (n / sb.total) * 100 : 0;
  return `
    <div class="status-bar">
      <div class="status-seg done" style="width:0%" data-w="${pct(sb.done)}"></div>
      <div class="status-seg progress" style="width:0%" data-w="${pct(sb.progress)}"></div>
      <div class="status-seg todo" style="width:0%" data-w="${pct(sb.todo)}"></div>
    </div>
    <div class="status-legend">
      <div class="status-legend-item"><div class="sw" style="background:var(--good-text)"></div>Done · ${sb.done}</div>
      <div class="status-legend-item"><div class="sw" style="background:var(--accent)"></div>In Progress · ${sb.progress}</div>
      <div class="status-legend-item"><div class="sw" style="background:var(--text-faint)"></div>To Do · ${sb.todo}</div>
    </div>`;
}
function animateStatusBars(root) { root.querySelectorAll('.status-seg').forEach(seg => requestAnimationFrame(() => { seg.style.width = seg.dataset.w + '%'; })); }

let activePopoverClose = null;
function reorderItems(list, fromId, toId, getId) {
  const fromIdx = list.findIndex(it => getId(it) === fromId);
  const toIdx = list.findIndex(it => getId(it) === toId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  const touchedBrands = new Set();
  list.forEach((it, idx) => {
    const ref = it.ref !== undefined ? it.ref : it;
    ref.order = idx;
    if (it.kind === 'subtask') touchedBrands.add(it.brand);
    else if (it.kind === 'todo') touchedBrands.add('__todos__');
    else touchedBrands.add('__todos__');
  });
  touchedBrands.forEach(b => b === '__todos__' ? Store.saveTodos() : Store.saveBrand(b));
}

function pulse(el) { if (!el) return; el.classList.remove('pop-animate'); void el.offsetWidth; el.classList.add('pop-animate'); }
function removeWithExit(el, callback) { if (!el) { callback(); return; } el.classList.add('row-exit'); setTimeout(callback, 250); }

function openExclusive(closeFn, openFn) {
  if (activePopoverClose && activePopoverClose !== closeFn) activePopoverClose();
  activePopoverClose = closeFn;
  openFn();
}

function createDatePicker(container, initialISO, onChange, placeholder) {
  const wrap = document.createElement('div');
  wrap.className = 'date-picker';
  let selected = initialISO || null;
  let viewMonth = selected ? parseISO(selected) : new Date();

  const labelText = () => selected ? fmtDateShort(selected) : (placeholder || 'Set date');

  wrap.innerHTML = `
    <div class="date-picker-btn" role="button" tabindex="0">
      <svg class="dp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
      <span class="dp-label">${labelText()}</span>
    </div>
    <div class="date-picker-menu">
      <div class="dp-header"><div class="dp-nav" role="button" tabindex="0" data-dir="-1">‹</div><div class="dp-month-label"></div><div class="dp-nav" role="button" tabindex="0" data-dir="1">›</div></div>
      <div class="dp-grid"></div>
      <div class="dp-footer"><div class="dp-clear" role="button" tabindex="0">Clear</div><div class="dp-today-btn" role="button" tabindex="0">Today</div></div>
    </div>`;
  container.appendChild(wrap);

  const btn = wrap.querySelector('.date-picker-btn'), menu = wrap.querySelector('.date-picker-menu'), grid = wrap.querySelector('.dp-grid'), monthLabel = wrap.querySelector('.dp-month-label'), labelEl = wrap.querySelector('.dp-label');

  function actionable(el, handler) {
    el.addEventListener('click', (e) => { e.stopPropagation(); handler(e); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handler(e); } });
  }

  function renderGrid() {
    monthLabel.textContent = viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    grid.innerHTML = '';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => { const el = document.createElement('div'); el.className = 'dp-dow'; el.textContent = d; grid.appendChild(el); });
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < first.getDay(); i++) grid.appendChild(document.createElement('div'));
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = fmt(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
      const cell = document.createElement('div');
      cell.setAttribute('role', 'button');
      cell.tabIndex = 0;
      cell.className = 'dp-day' + (iso === selected ? ' selected' : '') + (iso === todayISO() ? ' is-today' : '');
      cell.textContent = d;
      actionable(cell, () => { selected = iso; labelEl.textContent = labelText(); onChange(selected); close(); });
      grid.appendChild(cell);
    }
  }
  function positionMenu() {
    const rect = btn.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let left = rect.left, top = rect.bottom + 6;
    if (top + menuRect.height > window.innerHeight - 8) top = rect.top - menuRect.height - 6;
    if (left + menuRect.width > window.innerWidth - 8) left = window.innerWidth - menuRect.width - 8;
    if (left < 8) left = 8;
    menu.style.position = 'fixed';
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }
  function open() { renderGrid(); positionMenu(); menu.classList.add('open'); }
  function close() { menu.classList.remove('open'); }

  actionable(btn, () => {
    if (menu.classList.contains('open')) { close(); activePopoverClose = null; }
    else { openExclusive(close, open); }
  });
  wrap.querySelectorAll('.dp-nav').forEach(nb => actionable(nb, () => { viewMonth.setMonth(viewMonth.getMonth() + parseInt(nb.dataset.dir, 10)); renderGrid(); positionMenu(); }));
  actionable(wrap.querySelector('.dp-clear'), () => { selected = null; labelEl.textContent = labelText(); onChange(null); close(); });
  actionable(wrap.querySelector('.dp-today-btn'), () => { selected = todayISO(); viewMonth = new Date(); labelEl.textContent = labelText(); onChange(selected); close(); });
  document.addEventListener('click', close);

  return { getValue: () => selected };
}

function buildKebabMenu(container, actions) {
  const wrap = document.createElement('div');
  wrap.className = 'kebab-menu';
  wrap.innerHTML = `<button type="button" class="kebab-btn">⋯</button><div class="kebab-dropdown"></div>`;
  container.appendChild(wrap);
  const btn = wrap.querySelector('.kebab-btn'), dd = wrap.querySelector('.kebab-dropdown');

  function renderActions(list) {
    dd.innerHTML = list.map((a, i) => `<button type="button" class="kebab-item ${a.danger ? 'danger' : ''} ${a.back ? 'back' : ''}" data-i="${i}">${a.label}</button>`).join('');
    dd.querySelectorAll('.kebab-item').forEach((el, i) => el.addEventListener('click', (e) => { e.stopPropagation(); list[i].onClick(); }));
  }
  renderActions(actions);
  function positionDropdown() {
    const rect = btn.getBoundingClientRect();
    const ddRect = dd.getBoundingClientRect();
    let left = rect.right - ddRect.width;
    let top = rect.bottom + 6;
    if (top + ddRect.height > window.innerHeight - 8) top = rect.top - ddRect.height - 6;
    if (left < 8) left = 8;
    if (left + ddRect.width > window.innerWidth - 8) left = window.innerWidth - ddRect.width - 8;
    dd.style.position = 'fixed';
    dd.style.left = left + 'px';
    dd.style.top = top + 'px';
    dd.style.right = 'auto';
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dd.classList.contains('open')) { dd.classList.remove('open'); activePopoverClose = null; }
    else { openExclusive(() => dd.classList.remove('open'), () => { positionDropdown(); dd.classList.add('open'); }); }
  });
  document.addEventListener('click', () => dd.classList.remove('open'));
  return {
    close: () => dd.classList.remove('open'),
    setActions: renderActions,
    dd,
    open: () => { positionDropdown(); dd.classList.add('open'); },
    openAt: (x, y) => {
      dd.style.position = 'fixed';
      dd.style.right = 'auto';
      const rect = dd.getBoundingClientRect();
      let left = x, top = y;
      if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
      if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
      dd.style.left = left + 'px';
      dd.style.top = top + 'px';
      dd.classList.add('open');
    }
  };
}

function makeInlineEditable(el, getValue, onSave) {
  el.classList.add('inline-editable');
  el.title = 'Tap to edit';
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (el.querySelector('input')) return;
    const current = getValue();
    el.classList.add('is-editing');
    el.innerHTML = `<input type="text" class="inline-edit-input" value="${current.replace(/"/g, '&quot;')}">`;
    const input = el.querySelector('input');
    input.focus(); input.select();
    let done = false;
    const finish = (save) => {
      if (done) return; done = true;
      const val = input.value.trim();
      if (save && val && val !== current) onSave(val);
      el.classList.remove('is-editing');
      el.textContent = (save && val) ? val : current;
    };
    input.addEventListener('click', (ev) => ev.stopPropagation());
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
      if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    });
  });
}

function allProjectsFlat() {
  const out = [];
  BRAND_KEYS.forEach(b => DATA[b].projects.forEach(p => out.push({ brandKey: b, project: p })));
  return out;
}

function renderAddProjectForm(container, brandKeyFixed) {
  const wrap = document.createElement('div');
  wrap.className = 'add-project-form';
  let selectedBrand = brandKeyFixed || BRAND_KEYS[0];
  const brandPickerHTML = brandKeyFixed ? '' : `
    <div class="custom-select" id="brandPicker">
      <button type="button" class="custom-select-btn" id="brandPickerBtn">
        <span class="csb-dot" id="brandPickerDot" style="background:${BRAND_META[selectedBrand].color}"></span>
        <span id="brandPickerLabel">${selectedBrand.toUpperCase()}</span>
        <svg class="csb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="custom-select-menu" id="brandPickerMenu">
        ${BRAND_KEYS.map(b => `<div class="custom-select-opt" data-b="${b}"><span class="csb-dot" style="background:${BRAND_META[b].color}"></span>${b.toUpperCase()}</div>`).join('')}
      </div>
    </div>`;
  wrap.innerHTML = `
    ${brandPickerHTML}
    <input type="text" class="name-input" id="newProjName" placeholder="Project name">
    <div class="dp-slot" id="newProjStartSlot"></div>
    <div class="dp-slot" id="newProjEndSlot"></div>
    <button id="newProjSubmit">Add project</button>`;
  container.appendChild(wrap);
  const startPicker = createDatePicker(wrap.querySelector('#newProjStartSlot'), todayISO(), () => {});
  const endPicker = createDatePicker(wrap.querySelector('#newProjEndSlot'), fmt(addDays(todayISO(), 90)), () => {});

  if (!brandKeyFixed) {
    const btn = wrap.querySelector('#brandPickerBtn'), menu = wrap.querySelector('#brandPickerMenu');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu.classList.contains('open')) { btn.classList.remove('open'); menu.classList.remove('open'); activePopoverClose = null; }
      else { openExclusive(() => { btn.classList.remove('open'); menu.classList.remove('open'); }, () => { btn.classList.add('open'); menu.classList.add('open'); }); }
    });
    wrap.querySelectorAll('.custom-select-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        selectedBrand = opt.dataset.b;
        wrap.querySelector('#brandPickerLabel').textContent = selectedBrand.toUpperCase();
        wrap.querySelector('#brandPickerDot').style.background = BRAND_META[selectedBrand].color;
        btn.classList.remove('open'); menu.classList.remove('open');
        clickTick();
      });
    });
    document.addEventListener('click', () => { btn.classList.remove('open'); menu.classList.remove('open'); });
  }
  wrap.querySelector('#newProjSubmit').addEventListener('click', () => {
    const brandKey = brandKeyFixed || selectedBrand;
    const name = wrap.querySelector('#newProjName').value.trim();
    const startDate = startPicker.getValue() || todayISO();
    const endDate = endPicker.getValue() || fmt(addDays(startDate, 90));
    if (!name) return;
    DATA[brandKey].projects.push({ id: uid(), name, startDate, endDate, type: 'Project', status: 'active', healthStatus: null, files: [] });
    Store.saveBrand(brandKey);
    clickTick();
    navigate(state.view);
  });
}

function projectRowHTML(brandKey, p) {
  const counts = computeProjectCounts(brandKey, p.id);
  const daysLeft = daysBetween(parseISO(todayISO()), parseISO(p.endDate));
  const closed = p.status === 'closed';
  const daysHTML = closed ? '—' : (daysLeft > 0 ? daysLeft + 'd' : 'Ended');
  return { counts, daysHTML, closed,
    metaLine: `${fmtDateShort(p.startDate)} – ${fmtDateShort(p.endDate)} · ${counts.mainTotal} tasks · ${counts.subRemaining} subtasks left` };
}

function mountProjectStatus(container, brandKey, p, counts, closed) {
  if (closed) { container.innerHTML = `<span class="status-pill closed">Closed</span>`; return; }
  const effective = p.healthStatus || (counts.pct >= 50 ? 'good' : 'risk');
  const label = effective === 'good' ? 'On track' : 'At risk';
  const wrap = document.createElement('div');
  wrap.className = 'kebab-menu';
  wrap.innerHTML = `<button type="button" class="status-pill-btn ${effective}">${label}<svg class="csb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button><div class="kebab-dropdown"></div>`;
  container.appendChild(wrap);
  const btn = wrap.querySelector('.status-pill-btn'), dd = wrap.querySelector('.kebab-dropdown');
  function save() { Store.saveBrand(brandKey); clickTick(); navigate(state.view); }
  const options = [
    { label: 'On track', onClick: () => { p.healthStatus = 'good'; save(); } },
    { label: 'At risk', onClick: () => { p.healthStatus = 'risk'; save(); } },
    { label: 'Auto (based on completion)', onClick: () => { p.healthStatus = null; save(); } }
  ];
  dd.innerHTML = options.map((o, i) => `<button type="button" class="kebab-item" data-i="${i}">${o.label}</button>`).join('');
  dd.querySelectorAll('.kebab-item').forEach((el, i) => el.addEventListener('click', (e) => { e.stopPropagation(); dd.classList.remove('open'); options[i].onClick(); }));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dd.classList.contains('open')) { dd.classList.remove('open'); activePopoverClose = null; }
    else { openExclusive(() => dd.classList.remove('open'), () => dd.classList.add('open')); }
  });
  document.addEventListener('click', () => dd.classList.remove('open'));
}

/* ============================================================
   VIEW: GLOBAL OVERVIEW
   ============================================================ */

function renderGlobalOverview() {
  const g = computeGlobalStats();
  const mount = document.getElementById('viewMount');
  mount.innerHTML = `<div class="stat-row" id="statRow"></div><div class="brand-grid" id="brandGrid"></div>`;
  fillStatCards(document.getElementById('statRow'), [
    { label: 'Total projects', value: g.totalProjects }, { label: 'Overall completion', value: g.pctDone, suffix: '%' },
    { label: 'Due today', value: g.dueToday }, { label: 'Overdue', value: g.overdue }
  ]);
  const grid = document.getElementById('brandGrid');
  BRAND_KEYS.forEach(brandKey => {
    const meta = BRAND_META[brandKey], s = computeStats(brandKey), topProject = DATA[brandKey].projects.find(p => p.status !== 'closed');
    const card = document.createElement('div');
    card.className = 'card brand-card hoverable';
    card.innerHTML = `
      <div class="brand-card-head"><div class="dot" style="background:${meta.color}"></div><div class="bname">${brandKey.toUpperCase()}</div></div>
      <div class="brand-mini-stats">
        <div class="brand-mini-stat"><div class="l">Projects</div><div class="v">${s.activeProjects}</div></div>
        <div class="brand-mini-stat"><div class="l">Completed</div><div class="v">${s.pctDone}%</div></div>
        <div class="brand-mini-stat"><div class="l">Due today</div><div class="v">${s.dueToday}</div></div>
        <div class="brand-mini-stat"><div class="l">Overdue</div><div class="v" style="color:${s.overdue ? 'var(--behind-text)' : 'var(--text)'}">${s.overdue}</div></div>
      </div>
      ${topProject ? `<div class="brand-card-top-project">Top project: <b>${topProject.name}</b></div>` : `<div class="brand-card-top-project">No active projects yet.</div>`}
      <div class="brand-card-cta" style="color:${meta.color}">View ${brandKey.toUpperCase()} →</div>`;
    card.addEventListener('click', () => { state.brand = brandKey; navigate('overview'); });
    grid.appendChild(card);
  });
}

/* ============================================================
   VIEW: BRAND OVERVIEW
   ============================================================ */

function renderBrandOverview() {
  const stats = computeStats(state.brand), sb = computeStatusBreakdown(state.brand), health = computeHealth(state.brand), projects = brandData().projects;
  const active = itemsForDate(todayISO()).active.filter(it => it.brand === state.brand);

  const mount = document.getElementById('viewMount');
  mount.innerHTML = `
    <div class="stat-row" id="statRow"></div>
    <div class="grid-2">
      <div class="card panel-card hoverable"><div class="card-title">Task status</div><div class="card-sub">${stats.done} of ${stats.total} tasks done</div>${statusBreakdownHTML(sb)}</div>
      <div class="card panel-card hoverable"><div class="card-title" style="margin-bottom:10px;">Task health by category</div><div id="healthRows"></div></div>
    </div>
    <div class="card campaign-card">
      <div style="padding:14px 20px 0;"><div class="section-title" style="margin:0 0 2px;">Projects</div></div>
      <div id="addProjectMount"></div>
      <div class="campaign-head-row"><div>Project</div><div>Progress</div><div>Status</div><div style="text-align:right;">Days left</div></div>
      <div id="projectList"></div>
    </div>
    <div class="card todo-card"><div style="padding:14px 20px 0;"><div class="section-title" style="margin:0 0 2px;">Due today &amp; overdue</div></div><div id="todoPreview"></div></div>`;

  fillStatCards(document.getElementById('statRow'), [
    { label: 'Active projects', value: stats.activeProjects }, { label: 'Tasks completed', value: stats.pctDone, suffix: '%' },
    { label: 'Due today', value: stats.dueToday }, { label: 'Overdue', value: stats.overdue }
  ]);
  animateStatusBars(mount);

  const healthRows = document.getElementById('healthRows');
  if (!health.length) { healthRows.innerHTML = `<div style="font-size:12.5px;color:var(--text-dim);padding:8px 0;">No categories tracked yet.</div>`; }
  else health.forEach(h => {
    const row = document.createElement('div');
    row.className = 'health-row';
    row.innerHTML = `<div><div class="health-name">${h.name}</div><div class="health-bar-track"><div class="health-bar-fill" style="width:0%"></div></div></div><div class="health-pct">${h.pct}%</div>`;
    healthRows.appendChild(row);
    requestAnimationFrame(() => { row.querySelector('.health-bar-fill').style.width = h.pct + '%'; });
  });

  renderAddProjectForm(document.getElementById('addProjectMount'), state.brand);

  const projectList = document.getElementById('projectList');
  if (!projects.length) { projectList.innerHTML = `<div class="empty-row"><div class="t">Nothing running yet</div><div class="s">Add your first project above.</div></div>`; }
  else projects.forEach(p => {
    const { counts, daysHTML, closed, metaLine } = projectRowHTML(state.brand, p);
    const row = document.createElement('div');
    row.className = 'campaign-row';
    row.innerHTML = `
      <div><div class="campaign-name">${p.name}<span class="project-type-pill">${p.type || 'Project'}</span></div><div class="campaign-cat">${metaLine}</div></div>
      <div><div class="progress-track"><div class="progress-fill" style="width:0%"></div></div><div class="progress-label">${counts.pct}%</div></div>
      <div class="status-mount"></div>
      <div style="text-align:right; font-family:'JetBrains Mono',monospace; font-weight:600; font-size:13px;">${daysHTML}</div>`;
    row.addEventListener('click', (e) => { if (e.target.closest('.kebab-menu')) return; navigate('project', { projectId: p.id }); });
    mountProjectStatus(row.querySelector('.status-mount'), state.brand, p, counts, closed);
    projectList.appendChild(row);
    requestAnimationFrame(() => { row.querySelector('.progress-fill').style.width = counts.pct + '%'; });
  });

  renderTodoRows(document.getElementById('todoPreview'), active.slice(0, 4), true, false);
}

/* ============================================================
   VIEW: DAILY TO-DO
   ============================================================ */

function monthsWithActivity() {
  const months = new Set();
  const now = new Date();
  months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  (DATA.todos || []).forEach(t => { if (t.completedAt) months.add(t.completedAt.slice(0, 7)); });
  BRAND_KEYS.forEach(b => dueUnitsForBrand(b).forEach(u => { const c = unitCompletedAt(u); if (c) months.add(c.slice(0, 7)); }));
  return Array.from(months).sort().reverse();
}
function weeksInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);
  let cursorDate = new Date(firstDay);
  while (cursorDate.getDay() !== 0) cursorDate = addDays(cursorDate, 1);
  const weeks = [];
  while (cursorDate <= lastDay) {
    let endDate = addDays(cursorDate, 4);
    if (endDate > lastDay) endDate = lastDay;
    weeks.push({ startISO: fmt(cursorDate), endISO: fmt(endDate) });
    cursorDate = addDays(cursorDate, 7);
  }
  return weeks;
}
function todoRowLabel(item) {
  if (item.kind === 'todo') {
    const projName = item.ref.projectId ? projectNameFor(item.ref.brand, item.ref.projectId) : null;
    return { title: item.ref.text, sub: projName };
  }
  const projName = projectNameFor(item.brand, unitProjectId(item));
  if (item.kind === 'subtask') return { title: item.ref.text, sub: `${item.parentTask.title}${projName ? ' · ' + projName : ''}` };
  return { title: item.ref.title, sub: projName };
}

function itemText(item) { return item.kind === 'todo' ? item.ref.text : item.ref.text; }
function setItemText(item, val) {
  if (item.kind === 'todo') { item.ref.text = val; Store.saveTodos(); }
  else { item.ref.text = val; Store.saveBrand(item.brand); }
}
function setItemDate(item, iso) {
  if (item.kind === 'todo') { item.ref.date = iso; Store.saveTodos(); }
  else { item.ref.due = iso || ''; Store.saveBrand(item.brand); }
}

function renderTodoRows(container, items, showTag, editable) {
  if (!items.length) { container.innerHTML = `<div style="padding:20px; font-size:12.5px; color:var(--text-dim);">Nothing here.</div>`; return; }
  container.innerHTML = '';
  items.forEach(item => {
    const { title, sub } = todoRowLabel(item);
    const meta = item.brand ? BRAND_META[item.brand] : null;
    const row = document.createElement('div');
    row.className = 'todo-row';
    row.dataset.itemId = item.ref.id;
    row.innerHTML = `
      ${editable ? `<div class="drag-handle" title="Drag to reorder">⠿</div>` : ''}
      <div class="check"></div>
      <div style="flex:1; min-width:0;"><div class="todo-title">${title}</div>${sub ? `<div class="todo-project-sub">${sub}</div>` : ''}</div>
      ${item.overdue ? `<div class="todo-due">Overdue</div>` : ''}
      ${showTag && meta ? `<div class="todo-brand-tag" style="background:${meta.soft}; color:${meta.color};">${item.brand.toUpperCase()}</div>` : ''}`;
    row.querySelector('.check').addEventListener('click', (e) => { toggleItem(item); pulse(e.currentTarget); setTimeout(() => navigate('todo'), 220); });

    if (editable) {
      makeInlineEditable(row.querySelector('.todo-title'), () => itemText(item), (val) => { setItemText(item, val); });
      const kebab = buildKebabMenu(row, []);
      kebab.setActions(baseKebabActionsFor(item, kebab, row));
      row.addEventListener('contextmenu', (e) => { e.preventDefault(); kebab.openAt(e.clientX, e.clientY); });
      row.draggable = true;
      row.addEventListener('dragstart', (e) => {
        if (e.target.closest('input, .check, .kebab-menu')) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.ref.id);
        setTimeout(() => row.classList.add('dragging'), 0);
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
      row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        reorderItems(items, draggedId, item.ref.id, (it) => it.ref.id);
        clickTick();
        navigate('todo');
      });
    }
    container.appendChild(row);
  });
}

function openPickDateMenu(kebab, item) {
  kebab.dd.innerHTML = `<button type="button" class="kebab-item back" id="kebabBackBtn">← Back</button><div id="kebabDateSlot" style="padding:2px 0;"></div>`;
  document.getElementById('kebabBackBtn').addEventListener('click', (e) => { e.stopPropagation(); kebab.setActions(baseKebabActionsFor(item, kebab)); });
  createDatePicker(document.getElementById('kebabDateSlot'), null, (iso) => { setItemDate(item, iso); clickTick(); navigate('todo'); });
  document.querySelector('#kebabDateSlot .date-picker-btn').click();
}

function openBrandAssignMenu(kebab, item) {
  const list = BRAND_KEYS.map(b => ({
    label: `<span class="csb-dot" style="background:${BRAND_META[b].color}; display:inline-block; margin-right:8px;"></span>${b.toUpperCase()}`,
    onClick: () => { item.ref.brand = b; Store.saveTodos(); clickTick(); navigate('todo'); }
  }));
  kebab.setActions([{ label: '← Back', back: true, onClick: () => kebab.setActions(baseKebabActionsFor(item, kebab)) }, ...list]);
}

function openProjectAssignMenu(kebab, item) {
  const projects = allProjectsFlat();
  const list = projects.length
    ? projects.map((pr, i) => ({ label: `${pr.brandKey.toUpperCase()} · ${pr.project.name}`, onClick: () => {
        item.ref.brand = pr.brandKey; item.ref.projectId = pr.project.id; Store.saveTodos(); clickTick(); navigate('todo');
      }}))
    : [{ label: 'No projects yet', onClick: () => {} }];
  kebab.setActions([{ label: '← Back', back: true, onClick: () => kebab.setActions(baseKebabActionsFor(item, kebab)) }, ...list]);
}
function baseKebabActionsFor(item, kebab, row) {
  const actions = [
    { label: 'Due today', onClick: () => { setItemDate(item, todayISO()); clickTick(); navigate('todo'); } },
    { label: 'Due tomorrow', onClick: () => { setItemDate(item, fmt(addDays(todayISO(), 1))); clickTick(); navigate('todo'); } },
    { label: 'Pick a date…', onClick: () => openPickDateMenu(kebab, item) },
  ];
  if (item.kind === 'todo') {
    actions.push({ label: 'Remove date (unschedule)', onClick: () => { setItemDate(item, null); clickTick(); navigate('todo'); } });
    actions.push({ label: item.ref.brand ? 'Change brand…' : 'Set brand…', onClick: () => openBrandAssignMenu(kebab, item) });
    actions.push({ label: 'Assign to project…', onClick: () => openProjectAssignMenu(kebab, item) });
  }
  actions.push({ label: 'Delete', danger: true, onClick: () => removeWithExit(row, () => deleteTodoItem(item)) });
  return actions;
}

function deleteTodoItem(item) {
  if (item.kind === 'todo') { DATA.todos = DATA.todos.filter(t => t.id !== item.ref.id); Store.saveTodos(); }
  else if (item.kind === 'subtask') { item.parentTask.subtasks = item.parentTask.subtasks.filter(s => s.id !== item.ref.id); Store.saveBrand(item.brand); }
  clickTick();
  navigate('todo');
}

function renderDailyTodo() {
  if (!state.selectedDate) state.selectedDate = todayISO();
  const mount = document.getElementById('viewMount');
  mount.innerHTML = `
    <div class="todo-mode-tabs">
      <button class="todo-mode-tab ${state.todoMode === 'day' ? 'active' : ''}" data-m="day">Day</button>
      <button class="todo-mode-tab ${state.todoMode === 'summary' ? 'active' : ''}" data-m="summary">Summary</button>
    </div>
    <div id="todoModeMount"></div>`;
  mount.querySelectorAll('.todo-mode-tab').forEach(t => t.addEventListener('click', () => { state.todoMode = t.dataset.m; renderDailyTodo(); }));

  if (state.todoMode === 'summary') { renderTodoSummary(); return; }
  renderDailyTodoDay();
}

function renderTodoSummary() {
  const mount = document.getElementById('todoModeMount');
  const months = monthsWithActivity();
  mount.innerHTML = `<div class="card"><div id="monthList"></div></div>`;
  const list = document.getElementById('monthList');
  months.forEach(monthKey => {
    const [y, m] = monthKey.split('-').map(Number);
    const monthName = new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const monthStart = `${monthKey}-01`;
    const monthEnd = fmt(new Date(y, m, 0));
    const total = completedCountInRange(monthStart, monthEnd);
    const isOpen = state.expandedMonth === monthKey;

    const row = document.createElement('div');
    row.className = 'month-row';
    row.innerHTML = `<div class="m-name">${monthName}</div><div class="m-count">${total} completed</div>`;
    row.addEventListener('click', () => { state.expandedMonth = isOpen ? null : monthKey; renderTodoSummary(); });
    list.appendChild(row);

    const weeksWrap = document.createElement('div');
    weeksWrap.className = 'month-weeks' + (isOpen ? ' open' : '');
    if (isOpen) {
      weeksInMonth(monthKey).forEach(w => {
        const count = completedCountInRange(w.startISO, w.endISO);
        const wRow = document.createElement('div');
        wRow.className = 'week-row';
        wRow.innerHTML = `<div class="w-range">${fmtDateShort(w.startISO)} – ${fmtDateShort(w.endISO)}</div><div class="w-count">${count} completed</div>`;
        wRow.addEventListener('click', (e) => { e.stopPropagation(); state.selectedDate = w.startISO; state.todoMode = 'day'; navigate('todo'); });
        weeksWrap.appendChild(wRow);
      });
    }
    list.appendChild(weeksWrap);
  });
}

function renderDailyTodoDay() {
  const mount = document.getElementById('todoModeMount');
  const weekStart = weekStartOf(state.selectedDate);
  const weekEnd = fmt(addDays(weekStart, 4));
  const monthStart = state.selectedDate.slice(0, 7) + '-01';
  const now = parseISO(state.selectedDate);
  const monthEnd = fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  mount.innerHTML = `
    <div class="card week-strip-card">
      <button class="week-nav-btn" id="weekPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
      <div class="week-days" id="weekDays"></div>
      <button class="week-nav-btn" id="weekNext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
      <button class="today-jump-btn" id="jumpToday">Today</button>
    </div>
    <div class="todo-counters" id="counters"></div>
    <div class="card todo-card">
      <div class="add-todo-row">
        <input type="text" id="newTodoInput" placeholder="Add a task for ${state.selectedDate === todayISO() ? 'today' : parseISO(state.selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}…">
        <button id="addTodoBtn">Add</button>
      </div>
      <div class="todo-section-label">Active</div>
      <div id="activeList"></div>
      <div class="todo-section-label">Completed</div>
      <div id="doneList"></div>
    </div>
    <div class="card todo-card" style="margin-top:24px;">
      <div style="padding:14px 20px 0;"><div class="section-title" style="margin:0 0 2px;">Unscheduled</div><div class="card-sub" style="padding:0 0 4px;">Things to do, no date decided yet</div></div>
      <div class="unscheduled-add-row">
        <input type="text" id="newUnscheduledInput" placeholder="Add something with no date yet…">
        <button id="addUnscheduledBtn">Add</button>
      </div>
      <div id="unscheduledList"></div>
    </div>`;

  const weekDays = document.getElementById('weekDays');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  for (let i = 0; i < 5; i++) {
    const dISO = fmt(addDays(weekStart, i));
    const { active, done } = itemsForDate(dISO);
    const tab = document.createElement('button');
    tab.className = 'day-tab' + (dISO === state.selectedDate ? ' active' : '') + (dISO === todayISO() ? ' today-marker' : '');
    tab.innerHTML = `<div class="dname">${dayNames[i]}</div><div class="dnum">${parseISO(dISO).getDate()}</div><div class="dcount">${active.length ? active.length + ' open' : '—'}</div><div class="ddone">${done.length || ''}</div>`;
    tab.addEventListener('click', () => { state.selectedDate = dISO; navigate('todo'); });
    weekDays.appendChild(tab);
  }
  document.getElementById('weekPrev').addEventListener('click', () => { state.selectedDate = fmt(addDays(state.selectedDate, -7)); navigate('todo'); });
  document.getElementById('weekNext').addEventListener('click', () => { state.selectedDate = fmt(addDays(state.selectedDate, 7)); navigate('todo'); });
  document.getElementById('jumpToday').addEventListener('click', () => { state.selectedDate = todayISO(); navigate('todo'); });

  fillStatCards(document.getElementById('counters'), [
    { label: state.selectedDate === todayISO() ? 'Completed today' : 'Completed this day', value: completedCountInRange(state.selectedDate, state.selectedDate) },
    { label: 'Completed this week', value: completedCountInRange(fmt(weekStart), weekEnd) },
    { label: 'Completed this month', value: completedCountInRange(monthStart, monthEnd) }
  ]);

  document.getElementById('addTodoBtn').addEventListener('click', () => addTodoFromInput('newTodoInput', state.selectedDate));
  document.getElementById('newTodoInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodoFromInput('newTodoInput', state.selectedDate); });
  document.getElementById('addUnscheduledBtn').addEventListener('click', () => addTodoFromInput('newUnscheduledInput', null));
  document.getElementById('newUnscheduledInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodoFromInput('newUnscheduledInput', null); });

  const { active, done } = itemsForDate(state.selectedDate);
  renderTodoRows(document.getElementById('activeList'), active, true, true);

  const doneContainer = document.getElementById('doneList');
  if (!done.length) { doneContainer.innerHTML = `<div style="padding:12px 20px; font-size:12.5px; color:var(--text-dim);">Nothing completed for this day yet.</div>`; }
  else {
    doneContainer.innerHTML = '';
    done.forEach(item => {
      const { title, sub } = todoRowLabel(item);
      const meta = item.brand ? BRAND_META[item.brand] : null;
      const row = document.createElement('div');
      row.className = 'todo-row is-done';
      row.innerHTML = `<div class="check checked">✓</div><div style="flex:1;"><div class="todo-title">${title}</div>${sub ? `<div class="todo-project-sub">${sub}</div>` : ''}</div>${meta ? `<div class="todo-brand-tag" style="background:${meta.soft}; color:${meta.color};">${item.brand.toUpperCase()}</div>` : ''}`;
      row.querySelector('.check').addEventListener('click', (e) => { toggleItem(item); pulse(e.currentTarget); setTimeout(() => navigate('todo'), 220); });
      doneContainer.appendChild(row);
    });
  }

  const unscheduled = unscheduledTodos();
  const unschedContainer = document.getElementById('unscheduledList');
  if (!unscheduled.length) { unschedContainer.innerHTML = `<div style="padding:14px 20px; font-size:12.5px; color:var(--text-dim);">Nothing unscheduled.</div>`; }
  else {
    unschedContainer.innerHTML = '';
    unscheduled.forEach(t => {
      const item = { kind: 'todo', ref: t, brand: t.brand || null };
      const row = document.createElement('div');
      row.className = 'todo-row';
      row.dataset.itemId = item.ref.id;
      row.draggable = true;
      row.innerHTML = `
        <div class="drag-handle" title="Drag to reorder">⠿</div>
        <div class="check"></div>
        <div class="todo-title" style="flex:1; min-width:0;"></div>
        <div class="quick-date-actions">
          <button type="button" class="qd-btn" data-a="today">Today</button>
          <button type="button" class="qd-btn" data-a="tomorrow">Tomorrow</button>
          <div class="qd-pick-slot"></div>
        </div>
        <button class="icon-btn" title="Delete">×</button>`;
      row.querySelector('.check').addEventListener('click', (e) => { toggleItem(item); pulse(e.currentTarget); setTimeout(() => navigate('todo'), 220); });
      row.querySelector('.todo-title').textContent = t.text;
      makeInlineEditable(row.querySelector('.todo-title'), () => t.text, (val) => { t.text = val; Store.saveTodos(); });
      row.querySelector('[data-a="today"]').addEventListener('click', () => { t.date = todayISO(); Store.saveTodos(); clickTick(); navigate('todo'); });
      row.querySelector('[data-a="tomorrow"]').addEventListener('click', () => { t.date = fmt(addDays(todayISO(), 1)); Store.saveTodos(); clickTick(); navigate('todo'); });
      createDatePicker(row.querySelector('.qd-pick-slot'), null, (iso) => { t.date = iso; Store.saveTodos(); clickTick(); navigate('todo'); });
      row.querySelector('.icon-btn').addEventListener('click', () => deleteTodoItem(item));
      row.addEventListener('dragstart', (e) => {
        if (e.target.closest('input, .check, .icon-btn, .date-picker, button')) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', t.id);
        setTimeout(() => row.classList.add('dragging'), 0);
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
      row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        const fromIdx = unscheduled.findIndex(x => x.id === draggedId);
        const toIdx = unscheduled.findIndex(x => x.id === t.id);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
        const [moved] = unscheduled.splice(fromIdx, 1);
        unscheduled.splice(toIdx, 0, moved);
        unscheduled.forEach((x, idx) => x.order = idx);
        Store.saveTodos();
        clickTick();
        navigate('todo');
      });
      unschedContainer.appendChild(row);
    });
  }
}

function addTodoFromInput(inputId, dateOrNull) {
  const input = document.getElementById(inputId);
  const text = input.value.trim();
  if (!text) return;
  DATA.todos = DATA.todos || [];
  const newId = uid();
  DATA.todos.push({ id: newId, text, date: dateOrNull, done: false, completedAt: null, brand: null });
  Store.saveTodos();
  clickTick();
  navigate('todo');
  const newRow = document.querySelector(`[data-item-id="${newId}"]`);
  if (newRow) newRow.classList.add('row-enter');
}

/* ============================================================
   VIEW: ALL PROJECTS (global)
   ============================================================ */

function renderAllProjectsGlobal() {
  const mount = document.getElementById('viewMount');
  mount.innerHTML = `<div class="card campaign-card">
    <div style="padding:14px 20px 0;"><div class="section-title">All Projects</div></div>
    <div id="addProjectMount"></div>
    <div class="campaign-head-row" style="grid-template-columns:2fr 90px 1fr 1fr;"><div>Project</div><div>Brand</div><div>Progress</div><div>Status</div></div>
    <div id="globalProjectList"></div></div>`;
  renderAddProjectForm(document.getElementById('addProjectMount'), null);

  const list = document.getElementById('globalProjectList');
  let any = false;
  BRAND_KEYS.forEach(brandKey => {
    const meta = BRAND_META[brandKey];
    DATA[brandKey].projects.forEach(p => {
      any = true;
      const { counts, closed, metaLine } = projectRowHTML(brandKey, p);
      const row = document.createElement('div');
      row.className = 'campaign-row';
      row.style.gridTemplateColumns = '2fr 90px 1fr 1fr';
      row.innerHTML = `
        <div><div class="campaign-name">${p.name}<span class="project-type-pill">${p.type || 'Project'}</span></div><div class="campaign-cat">${metaLine}</div></div>
        <div><span class="todo-brand-tag" style="background:${meta.soft}; color:${meta.color};">${brandKey.toUpperCase()}</span></div>
        <div><div class="progress-track"><div class="progress-fill" style="width:${counts.pct}%"></div></div><div class="progress-label">${counts.pct}%</div></div>
        <div class="status-mount"></div>`;
      row.addEventListener('click', (e) => { if (e.target.closest('.kebab-menu')) return; state.brand = brandKey; navigate('project', { projectId: p.id }); });
      mountProjectStatus(row.querySelector('.status-mount'), brandKey, p, counts, closed);
      list.appendChild(row);
    });
  });
  if (!any) list.innerHTML = `<div class="empty-row"><div class="t">No projects yet</div><div class="s">Add your first one above.</div></div>`;
}

/* ============================================================
   VIEW: PROJECT DETAIL (Timeline / Tasks / Files)
   ============================================================ */

function renderProjectDetail() {
  const project = currentProject();
  const mount = document.getElementById('viewMount');
  mount.innerHTML = `
    <button class="back-link" id="backLink">← Overview</button>
    <div class="view-tabs" style="display:flex; align-items:center;">
      <button class="view-tab ${state.projectTab === 'timeline' ? 'active' : ''}" data-tab="timeline">Timeline</button>
      <button class="view-tab ${state.projectTab === 'tasks' ? 'active' : ''}" data-tab="tasks">Tasks</button>
      <button class="view-tab ${state.projectTab === 'files' ? 'active' : ''}" data-tab="files">Files</button>
    </div>
    <button class="close-project-btn" id="closeProjectBtn" style="margin-top:-46px; float:right; position:relative; z-index:2;">${project.status === 'closed' ? 'Reopen project' : 'Close project'}</button>
    <div style="clear:both;"></div>
    <div id="tabMount"></div>`;
  document.getElementById('backLink').addEventListener('click', () => navigate('overview'));
  document.getElementById('closeProjectBtn').addEventListener('click', () => {
    project.status = project.status === 'closed' ? 'active' : 'closed';
    Store.saveBrand(state.brand);
    clickTick();
    navigate('project', { projectId: project.id });
  });
  mount.querySelectorAll('.view-tab').forEach(tab => tab.addEventListener('click', () => { state.projectTab = tab.dataset.tab; renderProjectDetail(); }));
  if (state.projectTab === 'timeline') renderGantt();
  else if (state.projectTab === 'tasks') renderTaskTracker();
  else renderProjectFiles();
}

function renderGantt() {
  const tabMount = document.getElementById('tabMount');
  const timeline = brandData().timeline;
  const dayWidth = 22;
  const labelWidth = window.innerWidth <= 760 ? 140 : 230;

  function buildBody() {
    if (!timeline.length) return `<div class="empty-page"><div class="t">No timeline yet</div><div class="s">Add your first scheduled item above.</div></div>`;
    const allDates = timeline.flatMap(t => t.dates).sort();
    const rangeStart = parseISO(allDates[0]), rangeEnd = parseISO(allDates[allDates.length - 1]);
    const totalDays = daysBetween(rangeStart, rangeEnd) + 1;
    const canvasWidth = totalDays * dayWidth;

    const rows = [];
    const seenCats = new Set();
    timeline.forEach(item => {
      if (!seenCats.has(item.cat)) { seenCats.add(item.cat); rows.push({ type: 'cat', label: item.cat }); }
      rows.push({ type: 'task', item });
    });

    let rowsHTML = '';
    rows.forEach(r => {
      if (r.type === 'cat') {
        rowsHTML += `<div class="gantt-row cat-row"><div class="gantt-label">${r.label}</div><div class="gantt-track" style="width:${canvasWidth}px;"></div></div>`;
      } else {
        const idx = timeline.indexOf(r.item);
        const runs = groupConsecutive(r.item.dates);
        let barsHTML = '';
        runs.forEach(([s, e]) => {
          const left = daysBetween(rangeStart, parseISO(s)) * dayWidth;
          const width = (daysBetween(parseISO(s), parseISO(e)) + 1) * dayWidth - 3;
          const dlabel = s === e ? parseISO(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : `${parseISO(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → ${parseISO(e).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
          barsHTML += `<div class="gantt-bar" title="${r.item.task} — ${dlabel}" style="left:${left}px; width:${Math.max(width, 5)}px;"></div><div class="gantt-bar-date" style="left:${left + Math.max(width, 5) + 8}px;">${dlabel}</div>`;
        });
        rowsHTML += `<div class="gantt-row" data-idx="${idx}">
          <div class="gantt-label" title="${r.item.task}"><span class="gantt-name-edit"></span><button class="gantt-edit-btn" data-idx="${idx}" title="Edit">✎</button><button class="gantt-delete-btn" data-idx="${idx}">×</button></div>
          <div class="gantt-track" style="width:${canvasWidth}px;">${barsHTML}</div>
        </div>`;
      }
    });

    const contentHeight = 34 + rows.length * 33;
    let gridHTML = '', monthLabelsHTML = '', tickHTML = '';
    let cursor = new Date(rangeStart); cursor.setDate(1);
    if (cursor < rangeStart) cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= rangeEnd) {
      const x = daysBetween(rangeStart, cursor) * dayWidth;
      gridHTML += `<div class="gantt-month-line" style="left:${labelWidth + x}px; height:${contentHeight}px;"></div>`;
      monthLabelsHTML += `<div class="gantt-month-label" style="left:${x + 5}px;">${cursor.toLocaleDateString('en-GB', { month: 'short' })}</div>`;
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (let d = 0; d <= totalDays; d++) {
      const dDate = addDays(rangeStart, d);
      const isToday = fmt(dDate) === todayISO();
      tickHTML += `<div class="gantt-day-tick ${isToday ? 'is-today' : ''}" style="left:${d * dayWidth + 3}px;">${dDate.getDate()}</div>`;
    }

    const todayOffset = daysBetween(rangeStart, parseISO(todayISO()));
    const clampedOffset = Math.max(0, Math.min(todayOffset, totalDays));
    const elapsedHTML = `<div class="gantt-elapsed" style="left:${labelWidth}px; width:${clampedOffset * dayWidth}px; height:${contentHeight}px;"></div>`;
    let todayLineHTML = '';
    if (todayOffset >= 0 && todayOffset <= totalDays) { todayLineHTML = `<div class="gantt-today-line" style="left:${labelWidth + todayOffset * dayWidth}px; height:${contentHeight}px;"></div>`; }

    return `
      <div class="gantt-wrap">
        <div class="gantt-header-row"><div class="gantt-header-label">Task</div><div class="gantt-header-track" style="width:${canvasWidth}px;">${monthLabelsHTML}${tickHTML}</div></div>
        ${elapsedHTML}${gridHTML}${todayLineHTML}
        ${rowsHTML}
      </div>`;
  }

  tabMount.innerHTML = `
    <div class="card gantt-card">
      <div class="gantt-add-form">
        <input type="text" class="gi-name" id="tlName" placeholder="Item name">
        <input type="text" class="gi-cat" id="tlCat" placeholder="Category">
        <input type="text" class="gi-owner" id="tlOwner" placeholder="Owner">
        <div id="tlStartSlot"></div>
        <div id="tlEndSlot"></div>
        <button id="tlAddBtn">Add item</button>
      </div>
      ${buildBody()}
    </div>
    <div class="card-sub" style="margin-top:10px; padding-left:4px;">Shaded area = time already elapsed · red line = today · hover a bar for its exact date · hover a row to delete it</div>`;

  const tlStartPicker = createDatePicker(document.getElementById('tlStartSlot'), null, () => {}, 'Start date');
  const tlEndPicker = createDatePicker(document.getElementById('tlEndSlot'), null, () => {}, 'End date');

  tabMount.querySelector('#tlAddBtn').addEventListener('click', () => {
    const name = document.getElementById('tlName').value.trim();
    const cat = document.getElementById('tlCat').value.trim();
    const owner = document.getElementById('tlOwner').value.trim() || '—';
    const start = tlStartPicker.getValue();
    const end = tlEndPicker.getValue() || start;
    if (!name || !cat || !start) return;
    const out = []; let cur = parseISO(start); const endD = parseISO(end);
    while (cur <= endD) { out.push(fmt(cur)); cur = addDays(cur, 1); }
    brandData().timeline.push({ task: name, cat, owner, dates: out });
    Store.saveBrand(state.brand);
    clickTick();
    renderGantt();
  });
  tabMount.querySelectorAll('.gantt-row[data-idx]').forEach(rowEl => {
    const idx = parseInt(rowEl.dataset.idx, 10);
    const it = timeline[idx];
    const nameSpan = rowEl.querySelector('.gantt-name-edit');
    nameSpan.textContent = it.task;
    makeInlineEditable(nameSpan, () => it.task, (val) => { it.task = val; Store.saveBrand(state.brand); });
  });
  tabMount.querySelectorAll('.gantt-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      const it = timeline[idx];
      openGanttEditPanel(btn, it);
    });
  });
  tabMount.querySelectorAll('.gantt-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeWithExit(btn.closest('.gantt-row'), () => {
        brandData().timeline.splice(parseInt(btn.dataset.idx, 10), 1);
        Store.saveBrand(state.brand);
        renderGantt();
      });
    });
  });
}

function mountPriorityPicker(container, t, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'kebab-menu';
  wrap.innerHTML = `<button type="button" class="priority-pill ${t.priority}" style="cursor:pointer;">${t.priority}</button><div class="kebab-dropdown"></div>`;
  container.appendChild(wrap);
  const btn = wrap.querySelector('button'), dd = wrap.querySelector('.kebab-dropdown');
  const options = ['high', 'medium', 'low'];
  dd.innerHTML = options.map((p, i) => `<button type="button" class="kebab-item" data-i="${i}">${p.charAt(0).toUpperCase() + p.slice(1)}</button>`).join('');
  dd.querySelectorAll('.kebab-item').forEach((el, i) => el.addEventListener('click', (e) => { e.stopPropagation(); dd.classList.remove('open'); t.priority = options[i]; onChange(); }));
  function positionDropdown() {
    const rect = btn.getBoundingClientRect(), ddRect = dd.getBoundingClientRect();
    let left = rect.left, top = rect.bottom + 6;
    if (top + ddRect.height > window.innerHeight - 8) top = rect.top - ddRect.height - 6;
    if (left + ddRect.width > window.innerWidth - 8) left = window.innerWidth - ddRect.width - 8;
    dd.style.position = 'fixed'; dd.style.left = left + 'px'; dd.style.top = top + 'px'; dd.style.right = 'auto';
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dd.classList.contains('open')) { dd.classList.remove('open'); activePopoverClose = null; }
    else { openExclusive(() => dd.classList.remove('open'), () => { positionDropdown(); dd.classList.add('open'); }); }
  });
  document.addEventListener('click', () => dd.classList.remove('open'));
}

function renderAddTaskForm(container, projectId) {
  const wrap = document.createElement('div');
  wrap.className = 'add-project-form';
  let selectedPriority = 'medium';
  const priorityColors = { high: 'var(--behind-text)', medium: 'var(--risk-text)', low: 'var(--text-faint)' };
  wrap.innerHTML = `
    <input type="text" class="name-input" id="newTaskTitle" placeholder="Task title">
    <input type="text" class="period-input" id="newTaskCat" placeholder="Category">
    <input type="text" class="period-input" id="newTaskOwner" placeholder="Owner">
    <div class="custom-select" id="priorityPicker">
      <button type="button" class="custom-select-btn" id="priorityPickerBtn">
        <span class="csb-dot" id="priorityPickerDot" style="background:${priorityColors.medium}"></span>
        <span id="priorityPickerLabel">Medium</span>
        <svg class="csb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="custom-select-menu" id="priorityPickerMenu">
        <div class="custom-select-opt" data-p="high"><span class="csb-dot" style="background:${priorityColors.high}"></span>High</div>
        <div class="custom-select-opt" data-p="medium"><span class="csb-dot" style="background:${priorityColors.medium}"></span>Medium</div>
        <div class="custom-select-opt" data-p="low"><span class="csb-dot" style="background:${priorityColors.low}"></span>Low</div>
      </div>
    </div>
    <div id="newTaskDueSlot"></div>
    <button id="newTaskSubmit">Add task</button>`;
  container.appendChild(wrap);

  const duePicker = createDatePicker(document.getElementById('newTaskDueSlot'), null, () => {});
  wrap.querySelector('#newTaskTitle').addEventListener('keydown', (e) => { if (e.key === 'Enter') wrap.querySelector('#newTaskSubmit').click(); });

  const pBtn = wrap.querySelector('#priorityPickerBtn'), pMenu = wrap.querySelector('#priorityPickerMenu');
  pBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pMenu.classList.contains('open')) { pBtn.classList.remove('open'); pMenu.classList.remove('open'); activePopoverClose = null; }
    else { openExclusive(() => { pBtn.classList.remove('open'); pMenu.classList.remove('open'); }, () => { pBtn.classList.add('open'); pMenu.classList.add('open'); }); }
  });
  wrap.querySelectorAll('.custom-select-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      selectedPriority = opt.dataset.p;
      wrap.querySelector('#priorityPickerLabel').textContent = selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1);
      wrap.querySelector('#priorityPickerDot').style.background = priorityColors[selectedPriority];
      pBtn.classList.remove('open'); pMenu.classList.remove('open');
      clickTick();
    });
  });

  wrap.querySelector('#newTaskSubmit').addEventListener('click', () => {
    const title = wrap.querySelector('#newTaskTitle').value.trim();
    const cat = wrap.querySelector('#newTaskCat').value.trim() || 'General';
    const owner = wrap.querySelector('#newTaskOwner').value.trim() || '—';
    const due = duePicker.getValue() || '';
    if (!title) return;
    const newId = uid();
    brandData().tasks.push({ id: newId, title, cat, owner, priority: selectedPriority, status: 'todo', due, notes: '', subtasks: [], deps: [], links: [], projectId });
    Store.saveBrand(state.brand);
    clickTick();
    renderTaskTracker();
    const newRow = document.querySelector(`[data-task="${newId}"]`)?.closest('.task-item');
    if (newRow) newRow.classList.add('row-enter');
  });
}

function openGanttEditPanel(anchorBtn, item) {
  const existing = document.getElementById('ganttEditPanel');
  if (existing) existing.remove();
  const panel = document.createElement('div');
  panel.id = 'ganttEditPanel';
  panel.className = 'kebab-dropdown gantt-edit-panel';
  panel.innerHTML = `
    <div class="gantt-edit-field"><label>Category</label><input type="text" id="geCat" value="${item.cat.replace(/"/g, '&quot;')}"></div>
    <div class="gantt-edit-field"><label>Owner</label><input type="text" id="geOwner" value="${item.owner.replace(/"/g, '&quot;')}"></div>
    <div class="gantt-edit-field"><label>Start date</label><div id="geStartSlot"></div></div>
    <div class="gantt-edit-field"><label>End date</label><div id="geEndSlot"></div></div>
    <button type="button" id="geSave">Save</button>`;
  document.body.appendChild(panel);
  const rect = anchorBtn.getBoundingClientRect();
  panel.style.position = 'fixed';
  panel.style.left = Math.min(rect.left, window.innerWidth - 260) + 'px';
  panel.style.top = (rect.bottom + 6) + 'px';
  const startPicker = createDatePicker(document.getElementById('geStartSlot'), item.dates[0], () => {}, 'Start date');
  const endPicker = createDatePicker(document.getElementById('geEndSlot'), item.dates[item.dates.length - 1], () => {}, 'End date');
  requestAnimationFrame(() => panel.classList.add('open'));
  function close() { panel.classList.remove('open'); setTimeout(() => panel.remove(), 200); activePopoverClose = null; document.removeEventListener('click', outsideClick); }
  function outsideClick(e) { if (!panel.contains(e.target) && e.target !== anchorBtn) close(); }
  setTimeout(() => document.addEventListener('click', outsideClick), 0);
  openExclusive(close, () => {});
  panel.querySelector('#geSave').addEventListener('click', (e) => {
    e.stopPropagation();
    item.cat = document.getElementById('geCat').value.trim() || item.cat;
    item.owner = document.getElementById('geOwner').value.trim() || item.owner;
    const start = startPicker.getValue() || item.dates[0];
    const end = endPicker.getValue() || start;
    const out = []; let cur = parseISO(start); const endD = parseISO(end);
    while (cur <= endD) { out.push(fmt(cur)); cur = addDays(cur, 1); }
    item.dates = out;
    Store.saveBrand(state.brand);
    clickTick();
    close();
    renderGantt();
  });
}

function renderTaskTracker() {
  const tabMount = document.getElementById('tabMount');
  const project = currentProject();
  const tasks = brandData().tasks.filter(t => !project || t.projectId === project.id || !t.projectId);
  const filtered = state.taskFilter === 'all' ? [...tasks].sort((a, b) => (a.status === 'done') - (b.status === 'done')) : tasks.filter(t => t.status === state.taskFilter);

  tabMount.innerHTML = `
    <div class="card" style="margin-bottom:16px;"><div id="addTaskMount"></div></div>
    <div class="filter-tabs">
      <button class="filter-tab ${state.taskFilter === 'all' ? 'active' : ''}" data-f="all">All</button>
      <button class="filter-tab ${state.taskFilter === 'todo' ? 'active' : ''}" data-f="todo">To Do</button>
      <button class="filter-tab ${state.taskFilter === 'progress' ? 'active' : ''}" data-f="progress">In Progress</button>
      <button class="filter-tab ${state.taskFilter === 'done' ? 'active' : ''}" data-f="done">Done</button>
    </div>
    <div class="task-list" id="taskList"></div>`;
  renderAddTaskForm(document.getElementById('addTaskMount'), project ? project.id : null);
  tabMount.querySelectorAll('.filter-tab').forEach(f => f.addEventListener('click', () => { state.taskFilter = f.dataset.f; renderTaskTracker(); }));

  const list = document.getElementById('taskList');
  filtered.forEach(t => {
    const doneCount = t.subtasks.filter(s => s.done).length;
    const isOpen = state.expandedTask === t.id;
    const isDone = t.status === 'done';
    const item = document.createElement('div');
    item.className = 'task-item' + (isDone ? ' is-done' : '');
    const hasSubtasks = t.subtasks.length > 0;
    item.innerHTML = `
      <div class="task-row">
        <div class="task-complete-btn ${isDone ? 'done' : ''}" data-task="${t.id}">${isDone ? '✓' : ''}</div>
        <div class="task-title-cell"><div class="t-title"></div><div class="t-cat"><span class="t-cat-edit"></span> · <span class="t-owner-edit"></span></div></div>
        <div class="task-priority-mount"></div>
        <div><span class="status-pill ${t.status}">${t.status === 'todo' ? 'To Do' : t.status === 'progress' ? 'In Progress' : 'Done'}</span></div>
        <div class="task-due-mount"></div>
        <div class="task-sub-count">${t.subtasks.length ? doneCount + '/' + t.subtasks.length : '—'}</div>
        <div class="task-row-kebab-mount"></div>
      </div>
      <div class="task-detail ${isOpen ? 'open' : ''}" id="detail-${t.id}">
        <div class="task-detail-grid">
          <div>
            <div class="detail-block-title">Subtasks</div>
            <div id="subtasks-${t.id}" class="subtasks-scroll"></div>
            <div class="add-subtask-row"><input type="text" id="newSub-${t.id}" placeholder="Add a subtask…"><button data-task="${t.id}" class="addSubBtn">Add</button></div>
          </div>
          <div>
            <div class="detail-block-title">Notes</div>
            <textarea class="detail-notes-input" placeholder="Add notes for this task…">${(t.notes || '').replace(/</g, '&lt;')}</textarea>
            ${t.deps.length ? `<div class="detail-block-title" style="margin-top:16px;">Depends on</div>${t.deps.map(id => { const dt = tasks.find(x => x.id === id); return dt ? `<span class="dep-chip">${dt.title}</span>` : ''; }).join('')}` : ''}
          </div>
        </div>
      </div>`;
    item.querySelector('.t-title').textContent = t.title;
    makeInlineEditable(item.querySelector('.t-title'), () => t.title, (val) => { t.title = val; Store.saveBrand(state.brand); });
    item.querySelector('.t-cat-edit').textContent = t.cat;
    makeInlineEditable(item.querySelector('.t-cat-edit'), () => t.cat, (val) => { t.cat = val; Store.saveBrand(state.brand); });
    item.querySelector('.t-owner-edit').textContent = t.owner;
    makeInlineEditable(item.querySelector('.t-owner-edit'), () => t.owner, (val) => { t.owner = val; Store.saveBrand(state.brand); });
    item.querySelector('.detail-notes-input').addEventListener('change', (e) => { t.notes = e.target.value; Store.saveBrand(state.brand); });
    mountPriorityPicker(item.querySelector('.task-priority-mount'), t, () => { Store.saveBrand(state.brand); clickTick(); renderTaskTracker(); });
    createDatePicker(item.querySelector('.task-due-mount'), t.due || null, (iso) => { t.due = iso || ''; Store.saveBrand(state.brand); clickTick(); renderTaskTracker(); });
    const taskKebab = buildKebabMenu(item.querySelector('.task-row-kebab-mount'), [
      { label: 'Delete task', danger: true, onClick: () => { removeWithExit(item, () => { const idx = brandData().tasks.indexOf(t); brandData().tasks.splice(idx, 1); Store.saveBrand(state.brand); renderTaskTracker(); }); } }
    ]);
    item.querySelector('.task-row').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openExclusive(taskKebab.close, () => taskKebab.openAt(e.clientX, e.clientY));
    });
    item.querySelector('.task-row').addEventListener('click', (e) => {
      if (e.target.closest('.task-complete-btn, .kebab-menu, .inline-editable, input, button')) return;
      state.expandedTask = isOpen ? null : t.id; renderTaskTracker();
    });
    item.querySelector('.task-complete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const wasDone = t.status === 'done';
      setUnitDone({ kind: 'task', ref: t }, state.brand, !wasDone, todayISO());
      if (wasDone) { recomputeTaskStatus(t); Store.saveBrand(state.brand); }
      wasDone ? uncheckTick() : completeChime();
      pulse(e.currentTarget);
      item.classList.add('completing');
      setTimeout(() => renderTaskTracker(), 340);
    });
    list.appendChild(item);
    if (isOpen) {
      const detailEl = item.querySelector('.task-detail');
      requestAnimationFrame(() => { detailEl.style.maxHeight = detailEl.scrollHeight + 40 + 'px'; });
    }

    if (isOpen) {
      const sub = item.querySelector(`#subtasks-${t.id}`);
      if (!t.subtasks.length) sub.innerHTML = `<div style="font-size:12.5px;color:var(--text-dim);">No subtasks yet.</div>`;
      t.subtasks.forEach(s => {
        const row = document.createElement('div');
        row.className = `subtask-row-full ${s.done ? 'done' : ''}`;
        row.draggable = true;
        row.dataset.subId = s.id;
        row.innerHTML = `
          <div class="subtask-main">
            <div class="drag-handle" title="Drag to reorder">⠿</div>
            <div class="subtask-check" style="background:${s.done ? 'var(--accent)' : 'transparent'}; border-color:${s.done ? 'var(--accent)' : ''};">${s.done ? '✓' : ''}</div>
            <input type="text" class="subtask-text-input" value="${s.text.replace(/"/g, '&quot;')}">
            <button class="icon-btn" title="Delete subtask">×</button>
          </div>
          <div class="subtask-meta">
            <div class="subtask-due-slot"></div>
            <input type="text" class="subtask-notes-input" value="${(s.notes || '').replace(/"/g, '&quot;')}" placeholder="Note…">
          </div>`;
        sub.appendChild(row);
        createDatePicker(row.querySelector('.subtask-due-slot'), s.due || null, (iso) => { s.due = iso || ''; Store.saveBrand(state.brand); clickTick(); });
        const subKebabMount = document.createElement('div');
        row.appendChild(subKebabMount);
        const subKebab = buildKebabMenu(subKebabMount, [
          { label: 'Delete subtask', danger: true, onClick: () => { removeWithExit(row, () => { t.subtasks = t.subtasks.filter(x => x.id !== s.id); recomputeTaskStatus(t); Store.saveBrand(state.brand); renderTaskTracker(); }); } }
        ]);
        subKebabMount.querySelector('.kebab-btn').style.display = 'none';
        row.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          openExclusive(subKebab.close, () => subKebab.openAt(e.clientX, e.clientY));
        });
        row.querySelector('.subtask-check').addEventListener('click', (e) => {
          e.stopPropagation();
          const nowDone = !s.done;
          s.done = nowDone; s.completedAt = nowDone ? todayISO() : null;
          recomputeTaskStatus(t);
          Store.saveBrand(state.brand);
          nowDone ? completeChime() : uncheckTick();
          pulse(e.currentTarget);
          setTimeout(() => renderTaskTracker(), 240);
        });
        row.querySelector('.subtask-text-input').addEventListener('change', (e) => { s.text = e.target.value.trim() || s.text; Store.saveBrand(state.brand); });
        row.querySelector('.subtask-notes-input').addEventListener('change', (e) => { s.notes = e.target.value; Store.saveBrand(state.brand); });
        row.querySelector('.icon-btn').addEventListener('click', (e) => { e.stopPropagation(); removeWithExit(row, () => { t.subtasks = t.subtasks.filter(x => x.id !== s.id); recomputeTaskStatus(t); Store.saveBrand(state.brand); renderTaskTracker(); }); });
        row.addEventListener('dragstart', (e) => {
          if (e.target.closest('input, .subtask-check, .icon-btn, .date-picker, .kebab-menu')) { e.preventDefault(); return; }
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', s.id);
          setTimeout(() => row.classList.add('dragging'), 0);
        });
        row.addEventListener('dragend', () => row.classList.remove('dragging'));
        row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
        row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
        row.addEventListener('drop', (e) => {
          e.preventDefault();
          row.classList.remove('drag-over');
          const draggedId = e.dataTransfer.getData('text/plain');
          if (!draggedId || draggedId === s.id) return;
          const fromIdx = t.subtasks.findIndex(x => x.id === draggedId);
          const toIdx = t.subtasks.findIndex(x => x.id === s.id);
          if (fromIdx === -1 || toIdx === -1) return;
          const [moved] = t.subtasks.splice(fromIdx, 1);
          t.subtasks.splice(toIdx, 0, moved);
          Store.saveBrand(state.brand);
          clickTick();
          renderTaskTracker();
        });
      });
      item.querySelector('.addSubBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const input = document.getElementById(`newSub-${t.id}`);
        const text = input.value.trim();
        if (!text) return;
        t.subtasks.push({ id: uid(), text, done: false, due: '', notes: '', completedAt: null });
        recomputeTaskStatus(t);
        Store.saveBrand(state.brand);
        clickTick();
        renderTaskTracker();
        const subList = document.getElementById(`subtasks-${t.id}`);
        if (subList && subList.lastElementChild) subList.lastElementChild.classList.add('row-enter');
      });
      document.getElementById(`newSub-${t.id}`).addEventListener('keydown', (e) => { if (e.key === 'Enter') item.querySelector('.addSubBtn').click(); });
    }
  });
}

function renderProjectFiles() {
  const tabMount = document.getElementById('tabMount');
  const project = currentProject();
  project.files = project.files || [];
  tabMount.innerHTML = `
    <div class="card">
      <div class="add-todo-row">
        <input type="text" id="fileLabelInput" placeholder="Label, e.g. Media Plan">
        <input type="text" id="fileUrlInput" placeholder="Paste Google Drive / SharePoint link">
        <button id="addFileBtn">Add</button>
      </div>
      <div id="fileList"></div>
    </div>`;
  document.getElementById('addFileBtn').addEventListener('click', () => {
    const label = document.getElementById('fileLabelInput').value.trim();
    const url = document.getElementById('fileUrlInput').value.trim();
    if (!label || !url) return;
    project.files.push({ id: uid(), label, url });
    Store.saveBrand(state.brand);
    clickTick();
    renderProjectFiles();
  });
  const list = document.getElementById('fileList');
  if (!project.files.length) { list.innerHTML = `<div style="padding:20px;font-size:12.5px;color:var(--text-dim);">No files linked yet.</div>`; }
  else {
    list.innerHTML = '';
    project.files.forEach(f => {
      const row = document.createElement('div');
      row.className = 'todo-row';
    row.dataset.itemId = item.ref.id;
      row.innerHTML = `<a href="${f.url}" target="_blank" rel="noopener" class="file-link">📎 ${f.label}</a><button class="file-remove-btn" data-id="${f.id}">×</button>`;
      row.querySelector('.file-remove-btn').addEventListener('click', () => { project.files = project.files.filter(x => x.id !== f.id); Store.saveBrand(state.brand); renderProjectFiles(); });
      list.appendChild(row);
    });
  }
}

/* ============================================================
   ROUTER
   ============================================================ */

function renderCurrentView() {
  if (state.view === 'global-overview') renderGlobalOverview();
  else if (state.view === 'overview') renderBrandOverview();
  else if (state.view === 'todo') renderDailyTodo();
  else if (state.view === 'all') renderAllProjectsGlobal();
  else if (state.view === 'project') renderProjectDetail();
}

function navigate(view, opts = {}) {
  state.view = view;
  if (opts.projectId) { state.projectId = opts.projectId; state.projectTab = 'timeline'; }
  const mount = document.getElementById('viewMount');
  const brandActive = (view === 'overview' || view === 'project');
  document.getElementById('brandEyebrow').textContent = brandActive ? BRAND_META[state.brand].label : (view === 'todo' ? '' : 'ALL BRANDS');
  document.getElementById('mainTitle').textContent =
    view === 'global-overview' ? 'Overview' :
    view === 'overview' ? 'Overview' :
    view === 'todo' ? 'Daily To-Do' :
    view === 'all' ? 'All Projects' :
    (currentProject() || {}).name || 'Project';
  renderCurrentView();
  mount.classList.remove('view-fade'); void mount.offsetWidth; mount.classList.add('view-fade');
  syncSidebar();
}

/* ============================================================
   INIT
   ============================================================ */

function closeMobileDrawer() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
}

window.addEventListener('load', async () => {
  renderYearCountdown();
  initCursor();
  initRipple();
  let wasHidden = false;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      wasHidden = true;
    } else if (document.visibilityState === 'visible' && wasHidden && DATA) {
      navigate('global-overview');
      wasHidden = false;
    }
  });
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
    document.getElementById('sidebarBackdrop').classList.toggle('open');
  });
  document.getElementById('sidebarBackdrop').addEventListener('click', closeMobileDrawer);
  document.querySelectorAll('.brand-tab').forEach(tab => tab.addEventListener('click', () => { state.brand = tab.dataset.brand; clickTick(); closeMobileDrawer(); navigate('overview'); }));
  document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => { clickTick(); closeMobileDrawer(); navigate(item.dataset.nav === 'overview' ? 'global-overview' : item.dataset.nav); }));
  document.getElementById('viewMount').innerHTML = `<div style="padding:40px; color:var(--text-dim); font-size:13px;">Loading your data…</div>`;
  await signInAnonymously(auth);
  DATA = await Store.loadAll();
  state.selectedDate = todayISO();
  navigate('global-overview');
});
