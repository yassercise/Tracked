import { motion } from 'motion/react';
import './ui.css';

interface Props<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)}>
          {value === o.id && <motion.span layoutId={`seg-${label}`} className="seg-active" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
