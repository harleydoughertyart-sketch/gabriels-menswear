/* Runs the booking functions (api/_lib/handlers.mjs) against stand-ins for Resend, Turnstile and the clock, so
   nothing here touches the network. Run with `node scripts/test-bookings.mjs`.
   "Now" is Thursday, October 22, 2026 at 2:00 PM in Holden (EDT) unless a test says otherwise. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleBook, readBooking } from '../api/_lib/handlers.mjs';
import { OCCASIONS, ics, googleCalendarUrl, timesFor, holdenNow, reminderPlan } from '../api/_lib/shop.mjs';
import { confirmationEmail, reminderEmail, shopEmail } from '../api/_lib/emails.mjs';
import { DEFAULT_FROM } from '../api/_lib/services.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';
const ENV = { TURNSTILE_SECRET_KEY: 'turnstile-secret', RESEND_API_KEY: 're_test', SHOP_EMAIL: 'shop@example.com' };
const NOW = '2026-10-22T18:00:00Z';
const SAM = {
  'fitting-for': 'group', 'group-size': '4', occasion: 'Wedding', date: '2026-11-14', time: '14:00',
  name: 'Sam Rivera', email: 'sam@example.com', 'cf-turnstile-response': 'token-from-widget', website: '',
};
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND = 'https://api.resend.com';
// The ids Resend hands back, in call order: the first email sent gets resendId(1).
const resendId = n => '4ef9a417-02e9-4d39-ad75-9611e0fcc3' + String(n).padStart(2, '0');
const timeout = () => Object.assign(new Error('timed out'), { name: 'TimeoutError' });

/* deps for the handlers, with every outside call recorded. resend(call, n) answers Resend's nth call with
   [status, body], or throws; the default sends everything. */
function fakes({ env = {}, now = NOW, turnstile = {}, resend } = {}) {
  const calls = [], verifies = [], logs = [], sleeps = [];
  const vars = { ...ENV, ...env };
  const deps = {
    env: name => String(vars[name] ?? '').trim(),
    now: () => new Date(now),
    uuid: () => ID,
    sleep: async ms => { sleeps.push(ms); },
    log: (...args) => logs.push(args.join(' ')),
    fetch: async (url, init) => {
      if (url === SITEVERIFY) {
        verifies.push(Object.fromEntries(init.body));
        if (turnstile.throws) throw timeout();
        return Response.json({ success: true, hostname: 'gabrielsmenswear.com', action: 'book', 'error-codes': [], ...turnstile.reply });
      }
      if (url.startsWith(RESEND + '/')) {
        const call = { path: url.slice(RESEND.length), ...JSON.parse(init.body), key: init.headers['Idempotency-Key'], auth: init.headers.Authorization };
        calls.push(call);
        const [status, body] = resend ? resend(call, calls.length) : [200, { id: resendId(calls.length) }];
        return Response.json(body, { status });
      }
      throw new Error('unexpected fetch ' + url);
    },
  };
  return { deps, calls, verifies, logs, sleeps, keys: () => calls.map(c => c.key) };
}

function bookRequest(fields = {}, method = 'POST') {
  const entries = Object.entries({ ...SAM, ...fields }).filter(([, value]) => value !== undefined);
  return new Request('https://gabrielsmenswear.com/api/book', {
    method, headers: { 'x-real-ip': '203.0.113.9' }, body: method === 'POST' ? new URLSearchParams(entries) : undefined,
  });
}
const location = res => res.headers.get('location');
const BACK = code => '/book?error=' + code + '#booking-preview';

/* /api/book */

