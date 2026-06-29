// Tiny key/value API backed by Upstash Redis (free tier — 500K commands/mo, 256MB).
// GET  /api/store?key=fps_pipeline_v1        -> { value }
// POST /api/store  { "key": "...", "value": ... }  -> { ok: true }
//
// Requires two environment variables, set in the Vercel project's
// Settings -> Environment Variables (copy these from your Upstash database page):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: 'key required' });
      const value = await redis.get(key);
      return res.status(200).json({ value: value ?? null });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const { key, value } = body || {};
      if (!key) return res.status(400).json({ error: 'key required' });
      await redis.set(key, value);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
