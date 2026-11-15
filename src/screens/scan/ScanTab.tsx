import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Camera, Plus, ScanLine, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { analyze, type ScanResult } from '../../lib/ai';
import { toPhoto, type Photo } from '../../lib/images';
import { iconFor } from '../../lib/foodIcon';
import { scale, sum } from '../../lib/macros';
import type { BreakdownItem, Macros } from '../../lib/types';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { MicButton } from '../../ui/MicButton';
import { Sheet } from '../../ui/Sheet';
import { Stepper } from '../../ui/Stepper';
import { EMPTY_DRAFT, MacroFields, draftMacros, type FoodDraft } from '../log/MacroFields';
import './scan.css';

const MAX_PHOTOS = 4;

export interface ScannedMeal {
  name: string;
  base: Macros; // one serving = the sum of the breakdown
  servings: number;
  breakdown: BreakdownItem[];
  icon?: string;
}

interface Props {
  catLabel: string;
  onAdd: (meal: ScannedMeal) => void;
}

/** Photo and/or description in, itemised breakdown out. Totals are always the sum of the items shown. */
export function ScanTab({ catLabel, onAdd }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [name, setName] = useState('');
  const [servings, setServings] = useState(1);
  const [feedback, setFeedback] = useState('');
  // null = closed, 'new' = adding an item, a number = editing that item
  const [itemEdit, setItemEdit] = useState<number | 'new' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const detailsField = useRef<HTMLTextAreaElement>(null);
  const feedbackField = useRef<HTMLInputElement>(null);

  const totals = result ? sum(result.breakdown) : null;
  const shown = totals ? scale(totals, servings) : null;
  const canScan = photos.length > 0 || description.trim().length > 0;

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setError('');
    try {
      const picked = await Promise.all(Array.from(files).slice(0, MAX_PHOTOS - photos.length).map(toPhoto));
      setPhotos((p) => [...p, ...picked].slice(0, MAX_PHOTOS));
    } catch (e) {
      setError((e as Error).message);
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  const run = async (correction?: string) => {
    setBusy(true);
    setError('');
    try {
      const images = photos.map(({ data, mediaType }) => ({ data, mediaType }));
      const next = await analyze(
        correction && result
          ? { images, description, previous: { name, breakdown: result.breakdown }, feedback: correction }
          : { images, description }
      );
      // The whole result is replaced, so the breakdown on screen always matches the totals.
      setResult(next);
      setName(next.name);
      setFeedback('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeItem = (index: number) => setResult((r) => (r ? { ...r, breakdown: r.breakdown.filter((_, i) => i !== index) } : r));

  const reset = () => {
    setResult(null);
    setPhotos([]);
    setDescription('');
    setFeedback('');
    setServings(1);
    setError('');
  };

  return (
    <div className="scan">
      <div className={`photos${busy ? ' scanning' : ''}${result ? ' compact' : ''}`}>
        <AnimatePresence initial={false} mode="popLayout">
          {photos.map((p) => (
            <motion.div key={p.id} layout className="photo" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
              <img src={p.url} alt="Meal photo" />
              {!busy && !result && (
                <button className="photo-remove press" aria-label="Remove photo" onClick={() => setPhotos((all) => all.filter((x) => x.id !== p.id))}>
                  <X size={14} strokeWidth={2.6} />
                </button>
              )}
            </motion.div>
          ))}
          {!result && photos.length < MAX_PHOTOS && (
            <motion.label key="add" layout className={`photo photo-add press${photos.length === 0 ? ' wide' : ''}`}>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => void addPhotos(e.target.files)} />
              <Camera size={photos.length === 0 ? 26 : 22} strokeWidth={2} />
              <span>{photos.length === 0 ? 'Add up to 4 photos' : 'Add'}</span>
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!result ? (
          <motion.div key="compose" className="scan-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <label className="field">
              <span>Details</span>
              <div className="field-box area">
                <textarea
                  ref={detailsField}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional. Weights, how it was cooked, the brand."
                  rows={2}
                  disabled={busy}
                />
                <MicButton onText={setDescription} field={detailsField} label="Dictate details" disabled={busy} />
              </div>
            </label>

            {error && <p className="scan-error" role="alert">{error}</p>}

            <button className="btn btn-primary press" disabled={!canScan || busy} onClick={() => void run()}>
              {busy ? <Busy label="Estimating macros" /> : (<><ScanLine size={20} strokeWidth={2.2} /> Scan meal</>)}
            </button>
            {photos.length === 0 && <p className="scan-hint">No photo? Describe the meal and scan from the text alone.</p>}
          </motion.div>
        ) : (
          <motion.div key="result" className="scan-step" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
            <label className="field">
              <span>Meal name</span>
              <div className="field-box">
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </label>

            {shown && (
              <div className="msheet-macros">
                <div className="is-cal"><span className="num"><AnimatedNumber value={shown.cal} /></span><small>kcal</small></div>
                <div><span className="num"><AnimatedNumber value={shown.prot} /></span><small>g protein</small></div>
                <div><span className="num"><AnimatedNumber value={shown.carb} /></span><small>g carbs</small></div>
                <div><span className="num"><AnimatedNumber value={shown.fat} /></span><small>g fat</small></div>
              </div>
            )}

            <section className={`card bd${busy ? ' rescanning' : ''}`} aria-label="Breakdown">
              <h3>Breakdown</h3>
              <ul>
                <AnimatePresence initial={false}>
                  {result.breakdown.map((b, i) => (
                    <motion.li key={`${b.item}-${b.weight}-${i}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
                      <div className="bd-row">
                        <span className="food-icon" aria-hidden="true">{iconFor(b.item)}</span>
                        <button className="bd-main press" aria-label={`Edit ${b.item}`} disabled={busy} onClick={() => setItemEdit(i)}>
                          <span className="bd-item">{b.item} <small>{b.weight}</small></span>
                          <span className="macro-line">
                            <span><b className="num kcal">{b.cal}</b> kcal</span>
                            <span>P <b className="num">{b.prot}</b></span>
                            <span>C <b className="num">{b.carb}</b></span>
                            <span>F <b className="num">{b.fat}</b></span>
                          </span>
                        </button>
                        <button className="bd-remove press" aria-label={`Remove ${b.item}`} disabled={busy} onClick={() => removeItem(i)}>
                          <X size={16} strokeWidth={2.4} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <button className="bd-add press" disabled={busy} onClick={() => setItemEdit('new')}>
                <Plus size={17} strokeWidth={2.4} /> Add an item
              </button>
              {result.breakdown.length === 0 && <p className="bd-empty">Every item was removed. Add one, correct the scan below, or start over.</p>}
              {result.notes && <p className="bd-notes">{result.notes}</p>}
            </section>

            <form
              className="field"
              onSubmit={(e) => {
                e.preventDefault();
                if (feedback.trim() && !busy) void run(feedback.trim());
              }}
            >
              <span>Something off?</span>
              <div className="field-box feedback">
                <input ref={feedbackField} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="The rice was 150 g, no oil" disabled={busy} enterKeyHint="send" />
                <MicButton onText={setFeedback} field={feedbackField} label="Dictate a correction" disabled={busy} />
                <button className="send press" aria-label="Re-scan with this correction" disabled={!feedback.trim() || busy}>
                  {busy ? <span className="spinner" /> : <ArrowUp size={19} strokeWidth={2.6} />}
                </button>
              </div>
            </form>

            {error && <p className="scan-error" role="alert">{error}</p>}

            <div className="msheet-row">
              <span>Servings</span>
              <Stepper value={servings} onChange={setServings} />
            </div>

            <button
              className="btn btn-primary press"
              disabled={busy || !totals || result.breakdown.length === 0 || !name.trim()}
              onClick={() => totals && onAdd({ name: name.trim(), base: totals, servings, breakdown: result.breakdown, icon: result.icon || undefined })}
            >
              Add to {catLabel}
            </button>
            <button className="btn btn-plain press" disabled={busy} onClick={reset}>Start over</button>
          </motion.div>
        )}
      </AnimatePresence>

      <ItemSheet
        editing={itemEdit === null ? null : itemEdit === 'new' ? 'new' : result?.breakdown[itemEdit] ?? null}
        onClose={() => setItemEdit(null)}
        onSave={(item) => {
          // Totals follow automatically: they are always the sum of the items.
          setResult((r) => {
            if (!r) return r;
            const breakdown = itemEdit === 'new' ? [...r.breakdown, item] : r.breakdown.map((b, i) => (i === itemEdit ? item : b));
            return { ...r, breakdown };
          });
          setItemEdit(null);
        }}
      />
    </div>
  );
}

/** Edit one item of the breakdown, or add a missing one. */
function ItemSheet({ editing, onClose, onSave }: { editing: BreakdownItem | 'new' | null; onClose: () => void; onSave: (item: BreakdownItem) => void }) {
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT);
  const [weight, setWeight] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (!editing) return;
    setIsNew(editing === 'new');
    setDraft(editing === 'new' ? EMPTY_DRAFT : { name: editing.item, cal: String(editing.cal), prot: String(editing.prot), carb: String(editing.carb), fat: String(editing.fat) });
    setWeight(editing === 'new' ? '' : editing.weight);
  }, [editing]);

  const valid = draft.name.trim().length > 0;
  return (
    <Sheet open={!!editing} onClose={onClose} label={isNew ? 'Add item' : 'Edit item'}>
      <form
        className="msheet"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave({ item: draft.name.trim(), weight: weight.trim(), ...draftMacros(draft) });
        }}
      >
        <h2 className="msheet-name">{isNew ? 'Add item' : 'Edit item'}</h2>
        <MacroFields draft={draft} onChange={setDraft} />
        <label className="field">
          <span>Amount</span>
          <div className="field-box">
            <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="150g" />
          </div>
        </label>
        <button className="btn btn-primary press" disabled={!valid}>{isNew ? 'Add item' : 'Save item'}</button>
      </form>
    </Sheet>
  );
}

export function Busy({ label }: { label: string }) {
  return (
    <span className="busy" role="status">
      <span className="spinner" /> {label}
    </span>
  );
}
