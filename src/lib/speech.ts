import { useCallback, useEffect, useRef, useState } from 'react';

const Recognition: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const isInstalled = typeof window !== 'undefined' && ((navigator as any).standalone === true || window.matchMedia?.('(display-mode: standalone)').matches);

/** True when this browser can turn speech into text itself.
    Installed iOS web apps expose the feature but it never hears anything and can lock the screen,
    so it is switched off there and the keyboard's own dictation key is used instead. */
export const speechSupported = !!Recognition && !(isIOS && isInstalled);

interface Options {
  onText: (text: string, final: boolean) => void;
  onEnd?: (finalText: string) => void;
  /** Called when listening started but nothing was heard, so the caller can fall back to typing. */
  onSilent?: () => void;
}

const SILENT_MS = 6000; // give up if the browser hears nothing at all
const STOP_MS = 1200; // force the button back if the browser never confirms the stop

/** Tap-to-talk speech recognition. Stops by itself when the speaker pauses, and can always be cancelled. */
export function useSpeech({ onText, onEnd, onSilent }: Options) {
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  const timers = useRef<number[]>([]);
  const handlers = useRef({ onText, onEnd, onSilent });
  handlers.current = { onText, onEnd, onSilent };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /** Drop the recogniser no matter what state the browser thinks it is in. */
  const reset = useCallback(() => {
    clearTimers();
    const r = rec.current;
    rec.current = null;
    if (r) {
      r.onresult = r.onend = r.onerror = null;
      try {
        r.abort();
      } catch {}
    }
    setListening(false);
  }, []);

  const stop = useCallback(() => {
    const r = rec.current;
    if (!r) return setListening(false);
    try {
      r.stop();
    } catch {}
    timers.current.push(window.setTimeout(reset, STOP_MS));
  }, [reset]);

  const start = useCallback(() => {
    if (!speechSupported || rec.current) return;
    const r = new Recognition();
    r.lang = 'en-US';
    r.interimResults = true;
    r.continuous = false;
    let finalText = '';
    let heard = false;
    r.onresult = (e: any) => {
      heard = true;
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      finalText = text.trim();
      handlers.current.onText(finalText, e.results[e.results.length - 1].isFinal);
    };
    r.onend = () => {
      clearTimers();
      rec.current = null;
      setListening(false);
      if (finalText) handlers.current.onEnd?.(finalText);
    };
    r.onerror = () => {
      reset();
      if (!heard) handlers.current.onSilent?.();
    };
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      reset();
      handlers.current.onSilent?.();
      return;
    }
    timers.current.push(
      window.setTimeout(() => {
        if (!heard && rec.current === r) {
          reset();
          handlers.current.onSilent?.();
        }
      }, SILENT_MS)
    );
  }, [reset]);

  useEffect(() => reset, [reset]);

  return { listening, start, stop, toggle: listening ? stop : start };
}
