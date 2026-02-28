export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const BASE  = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;
  const KEY   = 'tsdata';

  if (!BASE || !TOKEN) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${BASE}/get/${KEY}`, { headers });
      const j = await r.json();
      let data = { people: [], entries: [] };
      if (j.result) {
        // handle both single and double encoded
        let parsed = j.result;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        data = parsed;
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      // store as single encoded string
      await fetch(`${BASE}/set/${KEY}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(JSON.stringify(body))
      });
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
