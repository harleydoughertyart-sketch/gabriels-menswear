/* What /api/book does. It takes the Request and deps (env, fetch, clock, ids, sleep, log) so
   scripts/test-bookings.mjs can run it against fakes; api/_lib/live.mjs gives the real ones. Nothing is stored
   here: Resend sends the emails and holds the scheduled reminder until it goes out. Logs carry a booking's id and
   date, or a reminder's Resend id, never a name or email address. */
import { SHOP, OCCASIONS, timesFor, reminderPlan, ics } from './shop.mjs';
import { confirmationEmail, reminderEmail, shopEmail } from './emails.mjs';
import { DEFAULT_FROM, sendEmail, verifyTurnstile } from './services.mjs';

const HOSTNAMES = ['gabrielsmenswear.com', 'www.gabrielsmenswear.com', 'gabriels-menswear.vercel.app'];
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const go = location => new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } });
// Back to the form, which says what went wrong. #booking-preview is the form itself, as the site's Book links use.
const back = code => go('/book?error=' + code + '#booking-preview');
const clientIp = request => request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();

// The form's fields, checked the way the page checks them. Returns null when anything is off.
export function readBooking(form, now) {
  const field = name => String(form.get(name) ?? '').trim();
  const date = field('date'), time = field('time'), fittingFor = field('fitting-for'), occasion = field('occasion'), email = field('email');
  const name = field('name').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (fittingFor !== 'solo' && fittingFor !== 'group') return null;
  let groupSize = null;
  if (fittingFor === 'group') {
    if (!/^\d{1,2}$/.test(field('group-size'))) return null;
    groupSize = Number(field('group-size'));
    if (groupSize < 2 || groupSize > 99) return null;
  }
  if (!OCCASIONS.includes(occasion) || !timesFor(date, now).includes(time)) return null;
  if (!name || name.length > 100 || email.length > 254 || !EMAIL.test(email)) return null;
  return { date, time, fittingFor, groupSize, occasion, name, email };
}

/* POST /api/book, the /book form. Turnstile first, so nothing is sent for a bot; then the form is checked the way
   the page checks it. The reminder is scheduled in Resend first (10 AM the day before, when that is 12 hours to 30
   days away) so the confirmation only promises one that is really coming; the shop's copy goes last and reports
   both, with a button that opens the reminder in Resend to cancel or move it. A reminder that can't be scheduled
   never stops the booking. Anything wrong goes back to the form with ?error=check|form|send, which the page
   explains. */
export async function handleBook(request, deps) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  let form;
  try { form = await request.formData(); } catch { return back('form'); }
  if (String(form.get('website') ?? '')) return go('/booked'); // the spam trap: look booked, do nothing

  const env = deps.env;
  const human = await verifyTurnstile(deps, {
    secret: env('TURNSTILE_SECRET_KEY'), token: String(form.get('cf-turnstile-response') ?? ''), ip: clientIp(request),
    action: 'book', hostnames: env('TURNSTILE_HOSTNAMES') ? env('TURNSTILE_HOSTNAMES').split(',').map(s => s.trim()) : HOSTNAMES,
  });
  if (!human.ok) { deps.log('book: turnstile refused', human.reason); return back('check'); }

  const now = deps.now(), fields = readBooking(form, now);
  if (!fields) { deps.log('book: form refused'); return back('form'); }
  const booking = { id: deps.uuid(), created: now.toISOString(), ...fields };
  const apiKey = env('RESEND_API_KEY'), from = env('MAIL_FROM') || DEFAULT_FROM, assetBase = SHOP.site;

  const plan = reminderPlan(booking, now), reminder = { status: plan.status, at: plan.at, id: '' };
  if (plan.status === 'schedule') {
    const email = reminderEmail(booking, { assetBase });
    const scheduled = await sendEmail(deps, {
      apiKey, idempotencyKey: 'remind/' + booking.id, from, to: [booking.email], subject: email.subject,
      html: email.html, text: email.text, scheduled_at: new Date(plan.at).toISOString(), tags: [{ name: 'category', value: 'reminder' }],
    });
    reminder.status = scheduled.ok ? 'scheduled' : 'failed';
    if (scheduled.ok) reminder.id = scheduled.id;
    else deps.log('book: reminder not scheduled', booking.id, booking.date, scheduled.error);
  }

  const confirmation = confirmationEmail(booking, { assetBase, reminder: reminder.status === 'scheduled' });
  const customer = await sendEmail(deps, {
    apiKey, idempotencyKey: 'confirm/' + booking.id, from, to: [booking.email], subject: confirmation.subject,
    html: confirmation.html, text: confirmation.text, tags: [{ name: 'category', value: 'confirmation' }],
    attachments: [{ filename: 'gabriels-menswear-fitting.ics', content: Buffer.from(ics(booking, now)).toString('base64') }],
  });
  if (!customer.ok) deps.log('book: confirmation failed', booking.id, booking.date, customer.error);

  // The shop copy goes last so it can say whether the confirmation went and when the reminder will.
  const to = env('SHOP_EMAIL').split(',').map(s => s.trim()).filter(Boolean);
  const copy = shopEmail(booking, { assetBase, reminder, customerSent: customer.ok });
  const shop = to.length
    ? await sendEmail(deps, {
      apiKey, idempotencyKey: 'shop/' + booking.id, from, to, reply_to: booking.email, subject: copy.subject,
      html: copy.html, text: copy.text, tags: [{ name: 'category', value: 'shop' }],
    })
    : { ok: false, error: 'SHOP_EMAIL is not set' };
  if (!shop.ok) deps.log('book: shop copy failed', booking.id, booking.date, shop.error);

  if (!customer.ok && !shop.ok) {
    // The page will say to call. The key can only send, so a reminder already scheduled stays in Resend: the log
    // names it for cancelling there.
    if (reminder.status === 'scheduled') deps.log('book: reminder still scheduled', booking.id, booking.date, 'resend id', reminder.id);
    return back('send');
  }
  deps.log('book: booked', booking.id, booking.date, customer.ok ? 'confirmed' : 'no confirmation', 'reminder ' + reminder.status, shop.ok ? 'shop told' : 'shop not told');
  return go('/booked');
}
