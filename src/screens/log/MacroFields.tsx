import type { Macros } from '../../lib/types';

export interface FoodDraft {
  name: string;
  cal: string;
  prot: string;
  carb: string;
  fat: string;
}

export const EMPTY_DRAFT: FoodDraft = { name: '', cal: '', prot: '', carb: '', fat: '' };

export const draftMacros = (d: FoodDraft): Macros => ({
  cal: Math.round(parseFloat(d.cal)) || 0,
  prot: Math.round(parseFloat(d.prot)) || 0,
  carb: Math.round(parseFloat(d.carb)) || 0,
  fat: Math.round(parseFloat(d.fat)) || 0,
});

const NUMS: { key: keyof Omit<FoodDraft, 'name'>; label: string; unit: string }[] = [
  { key: 'cal', label: 'Calories', unit: 'kcal' },
  { key: 'prot', label: 'Protein', unit: 'g' },
  { key: 'carb', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

/** Name plus the four macro inputs for one serving. Shared by Manual entry, New food, and later AI scan. */
export function MacroFields({ draft, onChange }: { draft: FoodDraft; onChange: (d: FoodDraft) => void }) {
  return (
    <div className="fields">
      <label className="field field-wide">
        <span>Name</span>
        <div className="field-box">
          <input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} placeholder="Grilled salmon and rice" autoCapitalize="sentences" enterKeyHint="next" />
        </div>
      </label>
      {NUMS.map((n) => (
        <label className="field" key={n.key}>
          <span>{n.label}</span>
          <div className="field-box">
            <input
              className="num"
              value={draft[n.key]}
              onChange={(e) => onChange({ ...draft, [n.key]: e.target.value.replace(/[^0-9.]/g, '') })}
              inputMode="decimal"
              placeholder="0"
            />
            <small>{n.unit}</small>
          </div>
        </label>
      ))}
    </div>
  );
}
