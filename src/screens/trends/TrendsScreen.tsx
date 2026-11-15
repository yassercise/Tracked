import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useRange, type DaySummary } from '../../data/useRange';
import { dayLong, dayNumber, lastDays, monthKeys, monthYear, rangeLabel, shiftKey, shiftMonth, todayKey, weekdayShort } from '../../lib/dates';
import { dayStatus, fmt } from '../../lib/macros';
import type { Targets } from '../../lib/types';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { Segmented } from '../../ui/Segmented';
import '../home/home.css';
import './trends.css';

type Period = 'week' | 'month';
const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: '7 days' },
  { id: 'month', label: 'Month' },
];

interface Props {
  targets: Targets;
  onOpenDay: (key: string) => void;
}

export function TrendsScreen({ targets, onOpenDay }: Props) {
  const today = todayKey();
  const [period, setPeriod] = useState<Period>('week');
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState<string | null>(null);

  const keys = useMemo(() => (period === 'week' ? lastDays(anchor, 7) : monthKeys(anchor)), [period, anchor]);
  const start = keys[0];
  const end = keys[keys.length - 1];
  const days = useRange(start, end);
  const isCurrent = today >= start && today <= end;

  useEffect(() => setSelected(null), [start, period]);

  const move = (dir: number) => {
    const next = period === 'week' ? shiftKey(anchor, dir * 7) : shiftMonth(anchor, dir);
    setAnchor(next > today ? today : next);
  };

  // Averages only count days with something logged, so an empty day doesn't drag them down.
  const stats = useMemo(() => {
    const elapsed = keys.filter((k) => k <= today);
    const logged = elapsed.filter((k) => days[k]?.logged);
    const avg = (pick: (d: DaySummary) => number) => (logged.length ? logged.reduce((a, k) => a + pick(days[k]), 0) / logged.length : 0);
    return {
      cal: avg((d) => d.totals.cal),
      prot: avg((d) => d.totals.prot),
      hit: logged.filter((k) => dayStatus(days[k].totals, true, targets) === 'hit').length,
      elapsed: elapsed.length,
      logged: logged.length,
    };
  }, [keys, days, targets, today]);

  const picked = selected ? days[selected] : null;

  return (
    <main className="screen trends">
      <header className="home-head">
        <div>
          <h1>Trends</h1>
          <p>{period === 'week' ? rangeLabel(start, end) : monthYear(anchor)}</p>
        </div>
        <div className="home-nav">
          {!isCurrent && <button className="today-chip press" onClick={() => setAnchor(today)}>Now</button>}
          <button className="nav-btn press" aria-label={period === 'week' ? 'Previous 7 days' : 'Previous month'} onClick={() => move(-1)}><ChevronLeft size={20} /></button>
          <button className="nav-btn press" aria-label={period === 'week' ? 'Next 7 days' : 'Next month'} disabled={isCurrent} onClick={() => move(1)}><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="trends-seg">
        <Segmented options={PERIODS} value={period} onChange={(p) => { setPeriod(p); }} label="Period" />
      </div>

      <section className="card stats" aria-label="Summary">
        <div>
          <span className="stat-label">Avg calories</span>
          <span className="stat-value num"><AnimatedNumber value={stats.cal} /></span>
          <span className="stat-sub">target {fmt(targets.cal)}</span>
        </div>
        <div>
          <span className="stat-label prot">Avg protein</span>
          <span className="stat-value num"><AnimatedNumber value={stats.prot} /><small> g</small></span>
          <span className="stat-sub">target {fmt(targets.prot)} g</span>
        </div>
        <div>
          <span className="stat-label">Targets hit</span>
          <span className="stat-value num"><AnimatedNumber value={stats.hit} /><small> / {stats.elapsed}</small></span>
          <span className="stat-sub">{stats.logged} {stats.logged === 1 ? 'day' : 'days'} logged</span>
        </div>
      </section>

      <Chart
        key={`cal-${start}-${period}`}
        title="Calories"
        unit="kcal"
        tone="cal"
        keys={keys}
        days={days}
        value={(d) => d.totals.cal}
        target={targets.cal}
        selected={selected}
        onSelect={setSelected}
      />
      <Chart
        key={`prot-${start}-${period}`}
        title="Protein"
        unit="g"
        tone="prot"
        keys={keys}
        days={days}
        value={(d) => d.totals.prot}
        target={targets.prot}
        selected={selected}
        onSelect={setSelected}
      />

      {selected && (
        <button className="btn-soft press open-day" onClick={() => onOpenDay(selected)}>
          {picked?.logged ? `Open ${dayLong(selected)}` : `Log food for ${dayLong(selected)}`}
        </button>
      )}
      {!selected && stats.logged === 0 && <p className="trends-empty">Nothing logged in {period === 'week' ? 'these 7 days' : 'this month'} yet.</p>}
    </main>
  );
}

