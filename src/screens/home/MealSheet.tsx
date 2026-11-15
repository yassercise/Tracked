import { useEffect, useState } from 'react';
import { fmt, withServings } from '../../lib/macros';
import { CATEGORIES, type Category, type Meal } from '../../lib/types';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';

interface Props {
  meal: Meal | null;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

/** Edit a logged meal: servings, category, or delete. */
export function MealSheet({ meal, onClose, onSave, onDelete }: Props) {
  const [servings, setServings] = useState(1);
  const [cat, setCat] = useState<Category>('lunch');
  const [shown, setShown] = useState<Meal | null>(null); // keeps content visible while the sheet animates out

  useEffect(() => {
    if (meal) {
      setShown(meal);
      setServings(meal.servings);
      setCat(meal.cat);
    }
  }, [meal]);

  const preview = shown ? withServings(shown, servings) : null;
  const changed = shown && (servings !== shown.servings || cat !== shown.cat);

  return (
    <Sheet open={!!meal} onClose={onClose} label="Edit meal">
      {shown && preview && (
        <div className="msheet">
          <h2 className="msheet-name">{shown.name}</h2>

          <div className="msheet-macros">
            <div className="is-cal"><span className="num">{fmt(preview.cal)}</span><small>kcal</small></div>
            <div><span className="num">{fmt(preview.prot)}</span><small>g protein</small></div>
            <div><span className="num">{fmt(preview.carb)}</span><small>g carbs</small></div>
            <div><span className="num">{fmt(preview.fat)}</span><small>g fat</small></div>
          </div>

          <div className="msheet-row">
            <span>Servings</span>
            <Stepper value={servings} onChange={setServings} />
          </div>

          <div className="chips" role="radiogroup" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="radio" aria-checked={cat === c.id} className="chip press" onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {shown.breakdown && shown.breakdown.length > 0 && (
            <div className="breakdown">
              <h3>What's in one serving</h3>
              <ul>
                {shown.breakdown.map((b, i) => (
                  <li key={i}>
                    <span className="b-item">{b.item}</span>
                    <span className="b-weight">{b.weight}</span>
                    <span className="b-cal num">{fmt(b.cal)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-primary press" disabled={!changed} onClick={() => onSave({ ...preview, cat })}>
            Save changes
          </button>
          <button className="btn btn-quiet press" onClick={() => onDelete(shown)}>
            Delete meal
          </button>
        </div>
      )}
    </Sheet>
  );
}
