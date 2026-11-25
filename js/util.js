// Small helpers shared by every tab.
export const $ = (id) => document.getElementById(id);

export const parse = (s) => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const fmt = (n, digits, minDigits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: minDigits, maximumFractionDigits: digits });

// Escape text before putting it into innerHTML.
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
