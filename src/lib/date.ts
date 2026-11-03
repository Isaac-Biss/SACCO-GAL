/** Date / contribution-period helpers. Periods are stored as "YYYY-MM". */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2025-11" -> "November 2025" */
export function formatPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return `${MONTHS[m - 1]} ${y}`;
}

/** "2025-11" -> "Nov 2025" */
export function formatPeriodShort(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return `${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** ISO date -> "3 Nov 2025" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/** ISO date -> "3 Nov, 2:15 PM" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}, ${h}:${min} ${ampm}`;
}

/** Friendly relative time, e.g. "2 days ago". `now` is injectable for testing. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

/** Add N months to a "YYYY-MM-..." ISO date, returning an ISO date string. */
export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

/** The current contribution period as "YYYY-MM". */
export function currentPeriod(now: Date = new Date()): string {
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

/** The period N steps before the given one. periodMinus("2025-11", 2) -> "2025-09" */
export function periodMinus(period: string, n: number): string {
  const [y, m] = period.split('-').map(Number);
  const idx = (y * 12 + (m - 1)) - n;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${nm.toString().padStart(2, '0')}`;
}
