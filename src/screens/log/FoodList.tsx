import { AnimatePresence, motion } from 'motion/react';
import { Check, Plus, Search } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { fmt } from '../../lib/macros';
import type { Food } from '../../lib/types';

interface Props {
  foods: Food[];
  empty: ReactNode;
  onQuickAdd: (food: Food) => void;
  onOpen: (food: Food) => void;
  action?: ReactNode;
}

/** Searchable list of foods. + adds one serving straight away; tapping the row opens servings. */
export function FoodList({ foods, empty, onQuickAdd, onOpen, action }: Props) {
  const [term, setTerm] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const quickAdd = (food: Food, key: string) => {
    onQuickAdd(food);
    window.clearTimeout(timer.current);
    setAdded(key);
    timer.current = window.setTimeout(() => setAdded(null), 1100);
  };
  const shown = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? foods.filter((f) => f.name.toLowerCase().includes(t)) : foods;
  }, [foods, term]);

  if (foods.length === 0) {
    return (
      <div className="log-empty">
        {empty}
        {action}
      </div>
    );
  }

  return (
    <>
      <div className="log-tools">
        <label className="field-box log-search">
          <Search size={18} />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search" aria-label="Search foods" enterKeyHint="search" />
        </label>
        {action}
      </div>
      {shown.length === 0 ? (
        <p className="log-empty">Nothing matches "{term.trim()}".</p>
      ) : (
        <ul className="card food-list">
          {shown.map((f, i) => {
            const key = f.id ?? `${f.name}-${i}`;
            const done = added === key;
            return (
              <li key={key}>
                <button className="food-row press" onClick={() => onOpen(f)}>
                  <span className="food-name">{f.name}</span>
                  <span className="macro-line">
                    <span><b className="num kcal">{fmt(f.cal)}</b> kcal</span>
                    <span>P <b className="num">{fmt(f.prot)}</b></span>
                    <span>C <b className="num">{fmt(f.carb)}</b></span>
                    <span>F <b className="num">{fmt(f.fat)}</b></span>
                  </span>
                </button>
                <button className={`meal-add press${done ? ' added' : ''}`} aria-label={`Add ${f.name}`} onClick={() => quickAdd(f, key)}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={done ? 'check' : 'plus'} initial={{ scale: 0.3, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.3, opacity: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 26 }}>
                      {done ? <Check size={20} strokeWidth={2.8} /> : <Plus size={20} strokeWidth={2.4} />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
