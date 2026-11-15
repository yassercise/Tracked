import { useEffect, useState } from 'react';
import { documentId, onSnapshot, query, where } from 'firebase/firestore';
import { daysCol } from '../lib/paths';
import { sum } from '../lib/macros';
import type { Macros } from '../lib/types';
import { normalizeDay } from './useDay';
import { DEMO, demoRange } from './demo';

export interface DaySummary {
  totals: Macros;
  water: number;
  logged: boolean;
}

/** Live summaries for every day between two keys (inclusive). Powers the month strip and Trends. */
export function useRange(start: string, end: string): Record<string, DaySummary> {
  const [days, setDays] = useState<Record<string, DaySummary>>({});

  useEffect(() => {
    if (DEMO) {
      setDays(Object.fromEntries(demoRange(start, end).map((d) => [d.date, { totals: sum(d.meals), water: d.water, logged: d.meals.length > 0 }])));
      return;
    }
    const q = query(daysCol(), where(documentId(), '>=', start), where(documentId(), '<=', end));
    return onSnapshot(
      q,
      (snap) => {
        const next: Record<string, DaySummary> = {};
        snap.forEach((d) => {
          const day = normalizeDay(d.id, d.data());
          next[d.id] = { totals: sum(day.meals), water: day.water, logged: day.meals.length > 0 };
        });
        setDays(next);
      },
      () => setDays({})
    );
  }, [start, end]);

  return days;
}
