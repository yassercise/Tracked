import { Mic } from 'lucide-react';
import type { RefObject } from 'react';
import { speechSupported, useSpeech } from '../lib/speech';
import { useToast } from './Toast';
import './ui.css';

interface Props {
  /** Live transcript while speaking. */
  onText: (text: string) => void;
  /** Called once when the speaker stops, with everything that was heard. */
  onDone?: (text: string) => void;
  /** The text field this mic fills. Where the browser can't listen itself, the mic opens the keyboard on it. */
  field: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  label?: string;
  disabled?: boolean;
}

/** Tap to dictate. Falls back to the keyboard's own dictation key where in-app listening isn't available. */
export function MicButton({ onText, onDone, field, label = 'Dictate', disabled }: Props) {
  const toast = useToast();
  const useKeyboard = () => {
    field.current?.focus();
    toast('Tap the mic on your keyboard to dictate');
  };
  const { listening, toggle } = useSpeech({ onText: (t) => onText(t), onEnd: (t) => onDone?.(t), onSilent: useKeyboard });

  return (
    <button
      type="button"
      className={`mic press${listening ? ' on' : ''}`}
      aria-label={listening ? 'Stop listening' : label}
      aria-pressed={listening}
      disabled={disabled}
      onClick={speechSupported ? toggle : useKeyboard}
    >
      <Mic size={19} strokeWidth={2.2} />
    </button>
  );
}
