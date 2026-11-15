/* Sample data for design work only. Active when running `npm run dev` and opening /?demo.
   Never included in the deployed app's behaviour: nothing is read from or written to Firestore. */
import type { DayDoc, Meal } from '../lib/types';
import { keyOf, shiftKey, todayKey } from '../lib/dates';

export const DEMO = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');

const meal = (id: string, cat: Meal['cat'], name: string, cal: number, prot: number, carb: number, fat: number, servings = 1): Meal => ({
  id, cat, name, servings, baseServing: 1, ts: 0,
  baseCal: cal, baseProt: prot, baseCarb: carb, baseFat: fat,
  cal: Math.round(cal * servings), prot: Math.round(prot * servings), carb: Math.round(carb * servings), fat: Math.round(fat * servings),
});

const FULL: Meal[] = [
  meal('1', 'breakfast', 'Eggs on sourdough with labneh', 520, 34, 41, 24),
  meal('2', 'breakfast', 'Whey protein shake', 160, 30, 6, 2),
  { ...meal('3', 'lunch', 'Chicken machboos', 780, 58, 92, 18), source: 'scan', breakdown: [
    { item: 'Grilled chicken thigh', weight: '220g', cal: 400, prot: 50, carb: 0, fat: 14 },
    { item: 'Spiced basmati rice', weight: '280g', cal: 360, prot: 7, carb: 90, fat: 3 },
    { item: 'Tomato daqoos', weight: '40g', cal: 20, prot: 1, carb: 2, fat: 1 },
  ] },
  meal('4', 'snacks', 'Greek yoghurt with honey', 190, 17, 22, 4, 1.5),
  meal('5', 'drinks', 'Flat white', 120, 6, 9, 6),
];
const DINNER = meal('6', 'dinner', 'Salmon, potatoes and greens', 690, 46, 52, 30);

export function demoDay(key: string): DayDoc {
  const today = todayKey();
  if (key === today) return { date: key, water: 5, meals: FULL };
  if (key > today) return { date: key, water: 0, meals: [] };
  const n = Number(key.slice(-2));
  if (n % 7 === 3) return { date: key, water: 0, meals: [] };
  if (n % 3 === 0) return { date: key, water: 6, meals: FULL.slice(0, 3) };
  if (n % 4 === 1) return { date: key, water: 7, meals: [...FULL, DINNER, meal('7', 'snacks', 'Protein bar', 210, 4, 24, 8)] };
  return { date: key, water: 8, meals: [...FULL, DINNER, meal('7', 'snacks', 'Dates and almonds', 420, 22, 40, 12)] };
}

export function demoRange(start: string, end: string): DayDoc[] {
  const out: DayDoc[] = [];
  for (let k = start; k <= end; k = shiftKey(k, 1)) out.push(demoDay(k));
  return out;
}
export { keyOf };

export const demoFoods = {
  recent: [
    { name: 'Chicken machboos', cal: 780, prot: 58, carb: 92, fat: 18 },
    { name: 'Whey protein shake', cal: 160, prot: 30, carb: 6, fat: 2 },
    { name: 'Eggs on sourdough with labneh', cal: 520, prot: 34, carb: 41, fat: 24 },
    { name: 'Greek yoghurt with honey', cal: 190, prot: 17, carb: 22, fat: 4 },
    { name: 'Flat white', cal: 120, prot: 6, carb: 9, fat: 6 },
    { name: 'Salmon, potatoes and greens', cal: 690, prot: 46, carb: 52, fat: 30 },
    { name: 'Dates and almonds', cal: 420, prot: 22, carb: 40, fat: 12 },
  ],
  saved: [
    { id: 'a', name: 'Overnight oats', cal: 450, prot: 32, carb: 55, fat: 11 },
    { id: 'b', name: 'Protein bar', cal: 210, prot: 20, carb: 22, fat: 7 },
    { id: 'c', name: 'Whey protein shake', cal: 160, prot: 30, carb: 6, fat: 2 },
  ],
};
