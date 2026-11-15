import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayUnion, onSnapshot, setDoc } from 'firebase/firestore';
import { dayRef } from '../lib/paths';
import type { DayDoc, Meal } from '../lib/types';
import { DEMO, demoDay } from './demo';

// Demo mode keeps its edits in memory so flows can be tried end to end.
const demoStore: Record<string, DayDoc> = {};

const empty = (key: string): DayDoc => ({ meals: [], water: 0, date: key });

/** Meals written by the original app have no id or servings field. */
export function normalizeDay(key: string, data: Record<string, any> | undefined): DayDoc {
  const meals: Meal[] = (data?.meals ?? []).map((m: any, i: number) => {
    const servings = Number(m.servings) > 0 ? Number(m.servings) : 1;
    return {
      ...m,
      id: m.id ?? `m${m.ts ?? 0}-${i}`,
      cat: m.cat ?? 'snacks',
      cal: m.cal || 0, prot: m.prot || 0, carb: m.carb || 0, fat: m.fat || 0,
      baseCal: m.baseCal ?? Math.round((m.cal || 0) / servings),
      baseProt: m.baseProt ?? Math.round((m.prot || 0) / servings),
      baseCarb: m.baseCarb ?? Math.round((m.carb || 0) / servings),
      baseFat: m.baseFat ?? Math.round((m.fat || 0) / servings),
      baseServing: 1,
      servings,
    };
  });
  return { meals, water: Number(data?.water) || 0, date: key };
}

// Firestore rejects undefined values; JSON round-trip drops them.
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Add a meal to any day without subscribing to it (used for "Log again"). */
export function addMealToDay(key: string, meal: Meal) {
  if (DEMO) {
    const day = demoStore[key] ?? demoDay(key);
    demoStore[key] = { ...day, meals: [...day.meals, meal] };
    return;
  }
  void setDoc(dayRef(key), { meals: arrayUnion(clean(meal)), date: key }, { merge: true });
}

/** Live data for one day (today or any past day) plus the actions that change it. */
export function useDay(key: string) {
  const [state, setState] = useState<{ key: string; day: DayDoc; ready: boolean }>({ key, day: empty(key), ready: false });
  const latest = useRef<DayDoc>(empty(key));

  useEffect(() => {
    if (DEMO) {
      latest.current = demoStore[key] ?? demoDay(key);
      setState({ key, day: latest.current, ready: true });
      return;
    }
    return onSnapshot(
      dayRef(key),
      (snap) => {
        latest.current = normalizeDay(key, snap.data());
        setState({ key, day: latest.current, ready: true });
      },
      () => setState({ key, day: empty(key), ready: true })
    );
  }, [key]);

  const current = state.key === key ? state : { key, day: empty(key), ready: false };
  const ready = current.ready;

  const write = useCallback(
    (next: DayDoc) => {
      latest.current = next;
      setState({ key, day: next, ready: true });
      if (DEMO) {
        demoStore[key] = next;
        return;
      }
      void setDoc(dayRef(key), clean({ meals: next.meals, water: next.water, date: key }), { merge: true });
    },
    [key]
  );

  /** Adding uses arrayUnion so two devices logging at once never overwrite each other. */
  const addMeal = useCallback(
    (meal: Meal) => {
      if (DEMO) return write({ ...latest.current, meals: [...latest.current.meals, meal] });
      void setDoc(dayRef(key), { meals: arrayUnion(clean(meal)), date: key }, { merge: true });
    },
    [key, write]
  );

  const updateMeal = useCallback(
    (meal: Meal) => {
      if (!ready) return;
      write({ ...latest.current, meals: latest.current.meals.map((m) => (m.id === meal.id ? meal : m)) });
    },
    [ready, write]
  );

  const removeMeal = useCallback(
    (id: string) => {
      if (!ready) return;
      write({ ...latest.current, meals: latest.current.meals.filter((m) => m.id !== id) });
    },
    [ready, write]
  );

  const setWater = useCallback(
    (glasses: number) => {
      if (!ready) return;
      const next = { ...latest.current, water: Math.max(0, glasses) };
      latest.current = next;
      setState({ key, day: next, ready: true });
      if (DEMO) return;
      void setDoc(dayRef(key), { water: next.water, date: key }, { merge: true });
    },
    [key, ready]
  );

  return { day: current.day, ready, addMeal, updateMeal, removeMeal, setWater };
}
