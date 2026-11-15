import { Minus, Plus } from 'lucide-react';
import './ui.css';

const STEP = 0.25;

/** Servings multiplier. 1 = one serving. */
export function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button type="button" className="press" aria-label="Fewer servings" disabled={value <= STEP} onClick={() => onChange(Math.max(STEP, value - STEP))}><Minus size={18} /></button>
      <span className="num" aria-live="polite">{Number(value.toFixed(2))}</span>
      <button type="button" className="press" aria-label="More servings" onClick={() => onChange(value + STEP)}><Plus size={18} /></button>
    </div>
  );
}
