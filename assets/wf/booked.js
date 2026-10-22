/* /booked: FormSubmit's _next brings people here after its spam check. Just before sending, the /book form
   saved the visit in this browser as gm-booking (date, time, group, occasion; never the name or email).
   With it the page shows the date and time, the party and calendar links, and counts book_confirmed once.
   Without it (another browser, storage blocked, or over a day old) the page still confirms, minus those. */
(() => {
  const root = document.querySelector('.gm-booked');
  if (!root) return;
  let b = null;
  try { b = JSON.parse(localStorage.getItem('gm-booking') || 'null'); } catch (e) { b = null; }
  if (!b || !/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.time || '') || !(Date.now() - b.saved < 864e5)) return;

  // The visit's Holden wall time, held as if it were UTC so Intl never shifts it.
  const [y, m, d] = b.date.split('-').map(Number), [h, min] = b.time.split(':').map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min);
  const visit = root.querySelector('.gm-booked__visit');
  // No-break spaces keep "October 24" and "at 11:00 AM" whole, so a narrow card wraps before "at".
  visit.querySelector('.gm-booked__when').textContent =
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(wall).replace(/ (\d+)$/, '\u00a0$1') + ' at\u00a0' +
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(wall).replace(/\s/g, '\u00a0');
  const size = Number(b.group_size);
  visit.querySelector('.gm-booked__party').textContent =
    [b.fitting_for === 'group' ? (size > 1 ? 'Group of ' + size : 'Group fitting') : 'Just you', b.occasion].filter(Boolean).join(' · ');
  visit.hidden = false;

  // Calendar links carry the time in UTC: Holden's offset that day (EST or EDT) moves the wall time.
  // Shop hours never fall near the 2 AM clock change, so the offset at the wall time is the right one.
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(wall).map(x => [x.type, x.value]));
    const start = wall - (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - wall), end = start + 36e5;
    const stamp = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const what = 'Fitting at Gabriel’s Menswear', where = '1363 Main St, Holden, MA 01520', note = 'To change or cancel, call (508) 829-5186.';
    const esc = s => s.replace(/[\\,;]/g, '\\$&');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gabriels Menswear//Fitting//EN', 'BEGIN:VEVENT',
      'UID:' + b.saved + '@gabrielsmenswear.com', 'DTSTAMP:' + stamp(Date.now()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
      'SUMMARY:' + esc(what), 'LOCATION:' + esc(where), 'DESCRIPTION:' + esc(note), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const links = root.querySelector('.gm-booked__calendar');
    links.querySelector('[data-calendar=google]').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(what) +
      '&dates=' + stamp(start) + '/' + stamp(end) + '&location=' + encodeURIComponent(where) + '&details=' + encodeURIComponent(note);
    links.querySelector('[data-calendar=ics]').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    links.hidden = false;
  } catch (e) { /* no calendar links */ }

  if (!b.counted) {
    window.gmTrack && gmTrack('book_confirmed', { fitting_for: b.fitting_for, occasion: b.occasion });
    try { b.counted = true; localStorage.setItem('gm-booking', JSON.stringify(b)); } catch (e) { /* may count again on reload */ }
  }
})();
