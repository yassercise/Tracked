import { useEffect, useRef } from 'react';
import type { DaySummary } from '../../data/useRange';
import { dayNumber, todayKey, weekdayShort } from '../../lib/dates';
import { dayStatus } from '../../lib/macros';
import type { Targets } from '../../lib/types';

interface Props {
  keys: string[];
  selected: string;
  summaries: Record<string, DaySummary>;
  targets: Targets;
  onSelect: (key: string) => void;
}

/** One month of days. Dot under each day: solid = calories and protein hit, ring = one of the two, grey = logged but missed. */
export function MonthStrip({ keys, selected, summaries, targets, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const today = todayKey();

  useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>('[aria-current="date"]');
    if (!box || !el) return;
    const left = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2;
    box.scrollTo({ left, behavior: first.current ? 'auto' : 'smooth' });
    first.current = false;
  }, [selected]);

  return (
    <div className="strip" ref={scroller}>
      {keys.map((key) => {
        const s = summaries[key];
        const status = s ? dayStatus(s.totals, s.logged, targets) : 'none';
        const future = key > today;
        return (
          <button
            key={key}
            className={`strip-day press${key === today ? ' is-today' : ''}`}
            aria-current={key === selected ? 'date' : undefined}
            aria-label={`${weekdayShort(key)} ${dayNumber(key)}, ${status === 'none' ? 'nothing logged' : status}`}
            disabled={future}
            onClick={() => onSelect(key)}
          >
            <span className="strip-wd">{weekdayShort(key)[0]}</span>
            <span className="strip-num num">{dayNumber(key)}</span>
            <span className={`strip-dot ${status}`} />
          </button>
        );
      })}
    </div>
  );
}