test('a booking schedules the reminder, confirms, copies the shop, then goes to /booked', async () => {
  const f = fakes();
  const res = await handleBook(bookRequest(), f.deps);
  assert.equal(res.status, 303);
  assert.equal(location(res), '/booked');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(f.verifies, [{ secret: 'turnstile-secret', response: 'token-from-widget', remoteip: '203.0.113.9' }]);
  assert.deepEqual(f.keys(), ['remind/' + ID, 'confirm/' + ID, 'shop/' + ID]);
  const [remind, confirm, shop] = f.calls;

  // Saturday, November 14 is on standard time: 10 AM the day before is 15:00 UTC.
  assert.equal(remind.path, '/emails');
  assert.equal(remind.scheduled_at, '2026-11-13T15:00:00.000Z');
  assert.deepEqual(remind.to, ['sam@example.com']);
  assert.equal(remind.from, DEFAULT_FROM);
  assert.equal(remind.subject, 'See you tomorrow at 2:00 PM');
  assert.equal(remind.attachments, undefined);

  assert.equal(confirm.auth, 'Bearer re_test');
  assert.equal(confirm.scheduled_at, undefined);
  assert.deepEqual(confirm.to, ['sam@example.com']);
  assert.equal(confirm.subject, 'You’re booked for Saturday, November 14 at 2:00 PM');
  assert.match(confirm.html, /Group of 4 · Wedding/);
  assert.match(confirm.html, /I’ll email you a reminder the day before\./);
  assert.equal(confirm.attachments[0].filename, 'gabriels-menswear-fitting.ics');
  assert.match(Buffer.from(confirm.attachments[0].content, 'base64').toString(), /\r\nDTSTART:20261114T190000Z\r\n/);

  assert.deepEqual(shop.to, ['shop@example.com']);
  assert.equal(shop.reply_to, 'sam@example.com');
  assert.equal(shop.subject, 'Sam Rivera booked Sat, Nov 14 at 2:00 PM');
  assert.match(shop.text, /^Reminder: Fri, Nov 13 at 10:00 AM$/m);
  // The Stop button opens the scheduled reminder in Resend's dashboard, where it can be cancelled or moved.
  const stop = 'https://resend.com/emails/' + resendId(1);
  assert.match(shop.html, new RegExp(`<a href="${stop}"[^>]*>Stop the reminder</a>`));
  assert.ok(shop.text.includes(`Stop the reminder: ${stop}\nOpens it in Resend. Under the three dots at the top right, pick Cancel schedule, or Edit schedule to move it.`));
});

test('the reminder time follows daylight time: EDT in October, EST from the morning the clocks change', async () => {
  const edt = fakes();
  await handleBook(bookRequest({ date: '2026-10-31', time: '14:00' }), edt.deps); // Saturday
  assert.equal(edt.calls[0].scheduled_at, '2026-10-30T14:00:00.000Z');
  assert.match(Buffer.from(edt.calls[1].attachments[0].content, 'base64').toString(), /\r\nDTSTART:20261031T180000Z\r\n/);
  const changeover = fakes();
  await handleBook(bookRequest({ date: '2026-11-02', time: '11:00' }), changeover.deps); // Monday; clocks went back Sunday at 2 AM
  assert.equal(changeover.calls[0].scheduled_at, '2026-11-01T15:00:00.000Z');
});

test('a reminder due at least 12 hours out is scheduled; one due sooner is not', async () => {
  const visit = { date: '2026-10-24', time: '14:00' }; // reminder: Friday the 23rd, 10 AM EDT = 14:00 UTC
  const edge = fakes({ now: '2026-10-23T02:00:00Z' });
  await handleBook(bookRequest(visit), edge.deps);
  assert.deepEqual(edge.keys(), ['remind/' + ID, 'confirm/' + ID, 'shop/' + ID]);
  assert.equal(edge.calls[0].scheduled_at, '2026-10-23T14:00:00.000Z');

  const late = fakes({ now: '2026-10-23T02:01:00Z' });
  assert.equal(location(await handleBook(bookRequest(visit), late.deps)), '/booked');
  assert.deepEqual(late.keys(), ['confirm/' + ID, 'shop/' + ID]);
  assert.doesNotMatch(late.calls[0].html + late.calls[0].text, /reminder/i);
  assert.match(late.calls[1].text, /^Reminder: No reminder email\. The visit is too soon for one\.$/m);
  assert.doesNotMatch(late.calls[1].html + late.calls[1].text, /resend\.com|Stop the reminder/);
});

