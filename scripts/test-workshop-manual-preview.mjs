import assert from 'node:assert/strict';

const previewWorker = (process.env.WORKER_PREVIEW_URL || '').replace(/\/$/, '');
const productionWorker = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const allowedOrigin = 'https://linsi.beamiranda.com.br';

const offers = [
  {coupon: '', expectedAmount: 100, expectedUrl: 'https://mpago.la/linsi-manual-qa-full'},
  {coupon: 'CROQ5', expectedAmount: 95, expectedUrl: 'https://mpago.la/linsi-manual-qa-95'},
  {coupon: 'GUIA5', expectedAmount: 95, expectedUrl: 'https://mpago.la/linsi-manual-qa-95'},
  {coupon: 'VAGASUX15', expectedAmount: 85, expectedUrl: 'https://mpago.la/linsi-manual-qa-85'},
  {coupon: 'CLUBEUXW20', expectedAmount: 80, expectedUrl: 'https://mpago.la/linsi-manual-qa-80'},
];

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

for (const {coupon} of offers.filter((offer) => offer.coupon)) {
  const result = await request('/workshop/coupon', {
    method: 'POST',
    body: JSON.stringify({coupon: coupon.toLowerCase()}),
  });
  assert.equal(result.response.status, 200, `Coupon endpoint failed for ${coupon}`);
  assert.equal(result.data?.status, 'valid', `Expected ${coupon} to be valid`);
  assert.equal(result.data?.coupon, coupon, `Expected ${coupon} to be normalized by the Worker`);
}

const legacy = await request('/workshop/coupon', {
  method: 'POST',
  body: JSON.stringify({coupon: 'CROQ10'}),
});
assert.equal(legacy.response.status, 200);
assert.equal(legacy.data?.status, 'invalid');

async function register({coupon, expectedAmount, expectedUrl}) {
  const result = await request('/workshop/start', {
    method: 'POST',
    body: JSON.stringify({
      nome: `QA Manual Payment ${expectedAmount} ${Date.now()}`,
      email: `qa-workshop-${expectedAmount}-${Date.now()}@example.com`,
      cargo: 'QA',
      empresa: 'LINSI QA',
      linkedin: '',
      whatsapp: '',
      coupon,
    }),
  });

  assert.equal(result.response.status, 200, result.data?.message || `Workshop start failed for ${coupon || 'full price'}`);
  assert.match(result.data?.registrationId || '', /^WS-[A-F0-9]{32}$/);
  assert.equal(result.data?.amount, expectedAmount);
  assert.equal(result.data?.paymentUrl, expectedUrl);
  return result.data.registrationId;
}

for (const offer of offers) {
  await register(offer);
}

console.log('REAL MANUAL WORKSHOP PREVIEW QA PASSED: all current coupons accepted through the real input contract and routed server-side to R$100/R$95/R$85/R$80 payment links.');
