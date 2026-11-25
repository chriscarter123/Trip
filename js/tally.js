// Running list of baht amounts with a cumulative total. Saved on the device.
const KEY = 'tally:items';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const save = (items) => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
};

export function createTally({ listEl, totalEl, clearBtn, fmt }) {
  let items = load();
  let rate = null;

  const usd = (thb) => (rate ? `$${fmt(thb / rate, 2, 2)}` : '–');

  function render() {
    listEl.innerHTML = '';
    items.forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="n">${i + 1}</span>
        <span class="thb">฿${fmt(item.thb, 2)}</span>
        <span class="usd">${usd(item.thb)}</span>`;
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del';
      del.textContent = '×';
      del.setAttribute('aria-label', `Remove item ${i + 1}`);
      del.addEventListener('click', () => {
        items.splice(i, 1);
        save(items);
        render();
      });
      li.appendChild(del);
      listEl.appendChild(li);
    });

    const total = items.reduce((s, it) => s + it.thb, 0);
    totalEl.innerHTML = items.length
      ? `<span>Total (${items.length})</span><span class="thb">฿${fmt(total, 2)}</span><span class="usd">${usd(total)}</span>`
      : '<span class="empty">Add amounts to keep a running total</span>';
    clearBtn.hidden = items.length === 0;
  }

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all items?')) return;
    items = [];
    save(items);
    render();
  });

  render();

  return {
    add(thb) {
      if (!(thb > 0)) return false;
      items.push({ thb, at: Date.now() });
      save(items);
      render();
      return true;
    },
    setRate(r) {
      rate = r;
      render();
    },
  };
}
