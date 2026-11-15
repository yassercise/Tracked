import { useCallback, useEffect, useRef, useState } from 'react';
import { addDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { foodRef, foodsCol, recentRef } from '../lib/paths';
import type { Food, Macros } from '../lib/types';
import { DEMO, demoFoods } from './demo';

const RECENT_MAX = 30;

const toFood = (d: Record<string, any>, id?: string): Food => ({
  ...(id ? { id } : {}),
  name: String(d.name ?? ''),
  cal: Number(d.cal) || 0, prot: Number(d.prot) || 0, carb: Number(d.carb) || 0, fat: Number(d.fat) || 0,
  ...(d.ts ? { ts: d.ts } : {}),
});

/** Recent foods (last 30 logged, one serving each) and saved foods. */
export function useFoods() {
  const [recent, setRecent] = useState<Food[]>(DEMO ? demoFoods.recent : []);
  const [saved, setSaved] = useState<Food[]>(DEMO ? demoFoods.saved : []);
  const recentLatest = useRef<Food[]>(recent);

  useEffect(() => {
    if (DEMO) return;
    const a = onSnapshot(recentRef(), (snap) => {
      recentLatest.current = ((snap.data()?.items as any[]) ?? []).map((d) => toFood(d));
      setRecent(recentLatest.current);
    }, () => {});
    const b = onSnapshot(foodsCol(), (snap) => {
      setSaved(snap.docs.map((d) => toFood(d.data(), d.id)).sort((x, y) => x.name.localeCompare(y.name)));
    }, () => {});
    return () => { a(); b(); };
  }, []);

  /** Move a food to the top of Recent. Always pass one serving's macros. */
  const pushRecent = useCallback((food: Macros & { name: string }) => {
    const entry: Food = { name: food.name, cal: food.cal, prot: food.prot, carb: food.carb, fat: food.fat, ts: Date.now() };
    const next = [entry, ...recentLatest.current.filter((r) => r.name !== food.name)].slice(0, RECENT_MAX);
    recentLatest.current = next;
    setRecent(next);
    if (!DEMO) void setDoc(recentRef(), { items: next });
  }, []);

  const saveFood = useCallback((food: Food) => {
    const data = { name: food.name.trim(), cal: food.cal, prot: food.prot, carb: food.carb, fat: food.fat };
    if (DEMO) return setSaved((s) => [...s.filter((f) => f.id !== food.id), { ...data, id: food.id ?? String(Date.now()) }]);
    if (food.id) void setDoc(foodRef(food.id), data, { merge: true });
    else void addDoc(foodsCol(), data);
  }, []);

  const deleteFood = useCallback((id: string) => {
    if (DEMO) return setSaved((s) => s.filter((f) => f.id !== id));
    void deleteDoc(foodRef(id));
  }, []);

  return { recent, saved, pushRecent, saveFood, deleteFood };
}
