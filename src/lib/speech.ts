import { useCallback, useEffect, useRef, useState } from 'react';

const Recognition: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

/** True when this browser can turn speech into text itself. When false, the keyboard's own dictation key still works in any text field. */
export const speechSupported = !!Recognition;

interface Options {
  onText: (text: string, final: boolean) => void;
  onEnd?: (finalText: string) => void;
}

/** Tap-to-talk speech recognition. Stops by itself when the speaker pauses. */
export function useSpeech({ onText, onEnd }: Options) {
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  const handlers = useRef({ onText, onEnd });
  handlers.current = { onText, onEnd };

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    if (!Recognition || rec.current) return;
    const r = new Recognition();
    r.lang = 'en-US';
    r.interimResults = true;
    r.continuous = false;
    let finalText = '';
    r.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      finalText = text.trim();
      handlers.current.onText(finalText, e.results[e.results.length - 1].isFinal);
    };
    r.onend = () => {
      rec.current = null;
      setListening(false);
      handlers.current.onEnd?.(finalText);
    };
    r.onerror = () => {};
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      rec.current = null;
      setListening(false);
    }
  }, []);

  useEffect(() => () => rec.current?.abort(), []);

  return { listening, start, stop, toggle: listening ? stop : start };
}
