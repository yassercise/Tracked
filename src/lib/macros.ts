import type { Macros, Meal, Targets } from './types';

export const ZERO: Macros = { cal: 0, prot: 0, carb: 0, fat: 0 };

export function sum(items: Macros[]): Macros {
  return items.reduce(
    (a, m) => ({
      cal: a.cal + (m.cal || 0),
      prot: a.prot + (m.prot || 0),
      carb: a.carb + (m.carb || 0),
      fat: a.fat + (m.fat || 0),
    }),
    ZERO
  );
}

/** Scale one serving by a servings multiplier. */
export function scale(base: Macros, servings: number): Macros {
  return {
    cal: Math.round(base.cal * servings),
    prot: Math.round(base.prot * servings),
    carb: Math.round(base.carb * servings),
    fat: Math.round(base.fat * servings),
  };
}

export const baseOf = (m: Meal): Macros => ({ cal: m.baseCal, prot: m.baseProt, carb: m.baseCarb, fat: m.baseFat });

/** Apply a new servings multiplier to a meal, keeping base macros untouched. */
export function withServings(m: Meal, servings: number): Meal {
  return { ...m, ...scale(baseOf(m), servings), servings };
}

export type DayStatus = 'none' | 'missed' | 'partial' | 'hit';

/** hit = calories AND protein at or above target. */
export function dayStatus(totals: Macros, logged: boolean, t: Targets): DayStatus {
  if (!logged) return 'none';
  const cal = totals.cal >= t.cal;
  const prot = totals.prot >= t.prot;
  if (cal && prot) return 'hit';
  return cal || prot ? 'partial' : 'missed';
}

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtServings = (n: number) => `${Number(n.toFixed(2))}×`;
