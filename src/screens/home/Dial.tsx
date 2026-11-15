import { useEffect, useState } from 'react';
import { fmt } from '../../lib/macros';
import { AnimatedNumber } from '../../ui/AnimatedNumber';

const C = 150;
const START = 135; // degrees; the dial opens at the bottom
const SWEEP = 270;
const pt = (deg: number, r: number) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];
const arc = (r: number) => {
  const [x1, y1] = pt(START, r);
  const [x2, y2] = pt(START + SWEEP, r);
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
};
const TICKS = Array.from({ length: 55 }, (_, i) => i);

interface Props {
  cal: number;
  calTarget: number;
  prot: number;
  protTarget: number;
}

/** The two numbers that decide the day: calories on the outer arc, protein on the inner one. */
export function Dial({ cal, calTarget, prot, protTarget }: Props) {
  // Arcs start empty and sweep to their value when the dial first appears.
  const [live, setLive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const calPct = live ? Math.min(1, cal / calTarget) : 0;
  const protPct = live ? Math.min(1, prot / protTarget) : 0;
  const left = calTarget - cal;

  return (
    <div className="dial" role="img" aria-label={`${fmt(cal)} of ${fmt(calTarget)} calories, ${fmt(prot)} of ${fmt(protTarget)} grams protein`}>
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <defs>
          <linearGradient id="dial-amber" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#ff7d1a" />
            <stop offset="0.55" stopColor="#ffa630" />
            <stop offset="1" stopColor="#ffd08a" />
          </linearGradient>
        </defs>

        {TICKS.map((i) => {
          const deg = START + (i / (TICKS.length - 1)) * SWEEP;
          const [x1, y1] = pt(deg, 139);
          const [x2, y2] = pt(deg, 145);
          const lit = calPct > 0 && i / (TICKS.length - 1) <= calPct;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={lit ? 'dial-tick lit' : 'dial-tick'} style={{ transitionDelay: `${i * 9}ms` }} />;
        })}

        <path d={arc(120)} className="dial-track" strokeWidth={15} />
        <path d={arc(120)} className="dial-cal" strokeWidth={15} pathLength={1} strokeDasharray={`${calPct} 1`} style={{ opacity: calPct > 0 ? 1 : 0 }} />

        <path d={arc(99)} className="dial-track" strokeWidth={5} />
        <path d={arc(99)} className="dial-prot" strokeWidth={5} pathLength={1} strokeDasharray={`${protPct} 1`} style={{ opacity: protPct > 0 ? 1 : 0 }} />
      </svg>

      <div className="dial-center">
        <span className="dial-value num"><AnimatedNumber value={cal} duration={900} /></span>
        <span className="dial-of">of {fmt(calTarget)} kcal</span>
      </div>

      <div className={left <= 0 ? 'dial-left done' : 'dial-left'}>
        {left > 0 ? (
          <>
            <span className="num">{fmt(left)}</span> to go
          </>
        ) : left === 0 ? (
          'Target hit'
        ) : (
          <>
            <span className="num">{fmt(-left)}</span> over
          </>
        )}
      </div>
    </div>
  );
}
