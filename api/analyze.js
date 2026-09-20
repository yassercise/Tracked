export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { images, description } = req.body;
  if ((!images || !images.length) && !description) {
    return res.status(400).json({ error: 'Provide at least a photo or description' });
  }

  const descText = description ? ` Additional context: ${description}.` : '';
  const promptText = `Analyze this meal and estimate nutritional content.${descText} Respond ONLY with a JSON object, no markdown: {"name":"meal name","cal":0,"prot":0,"carb":0,"fat":0,"notes":"brief accuracy note"}`;

  const content = [];
  if (images && images.length) {
    for (const img of images) {
      if (img.data && img.data.length > 0) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.data }
        });
      }
    }
  }
  content.push({ type: 'text', text: promptText });

  // If no valid images and no description, use text only
  if (content.length === 1 && !description) {
    return res.status(400).json({ error: 'No valid image data received' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content }]
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(500).json({ error: 'Claude API error: ' + errText });
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'Analysis failed: ' + e.message });
  }
}
