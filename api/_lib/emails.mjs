/* The three booking emails: the customer's confirmation, the reminder the day before and the shop's copy.
   Each returns { subject, html, text }. The HTML is tables with inline styles so Gmail, Outlook and Apple Mail
   agree; it matches the /booked card (cream page, white card, navy ink, steel-blue accent). Every value the
   customer typed goes through escapeHtml. The logo is baked onto white so a dark-mode client can't hide it. */
import { SHOP, longDate, timeLabel, shortDate, whenLabel, firstName, party, holdenLabel, googleCalendarUrl } from './shop.mjs';

const C = { canvas: '#f7f5f1', card: '#ffffff', ink: '#152238', soft: '#51617a', accent: '#33627c', tint: '#eef2f5', rule: '#e6e2db' };
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";
const SANS = 'Archivo,Arial,Helvetica,sans-serif';

export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = escapeHtml;
const font = (family, size, line, color, extra = '') => `font-family:${family};font-size:${size}px;line-height:${line}px;color:${color};${extra}`;

// No-break spaces keep "November 14" and "at 2:00 PM" whole, as on /booked, so a phone wraps before "at".
const whenHtml = b => h(longDate(b)).replace(/ (\d+)$/, '&nbsp;$1') + ' at&nbsp;' + h(timeLabel(b.time)).replace(' ', '&nbsp;');

const kicker = text => `<p style="margin:0 0 10px;${font(SANS, 12, 16, C.accent, 'font-weight:600;letter-spacing:1px;text-transform:uppercase;')}">${text}</p>`;
const title = html => `<h1 class="gm-h1" style="margin:0;${font(SERIF, 34, 40, C.ink, 'font-weight:600;')}">${html}</h1>`;
const em = text => `<em style="font-style:italic;color:${C.accent};">${text}</em>`;
const visit = (when, detail) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr><td style="border-left:3px solid ${C.accent};background-color:${C.tint};border-radius:10px;padding:16px 18px;"><p style="margin:0;${font(SERIF, 22, 29, C.ink, 'font-weight:600;')}">${when}</p>${detail ? `<p style="margin:6px 0 0;${font(SANS, 15, 22, C.soft)}">${detail}</p>` : ''}</td></tr></table>`;
const rows = items => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid ${C.rule};">${items.map(([label, value]) =>
  `<tr><td class="gm-l" valign="top" width="38%" style="padding:14px 16px 0 0;${font(SANS, 14, 21, C.soft)}">${label}</td><td class="gm-v" valign="top" style="padding:14px 0 0;${font(SANS, 15, 22, C.ink)}">${value}</td></tr>`).join('')}</table>`;