test('a reminder due up to 29 days 23 hours out is scheduled; one due later is not', async () => {
  const visit = { date: '2026-11-21', time: '14:00' }; // reminder: Friday the 20th, 10 AM EST = 15:00 UTC
  const edge = fakes({ now: '2026-10-21T16:00:00Z' });
  await handleBook(bookRequest(visit), edge.deps);
  assert.deepEqual(edge.keys(), ['remind/' + ID, 'confirm/' + ID, 'shop/' + ID]);
  assert.equal(edge.calls[0].scheduled_at, '2026-11-20T15:00:00.000Z');

  const early = fakes({ now: '2026-10-21T15:59:00Z' });
  assert.equal(location(await handleBook(bookRequest(visit), early.deps)), '/booked');
  assert.deepEqual(early.keys(), ['confirm/' + ID, 'shop/' + ID]);
  assert.doesNotMatch(early.calls[0].text, /reminder/i);
  assert.match(early.calls[1].text, /^Reminder: No reminder email\. This booking is more than 30 days away\.$/m);
});

test('reminderPlan names the edges', () => {
  const b = { date: '2026-11-21' }, at = Date.parse('2026-11-20T15:00:00Z'), h = 36e5;
  assert.deepEqual(reminderPlan(b, new Date(at - 12 * h)), { at, status: 'schedule' });
  assert.deepEqual(reminderPlan(b, new Date(at - 12 * h + 1)), { at, status: 'soon' });
  assert.deepEqual(reminderPlan(b, new Date(at - (29 * 24 + 23) * h)), { at, status: 'schedule' });
  assert.deepEqual(reminderPlan(b, new Date(at - (29 * 24 + 23) * h - 1)), { at, status: 'far' });
});

test('a reminder that can’t be scheduled never stops the booking', async () => {
  const f = fakes({ resend: (call, n) => call.key.startsWith('remind/') ? [500, { name: 'application_error' }] : [200, { id: resendId(n) }] });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
  assert.deepEqual(f.keys(), ['remind/' + ID, 'remind/' + ID, 'confirm/' + ID, 'shop/' + ID]); // one retry after a 5xx
  assert.deepEqual(f.sleeps, [1000]);
  assert.doesNotMatch(f.calls[2].text, /reminder/i);
  assert.match(f.calls[3].text, /^Reminder: The reminder couldn’t be scheduled\.$/m);
  assert.doesNotMatch(f.calls[3].html + f.calls[3].text, /resend\.com|Stop the reminder/);
});

test('a Resend timeout isn’t retried, so a slow Resend still leaves time to answer', async () => {
  const f = fakes({ resend: (call, n) => { if (call.key.startsWith('remind/')) throw timeout(); return [200, { id: resendId(n) }]; } });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
  assert.deepEqual(f.keys(), ['remind/' + ID, 'confirm/' + ID, 'shop/' + ID]);
  assert.match(f.calls[2].text, /The reminder couldn’t be scheduled\./);
});

test('logs carry the booking id and date, never the name or email', async () => {
  const f = fakes({ resend: (call, n) => call.key.startsWith('confirm/') ? [422, { name: 'validation_error', message: 'Invalid `to` field: sam@example.com' }] : [200, { id: resendId(n) }] });
  await handleBook(bookRequest(), f.deps);
  assert.ok(f.logs.some(line => line.includes(ID) && line.includes('2026-11-14')));
  for (const line of f.logs) assert.doesNotMatch(line, /Sam|Rivera|sam@example\.com/, line);
});

test('the spam trap looks booked and does nothing', async () => {
  const f = fakes();
  const res = await handleBook(bookRequest({ website: 'https://spam.example' }), f.deps);
  assert.equal(res.status, 303);
  assert.equal(location(res), '/booked');
  assert.equal(f.verifies.length + f.calls.length, 0);
});

test('a failed Turnstile check goes back with error=check before any email', async () => {
  const cases = [
    ['refused', { turnstile: { reply: { success: false, 'error-codes': ['invalid-input-response'] } } }],
    ['no token', {}, { 'cf-turnstile-response': '' }],
    ['token too long', {}, { 'cf-turnstile-response': 'x'.repeat(2049) }],
    ['no secret set, so it fails closed', { env: { TURNSTILE_SECRET_KEY: '' } }],
    ['siteverify unreachable', { turnstile: { throws: true } }],
    ['token from another site', { turnstile: { reply: { hostname: 'evil.example' } } }],
    ['token from another widget', { turnstile: { reply: { action: 'login' } } }],
  ];
  for (const [label, options, fields] of cases) {
    const f = fakes(options);
    const res = await handleBook(bookRequest(fields), f.deps);
    assert.equal(location(res), BACK('check'), label);
    assert.equal(f.calls.length, 0, label);
  }
});

