// Live read-only calendar feed for the dashboard.
// GET /api/calendar -> { events: [...], updatedAt }
//
// Pulls Lawrence's Google Calendar via the "secret address in iCal format"
// (Calendar Settings -> Integrate calendar -> Secret address in iCal format),
// stored as the GCAL_ICS_URL environment variable in Vercel. Expands recurring
// events and returns everything in the next 7 days, sorted by start time.
// No OAuth, no scheduled task, no manual refresh - this runs fresh on every
// page load.

const ical = require('node-ical');

module.exports = async (req, res) => {
  try {
    const url = process.env.GCAL_ICS_URL;
    if (!url) {
      return res.status(500).json({ error: 'GCAL_ICS_URL not set', events: [] });
    }

    const data = await ical.async.fromURL(url);

    const now = new Date();
    const rangeEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = [];

    for (const key in data) {
      const ev = data[key];
      if (!ev || ev.type !== 'VEVENT') continue;

      if (ev.rrule) {
        // Recurring event - expand occurrences that fall in our window.
        let occurrences = [];
        try {
          occurrences = ev.rrule.between(now, rangeEnd, true);
        } catch (e) {
          occurrences = [];
        }
        for (const occ of occurrences) {
          events.push(toEventObj(ev, occ));
        }
      } else if (ev.start) {
        const start = new Date(ev.start);
        if (start >= now && start <= rangeEnd) {
          events.push(toEventObj(ev, start));
        }
      }
    }

    events.sort((a, b) => new Date(a.start) - new Date(b.start));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // 5 min edge cache
    return res.status(200).json({ events, updatedAt: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: String(err), events: [] });
  }
};

function toEventObj(ev, startDate) {
  const allDay = ev.datetype === 'date';
  return {
    title: ev.summary || '(untitled)',
    start: startDate.toISOString(),
    allDay: !!allDay,
    location: ev.location || ''
  };
}
