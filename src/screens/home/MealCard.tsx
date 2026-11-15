import { AnimatePresence, motion } from 'motion/react';
import { Coffee, Cookie, Moon, Plus, Sun, Sunrise, type LucideIcon } from 'lucide-react';
import { iconOf } from '../../lib/foodIcon';
import { fmt, fmtServings, sum } from '../../lib/macros';
import type { Category, Meal } from '../../lib/types';

const ICON: Record<Category, LucideIcon> = { breakfast: Sunrise, lunch: Sun, dinner: Moon, snacks: Cookie, drinks: Coffee };

interface Props {
  cat: Category;
  label: string;
  meals: Meal[];
  onAdd: () => void;
  onOpen: (meal: Meal) => void;
}

export function MealCard({ cat, label, meals, onAdd, onOpen }: Props) {
  const Icon = ICON[cat];
  const total = sum(meals);
  return (
    <section className="card meal-card">
      <header className="meal-head">
        <span className="meal-icon"><Icon size={18} strokeWidth={2.1} /></span>
        <div className="meal-title">
          <h2>{label}</h2>
          {meals.length > 0 && (
            <p className="macro-line">
              <span>P <b className="num">{fmt(total.prot)}</b></span>
              <span>C <b className="num">{fmt(total.carb)}</b></span>
              <span>F <b className="num">{fmt(total.fat)}</b></span>
            </p>
          )}
        </div>
        {meals.length > 0 && (
          <span className="meal-total"><span className="num">{fmt(total.cal)}</span> kcal</span>
        )}
        <button className="meal-add press" aria-label={`Add to ${label}`} onClick={onAdd}>
          <Plus size={20} strokeWidth={2.4} />
        </button>
      </header>
      <ul className="meal-list">
        <AnimatePresence>
          {meals.map((m) => {
            // A meal logged in the last few seconds slides in with an amber flash, so you see where it landed.
            const fresh = Date.now() - m.ts < 5000;
            return (
              <motion.li
                key={m.id}
                initial={fresh ? { opacity: 0, height: 0, backgroundColor: 'rgba(255, 166, 48, 0.28)' } : false}
                animate={{ opacity: 1, height: 'auto', backgroundColor: 'rgba(255, 166, 48, 0)' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 32, backgroundColor: { duration: 1.4, delay: 0.2 } }}
              >
                <button className="meal-row press" onClick={() => onOpen(m)}>
                  <span className="food-icon" aria-hidden="true">{iconOf(m)}</span>
                  <span className="meal-name">
                    {m.name}
                    {m.servings !== 1 && <small> {fmtServings(m.servings)}</small>}
                  </span>
                  <span className="meal-cal num">{fmt(m.cal)}</span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
