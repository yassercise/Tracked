import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Droplet, Flame } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDay } from '../../data/useDay';
import { useRange } from '../../data/useRange';
import { dayLong, dayTitle, fromKey, monthKeys, shiftKey, todayKey } from '../../lib/dates';
import { fmt, sum } from '../../lib/macros';
import { hideSplash } from '../../lib/splash';
import { CATEGORIES, GLASS_ML, type Category, type Meal, type Targets } from '../../lib/types';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { useToast } from '../../ui/Toast';
import { Dial } from './Dial';
import { MealCard } from './MealCard';
import { MealSheet } from './MealSheet';
import { MonthStrip } from './MonthStrip';
import './home.css';

interface Props {
  dateKey: string;
  onDateChange: (key: string) => void;
  targets: Targets;
  onLog: (cat: Category) => void;
}

const slide = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
};

export function HomeScreen({ dateKey, onDateChange, targets, onLog }: Props) {
  const today = todayKey();
  const isToday = dateKey === today;
  const dir = useRef(0);
  const toast = useToast();
  const [editing, setEditing] = useState<Meal | null>(null);

  const { day, ready, updateMeal, removeMeal, setWater } = useDay(dateKey);

  // Lift the loading screen once the day's data has arrived.
  useEffect(() => {
    if (ready) hideSplash();
  }, [ready]);
  const keys = useMemo(() => monthKeys(dateKey), [dateKey.slice(0, 7)]);
  const summaries = useRange(keys[0], keys[keys.length - 1]);

  const totals = useMemo(() => sum(day.meals), [day.meals]);
  const goalHit = totals.cal >= targets.cal && totals.prot >= targets.prot;

  const go = (key: string) => {
    if (key > today || key === dateKey) return;
    dir.current = key > dateKey ? 1 : -1;
    onDateChange(key);
  };

  const weekday = fromKey(dateKey).toLocaleDateString('en-GB', { weekday: 'long' });
  const title = dayTitle(dateKey);
  const subtitle = title === weekday ? dayLong(dateKey) : `${weekday} ${dayLong(dateKey)}`;

  return (
    <main className="screen home">
      <header className="home-head">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="home-nav">
          {!isToday && (
            <button className="today-chip press" onClick={() => go(today)}>Today</button>
          )}
          <button className="nav-btn press" aria-label="Previous day" onClick={() => go(shiftKey(dateKey, -1))}><ChevronLeft size={20} /></button>
          <button className="nav-btn press" aria-label="Next day" disabled={isToday} onClick={() => go(shiftKey(dateKey, 1))}><ChevronRight size={20} /></button>
        </div>
      </header>

      <MonthStrip keys={keys} selected={dateKey} summaries={summaries} targets={targets} onSelect={go} />

      <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
        <motion.div
          key={dateKey}
          className="day"
          custom={dir.current}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_, info) => {
            const far = Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500;
            if (!far) return;
            go(shiftKey(dateKey, info.offset.x < 0 ? 1 : -1));
          }}
        >
          <Dial cal={totals.cal} calTarget={targets.cal} prot={totals.prot} protTarget={targets.prot} />

          <AnimatePresence initial={false}>
            {goalHit && (
              <motion.div
                className="goal"
                role="status"
                initial={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto', marginBottom: 14 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              >
                <span className="goal-icon"><Flame size={20} strokeWidth={2.2} /></span>
                <div>
                  <strong>Calories and protein hit</strong>
                  <p>{isToday ? 'Both targets are done for today.' : 'Both targets were met this day.'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="card macros" aria-label="Macros">
            <Macro label="Protein" value={totals.prot} target={targets.prot} tone="prot" />
            <Macro label="Carbs" value={totals.carb} target={targets.carb} />
            <Macro label="Fat" value={totals.fat} target={targets.fat} />
          </section>

          <section className="card water" aria-label="Water">
            <header>
              <span className="water-icon"><Droplet size={17} strokeWidth={2.2} /></span>
              <h2>Water</h2>
              <span className="water-amount">
                <span className="num">{fmt(day.water * GLASS_ML)}</span> of {fmt(targets.water * GLASS_ML)} ml
              </span>
            </header>
            <div className="glasses">
              {Array.from({ length: Math.max(targets.water, day.water) }, (_, i) => (
                <button
                  key={i}
                  className={`glass press${i < day.water ? ' full' : ''}`}
                  aria-label={i < day.water ? `Remove glass ${i + 1}` : `Add glass ${i + 1}`}
                  onClick={() => setWater(i < day.water ? i : i + 1)}
                />
              ))}
            </div>
          </section>

          <div className="meals">
            {CATEGORIES.map((c) => (
              <MealCard key={c.id} cat={c.id} label={c.label} meals={day.meals.filter((m) => m.cat === c.id)} onAdd={() => onLog(c.id)} onOpen={setEditing} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <MealSheet
        meal={editing}
        onClose={() => setEditing(null)}
        onSave={(m) => {
          updateMeal(m);
          setEditing(null);
          toast('Changes saved');
        }}
        onDelete={(m) => {
          removeMeal(m.id);
          setEditing(null);
          toast('Meal deleted');
        }}
      />
    </main>
  );
}

function Macro({ label, value, target, tone }: { label: string; value: number; target: number; tone?: 'prot' }) {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const pct = live ? Math.min(1, value / target) : 0;
  return (
    <div className={`macro${tone ? ` ${tone}` : ''}`}>
      <span className="macro-label">{label}</span>
      <span className="macro-value">
        <span className="num"><AnimatedNumber value={value} /></span>
        <small> / {fmt(target)} g</small>
      </span>
      <span className="macro-bar"><span style={{ transform: `scaleX(${pct})` }} /></span>
    </div>
  );
}
