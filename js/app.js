import { getCachedRate, fetchRate, isFresh } from './rates.js';

const QUICK_THB = [100, 500, 1000, 2000, 5000];

const $ = (id) => document.getElementById(id);
const thbInput = $('thb');
const usdInput = $('usd');
const rateEl = $('rate');
const statusEl = $('status');

let state = { rate: null, lastEdited: 'thb' };

// ---- formatting helpers ----
const parse = (s) => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n, digits) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits });

// ---- conversion ----
function recalc() {
  if (!state.rate) return;
  if (state.lastEdited === 'thb') {
    const thb = parse(thbInput.value);
    usdInput.value = thb == null ? '' : fmt(thb / state.rate, 2);
  } else {
    const usd = parse(usdInput.value);
    thbInput.value = usd == null ? '' : fmt(usd * state.rate, 0);
  }
}

function onType(which) {
  return (e) => {
    // keep only digits and a single dot while typing
    const el = e.target;
    let v = el.value.replace(/[^0-9.]/g, '');
    const i = v.indexOf('.');
    if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '');
    el.value = v;
    state.lastEdited = which;
    recalc();
  };
}

thbInput.addEventListener('input', onType('thb'));
usdInput.addEventListener('input', onType('usd'));
// show raw number when focusing a formatted field
[thbInput, usdInput].forEach((el) =>
  el.addEventListener('focus', () => { el.value = el.value.replace(/,/g, ''); })
);

$('clear').addEventListener('click', () => {
  thbInput.value = '';
  usdInput.value = '';
  thbInput.focus();
});

const chips = $('chips');
QUICK_THB.forEach((amt) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = `฿${fmt(amt, 0)}`;
  b.addEventListener('click', () => {
    thbInput.value = String(amt);
    state.lastEdited = 'thb';
    recalc();
  });
  chips.appendChild(b);
});

// ---- rate display ----
function showRate(r, { stale = false } = {}) {
  state.rate = r.rate;
  rateEl.textContent = `$1 = ฿${r.rate.toFixed(2)}  ·  ฿100 = $${(100 / r.rate).toFixed(2)}`;
  const when = new Date(r.date || r.fetchedAt).toLocaleString([], {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  statusEl.textContent = stale ? `Offline – using rate from ${when}` : `Rate updated ${when}`;
  statusEl.classList.toggle('stale', stale);
  recalc();
}

async function loadRate() {
  const cached = getCachedRate();
  if (cached) showRate(cached, { stale: !navigator.onLine });
  if (isFresh(cached)) return;
  try {
    showRate(await fetchRate());
  } catch {
    if (cached) showRate(cached, { stale: true });
    else rateEl.textContent = 'Could not load rate. Connect to the internet once.';
  }
}

loadRate();
// refresh when the app comes back to the foreground
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') loadRate();
});

// ---- offline support ----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
