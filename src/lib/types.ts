export type Category = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'drinks';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'drinks', label: 'Drinks' },
];

export interface Macros {
  cal: number;
  prot: number;
  carb: number;
  fat: number;
}

export interface BreakdownItem extends Macros {
  item: string;
  weight: string;
}

/** A logged meal. cal/prot/carb/fat are already multiplied by `servings`;
    base* always describe exactly one serving. */
export interface Meal extends Macros {
  id: string;
  name: string;
  cat: Category;
  baseCal: number;
  baseProt: number;
  baseCarb: number;
  baseFat: number;
  baseServing: 1;
  servings: number;
  ts: number;
  source?: string;
  breakdown?: BreakdownItem[];
  icon?: string; // emoji; set by AI scans, otherwise derived from the name
}

export interface DayDoc {
  meals: Meal[];
  water: number; // glasses of 300 ml
  date: string;
}

/** One serving of a food, as stored in recent and saved foods. */
export interface Food extends Macros {
  id?: string;
  name: string;
  ts?: number;
  icon?: string;
}

export interface Targets extends Macros {
  water: number; // glasses
}

export const DEFAULT_TARGETS: Targets = { cal: 2865, prot: 183, carb: 300, fat: 80, water: 8 };
export const GLASS_ML = 300;