test('TURNSTILE_HOSTNAMES widens the hostnames a token may come from', async () => {
  const f = fakes({ env: { TURNSTILE_HOSTNAMES: 'gabrielsmenswear.com, preview.example' }, turnstile: { reply: { hostname: 'preview.example' } } });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
});

test("Cloudflare's always-pass test secret skips the hostname and action checks", async () => {
  const f = fakes({ env: { TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' }, turnstile: { reply: { hostname: 'example.com', action: '' } } });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
});

test('the server turns away what the page would not offer', async () => {
  const cases = {
    'Saturday at 5:00 PM, closing time': { time: '17:00' },
    'Sunday before noon': { date: '2026-11-15', time: '11:30' },
    'a weekday at 6:00 PM': { date: '2026-11-13', time: '18:00' },
    'not on the half hour': { time: '14:15' },
    'earlier today': { date: '2026-10-22', time: '13:00' },
    'yesterday': { date: '2026-10-21', time: '14:00' },
    'more than a year ahead': { date: '2027-10-23', time: '14:00' },
    'a date that doesn’t exist': { date: '2026-02-30' },
    'a group with no size': { 'group-size': '' },
    'a group of one': { 'group-size': '1' },
    'a group of 100': { 'group-size': '100' },
    'a size that isn’t a number': { 'group-size': '4.5' },
    'neither solo nor group': { 'fitting-for': 'family' },
    'an occasion not on the list': { occasion: 'Funeral' },
    'no name': { name: '   ' },
    'a name over 100 characters': { name: 'x'.repeat(101) },
    'no email': { email: '' },
    'an email with no domain': { email: 'sam@' },
    'two emails': { email: 'a@example.com,b@example.com' },
    'an email with a header break': { email: 'sam@example.com\r\nBcc: x@example.com' },
    'missing fields': { date: undefined, time: undefined },
  };
  for (const [label, fields] of Object.entries(cases)) {
    const f = fakes();
    const res = await handleBook(bookRequest(fields), f.deps);
    assert.equal(location(res), BACK('form'), label);
    assert.equal(f.calls.length, 0, label);
  }
});

test('the starts the page offers are accepted', () => {
  const now = new Date(NOW), form = fields => new URLSearchParams({ ...SAM, ...fields });
  assert.equal(readBooking(form({ date: '2026-11-13', time: '17:30' }), now)?.time, '17:30'); // weekday, last start
  assert.equal(readBooking(form({ date: '2026-11-15', time: '12:00' }), now)?.time, '12:00'); // Sunday, first start
  assert.equal(readBooking(form({ date: '2026-11-15', time: '15:30' }), now)?.time, '15:30'); // Sunday, last start
  assert.equal(readBooking(form({ date: '2026-11-14', time: '16:30' }), now)?.time, '16:30'); // Saturday, last start
  assert.equal(readBooking(form({ date: '2026-10-22', time: '14:00' }), now)?.time, '14:00'); // today, the start now
  assert.equal(readBooking(form({ date: '2027-10-22', time: '14:00' }), now)?.date, '2027-10-22'); // a year ahead
  const solo = readBooking(form({ 'fitting-for': 'solo', 'group-size': '' }), now);
  assert.equal(solo.fittingFor, 'solo');
  assert.equal(solo.groupSize, null);
  assert.equal(readBooking(form({ name: '  Sam \n\t Rivera  ' }), now).name, 'Sam Rivera');
  // A start that passed a few minutes ago still goes through, for a form sent just after it.
  assert.equal(readBooking(form({ date: '2026-10-22', time: '14:00' }), new Date('2026-10-22T18:10:00Z'))?.time, '14:00');
  assert.equal(readBooking(form({ date: '2026-10-22', time: '14:00' }), new Date('2026-10-22T18:20:00Z')), null);
});

test('"today" is Holden’s date, not UTC’s', () => {
  const lateEvening = new Date('2026-10-23T02:30:00Z'); // 10:30 PM on the 22nd in Holden
  assert.deepEqual(holdenNow(lateEvening), { today: '2026-10-22', minutes: 22 * 60 + 30 });
  assert.deepEqual(timesFor('2026-10-22', lateEvening), []);
  assert.equal(timesFor('2026-10-23', lateEvening)[0], '11:00');
});

test('when the confirmation fails the shop copy says so, and the visitor still sees /booked', async () => {
  const f = fakes({ resend: (call, n) => call.key.startsWith('confirm/') ? [422, { name: 'validation_error' }] : [200, { id: resendId(n) }] });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
  assert.deepEqual(f.keys(), ['remind/' + ID, 'confirm/' + ID, 'shop/' + ID]); // a 422 isn't retried
  assert.match(f.calls[2].text, /The confirmation email to sam@example\.com didn’t go through/);
});

test('when neither email goes out the visitor is asked to call, and the log names the reminder left in Resend', async () => {
  const f = fakes({ resend: (call, n) => call.key.startsWith('remind/') ? [200, { id: resendId(n) }] : [500, { name: 'application_error' }] });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), BACK('send'));
  assert.deepEqual(f.keys(), ['remind/' + ID, 'confirm/' + ID, 'confirm/' + ID, 'shop/' + ID, 'shop/' + ID]);
  assert.ok(f.logs.some(line => line.includes('reminder still scheduled') && line.includes(ID) && line.includes(resendId(1))));
});

test('Resend gets one retry after a 429, with the same Idempotency-Key', async () => {
  const f = fakes({ resend: (call, n) => n === 2 ? [429, { name: 'rate_limit_exceeded' }] : [200, { id: resendId(n) }] });
  assert.equal(location(await handleBook(bookRequest(), f.deps)), '/booked');
  assert.deepEqual(f.keys(), ['remind/' + ID, 'confirm/' + ID, 'confirm/' + ID, 'shop/' + ID]);
  assert.deepEqual(f.sleeps, [1000]);
});

test('without SHOP_EMAIL the shop copy is skipped; without RESEND_API_KEY nothing is sent', async () => {
  const noShop = fakes({ env: { SHOP_EMAIL: '' } });
  assert.equal(location(await handleBook(bookRequest(), noShop.deps)), '/booked');
  assert.deepEqual(noShop.keys(), ['remind/' + ID, 'confirm/' + ID]);
  const noKey = fakes({ env: { RESEND_API_KEY: '' } });
  assert.equal(location(await handleBook(bookRequest(), noKey.deps)), BACK('send'));
  assert.equal(noKey.calls.length, 0);
});

test('MAIL_FROM changes the sender, and SHOP_EMAIL can list more than one inbox', async () => {
  const f = fakes({ env: { MAIL_FROM: 'Test <test@example.com>', SHOP_EMAIL: 'a@example.com, b@example.com' } });
  await handleBook(bookRequest(), f.deps);
  assert.deepEqual(f.calls.map(c => c.from), Array(3).fill('Test <test@example.com>'));
  assert.deepEqual(f.calls[2].to, ['a@example.com', 'b@example.com']);
});

test('/api/book only takes POST', async () => {
  const res = await handleBook(bookRequest({}, 'GET'), fakes().deps);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'POST');
});