interface ChartProps {
  title: string;
  unit: string;
  tone: 'cal' | 'prot';
  keys: string[];
  days: Record<string, DaySummary>;
  value: (d: DaySummary) => number;
  target: number;
  selected: string | null;
  onSelect: (key: string | null) => void;
}

/** Bar per day with a dashed target line. Tap a bar to read that day. */
function Chart({ title, unit, tone, keys, days, value, target, selected, onSelect }: ChartProps) {
  const today = todayKey();
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Drag a finger across the chart to move the selection from bar to bar; a tap still selects one,
  // and tapping the selected bar clears it.
  const plot = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startKey: string; wasSelected: boolean; moved: boolean } | null>(null);
  const keyAt = (clientX: number): string | null => {
    const box = plot.current?.getBoundingClientRect();
    if (!box) return null;
    const i = Math.min(keys.length - 1, Math.max(0, Math.floor(((clientX - box.left) / box.width) * keys.length)));
    const past = keys.filter((k) => k <= today);
    if (!past.length) return null;
    return keys[i] <= today ? keys[i] : past[past.length - 1];
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const k = keyAt(e.clientX);
    if (!k) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startKey: k, wasSelected: selected === k, moved: false };
    onSelect(k);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const k = keyAt(e.clientX);
    if (!k || k === selected) return;
    drag.current.moved = true;
    onSelect(k);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && d.wasSelected) onSelect(null);
  };

  const values = keys.map((k) => (days[k] ? value(days[k]) : 0));
  const max = Math.max(target * 1.18, ...values) || 1;
  const month = keys.length > 7;
  const sel = selected && keys.includes(selected) ? selected : null;
  const selValue = sel ? (days[sel] ? value(days[sel]) : 0) : null;

  return (
    <section className={`card chart ${tone}${month ? ' dense' : ''}`} aria-label={`${title} per day`}>
      <header>
        <h2>{title}</h2>
        <span className="chart-read">
          {sel ? (
            <>
              {weekdayShort(sel)} {dayNumber(sel)} <b className="num">{fmt(selValue ?? 0)}</b> {unit}
            </>
          ) : (
            <>target <b className="num">{fmt(target)}</b> {unit}</>
          )}
        </span>
      </header>
      <div className="plot" ref={plot} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="target-line" style={{ bottom: `${(target / max) * 100}%` }} />
        {keys.map((k, i) => {
          const v = values[i];
          const future = k > today;
          const hit = v >= target;
          return (
            <button
              key={k}
              className={`bar${hit ? ' hit' : ''}${sel === k ? ' sel' : ''}${sel && sel !== k ? ' dim' : ''}`}
              disabled={future}
              aria-label={`${weekdayShort(k)} ${dayNumber(k)}: ${fmt(v)} ${unit}`}
              onClick={() => onSelect(sel === k ? null : k)}
            >
              <span style={{ height: live ? `${Math.max(v > 0 ? 2 : 0, (v / max) * 100)}%` : '0%', transitionDelay: `${Math.min(i * (month ? 8 : 35), 300)}ms` }} />
            </button>
          );
        })}
      </div>
      <div className="axis" aria-hidden="true">
        {keys.map((k) => {
          const n = dayNumber(k);
          const show = !month || n === 1 || n % 7 === 1;
          return (
            <span key={k} className={k === today ? 'now' : undefined}>
              {show ? (month ? n : weekdayShort(k)[0]) : ''}
            </span>
          );
        })}
      </div>
    </section>
  );
}
