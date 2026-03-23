export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
      headers: { 'X-Api-Key': 'TeEmaa4OORqOHUIyKV81auP3wh12QsDPqQxUK4F2' }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
}
