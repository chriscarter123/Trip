// Fetches exchange rates and caches the last good result on the device.
// Free, no API key, CORS-enabled sources. The first one that works wins.
const SOURCES = [
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    parse: (d) => ({ rate: d.rates.THB, date: d.time_last_update_unix * 1000 }),
  },
  {
    name: 'currency-api',
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
    parse: (d) => ({ rate: d.usd.thb, date: Date.parse(d.date) }),
  },
];

const CACHE_KEY = 'rate:USD-THB';
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // refetch if older than 6 hours

export function getCachedRate() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

function saveRate(value) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch {}
}

export function isFresh(cached) {
  return cached && Date.now() - cached.fetchedAt < MAX_AGE_MS;
}

// Returns { rate, date, fetchedAt, source } where rate = THB per 1 USD.
export async function fetchRate() {
  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, { cache: 'no-store' });
      if (!res.ok) continue;
      const { rate, date } = src.parse(await res.json());
      if (!(rate > 0)) continue;
      const value = { rate, date, fetchedAt: Date.now(), source: src.name };
      saveRate(value);
      return value;
    } catch {
      // try next source
    }
  }
  throw new Error('No rate source reachable');
}
