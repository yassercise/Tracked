import { Minus, Plus } from 'lucide-react';
import './ui.css';

interface Props {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** What is being counted, for screen readers. */
  noun?: string;
}

/** Minus / value / plus. Defaults suit a servings multiplier (steps of 0.25, where 1 = one serving). */
export function Stepper({ value, onChange, step = 0.25, min = step, max = Infinity, noun = 'servings' }: Props) {
  return (
    <div className="stepper">
      <button type="button" className="press" aria-label={`Fewer ${noun}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}><Minus size={18} /></button>
      <span className="num" aria-live="polite">{Number(value.toFixed(2))}</span>
      <button type="button" className="press" aria-label={`More ${noun}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}><Plus size={18} /></button>
    </div>
  );
}
