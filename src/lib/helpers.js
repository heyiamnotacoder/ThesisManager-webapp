export const ARM_COLORS = ['#1e3a8a', '#3b82f6', '#0ea5e9'];

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtDateShort = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const daysFromNow = (d) => {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
};

export const initials = (name) =>
  name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

export const shade = (hex, amount) => {
  const h = hex.replace('#', '');
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const adj = (v) => Math.max(0, Math.min(255, v + Math.round(255 * amount / 100)));
  return '#' + [adj(r), adj(g), adj(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
};

export const hexA = (hex, alpha) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const tinted = (hex, mix) => {
  const h = hex.replace('#', '');
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  r = Math.round(r + (255 - r) * (1 - mix));
  g = Math.round(g + (255 - g) * (1 - mix));
  b = Math.round(b + (255 - b) * (1 - mix));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};
