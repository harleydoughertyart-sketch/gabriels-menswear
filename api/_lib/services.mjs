/* The outside services the booking function calls, each through deps.fetch so tests can stand in for them:
   Resend sends the emails and holds the scheduled reminder, Cloudflare Turnstile says whether a person sent the
   form. */

export const DEFAULT_FROM = 'Gabriel’s Menswear <bookings@gabrielsmenswear.com>';

// Sends one email now, or at scheduled_at. Retries once, a second later, after a 429, a 5xx or a dropped
// connection, but not after a timeout, so a slow Resend still leaves time to answer the visitor. The
// Idempotency-Key makes a retry a no-op if the first try went through. Returns { ok, id } or { ok: false, error },
// and never throws.
export async function sendEmail(deps, { apiKey, idempotencyKey, ...email }) {
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not set' };
  const headers = { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  let error;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await deps.sleep(1000);
    try {
      const res = await deps.fetch('https://api.resend.com/emails', { method: 'POST', headers, body: JSON.stringify(email), signal: AbortSignal.timeout(5000) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data.id ? { ok: true, id: data.id } : { ok: false, error: 'resend sent no id' };
      // Resend's error names say what went wrong without repeating the address.
      error = `resend ${res.status} ${data.name || ''}`.trim();
      if (res.status !== 429 && res.status < 500) break;
    } catch (e) {
      error = 'resend ' + (e?.name || 'error');
      if (e?.name === 'TimeoutError') break;
    }
  }
  return { ok: false, error };
}

// Cloudflare's always-pass and always-fail test secrets: their tokens carry no real hostname or action.
const TEST_SECRETS = new Set(['1x0000000000000000000000000000000AA', '2x0000000000000000000000000000000AA', '3x0000000000000000000000000000000AA']);

export async function verifyTurnstile(deps, { secret, token, ip, action, hostnames }) {
  if (!secret) return { ok: false, reason: 'TURNSTILE_SECRET_KEY is not set' };
  if (!token || token.length > 2048) return { ok: false, reason: 'no token' };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await deps.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (!data.success) return { ok: false, reason: (data['error-codes'] || []).join(',') || 'failed' };
    if (TEST_SECRETS.has(secret)) return { ok: true };
    if (data.action !== action) return { ok: false, reason: 'action ' + data.action };
    if (!hostnames.includes(data.hostname)) return { ok: false, reason: 'hostname ' + data.hostname };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'siteverify ' + (e?.name || 'error') };
  }
}
