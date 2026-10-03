// Run: node --test worker/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { isValidCNPJ, parseLead } from '../src/validate.js';

const ORIGIN = 'https://ericolimaeducador-ux.github.io';
const env = {
  ALLOWED_ORIGINS: ORIGIN,
  LEAD_TO: 'leads@example.com',
  LEAD_FROM: 'Tela Viva <onboarding@resend.dev>',
  RESEND_API_KEY: 'test-key',
  TURNSTILE_SECRET: 'test-secret',
};
const valid = {
  cnpj: '54.765.439/0001-34',
  studio: 'Estúdio <b>Teste</b>',
  name: 'Fulano',
  whatsapp: '(11) 91497-7007',
  volume: '21-60',
  botcheck: '',
  turnstileToken: 'tok',
};

function stubFetch({ turnstile = true, resendOk = true } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('turnstile')) return new Response(JSON.stringify({ success: turnstile }));
    if (String(url).includes('resend')) return new Response('{}', { status: resendOk ? 200 : 500 });
    throw new Error('unexpected fetch ' + url);
  };
  return calls;
}

const post = (body, origin = ORIGIN) =>
  new Request('https://w.example/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '1.2.3.4' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test('cnpj validation', () => {
  assert.equal(isValidCNPJ('54.765.439/0001-34'), true);
  assert.equal(isValidCNPJ('54.765.439/0001-35'), false);
  assert.equal(isValidCNPJ('11111111111111'), false);
});

test('parseLead rejects bad fields', () => {
  assert.equal(parseLead({ ...valid, volume: 'x' }).field, 'volume');
  assert.equal(parseLead({ ...valid, whatsapp: '123' }).field, 'whatsapp');
  assert.equal(parseLead({ ...valid, turnstileToken: '' }).field, 'turnstile');
  assert.equal(parseLead([]).field, 'body');
});

test('valid lead is emailed with escaped html', async () => {
  const calls = stubFetch();
  const res = await worker.fetch(post(valid), env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  const resend = calls.find((c) => c.url.includes('resend'));
  const payload = JSON.parse(resend.init.body);
  assert.deepEqual(payload.to, ['leads@example.com']);
  assert.ok(payload.html.includes('&lt;b&gt;Teste&lt;/b&gt;'));
  assert.ok(!payload.html.includes('<b>Teste</b>'));
  assert.ok(payload.text.includes('CNPJ: 54.765.439/0001-34'));
  assert.equal(resend.init.headers.Authorization, 'Bearer test-key');
});

test('foreign origin is refused', async () => {
  stubFetch();
  const res = await worker.fetch(post(valid, 'https://evil.example'), env);
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
});

test('honeypot gets silent success and sends nothing', async () => {
  const calls = stubFetch();
  const res = await worker.fetch(post({ ...valid, botcheck: 'true' }), env);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test('failed captcha blocks email', async () => {
  const calls = stubFetch({ turnstile: false });
  const res = await worker.fetch(post(valid), env);
  assert.equal(res.status, 403);
  assert.equal(calls.filter((c) => c.url.includes('resend')).length, 0);
});

test('resend failure returns 502', async () => {
  stubFetch({ resendOk: false });
  const res = await worker.fetch(post(valid), env);
  assert.equal(res.status, 502);
});

test('invalid json and oversized body', async () => {
  stubFetch();
  assert.equal((await worker.fetch(post('{nope'), env)).status, 400);
  assert.equal((await worker.fetch(post('x'.repeat(9000)), env)).status, 413);
});

test('preflight and wrong path', async () => {
  const pre = await worker.fetch(new Request('https://w.example/lead', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env);
  assert.equal(pre.status, 204);
  const nf = await worker.fetch(new Request('https://w.example/other', { method: 'POST' }), env);
  assert.equal(nf.status, 404);
});
