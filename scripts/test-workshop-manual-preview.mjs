import assert from 'node:assert/strict';

const previewWorker = (process.env.WORKER_PREVIEW_URL || '').replace(/\/$/, '');
const productionWorker = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const allowedOrigin = 'https://linsi.beamiranda.com.br';
const fullPaymentUrl = 'https://mpago.la/linsi-manual-qa-full';
const discountPaymentUrl = 'https://mpago.la/linsi-manual-qa-discount';

assert.ok(previewWorker.startsWith('https://'), 'WORKER_PREVIEW_URL must be an HTTPS Worker preview URL.');
assert.notEqual(previewWorker, productionWorker, 'Preview QA must never target the production Worker.');

async function request(path, options = {}) {
  const response = await fetch(`${previewWorker}${path}`, {
    ...options,
    headers: {
      Origin: allowedOrigin,
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return {response, data};
}

const coupon = await request('/workshop/coupon', {
  method: 'POST',
  body: JSON.stringify({coupon: 'Croq10'}),
});
assert.equal(coupon.response.status, 200);
assert.equal(coupon.data?.status, 'valid');

async function register({coupon: couponValue, expectedAmount, expectedUrl}) {
  const result = await request('/workshop/start', {
    method: 'POST',
    body: JSON.stringify({
      nome: `QA Manual Payment ${expectedAmount} ${Date.now()}`,
      email: `qa-workshop-${expectedAmount}-${Date.now()}@example.com`,
      cargo: 'QA',
      empresa: 'LINSI QA',
      linkedin: '',
      whatsapp: '',
      coupon: couponValue,
    }),
  });

  assert.equal(result.response.status, 200, result.data?.message || 'Workshop start failed');
  assert.match(result.data?.registrationId || '', /^WS-[A-F0-9]{32}$/);
  assert.equal(result.data?.amount, expectedAmount);
  assert.equal(result.data?.paymentUrl, expectedUrl);
  return result.data.registrationId;
}

await register({coupon: '', expectedAmount: 100, expectedUrl: fullPaymentUrl});
await register({coupon: 'croq10', expectedAmount: 90, expectedUrl: discountPaymentUrl});

console.log('REAL MANUAL WORKSHOP PREVIEW QA PASSED: coupon, real Notion-backed registrations and server-side R$100/R$90 link selection.');