const link = (href, text, color = C.accent) => `<a href="${h(href)}" target="_blank" style="color:${color};font-weight:600;text-decoration:underline;">${text}</a>`;
const button = (href, text) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;"><tr><td align="center" bgcolor="${C.accent}" style="border-radius:999px;background-color:${C.accent};"><a href="${h(href)}" target="_blank" style="display:inline-block;padding:14px 28px;${font(SANS, 15, 20, '#ffffff', 'font-weight:600;text-decoration:none;border-radius:999px;')}">${text}</a></td></tr></table>`;
const note = text => `<p style="margin:10px 0 0;${font(SANS, 13, 19, C.soft)}">${text}</p>`;
const para = text => `<p style="margin:22px 0 0;${font(SANS, 15, 23, C.ink)}">${text}</p>`;
const warning = text => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr><td style="border-left:3px solid #a2492c;background-color:#f9eee8;border-radius:10px;padding:12px 16px;${font(SANS, 14, 21, '#6b2c18')}">${text}</td></tr></table>`;
const signoff = `<p style="margin:32px 0 0;${font(SANS, 15, 22, C.ink)}">See you then,</p><p style="margin:2px 0 0;${font(SERIF, 24, 30, C.ink, 'font-style:italic;')}">Gabriel</p>`;

const footerShop = `${SHOP.name} · ${SHOP.address} · ${link(SHOP.tel, SHOP.phone, C.soft)}`;
const siteLink = link(SHOP.site + '/', 'gabrielsmenswear.com', C.soft);
const footerShopText = `${SHOP.name} · ${SHOP.address} · ${SHOP.phone}`;

function layout({ subject, preheader, assetBase, body, footer }) {
  const logo = `${assetBase}/assets/email/gm-logo-email-440.png`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, address=no, email=no, date=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${h(subject)}</title>
<style>
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:500 700;src:url(${SHOP.site}/assets/fonts/playfair-latin.woff2) format('woff2');}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:500 600;src:url(${SHOP.site}/assets/fonts/playfair-italic-latin.woff2) format('woff2');}
:root{color-scheme:light only;supported-color-schemes:light only;}
body{margin:0;padding:0;-webkit-text-size-adjust:100%;}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
@media only screen and (max-width:620px){
.gm-card{padding:28px 22px 32px!important;}
.gm-h1{font-size:30px!important;line-height:36px!important;}
.gm-l,.gm-v{display:block!important;width:auto!important;}
.gm-v{padding-top:2px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.canvas};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.canvas};">${h(preheader)}${'&#847;&zwnj;&nbsp;'.repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.canvas};">
<tr><td align="center" style="padding:32px 14px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td class="gm-card" style="background-color:${C.card};border-radius:18px;padding:36px 44px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:0 0 26px;border-bottom:1px solid ${C.rule};"><a href="${SHOP.site}/" target="_blank" style="text-decoration:none;"><img src="${h(logo)}" width="220" height="69" alt="Gabriel’s Menswear" style="display:block;width:220px;max-width:100%;height:auto;border:0;outline:none;${font(SERIF, 24, 30, C.ink)}"></a></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:30px;">
${body}
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:22px 18px 0;${font(SANS, 12, 18, C.soft)}">${footer}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

// assetBase: where /assets/email/ is served. Production sends https://gabrielsmenswear.com; previews pass a local path.
// reminder: true when the reminder email is scheduled, so the confirmation says one is coming.
export function confirmationEmail(b, { assetBase = SHOP.site, reminder = false } = {}) {
  const name = firstName(b), detail = party(b, 'customer') + ' · ' + b.occasion, calendar = googleCalendarUrl(b);
  const subject = `You’re booked for ${whenLabel(b)}`;
  const preheader = `1363 Main St in Holden. Call ${SHOP.phone} if you need to change it.`;
  const body = kicker('Fitting confirmed') +
    title(`You’re ${em('booked')}${name ? ', ' + h(name) : ''}.`) +
    visit(whenHtml(b), h(detail)) +
    rows([
      ['Where', link(SHOP.directions, h(SHOP.address))],
      ['Need to change it?', link(SHOP.tel, 'Call ' + SHOP.phone)],
      ['Have a suit?', 'Bring it in. I’ll check it on you.'],
    ]) +
    button(calendar, 'Add to Google Calendar') +
    note('For Apple or Outlook, open the calendar file attached to this email.') +
    signoff;
  const later = reminder ? ' I’ll email you a reminder the day before.' : '';
  const footer = `${footerShop}<br>You booked this fitting at ${siteLink}.${later}`;
  const text = [
    `You’re booked${name ? ', ' + name : ''}.`, '',
    whenLabel(b), detail, '',
    `Where: ${SHOP.address}`, `Directions: ${SHOP.directions}`,
    `Need to change it? Call ${SHOP.phone}.`,
    'Have a suit? Bring it in. I’ll check it on you.', '',
    `Add to Google Calendar: ${calendar}`,
    'For Apple or Outlook, open the calendar file attached to this email.', '',
    'See you then,', 'Gabriel', '', '--',
    footerShopText,
    'You booked this fitting at gabrielsmenswear.com.' + later,
  ].join('\n');
  return { subject, html: layout({ subject, preheader, assetBase, body, footer }), text };
}

export function reminderEmail(b, { assetBase = SHOP.site } = {}) {
  const name = firstName(b), detail = party(b, 'customer') + ' · ' + b.occasion;
  const subject = `See you tomorrow at ${timeLabel(b.time)}`;
  const preheader = `Your fitting at ${SHOP.name} is tomorrow, ${longDate(b)}.`;
  const body = kicker('Reminder') +
    title(`See you ${em('tomorrow')}${name ? ', ' + h(name) : ''}.`) +
    visit(whenHtml(b), h(detail)) +
    rows([
      ['Where', link(SHOP.directions, h(SHOP.address))],
      ['Running late or need to change it?', link(SHOP.tel, 'Call ' + SHOP.phone)],
      ['Have a suit?', 'Bring it in. I’ll check it on you.'],
    ]) +
    button(SHOP.directions, 'Get directions') +
    signoff;
  const footer = `${footerShop}<br>This is the one reminder for the fitting you booked at ${siteLink}.`;
  const text = [
    `See you tomorrow${name ? ', ' + name : ''}.`, '',
    whenLabel(b), detail, '',
    `Where: ${SHOP.address}`, `Directions: ${SHOP.directions}`,
    `Running late or need to change it? Call ${SHOP.phone}.`,
    'Have a suit? Bring it in. I’ll check it on you.', '',
    'See you then,', 'Gabriel', '', '--',
    footerShopText,
    'This is the one reminder for the fitting you booked at gabrielsmenswear.com.',
  ].join('\n');
  return { subject, html: layout({ subject, preheader, assetBase, body, footer }), text };
}

/* reminder: { status, at, id }. status is 'scheduled' (at is when it goes out, id its Resend email id), 'soon' or
   'far' (none is sent for a visit under 12 hours or over 30 days away) or 'failed'. A scheduled one gets a "Stop
   the reminder" button that opens it in Resend's dashboard, where it can be cancelled or moved. customerSent: false
   when the confirmation didn't go through. */
const REMINDER_LINES = {
  soon: 'No reminder email. The visit is too soon for one.',
  far: 'No reminder email. This booking is more than 30 days away.',
  failed: 'The reminder couldn’t be scheduled.',
};
const STOP_NOTE = 'Opens it in Resend. Press Cancel there, or change the time.';
export function shopEmail(b, { assetBase = SHOP.site, reminder = { status: 'failed' }, customerSent = true } = {}) {
  const first = firstName(b) || 'them';
  const subject = `${b.name} booked ${shortDate(b)} at ${timeLabel(b.time)}`;
  const preheader = `${party(b, 'shop')}, ${b.occasion}. Reply to this email to write to ${first}.`;
  const reminderLine = reminder.status === 'scheduled' ? holdenLabel(reminder.at) : REMINDER_LINES[reminder.status] || REMINDER_LINES.failed;
  const problem = customerSent ? '' : `The confirmation email to ${b.email} didn’t go through. Reply to this email to confirm the fitting with ${first}.`;
  const stop = reminder.status === 'scheduled' && reminder.id ? 'https://resend.com/emails/' + encodeURIComponent(reminder.id) : '';
  const body = kicker('New booking') +
    title(h(b.name)) +
    visit(whenHtml(b), '') +
    rows([
      ['Email', link('mailto:' + b.email, h(b.email))],
      ['Party', h(party(b, 'shop'))],
      ['Occasion', h(b.occasion)],
      ['Booked', h(holdenLabel(Date.parse(b.created)))],
      ['Reminder', h(reminderLine)],
    ]) +
    (problem ? warning(h(problem)) : '') +
    para(`Reply to this email to write to ${h(first)}.`) +
    (stop ? button(stop, 'Stop the reminder') + note(STOP_NOTE) : '');
  const footer = `Sent by the booking form on ${siteLink}.`;
  const text = [
    b.name, '',
    whenLabel(b), '',
    `Email: ${b.email}`, `Party: ${party(b, 'shop')}`, `Occasion: ${b.occasion}`, `Booked: ${holdenLabel(Date.parse(b.created))}`, `Reminder: ${reminderLine}`, '',
    ...(problem ? [problem, ''] : []),
    `Reply to this email to write to ${first}.`,
    ...(stop ? ['', `Stop the reminder: ${stop}`, STOP_NOTE] : []),
    '', '--', 'Sent by the booking form on gabrielsmenswear.com.',
  ].join('\n');
  return { subject, html: layout({ subject, preheader, assetBase, body, footer }), text };
}
