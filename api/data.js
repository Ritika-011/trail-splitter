export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const URL   = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;
  const KEY   = 'tsdata';

  if (!URL || !TOKEN) {
    return res.status(500).json({ error: 'Missing env vars', url: !!URL, token: !!TOKEN });
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      const j = await r.json();
      const data = j.result ? JSON.parse(j.result) : { people: [], entries: [] };
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      await fetch(`${URL}/set/${KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(req.body))
      });
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
