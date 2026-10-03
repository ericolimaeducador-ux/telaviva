/* Input validation for B2B leads. Pure functions, unit-tested in worker/test. */

export const VOLUMES = ['1-20', '21-60', '61-120', '120+'];

export function isValidCNPJ(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const check = (len) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = 0; i < len; i++) {
      sum += Number(d[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return check(12) === Number(d[12]) && check(13) === Number(d[13]);
}

const clean = (v, max) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

/**
 * Validates and normalizes the raw JSON body.
 * @returns {{ ok: true, lead: object } | { ok: false, field: string }}
 */
export function parseLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, field: 'body' };

  // Honeypot: any value means a bot filled the hidden field.
  if (body.botcheck) return { ok: false, field: 'botcheck' };

  const cnpjDigits = String(body.cnpj ?? '').replace(/\D/g, '');
  const studio = clean(body.studio, 120);
  const name = clean(body.name, 120);
  const phone = String(body.whatsapp ?? '').replace(/\D/g, '');
  const volume = clean(body.volume, 10);
  const turnstileToken = clean(body.turnstileToken, 2048);

  if (!isValidCNPJ(cnpjDigits)) return { ok: false, field: 'cnpj' };
  if (studio.length < 2) return { ok: false, field: 'studio' };
  if (name.length < 2) return { ok: false, field: 'name' };
  if (phone.length < 10 || phone.length > 11) return { ok: false, field: 'whatsapp' };
  if (!VOLUMES.includes(volume)) return { ok: false, field: 'volume' };
  if (!turnstileToken) return { ok: false, field: 'turnstile' };

  const cnpj = cnpjDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  const whatsapp = phone.length === 11
    ? phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    : phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');

  return { ok: true, lead: { cnpj, studio, name, whatsapp, phoneDigits: phone, volume }, turnstileToken };
}

export const escapeHtml = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
