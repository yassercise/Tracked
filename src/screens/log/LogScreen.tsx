import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Mic, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDay } from '../../data/useDay';
import { useFoods } from '../../data/useFoods';
import { dayLong, fromKey, todayKey } from '../../lib/dates';
import { analyze } from '../../lib/ai';
import { fmt, sum } from '../../lib/macros';
import { makeMeal } from '../../lib/meals';
import { speechSupported, useSpeech } from '../../lib/speech';
import { CATEGORIES, type BreakdownItem, type Category, type Food, type Targets } from '../../lib/types';
import { Segmented } from '../../ui/Segmented';
import { Stepper } from '../../ui/Stepper';
import { useToast } from '../../ui/Toast';
import { Busy, ScanTab } from '../scan/ScanTab';
import { FoodList } from './FoodList';
import { FoodFormSheet } from './FoodFormSheet';
import { FoodSheet, type FoodKind } from './FoodSheet';
import { EMPTY_DRAFT, MacroFields, draftMacros, type FoodDraft } from './MacroFields';
import '../home/home.css';
import './log.css';
import '../scan/scan.css';

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
  targets: Targets;
  onCatChange: (cat: Category) => void;
  onDone: () => void;
}

export function LogScreen({ dateKey, cat, targets, onCatChange, onDone }: Props) {
  const toast = useToast();
  const { day, addMeal } = useDay(dateKey);
  const { recent, saved, pushRecent, removeRecent, saveFood, deleteFood } = useFoods();
  const [tab, setTab] = useState<LogTab>('recent');
  const [open, setOpen] = useState<{ food: Food; kind: FoodKind } | null>(null);
  const [openKind, setOpenKind] = useState<FoodKind>('recent');
  // null = closed, 'new' = creating, a Food = editing that saved food
  const [form, setForm] = useState<Food | 'new' | null>(null);

  const openFood = (food: Food, kind: FoodKind) => {
    setOpenKind(kind);
    setOpen({ food, kind });
  };

  // What is still needed to hit the day's targets, so it's visible while choosing food.
  const eaten = sum(day.meals);
  const calLeft = targets.cal - eaten.cal;
  const protLeft = targets.prot - eaten.prot;
  const leftText =
    calLeft <= 0 && protLeft <= 0
      ? 'Calories and protein hit'
      : [calLeft > 0 ? `${fmt(calLeft)} kcal` : '', protLeft > 0 ? `${fmt(protLeft)} g protein` : ''].filter(Boolean).join(' and ') + ' to go';

  const catLabel = CATEGORIES.find((c) => c.id === cat)!.label;
  const isToday = dateKey === todayKey();
  const dayLabel = `${fromKey(dateKey).toLocaleDateString('en-GB', { weekday: 'long' })} ${dayLong(dateKey)}`;

  /** Log one food. Recent always stores one serving, whatever was logged. */
  const log = (food: Food, servings = 1, extra: { source?: string; breakdown?: BreakdownItem[] } = {}) => {
    addMeal(makeMeal(food, cat, servings, { ...extra, ...(food.icon ? { icon: food.icon } : {}) }));
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
          <p className="log-left">{leftText}</p>
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} className="log-body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
          {tab === 'recent' && (
            <FoodList foods={recent} onQuickAdd={(f) => log(f, 1, { source: 'recent' })} onOpen={(f) => openFood(f, 'recent')} empty={<p>Foods you log show up here, ready to add again in one tap.</p>} />
          )}

          {tab === 'saved' && (
            <FoodList
              foods={saved}
              onQuickAdd={(f) => log(f, 1, { source: 'saved' })}
              onOpen={(f) => openFood(f, 'saved')}
              empty={<p>Save the foods you eat most to log them in one tap.</p>}
              action={
                <button className="new-food press" onClick={() => setForm('new')}>
                  <Plus size={18} strokeWidth={2.4} /> New food
                </button>
              }
            />
          )}

          {tab === 'manual' && (
            <ManualEntry
              catLabel={catLabel}
              onAdd={(food, servings, keep, extra) => {
                log(food, servings, extra);
                if (keep && !isSaved(food)) saveFood(food);
                onDone();
              }}
            />
          )}

          {tab === 'scan' && (
            <ScanTab
              catLabel={catLabel}
              onAdd={(m) => {
                log({ name: m.name, ...m.base, icon: m.icon }, m.servings, { source: 'scan', breakdown: m.breakdown });
                onDone();
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <FoodSheet
        food={open?.food ?? null}
        kind={openKind}
        catLabel={catLabel}
        canSave={!!open && !isSaved(open.food)}
        onClose={() => setOpen(null)}
        onAdd={(f, servings) => {
          log(f, servings, { source: openKind });
          setOpen(null);
        }}
        onSave={(f) => {
          saveFood({ name: f.name, cal: f.cal, prot: f.prot, carb: f.carb, fat: f.fat, icon: f.icon });
          toast('Saved to My foods');
        }}
        onEdit={(f) => {
          setOpen(null);
          setForm(f);
        }}
        onRemove={(f) => {
          setOpen(null);
          if (openKind === 'saved' && f.id) {
            deleteFood(f.id);
            toast('Food deleted', { label: 'Undo', onClick: () => saveFood(f) });
          } else {
            removeRecent(f.name);
            toast('Removed from Recent', { label: 'Undo', onClick: () => pushRecent(f) });
          }
        }}
      />

      <FoodFormSheet
        editing={form}
        onClose={() => setForm(null)}
        onSave={(f) => {
          saveFood(f);
          setForm(null);
          toast(f.id ? 'Food updated' : 'Saved to My foods');
        }}
      />
    </main>
  );
}

type Extra = { source?: string; breakdown?: BreakdownItem[] };

function ManualEntry({ catLabel, onAdd }: { catLabel: string; onAdd: (food: Food, servings: number, keep: boolean, extra: Extra) => void }) {
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT);
  const [servings, setServings] = useState(1);
  const [keep, setKeep] = useState(false);
  const [said, setSaid] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Breakdown from the last voice/text fill. Dropped as soon as the numbers are edited by hand.
  const [filled, setFilled] = useState<{ from: string; breakdown: BreakdownItem[] } | null>(null);
  const saidRef = useRef('');
  const valid = draft.name.trim().length > 0;

  const fill = async (text: string) => {
    const description = text.trim();
    if (!description || busy) return;
    setBusy(true);
    setError('');
    try {
      const r = await analyze({ description });
      const t = sum(r.breakdown); // totals always come from the breakdown
      setDraft({ name: r.name, cal: String(t.cal), prot: String(t.prot), carb: String(t.carb), fat: String(t.fat) });
      setFilled({ from: description, breakdown: r.breakdown });
      setSaid('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const speech = useSpeech({
    onText: (t) => {
      saidRef.current = t;
      setSaid(t);
    },
    onEnd: (t) => void fill(t || saidRef.current),
  });

  return (
    <form
      className="manual"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onAdd({ name: draft.name.trim(), ...draftMacros(draft) }, servings, keep, filled ? { source: 'voice', breakdown: filled.breakdown } : { source: 'manual' });
      }}
    >
      <section className={`card describe${speech.listening ? ' listening' : ''}`}>
        <h3>{speech.listening ? 'Listening…' : 'Say what you ate'}</h3>
        <p>{speechSupported ? 'Tap the mic and speak, or type it. The form fills in for you.' : 'Type it, or use the mic on your keyboard. The form fills in for you.'}</p>
        <div className="field-box">
          <input
            value={said}
            onChange={(e) => setSaid(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void fill(said);
              }
            }}
            placeholder="200g chicken and rice"
            aria-label="Describe what you ate"
            enterKeyHint="go"
            disabled={busy}
          />
          {speechSupported && (
            <button type="button" className={`mic press${speech.listening ? ' on' : ''}`} aria-label={speech.listening ? 'Stop listening' : 'Speak'} aria-pressed={speech.listening} disabled={busy} onClick={speech.toggle}>
              <Mic size={19} strokeWidth={2.2} />
            </button>
          )}
          <button type="button" className="send press" aria-label="Fill in the form" disabled={!said.trim() || busy} onClick={() => void fill(said)}>
            {busy ? <span className="spinner" /> : <ArrowUp size={19} strokeWidth={2.6} />}
          </button>
        </div>
        {busy && <Busy label="Working out the macros" />}
        {error && <p className="scan-error" role="alert">{error}</p>}
      </section>

      <p className="manual-hint">Macros for one serving.</p>
      <MacroFields
        draft={draft}
        onChange={(d) => {
          if (filled && (d.cal !== draft.cal || d.prot !== draft.prot || d.carb !== draft.carb || d.fat !== draft.fat)) setFilled(null);
          setDraft(d);
        }}
      />

      <AnimatePresence initial={false}>
        {filled && (
          <motion.div className="filled-from" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            Filled in from "{filled.from}"
            <ul>
              {filled.breakdown.map((b, i) => (
                <li key={i}>
                  <span>{b.item} {b.weight}</span>
                  <b className="num">{b.cal} kcal</b>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

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
