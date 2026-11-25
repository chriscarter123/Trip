// App shell: bottom tabs + offline support.
// To add a feature: add a <section class="view" id="view-NAME"> and a tab in index.html,
// put its code in js/NAME/, and register it in TABS below.
import { initToday } from './today/today.js';
import { initMoney } from './money/money.js';

const TABS = {
  today: initToday,
  money: initMoney,
};
const DEFAULT_TAB = 'today';
const started = new Set();

function show(name) {
  if (!TABS[name]) name = DEFAULT_TAB;
  document.querySelectorAll('.view').forEach((v) => { v.hidden = v.id !== `view-${name}`; });
  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.toggleAttribute('aria-current', a.dataset.tab === name);
  });
  if (!started.has(name)) {
    started.add(name);
    TABS[name]();
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
