import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useDay } from '../../data/useDay';
import { useFoods } from '../../data/useFoods';
import { dayLong, fromKey, todayKey } from '../../lib/dates';
import { makeMeal } from '../../lib/meals';
import { CATEGORIES, type Category, type Food } from '../../lib/types';
import { Segmented } from '../../ui/Segmented';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';
import { useToast } from '../../ui/Toast';
import { FoodList } from './FoodList';
import { FoodSheet } from './FoodSheet';
import { EMPTY_DRAFT, MacroFields, draftMacros, type FoodDraft } from './MacroFields';
import '../home/home.css';
import './log.css';

type LogTab = 'recent' | 'saved' | 'manual' | 'scan';
const TABS: { id: LogTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'saved', label: 'My foods' },
  { id: 'manual', label: 'Manual' },
  { id: 'scan', label: 'AI scan' },
];

interface Props {
  dateKey: string;
  cat: Category;
  onCatChange: (cat: Category) => void;
  onDone: () => void;
}

export function LogScreen({ dateKey, cat, onCatChange, onDone }: Props) {
  const toast = useToast();
  const { addMeal } = useDay(dateKey);
  const { recent, saved, pushRecent, saveFood } = useFoods();
  const [tab, setTab] = useState<LogTab>('recent');
  const [open, setOpen] = useState<Food | null>(null);
  const [creating, setCreating] = useState(false);

  const catLabel = CATEGORIES.find((c) => c.id === cat)!.label;
  const isToday = dateKey === todayKey();
  const dayLabel = `${fromKey(dateKey).toLocaleDateString('en-GB', { weekday: 'long' })} ${dayLong(dateKey)}`;

  /** Log one food. Recent always stores one serving, whatever was logged. */
  const log = (food: Food, servings = 1) => {
    addMeal(makeMeal(food, cat, servings));
    pushRecent(food);
    toast(`Added to ${catLabel}`);
  };

  const isSaved = (f: Food) => saved.some((s) => s.name.toLowerCase() === f.name.toLowerCase());

  return (
    <main className="screen log">
      <header className="home-head">
        <div>
          <h1>Log food</h1>
          <p className={isToday ? undefined : 'log-past'}>{isToday ? 'Today' : `Logging to ${dayLabel}`}</p>
        </div>
      </header>

      <div className="chips log-cats" role="radiogroup" aria-label="Category">
        {CATEGORIES.map((c) => (
          <button key={c.id} role="radio" aria-checked={cat === c.id} className="chip press" onClick={() => onCatChange(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <Segmented options={TABS} value={tab} onChange={setTab} label="Log method" />

      <div className="log-body">
        {tab === 'recent' && (
          <FoodList foods={recent} onQuickAdd={(f) => log(f)} onOpen={setOpen} empty={<p>Foods you log show up here, ready to add again in one tap.</p>} />
        )}

        {tab === 'saved' && (
          <FoodList
            foods={saved}
            onQuickAdd={(f) => log(f)}
            onOpen={setOpen}
            empty={<p>Save the foods you eat most to log them in one tap.</p>}
            action={
              <button className="new-food press" onClick={() => setCreating(true)}>
                <Plus size={18} strokeWidth={2.4} /> New food
              </button>
            }
          />
        )}

        {tab === 'manual' && (
          <ManualEntry
            catLabel={catLabel}
            onAdd={(food, servings, keep) => {
              log(food, servings);
              if (keep && !isSaved(food)) saveFood(food);
              onDone();
            }}
          />
        )}

        {tab === 'scan' && <p className="log-empty">Photo scan and voice logging are built in the next step.</p>}
      </div>

      <FoodSheet
        food={open}
        catLabel={catLabel}
        canSave={!!open && !isSaved(open)}
        onClose={() => setOpen(null)}
        onAdd={(f, servings) => {
          log(f, servings);
          setOpen(null);
        }}
        onSave={(f) => {
          saveFood({ name: f.name, cal: f.cal, prot: f.prot, carb: f.carb, fat: f.fat });
          toast('Saved to My foods');
        }}
      />

      <NewFoodSheet
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(f) => {
          saveFood(f);
          setCreating(false);
          toast('Saved to My foods');
        }}
      />
    </main>
  );
}

function ManualEntry({ catLabel, onAdd }: { catLabel: string; onAdd: (food: Food, servings: number, keep: boolean) => void }) {
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT);
  const [servings, setServings] = useState(1);
  const [keep, setKeep] = useState(false);
  const valid = draft.name.trim().length > 0;

  return (
    <form
      className="manual"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onAdd({ name: draft.name.trim(), ...draftMacros(draft) }, servings, keep);
      }}
    >
      <p className="manual-hint">Enter the macros for one serving.</p>
      <MacroFields draft={draft} onChange={setDraft} />
      <div className="msheet-row">
        <span>Servings</span>
        <Stepper value={servings} onChange={setServings} />
      </div>
      <label className="switch-row">
        <span>Save to My foods</span>
        <input type="checkbox" role="switch" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
        <i aria-hidden="true" />
      </label>
      <button className="btn btn-primary press" disabled={!valid}>Add to {catLabel}</button>
    </form>
  );
}

function NewFoodSheet({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (f: Food) => void }) {
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT);
  const valid = draft.name.trim().length > 0;
  return (
    <Sheet open={open} onClose={onClose} label="New food">
      <form
        className="msheet"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSave({ name: draft.name.trim(), ...draftMacros(draft) });
          setDraft(EMPTY_DRAFT);
        }}
      >
        <h2 className="msheet-name">New food</h2>
        <p className="manual-hint">Enter the macros for one serving.</p>
        <MacroFields draft={draft} onChange={setDraft} />
        <button className="btn btn-primary press" disabled={!valid}>Save food</button>
      </form>
    </Sheet>
  );
}
