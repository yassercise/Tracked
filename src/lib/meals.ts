import { scale } from './macros';
import type { BreakdownItem, Category, Macros, Meal } from './types';

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Build a meal entry from one serving of a food. */
export function makeMeal(
  food: Macros & { name: string },
  cat: Category,
  servings = 1,
  extra: { source?: string; breakdown?: BreakdownItem[] } = {}
): Meal {
  const base: Macros = { cal: Math.round(food.cal) || 0, prot: Math.round(food.prot) || 0, carb: Math.round(food.carb) || 0, fat: Math.round(food.fat) || 0 };
  return {
    id: newId(),
    name: food.name.trim(),
    cat,
    ...scale(base, servings),
    baseCal: base.cal, baseProt: base.prot, baseCarb: base.carb, baseFat: base.fat,
    baseServing: 1,
    servings,
    ts: Date.now(),
    ...extra,
  };
}

/** Sensible default category for the time of day. */
export function categoryForNow(): Category {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snacks';
}
