import { DEMO } from '../data/demo';
import type { BreakdownItem } from './types';

export interface ScanImage {
  data: string; // base64 JPEG, no data: prefix
  mediaType: string;
}

export interface ScanResult {
  name: string;
  notes: string;
  icon?: string;
  breakdown: BreakdownItem[];
}

export interface AnalyzeInput {
  images?: ScanImage[];
  description?: string;
  previous?: Pick<ScanResult, 'name' | 'breakdown'>;
  feedback?: string;
}

/** Ask Claude for a meal breakdown. Totals are never part of the answer: add up the breakdown. */
export async function analyze(input: AnalyzeInput): Promise<ScanResult> {
  if (DEMO) return demoAnalyze(input);

  let res: Response;
  try {
    res = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.breakdown) throw new Error(body?.error ? `${String(body.error).replace(/\.$/, '')}. Try again.` : 'The scan failed. Try again.');
  return body as ScanResult;
}

async function demoAnalyze(input: AnalyzeInput): Promise<ScanResult> {
  await new Promise((r) => setTimeout(r, 1800));
  if (input.previous) {
    return {
      name: input.previous.name,
      notes: 'Updated with your correction.',
      breakdown: input.previous.breakdown.map((b, i) => (i === 1 ? { ...b, weight: '150g', cal: 195, prot: 4, carb: 43, fat: 0 } : b)),
    };
  }
  return {
    name: 'Chicken and rice',
    icon: '🍗',
    notes: input.images?.length ? 'Oil used in cooking is the main uncertainty.' : '',
    breakdown: [
      { item: 'Grilled chicken breast', weight: '200g', cal: 330, prot: 62, carb: 0, fat: 7 },
      { item: 'White rice, cooked', weight: '250g', cal: 325, prot: 7, carb: 71, fat: 1 },
      { item: 'Olive oil', weight: '10g', cal: 88, prot: 0, carb: 0, fat: 10 },
    ],
  };
}
