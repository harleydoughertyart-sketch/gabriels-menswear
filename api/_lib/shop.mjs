/* Shop facts, Holden time and the visit's labels, calendar entry and reminder time, shared by the booking
   functions. Hours and starts match assets/wf/book-controls.js: Mon-Fri 11-6, Sat 11-5, Sun 12-4, a start every
   half hour until half an hour before closing, from today up to a year ahead. */

export const SHOP = {
  name: 'Gabriel’s Menswear',
  address: '1363 Main St, Holden, MA 01520',
  phone: '(508) 829-5186',
  tel: 'tel:+15088295186',
  site: 'https://gabrielsmenswear.com',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=1363%20Main%20St%2C%20Holden%2C%20MA%2001520',
};
export const ZONE = 'America/New_York';
export const OCCASIONS = ['Wedding', 'Prom', 'Work', 'Something else'];
export const MAX_DAYS_AHEAD = 365;
// The page hides starts that have passed. The server allows a few minutes more for a form sent just after one.
const GRACE_MINUTES = 15;

// The reminder goes out at 10:00 AM Holden time the day before the visit. Resend holds a scheduled email for 30
// days at most, and one due within 12 hours of booking would land right after the confirmation, so neither is sent.
const HOUR = 36e5;
export const REMINDER = { time: '10:00', minLead: 12 * HOUR, maxLead: (29 * 24 + 23) * HOUR };

function holdenParts(date) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(x => [x.type, x.value]));
}

// Today's date in Holden and the minutes since its midnight.
export function holdenNow(now) {
  const p = holdenParts(now);
  return { today: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

// The starts that can be booked on a date, as "HH:MM", given the time now.
export function timesFor(value, now) {
  if (!isDate(value)) return [];
  const { today, minutes } = holdenNow(now);
  if (value < today || value > addDays(today, MAX_DAYS_AHEAD)) return [];
  const day = new Date(value + 'T12:00:00Z').getUTCDay();
  const open = day === 0 ? 720 : 660, close = day === 0 ? 960 : day === 6 ? 1020 : 1080, out = [];
  for (let n = open; n < close; n += 30) {
    if (value === today && n < minutes - GRACE_MINUTES) continue;
    out.push(String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'));
  }
  return out;
}

const utcDate = iso => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const format = (options, ms) => new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(ms);

// "Saturday, November 14", with the year when the visit falls in a later year than the booking was made.
export function longDate(b) {
  const later = b.created && b.date.slice(0, 4) > holdenNow(new Date(b.created)).today.slice(0, 4);
  return format({ weekday: 'long', month: 'long', day: 'numeric', ...(later ? { year: 'numeric' } : {}) }, utcDate(b.date));
}
export const shortDate = b => format({ weekday: 'short', month: 'short', day: 'numeric' }, utcDate(b.date));
export function timeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM');
}
export const whenLabel = b => longDate(b) + ' at ' + timeLabel(b.time);
export const firstName = b => b.name.split(' ')[0];

// "Group of 4" or, for one person, "Just you" to the customer and "One person" to the shop.
export const party = (b, audience) =>
  b.fittingFor === 'group' ? 'Group of ' + b.groupSize : audience === 'shop' ? 'One person' : 'Just you';

// An instant as Holden's clock shows it: "Thu, Oct 22 at 6:33 PM"
export function holdenLabel(ms) {
  const p = holdenParts(new Date(ms));
  return shortDate({ date: `${p.year}-${p.month}-${p.day}` }) + ' at ' + timeLabel(`${p.hour}:${p.minute}`);
}

// A wall time in Holden as UTC milliseconds. Holden's offset that day (EST or EDT) moves the wall time; the clocks
// change at 2 AM, hours away from shop hours and the 10 AM reminder, so the offset at the wall time is the right one.
export function holdenUtc(date, hhmm) {
  const [h, min] = hhmm.split(':').map(Number), wall = utcDate(date) + (h * 60 + min) * 60000;
  const p = holdenParts(new Date(wall));
  return wall - (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - wall);
}
export const startUtc = b => holdenUtc(b.date, b.time);

// When the reminder would go out (UTC milliseconds) and whether it can: 'schedule', or 'soon' or 'far' when not.
export function reminderPlan(b, now) {
  const at = holdenUtc(addDays(b.date, -1), REMINDER.time), lead = at - now.getTime();
  return { at, status: lead < REMINDER.minLead ? 'soon' : lead > REMINDER.maxLead ? 'far' : 'schedule' };
}

// The calendar entry, as on /booked: one hour, the shop's address, how to change it, and an alert a day ahead
// for calendars that take one (the reminder email can't go out for visits more than 30 days away).
const EVENT = { title: 'Fitting at Gabriel’s Menswear', note: 'To change or cancel, call (508) 829-5186.' };
const stamp = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = s => s.replace(/[\\,;]/g, '\\$&');

export function ics(b, now) {
  const start = startUtc(b);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gabriels Menswear//Fitting//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${b.id}@gabrielsmenswear.com`, 'DTSTAMP:' + stamp(now.getTime()), 'DTSTART:' + stamp(start),
    'DTEND:' + stamp(start + HOUR), 'SUMMARY:' + icsText(EVENT.title), 'LOCATION:' + icsText(SHOP.address),
    'DESCRIPTION:' + icsText(EVENT.note), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(EVENT.title),
    'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

export function googleCalendarUrl(b) {
  const start = startUtc(b);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(EVENT.title) +
    '&dates=' + stamp(start) + '/' + stamp(start + HOUR) + '&location=' + encodeURIComponent(SHOP.address) +
    '&details=' + encodeURIComponent(EVENT.note);
}
