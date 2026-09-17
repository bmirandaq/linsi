import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {default: worker} = await import(moduleUrl);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  TURNSTILE_SECRET_KEY: 'test-value',
  NOTION_API_KEY: 'test-value',
  WORKSHOP_NOTION_DATABASE_ID: 'workshop-db',
  WORKSHOP_COUPONS_JSON: JSON.stringify({
    CROQ10: {partner: 'Design Croquete', discount: 10, active: true},
  }),
  WORKSHOP_PAYMENT_LINK_FULL: 'https://mpago.la/linsi-full-test',
  WORKSHOP_PAYMENT_LINK_DISCOUNT: 'https://mpago.la/linsi-discount-test',
};

function request(path, method = 'POST') {
  return new Request(`https://linsi-form-handler.example.test${path}`, {
    method,
    headers: {
      Origin: allowedOrigin,
      ...(method === 'POST' ? {'Content-Type': 'application/json'} : {}),
    },
    ...(method === 'POST' ? {body: JSON.stringify({registrationId: 'WS-TEST'})} : {}),
  });
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  throw new Error(`Endpoint aposentado não pode chamar serviço externo: ${String(url)}`);
};

try {
  for (let cycle = 0; cycle < 10; cycle += 1) {
    for (const path of [
      '/workshop/payment/reset',
      '/workshop/pay/card',
      '/workshop/pay/pix',
      '/workshop/checkout',
    ]) {
      const response = await worker.fetch(request(path), env);
      assert.equal(response.status, 410, `${path} precisa continuar aposentado.`);
    }

    const status = await worker.fetch(request('/workshop/status?id=WS-TEST', 'GET'), env);
    assert.equal(status.status, 410, '/workshop/status precisa continuar aposentado.');
  }

  const webhook = await worker.fetch(new Request('https://linsi-form-handler.example.test/webhooks/mercadopago', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: '{}',
  }), env);
  assert.equal(webhook.status, 410, 'Webhook legado do Workshop precisa continuar aposentado.');
} finally {
  globalThis.fetch = originalFetch;
}

assert.doesNotMatch(source, /Tentativas de pagamento[^\n]*\+|attempts\s*\+/);
assert.doesNotMatch(source, /Bloqueado até[^\n]*start|payment_locked|retryAt/);

console.log('Workshop retired payment paths passed: repeated legacy calls stay 410 with no retry counter, lock or external payment integration.');
