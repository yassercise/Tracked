const started = performance.now();
const MIN_MS = 800; // long enough to register, short enough not to get in the way
let done = false;

/** Fade out the loading screen from index.html. Safe to call more than once. */
export function hideSplash() {
  if (done) return;
  done = true;
  const el = document.getElementById('splash');
  if (!el) return;
  const wait = Math.max(0, MIN_MS - (performance.now() - started));
  window.setTimeout(() => {
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 500);
  }, wait);
}

// Never leave the loading screen up if data is slow or the phone is offline.
window.setTimeout(hideSplash, 5000);
