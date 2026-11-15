// POST /api/analyze — estimates a meal's macros with Claude.
//
// Body: {
//   images?:      [{ data: base64, mediaType: 'image/jpeg' }]   up to 4 photos
//   description?: string                                        typed or spoken description
//   previous?:    { name, breakdown }                           the last result, when correcting it
//   feedback?:    string                                        what to correct
// }
// Returns: { name, notes, breakdown: [{ item, weight, cal, prot, carb, fat }] }
//
// There are deliberately no meal totals in the response. The app always adds up the
// breakdown itself, so totals and breakdown can never disagree.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const SYSTEM = `You estimate the nutritional content of meals for a personal macro tracker used by someone who trains regularly and weighs food when he can.

Rules:
- List every distinct food item separately, including cooking oil, butter, sauces, dressings and drinks when they are visible or mentioned.
- Estimate each item's weight in grams (millilitres for drinks) and its calories, protein, carbs and fat for that weight.
- When the user states a weight, quantity or brand, use it exactly. Stated amounts always beat what a photo suggests.
- Weights are for the food as served (cooked weight for cooked food) unless the user says raw.
- Be realistic rather than conservative: restaurant and home portions are usually larger and oilier than they look.
- All numbers are integers. Calories should be consistent with the macros (4 kcal per gram of protein or carbs, 9 per gram of fat).
- The meal name is short and plain, like "Chicken and rice" or "Beef burger with fries".
- Notes: one short sentence on the biggest source of uncertainty, or an empty string when the user gave exact weights.

When you are given a previous estimate and a correction, apply the correction and return the complete updated list of items, including the ones that did not change.`;

const TOOL = {
  name: 'report_meal',
  description: 'Report the estimated breakdown of the meal.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Short plain name for the whole meal' },
      notes: { type: 'string', description: 'One short sentence on accuracy, or empty' },
      breakdown: {
        type: 'array',
        description: 'Every food item in the meal',
        items: {
          type: 'object',
          properties: {
            item: { type: 'string' },
            weight: { type: 'string', description: 'Estimated amount with unit, e.g. "150g" or "250ml"' },
            cal: { type: 'integer' },
            prot: { type: 'integer' },
            carb: { type: 'integer' },
            fat: { type: 'integer' },
          },
          required: ['item', 'weight', 'cal', 'prot', 'carb', 'fat'],
        },
      },
    },
    required: ['name', 'notes', 'breakdown'],
  },
};

const int = (v) => Math.max(0, Math.round(Number(v) || 0));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Only answer the app itself, not other websites calling this endpoint from a browser.
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Forbidden' });

  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set for this deployment' });

  const { images = [], description = '', previous, feedback = '' } = req.body || {};
  const photos = (Array.isArray(images) ? images : []).filter((i) => i && i.data).slice(0, 4);
  if (!photos.length && !String(description).trim() && !previous) {
    return res.status(400).json({ error: 'Add a photo or a description' });
  }

  const content = photos.map((img) => ({
    type: 'image',
    source: { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.data },
  }));

  let text = photos.length ? 'Estimate the macros for the meal in the photo(s).' : 'Estimate the macros for this meal.';
  if (String(description).trim()) text += `\n\nWhat the user said about it: ${String(description).trim()}`;
  if (previous && Array.isArray(previous.breakdown)) {
    text += `\n\nYour previous estimate was "${previous.name}":\n${JSON.stringify(previous.breakdown)}`;
    text += `\n\nThe user's correction: ${String(feedback).trim() || 'Look again and improve the estimate.'}`;
  }
  content.push({ type: 'text', text });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: TOOL.name },
        messages: [{ role: 'user', content }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Anthropic API error', r.status, detail);
      return res.status(502).json({ error: `Claude API error (${r.status})`, detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    const out = (data.content || []).find((c) => c.type === 'tool_use')?.input;
    if (!out || !Array.isArray(out.breakdown) || !out.breakdown.length) {
      return res.status(502).json({ error: 'Claude did not return a breakdown' });
    }

    return res.status(200).json({
      name: String(out.name || 'Meal').trim(),
      notes: String(out.notes || '').trim(),
      breakdown: out.breakdown.map((b) => ({
        item: String(b.item || 'Item').trim(),
        weight: String(b.weight || '').trim(),
        cal: int(b.cal),
        prot: int(b.prot),
        carb: int(b.carb),
        fat: int(b.fat),
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Analysis failed', detail: String(e?.message || e) });
  }
}
