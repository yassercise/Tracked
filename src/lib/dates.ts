/** Day keys are YYYY-MM-DD in the phone's local time. */
export function keyOf(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayKey = () => keyOf(new Date());

export function shiftKey(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return keyOf(d);
}

export function monthKeys(key: string): string[] {
  const d = fromKey(key);
  const count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => keyOf(new Date(d.getFullYear(), d.getMonth(), i + 1)));
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const weekdayShort = (key: string) => WEEKDAY[fromKey(key).getDay()];
export const dayNumber = (key: string) => fromKey(key).getDate();
export const monthName = (key: string) => MONTH[fromKey(key).getMonth()];

/** "Today", "Yesterday", or "Thursday". */
export function dayTitle(key: string): string {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === shiftKey(today, -1)) return 'Yesterday';
  return fromKey(key).toLocaleDateString('en-GB', { weekday: 'long' });
}

/** "14 November" (adds the year when it is not the current one). */
export function dayLong(key: string): string {
  const d = fromKey(key);
  const year = d.getFullYear() === new Date().getFullYear() ? '' : ` ${d.getFullYear()}`;
  return `${d.getDate()} ${MONTH[d.getMonth()]}${year}`;
}

/** The `count` days ending on `key`, oldest first. */
export function lastDays(key: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftKey(key, i - (count - 1)));
}

/** Same day-of-month in another month, clamped to that month's length. */
export function shiftMonth(key: string, months: number): string {
  const d = fromKey(key);
  const first = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return keyOf(new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last)));
}

/** "9 – 15 November" or "30 November – 6 December". */
export function rangeLabel(start: string, end: string): string {
  const a = fromKey(start);
  const b = fromKey(end);
  return a.getMonth() === b.getMonth() ? `${a.getDate()} – ${b.getDate()} ${MONTH[b.getMonth()]}` : `${a.getDate()} ${MONTH[a.getMonth()]} – ${b.getDate()} ${MONTH[b.getMonth()]}`;
}

export const monthYear = (key: string) => `${MONTH[fromKey(key).getMonth()]} ${fromKey(key).getFullYear()}`;
