import { useEffect, useState } from 'react';
import { fmt, scale } from '../../lib/macros';
import type { Food } from '../../lib/types';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';

interface Props {
  food: Food | null;
  catLabel: string;
  canSave: boolean;
  onClose: () => void;
  onAdd: (food: Food, servings: number) => void;
  onSave: (food: Food) => void;
}

/** Pick servings for a recent or saved food before adding it. */
export function FoodSheet({ food, catLabel, canSave, onClose, onAdd, onSave }: Props) {
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
          <h2 className="msheet-name">{shown.name}</h2>
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
          {canSave && (
            <button className="btn btn-plain press" onClick={() => onSave(shown)}>Save to My foods</button>
          )}
        </div>
      )}
    </Sheet>
  );
}
