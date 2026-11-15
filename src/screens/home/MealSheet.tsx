import { AnimatePresence, motion } from 'motion/react';
import { BookmarkPlus, ChevronDown, CopyPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { iconOf } from '../../lib/foodIcon';
import { fmt, scale } from '../../lib/macros';
import { CATEGORIES, type Category, type Macros, type Meal } from '../../lib/types';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';
import { MacroFields, draftMacros, type FoodDraft } from '../log/MacroFields';

interface Props {
  meal: Meal | null;
  isToday: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
  onLogAgain: (meal: Meal) => void;
  onSaveFood: (meal: Meal) => void;
}

const toDraft = (m: Meal): FoodDraft => ({ name: m.name, cal: String(m.baseCal), prot: String(m.baseProt), carb: String(m.baseCarb), fat: String(m.baseFat) });

/** Edit a logged meal: servings, category, name and macros; log it again, save it as a food, or delete it. */
export function MealSheet({ meal, isToday, onClose, onSave, onDelete, onLogAgain, onSaveFood }: Props) {
  const [servings, setServings] = useState(1);
  const [cat, setCat] = useState<Category>('lunch');
  const [draft, setDraft] = useState<FoodDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [shown, setShown] = useState<Meal | null>(null); // keeps content visible while the sheet animates out

  useEffect(() => {
    if (meal) {
      setShown(meal);
      setServings(meal.servings);
      setCat(meal.cat);
      setDraft(toDraft(meal));
      setEditing(false);
    }
  }, [meal]);

  if (!shown || !draft) return <Sheet open={false} onClose={onClose} label="Edit meal">{null}</Sheet>;

  const base: Macros = draftMacros(draft);
  const original: Macros = { cal: shown.baseCal, prot: shown.baseProt, carb: shown.baseCarb, fat: shown.baseFat };
  const macrosChanged = base.cal !== original.cal || base.prot !== original.prot || base.carb !== original.carb || base.fat !== original.fat;
  const name = draft.name.trim();
  const changed = servings !== shown.servings || cat !== shown.cat || macrosChanged || (name !== shown.name && name.length > 0);
  const preview = scale(base, servings);

  const build = (): Meal => {
    const next: Meal = {
      ...shown,
      name: name || shown.name,
      cat,
      servings,
      ...preview,
      baseCal: base.cal, baseProt: base.prot, baseCarb: base.carb, baseFat: base.fat,
    };
    // A breakdown only stays attached while it still adds up to the meal's macros.
    if (macrosChanged) delete next.breakdown;
    return next;
  };

  return (
    <Sheet open={!!meal} onClose={onClose} label="Edit meal">
      <div className="msheet">
        <h2 className="msheet-name"><span className="food-icon" aria-hidden="true">{iconOf({ name: name || shown.name, icon: shown.icon })}</span>{name || shown.name}</h2>

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

        <div>
          <button className="disclosure" aria-expanded={editing} onClick={() => setEditing((e) => !e)}>
            Edit name and macros <ChevronDown size={20} />
          </button>
          <AnimatePresence initial={false}>
            {editing && (
              <motion.div style={{ overflow: 'hidden' }} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
                <p className="manual-hint" style={{ margin: '4px 0 12px' }}>Macros for one serving.</p>
                <MacroFields draft={draft} onChange={setDraft} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {shown.breakdown && shown.breakdown.length > 0 && !macrosChanged && (
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

        <button className="btn btn-primary press" disabled={!changed} onClick={() => onSave(build())}>
          Save changes
        </button>

        <div className="sheet-actions">
          <button className="btn-soft press" onClick={() => onLogAgain(build())}>
            <CopyPlus size={18} /> {isToday ? 'Log again' : 'Log again today'}
          </button>
          <button className="btn-soft press" onClick={() => onSaveFood(build())}>
            <BookmarkPlus size={18} /> Save to My foods
          </button>
        </div>

        <button className="btn btn-quiet press" onClick={() => onDelete(shown)}>
          Delete meal
        </button>
      </div>
    </Sheet>
  );
}
