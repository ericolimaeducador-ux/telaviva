/* Tela Viva — lead intake Worker.
   POST /lead  (JSON) → validate → Turnstile → Resend email to the sales inbox.
   No lead data is stored or logged here; logs carry only error codes. */

import { parseLead, escapeHtml } from './validate.js';

const VOLUME_LABEL = { '1-20': 'Até 20', '21-60': '21 a 60', '61-120': '61 a 120', '120+': 'Mais de 120' };
const MAX_BODY_BYTES = 8 * 1024;
const TIMEOUT_MS = 8000;

function corsHeaders(origin, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin);
  return {
    ok,
    headers: {
      ...(ok ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  };
}

const json = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });

async function fetchWithTimeout(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function verifyTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetchWithTimeout('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    return data?.success === true;
  } catch {
    return false;
  }
}

async function sendEmail(lead, env) {
  if (!env.RESEND_API_KEY || !env.LEAD_TO) return false;
  const volume = VOLUME_LABEL[lead.volume] || lead.volume;
  const rows = [
    ['Estúdio', lead.studio],
    ['CNPJ', lead.cnpj],
    ['Nome', lead.name],
    ['WhatsApp', lead.whatsapp],
    ['Sessões por mês', volume],
  ];
  const text = ['Novo lead B2B pelo site Tela Viva.', '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n');
  const html = `<p>Novo lead B2B pelo site Tela Viva.</p><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p><a href="https://wa.me/55${lead.phoneDigits}">Abrir conversa no WhatsApp</a></p>`;

  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_FROM || 'Tela Viva <onboarding@resend.dev>',
        to: [env.LEAD_TO],
        subject: `Novo lead B2B — ${lead.studio}`,
        text,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (url.pathname !== '/lead') return json(404, { ok: false, error: 'not_found' });
    if (request.method === 'OPTIONS') return new Response(null, { status: cors.ok ? 204 : 403, headers: cors.headers });
    if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, cors.headers);
    if (!cors.ok) return json(403, { ok: false, error: 'origin' }, cors.headers);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (env.LEAD_LIMITER && ip) {
      const { success } = await env.LEAD_LIMITER.limit({ key: ip });
      if (!success) return json(429, { ok: false, error: 'rate_limited' }, cors.headers);
    }

    const len = Number(request.headers.get('Content-Length') || 0);
    if (len > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' }, cors.headers);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' }, cors.headers);
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: 'invalid_json' }, cors.headers);
    }

    const parsed = parseLead(body);
    if (!parsed.ok) {
      // Bots get a neutral success so the honeypot is not revealed.
      if (parsed.field === 'botcheck') return json(200, { ok: true }, cors.headers);
      return json(422, { ok: false, error: 'invalid', field: parsed.field }, cors.headers);
    }

    if (!(await verifyTurnstile(parsed.turnstileToken, ip, env))) {
      console.warn('lead_rejected: turnstile');
      return json(403, { ok: false, error: 'captcha' }, cors.headers);
    }

    if (!(await sendEmail(parsed.lead, env))) {
      console.error('lead_failed: email');
      return json(502, { ok: false, error: 'send' }, cors.headers);
    }

    return json(200, { ok: true }, cors.headers);
  },
};
