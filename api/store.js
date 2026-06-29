// Tiny key/value API backed by Vercel KV.
// GET  /api/store?key=fps_pipeline_v1        -> { value }
// POST /api/store  { "key": "...", "value": ... }  -> { ok: true }
//
// Vercel automatically injects KV_REST_API_URL / KV_REST_API_TOKEN once you
// create a KV (Redis) database in the project's Storage tab and connect it.
// No manual secret entry needed beyond that dashboard click.

const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: 'key required' });
      const value = await kv.get(key);
      return res.status(200).json({ value: value ?? null });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const { key, value } = body || {};
      if (!key) return res.status(400).json({ error: 'key required' });
      await kv.set(key, value);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
