import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFoods } from '../../data/useFoods';
import { iconOf } from '../../lib/foodIcon';
import { fmt } from '../../lib/macros';
import { GLASS_ML, type Food, type Targets } from '../../lib/types';
import { Stepper } from '../../ui/Stepper';
import { useToast } from '../../ui/Toast';
import { FoodFormSheet } from '../log/FoodFormSheet';
import '../home/home.css';
import '../log/log.css';
import './settings.css';

interface Props {
  targets: Targets;
  onSave: (t: Targets) => void;
}

const FIELDS: { key: 'cal' | 'prot' | 'carb' | 'fat'; label: string; unit: string }[] = [
  { key: 'cal', label: 'Calories', unit: 'kcal' },
  { key: 'prot', label: 'Protein', unit: 'g' },
  { key: 'carb', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

type Draft = Record<'cal' | 'prot' | 'carb' | 'fat', string> & { water: number };
const toDraft = (t: Targets): Draft => ({ cal: String(t.cal), prot: String(t.prot), carb: String(t.carb), fat: String(t.fat), water: t.water });

export function SettingsScreen({ targets, onSave }: Props) {
  const toast = useToast();
  const { recent, saved, saveFood, deleteFood, setRecentList } = useFoods();
  const [draft, setDraft] = useState<Draft>(() => toDraft(targets));
  const [form, setForm] = useState<Food | 'new' | null>(null);

  // Pick up targets changed on another device, unless there are unsaved edits here.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) setDraft(toDraft(targets));
  }, [targets, dirty]);

  const next: Targets = {
    cal: Math.round(parseFloat(draft.cal)) || 0,
    prot: Math.round(parseFloat(draft.prot)) || 0,
    carb: Math.round(parseFloat(draft.carb)) || 0,
    fat: Math.round(parseFloat(draft.fat)) || 0,
    water: draft.water,
  };
  const valid = next.cal > 0 && next.prot > 0 && next.carb > 0 && next.fat > 0;
  const changed = (Object.keys(next) as (keyof Targets)[]).some((k) => next[k] !== targets[k]);
  const fromMacros = next.prot * 4 + next.carb * 4 + next.fat * 9;
  const gap = fromMacros - next.cal;

  const edit = (patch: Partial<Draft>) => {
    setDirty(true);
    setDraft((d) => ({ ...d, ...patch }));
  };

  return (
    <main className="screen settings">
      <header className="home-head">
        <div>
          <h1>Settings</h1>
        </div>
      </header>

      <form
        className="card set-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid || !changed) return;
          onSave(next);
          setDirty(false);
          toast('Targets saved');
        }}
      >
        <h2>Daily targets</h2>
        <div className="fields">
          {FIELDS.map((f) => (
            <label className="field" key={f.key}>
              <span>{f.label}</span>
              <div className="field-box">
                <input className="num" inputMode="numeric" value={draft[f.key]} onChange={(e) => edit({ [f.key]: e.target.value.replace(/[^0-9]/g, '') })} />
                <small>{f.unit}</small>
              </div>
            </label>
          ))}
        </div>
        {valid && Math.abs(gap) > 50 && (
          <p className="set-note">
            These macros add up to {fmt(fromMacros)} kcal, {fmt(Math.abs(gap))} {gap > 0 ? 'more' : 'less'} than your calorie target.
          </p>
        )}

        <div className="msheet-row set-water">
          <span>
            Water
            <small>{fmt(draft.water * GLASS_ML)} ml, in {GLASS_ML} ml glasses</small>
          </span>
          <Stepper value={draft.water} onChange={(v) => edit({ water: v })} step={1} min={1} max={20} noun="glasses" />
        </div>

        <button className="btn btn-primary press" disabled={!valid || !changed}>Save targets</button>
      </form>

      <section className="card set-card">
        <div className="set-head">
          <h2>My foods</h2>
          <button className="new-food press" onClick={() => setForm('new')}>
            <Plus size={18} strokeWidth={2.4} /> New food
          </button>
        </div>
        {saved.length === 0 ? (
          <p className="set-empty">No saved foods yet. Add the ones you eat most to log them in one tap.</p>
        ) : (
          <ul className="set-foods">
            {saved.map((f) => (
              <li key={f.id}>
                <button className="food-row press" onClick={() => setForm(f)}>
                  <span className="food-icon" aria-hidden="true">{iconOf(f)}</span>
                  <span className="food-name">{f.name}</span>
                  <span className="macro-line">
                    <span><b className="num kcal">{fmt(f.cal)}</b> kcal</span>
                    <span>P <b className="num">{fmt(f.prot)}</b></span>
                    <span>C <b className="num">{fmt(f.carb)}</b></span>
                    <span>F <b className="num">{fmt(f.fat)}</b></span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card set-card">
        <div className="set-head">
          <h2>Recent foods</h2>
          <span className="set-count">{recent.length} of 30</span>
        </div>
        <button
          className="btn-soft press"
          disabled={recent.length === 0}
          onClick={() => {
            const before = recent;
            setRecentList([]);
            toast('Recent foods cleared', { label: 'Undo', onClick: () => setRecentList(before) });
          }}
        >
          Clear recent foods
        </button>
      </section>

      <p className="set-foot">Tracked 2.0. Your data syncs across your devices.</p>

      <FoodFormSheet
        editing={form}
        onClose={() => setForm(null)}
        onSave={(f) => {
          saveFood(f);
          setForm(null);
          toast(f.id ? 'Food updated' : 'Saved to My foods');
        }}
        onDelete={(f) => {
          if (f.id) deleteFood(f.id);
          setForm(null);
          toast('Food deleted', { label: 'Undo', onClick: () => saveFood(f) });
        }}
      />
    </main>
  );
}
