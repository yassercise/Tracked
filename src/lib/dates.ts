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
