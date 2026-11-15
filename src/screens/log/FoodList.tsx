import { Plus, Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
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
          {shown.map((f, i) => (
            <li key={f.id ?? `${f.name}-${i}`}>
              <button className="food-row press" onClick={() => onOpen(f)}>
                <span className="food-name">{f.name}</span>
                <span className="macro-line">
                  <span><b className="num kcal">{fmt(f.cal)}</b> kcal</span>
                  <span>P <b className="num">{fmt(f.prot)}</b></span>
                  <span>C <b className="num">{fmt(f.carb)}</b></span>
                  <span>F <b className="num">{fmt(f.fat)}</b></span>
                </span>
              </button>
              <button className="meal-add press" aria-label={`Add ${f.name}`} onClick={() => onQuickAdd(f)}>
                <Plus size={20} strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
