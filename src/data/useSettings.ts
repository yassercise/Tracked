import { useCallback, useEffect, useState } from 'react';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { settingsRef } from '../lib/paths';
import { DEFAULT_TARGETS, type Targets } from '../lib/types';
import { DEMO } from './demo';

const pick = (d: Record<string, any> | undefined): Targets => ({
  cal: Number(d?.cal) || DEFAULT_TARGETS.cal,
  prot: Number(d?.prot) || DEFAULT_TARGETS.prot,
  carb: Number(d?.carb) || DEFAULT_TARGETS.carb,
  fat: Number(d?.fat) || DEFAULT_TARGETS.fat,
  water: Number(d?.water) || DEFAULT_TARGETS.water,
});

export function useSettings() {
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);

  useEffect(() => {
    if (DEMO) return;
    return onSnapshot(settingsRef(), (snap) => setTargets(pick(snap.data())), () => {});
  }, []);

  const saveTargets = useCallback((t: Targets) => {
    setTargets(t);
    if (!DEMO) void setDoc(settingsRef(), t, { merge: true });
  }, []);

  return { targets, saveTargets };
}
