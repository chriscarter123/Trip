// Today tab: the day's plan, where you're staying, and trip essentials.
// Data comes from data/trip.json (cached on the phone for offline use).
import { $, esc, mapsUrl } from '../util.js';

let trip = null;
let dayIndex = 0;

// "YYYY-MM-DD" for now, in the trip's time zone (so it's right before you fly, too).
function todayISO(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// "HH:MM" for now, in the trip's time zone.
function nowHM(tz) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  } catch {
    return new Date().toTimeString().slice(0, 5);
  }
}

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function niceDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function niceTime(hm) {
  if (!hm) return '';
  const [h, m] = hm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Pick the day to show: today if it's in the trip, else the nearest day.
function defaultDayIndex() {
  const today = todayISO(trip.timezone);
  const i = trip.days.findIndex((d) => d.date === today);
  if (i !== -1) return i;
  return today < trip.days[0].date ? 0 : trip.days.length - 1;
}

function placeLink(place, local) {
  if (!place) return '';
  const driver = local
    ? ` <button class="chip-btn" type="button" data-driver="${esc(local)}" data-label="${esc(place)}">Show driver</button>`
    : '';
  return `<div class="place"><a href="${mapsUrl(place)}" target="_blank" rel="noopener">📍 ${esc(place)}</a>${driver}</div>`;
}

function renderStay(stay) {
  if (!stay) return '';
  const rows = [];
  if (stay.address) rows.push(placeLink(stay.address, stay.addressLocal));
  if (stay.phone) rows.push(`<div><a href="tel:${esc(stay.phone.replace(/\s/g, ''))}">📞 ${esc(stay.phone)}</a></div>`);
  if (stay.confirmation) rows.push(`<div class="muted">Conf # <span class="mono">${esc(stay.confirmation)}</span></div>`);
  return `<div class="card stay">
      <div class="card-label">Tonight</div>
      <div class="card-title">${esc(stay.name)}</div>
      ${rows.join('')}
    </div>`;
}

function renderItems(day, isToday) {
  if (!day.items?.length) return '<p class="muted">Nothing planned. Enjoy!</p>';
  // On today's page, highlight the item happening now / next.
  let nextIdx = -1;
  const now = nowHM(day.timezone || trip.timezone); // a day can override, e.g. a travel day
  if (isToday) {
    nextIdx = day.items.findIndex((it, i) => {
      const nextTime = day.items[i + 1]?.time;
      return !nextTime || nextTime > now;
    });
  }
  return `<ol class="timeline">${day.items
    .map((it, i) => {
      const cls = i === nextIdx ? 'now' : isToday && i < nextIdx ? 'done' : '';
      return `<li class="${cls}">
        <div class="time">${esc(niceTime(it.time))}</div>
        <div class="body">
          <div class="item-title">${esc(it.title)}${i === nextIdx ? ` <span class="badge">${!it.time || it.time <= now ? 'Now' : 'Next'}</span>` : ''}</div>
          ${placeLink(it.place, it.placeLocal)}
          ${it.notes ? `<div class="muted">${esc(it.notes)}</div>` : ''}
          ${it.confirmation ? `<div class="muted">Conf # <span class="mono">${esc(it.confirmation)}</span></div>` : ''}
          ${it.url ? `<div><a href="${esc(it.url)}" target="_blank" rel="noopener">Open link ↗</a></div>` : ''}
        </div>
      </li>`;
    })
    .join('')}</ol>`;
}

function renderEssentials() {
  if (!trip.essentials?.length) return '';
  const rows = trip.essentials
    .map((e) => {
      const val = e.tel
        ? `<a href="tel:${esc(e.tel)}">${esc(e.value)}</a>`
        : e.url
          ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.value)}</a>`
          : `<span class="mono">${esc(e.value)}</span>`;
      return `<li><span class="muted">${esc(e.label)}</span>${val}</li>`;
    })
    .join('');
  return `<details class="card essentials"><summary>Essentials &amp; emergency</summary><ul>${rows}</ul></details>`;
}

function render() {
  const root = $('today');
  const day = trip.days[dayIndex];
  const today = todayISO(trip.timezone);
  const isToday = day.date === today;

  let banner = '';
  const untilStart = daysBetween(today, trip.days[0].date);
  if (untilStart > 0) banner = `<p class="banner">Trip starts in ${untilStart} day${untilStart === 1 ? '' : 's'}</p>`;

  root.innerHTML = `
    ${banner}
    <div class="day-nav">
      <button type="button" class="nav-btn" id="day-prev" aria-label="Previous day" ${dayIndex === 0 ? 'disabled' : ''}>‹</button>
      <div class="day-head">
        <div class="day-date">${isToday ? 'Today · ' : ''}${esc(niceDate(day.date))}</div>
        <div class="day-title">${esc(day.title || '')}</div>
        <div class="muted small">Day ${dayIndex + 1} of ${trip.days.length}</div>
      </div>
      <button type="button" class="nav-btn" id="day-next" aria-label="Next day" ${dayIndex === trip.days.length - 1 ? 'disabled' : ''}>›</button>
    </div>
    ${!isToday && trip.days.some((d) => d.date === today) ? '<button type="button" class="link center" id="day-today">Jump to today</button>' : ''}
    ${renderItems(day, isToday)}
    ${renderStay(day.stay)}
    ${renderEssentials()}
  `;

  $('day-prev').onclick = () => { dayIndex--; render(); };
  $('day-next').onclick = () => { dayIndex++; render(); };
  const jump = $('day-today');
  if (jump) jump.onclick = () => { dayIndex = defaultDayIndex(); render(); };
}

// Full-screen address card to show a taxi / Grab driver.
function showDriverCard(local, label) {
  const dlg = $('driver');
  $('driver-local').textContent = local;
  $('driver-en').textContent = label;
  dlg.showModal();
}

export async function initToday() {
  const root = $('today');
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-driver]');
    if (btn) showDriverCard(btn.dataset.driver, btn.dataset.label);
  });
  $('driver').addEventListener('click', () => $('driver').close());

  try {
    const res = await fetch('data/trip.json');
    trip = await res.json();
    if (!trip.days?.length) throw new Error('No days in trip.json');
    trip.days.sort((a, b) => a.date.localeCompare(b.date));
    dayIndex = defaultDayIndex();
    render();
  } catch (err) {
    root.innerHTML = `<p class="muted">Couldn't load your itinerary (data/trip.json). ${esc(err.message)}</p>`;
  }

  // Coming back to the app later: jump to the current day and refresh "Now".
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && trip) {
      dayIndex = defaultDayIndex();
      render();
    }
  });
}
