import { BookmarkPlus, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { iconOf } from '../../lib/foodIcon';
import { fmt, scale } from '../../lib/macros';
import type { Food } from '../../lib/types';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';

export type FoodKind = 'recent' | 'saved';

interface Props {
  food: Food | null;
  kind: FoodKind;
  catLabel: string;
  canSave: boolean;
  onClose: () => void;
  onAdd: (food: Food, servings: number) => void;
  onSave: (food: Food) => void;
  onEdit: (food: Food) => void;
  onRemove: (food: Food) => void;
}

/** Pick servings for a recent or saved food before adding it. Also where a food is edited or removed. */
export function FoodSheet({ food, kind, catLabel, canSave, onClose, onAdd, onSave, onEdit, onRemove }: Props) {
  const [servings, setServings] = useState(1);
  const [shown, setShown] = useState<Food | null>(null);

  useEffect(() => {
    if (food) {
      setShown(food);
      setServings(1);
    }
  }, [food]);

  const m = shown ? scale(shown, servings) : null;

  return (
    <Sheet open={!!food} onClose={onClose} label="Add food">
      {shown && m && (
        <div className="msheet">
          <h2 className="msheet-name"><span className="food-icon" aria-hidden="true">{iconOf(shown)}</span>{shown.name}</h2>
          <div className="msheet-macros">
            <div className="is-cal"><span className="num">{fmt(m.cal)}</span><small>kcal</small></div>
            <div><span className="num">{fmt(m.prot)}</span><small>g protein</small></div>
            <div><span className="num">{fmt(m.carb)}</span><small>g carbs</small></div>
            <div><span className="num">{fmt(m.fat)}</span><small>g fat</small></div>
          </div>
          <div className="msheet-row">
            <span>Servings</span>
            <Stepper value={servings} onChange={setServings} />
          </div>
          <button className="btn btn-primary press" onClick={() => onAdd(shown, servings)}>Add to {catLabel}</button>

          <div className="sheet-actions">
            <button className="btn-soft press" onClick={() => onEdit(shown)}>
              <Pencil size={17} /> Edit food
            </button>
            {kind === 'recent' && canSave && (
              <button className="btn-soft press" onClick={() => onSave(shown)}>
                <BookmarkPlus size={18} /> Save to My foods
              </button>
            )}
          </div>

          <button className="btn btn-quiet press" onClick={() => onRemove(shown)}>
            {kind === 'saved' ? 'Delete food' : 'Remove from Recent'}
          </button>
        </div>
      )}
    </Sheet>
  );
}
