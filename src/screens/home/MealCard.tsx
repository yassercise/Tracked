import { Coffee, Cookie, Moon, Plus, Sun, Sunrise, type LucideIcon } from 'lucide-react';
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
      {meals.length > 0 && (
        <ul className="meal-list">
          {meals.map((m) => (
            <li key={m.id}>
              <button className="meal-row press" onClick={() => onOpen(m)}>
                <span className="meal-name">
                  {m.name}
                  {m.servings !== 1 && <small> {fmtServings(m.servings)}</small>}
                </span>
                <span className="meal-cal num">{fmt(m.cal)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