test('what a visitor types is escaped in every email', async () => {
  const f = fakes();
  await handleBook(bookRequest({ name: '<img src=x onerror=alert(1)> "Bo" & Co' }), f.deps);
  assert.equal(f.calls.length, 3);
  for (const { html } of f.calls) {
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;img/);
  }
});

/* The emails and the calendar file */

test('the emails read right for one person and for a group', () => {
  const solo = { id: ID, created: '2026-10-22T18:00:00.000Z', date: '2026-11-14', time: '14:00', fittingFor: 'solo', groupSize: null, occasion: 'Prom', name: 'Sam Rivera', email: 'sam@example.com' };
  const group = { ...solo, fittingFor: 'group', groupSize: 4, occasion: 'Wedding' };
  const scheduled = { status: 'scheduled', at: Date.parse('2026-11-13T15:00:00Z'), id: resendId(7) };
  assert.match(confirmationEmail(solo).html, /Just you · Prom/);
  assert.match(confirmationEmail(group).html, /Group of 4 · Wedding/);
  assert.match(shopEmail(solo).text, /^Party: One person$/m);
  assert.match(shopEmail(group).text, /^Party: Group of 4$/m);
  assert.match(shopEmail(group).text, /^Booked: Thu, Oct 22 at 2:00 PM$/m);
  assert.equal(reminderEmail(solo).subject, 'See you tomorrow at 2:00 PM');
  for (const email of [confirmationEmail(solo, { reminder: true }), reminderEmail(solo), shopEmail(solo, { reminder: scheduled }), shopEmail(group, { reminder: { status: 'far' } })]) {
    assert.doesNotMatch(email.html + email.text, /undefined|null|NaN|\[object/);
    assert.match(email.html, /src="https:\/\/gabrielsmenswear\.com\/assets\/email\/gm-logo-email-440\.png"/);
    assert.doesNotMatch(email.text, /['—–;]/); // ’ apostrophes, and no dashes or semicolons in the copy
  }
});

test('a visit next year shows the year', () => {
  const b = { id: ID, created: '2026-10-22T18:00:00.000Z', date: '2027-06-12', time: '14:00', fittingFor: 'solo', groupSize: null, occasion: 'Work', name: 'Sam', email: 'sam@example.com' };
  assert.equal(confirmationEmail(b).subject, 'You’re booked for Saturday, June 12, 2027 at 2:00 PM');
});

test('the calendar file is CRLF and UTC, with METHOD:PUBLISH, a fixed UID and an alert a day ahead', () => {
  const text = ics({ id: ID, date: '2026-11-14', time: '14:00' }, new Date(NOW));
  assert.ok(text.endsWith('\r\n'));
  assert.doesNotMatch(text.replaceAll('\r\n', ''), /[\r\n]/);
  const lines = text.trimEnd().split('\r\n');
  for (const line of ['BEGIN:VCALENDAR', 'VERSION:2.0', 'METHOD:PUBLISH', `UID:${ID}@gabrielsmenswear.com`, 'DTSTAMP:20261022T180000Z',
    'DTSTART:20261114T190000Z', 'DTEND:20261114T200000Z', 'LOCATION:1363 Main St\\, Holden\\, MA 01520', 'END:VCALENDAR']) {
    assert.ok(lines.includes(line), line);
  }
  const alarm = lines.slice(lines.indexOf('BEGIN:VALARM'), lines.indexOf('END:VALARM') + 1);
  assert.deepEqual(alarm, ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Fitting at Gabriel’s Menswear', 'TRIGGER:-P1D', 'END:VALARM']);
  assert.ok(lines.indexOf('END:VALARM') < lines.indexOf('END:VEVENT'));
  for (const line of lines) assert.ok(Buffer.byteLength(line) <= 75, 'longer than 75 octets: ' + line);
  assert.match(googleCalendarUrl({ date: '2026-11-14', time: '14:00' }), /&dates=20261114T190000Z\/20261114T200000Z&/);
});

test('a summer visit is on daylight time', () => {
  assert.match(ics({ id: ID, date: '2027-06-12', time: '14:00' }, new Date(NOW)), /\r\nDTSTART:20270612T180000Z\r\nDTEND:20270612T190000Z\r\n/);
  assert.match(googleCalendarUrl({ date: '2027-06-12', time: '14:00' }), /&dates=20270612T180000Z\/20270612T190000Z&/);
});

/* The /book page */

test('the /book form posts to /api/book with the fields the server reads, and nothing for FormSubmit', async () => {
  for (const file of ['book.html', 'webflow/build/book/schedule.html']) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    const form = html.match(/<form\b[^>]*id="booking-preview"[^>]*>[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, file + ' has the booking form');
    const tag = form.match(/^<form\b[^>]*>/)[0];
    assert.match(tag, /\baction="\/api\/book"/, file);
    assert.match(tag, /\bmethod="post"/i, file);
    assert.doesNotMatch(tag, /target=/, file);
    for (const name of ['fitting-for', 'group-size', 'occasion', 'date', 'time', 'name', 'email', 'website']) {
      assert.match(form, new RegExp(`name="${name}"`), `${file} sends ${name}`);
    }
    assert.match(form, /class="[^"]*\bcf-turnstile\b[^"]*"[^>]*data-action="book"/, file);
    assert.deepEqual([...form.matchAll(/<option>([^<]+)<\/option>/g)].map(m => m[1]), OCCASIONS, file);
    assert.doesNotMatch(form, /name="_|name="appointment"|name="party"|formsubmit/i, file);
  }
});
