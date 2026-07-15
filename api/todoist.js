// Todoist integration — proxies Todoist REST API v2 so the dashboard can
// read and complete tasks without exposing the API token client-side.
//
// GET  /api/todoist?type=today   → today + overdue tasks across all projects
// GET  /api/todoist?type=fps     → all open tasks in the FPS Pipeline project
// POST /api/todoist              → { action: 'complete', taskId: '...' }
//
// Requires one environment variable in Vercel Settings → Environment Variables:
//   TODOIST_API_TOKEN   (from Todoist Settings → Integrations → Developer)

const TODOIST_BASE = 'https://api.todoist.com/api/v1';
const FPS_PROJECT_ID = '6h5862GhJxgJ54hr';

module.exports = async (req, res) => {
  const token = process.env.TODOIST_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'TODOIST_API_TOKEN not set in Vercel env vars' });
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // ── GET: fetch tasks ──────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { type } = req.query;

      let url;
      if (type === 'today') {
        // All tasks due today or overdue across every project
        url = `${TODOIST_BASE}/tasks?filter=${encodeURIComponent('today | overdue')}`;
      } else if (type === 'fps') {
        // All open tasks in the FPS Pipeline Todoist project
        url = `${TODOIST_BASE}/tasks?project_id=${FPS_PROJECT_ID}`;
      } else {
        return res.status(400).json({ error: 'type param required: "today" or "fps"' });
      }

      const r = await fetch(url, { headers });
      if (!r.ok) {
        const txt = await r.text();
        return res.status(r.status).json({ error: `Todoist API error: ${txt}` });
      }
      const data = await r.json();
      // v1 API wraps tasks under a "results" key; fall back to array for safety
      const tasks = Array.isArray(data) ? data : (data.results || []);
      return res.status(200).json({ tasks });
    }

    // ── POST: complete a task ─────────────────────────────────────────────────
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const { action, taskId } = body || {};

      if (action === 'complete' && taskId) {
        const r = await fetch(`${TODOIST_BASE}/tasks/${taskId}/close`, {
          method: 'POST',
          headers,
        });
        return res.status(200).json({ ok: r.ok, status: r.status });
      }

      return res.status(400).json({ error: 'Invalid body — expected { action: "complete", taskId }' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
