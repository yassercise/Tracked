import { Mic } from 'lucide-react';
import { speechSupported, useSpeech } from '../lib/speech';
import './ui.css';

interface Props {
  /** Live transcript while speaking. */
  onText: (text: string) => void;
  /** Called once when the speaker stops, with everything that was heard. */
  onDone?: (text: string) => void;
  label?: string;
  large?: boolean;
}

/** Tap to dictate. Renders nothing where the browser has no speech recognition (the keyboard's mic key covers it). */
export function MicButton({ onText, onDone, label = 'Dictate', large }: Props) {
  const { listening, toggle } = useSpeech({ onText: (t) => onText(t), onEnd: (t) => t && onDone?.(t) });
  if (!speechSupported) return null;
  return (
    <button type="button" className={`mic press${listening ? ' on' : ''}${large ? ' large' : ''}`} aria-label={listening ? 'Stop listening' : label} aria-pressed={listening} onClick={toggle}>
      <Mic size={large ? 26 : 19} strokeWidth={2.2} />
    </button>
  );
}
