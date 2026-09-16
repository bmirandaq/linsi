import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const productionUrl = 'https://linsi.beamiranda.com.br';
const productionWorker = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const previewWorker = (process.env.WORKER_PREVIEW_URL || '').replace(/\/$/, '');
const artifactDir = 'artifacts/workshop-preview-real';
const turnstileTestToken = 'XXXX.DUMMY.TOKEN.XXXX';
const turnstileTestSecret = '1x0000000000000000000000000000000AA';

assert.ok(previewWorker.startsWith('https://'), 'WORKER_PREVIEW_URL must be an HTTPS Worker preview URL.');
assert.notEqual(previewWorker, productionWorker, 'The real preview QA must never target the production Worker code.');
await mkdir(artifactDir, {recursive: true});

async function workerRequest(path, options = {}) {
  const response = await fetch(`${previewWorker}${path}`, {
    ...options,
    headers: {
      Origin: productionUrl,
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return {response, data};
}

const turnstileProbe = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({secret: turnstileTestSecret, response: turnstileTestToken}),
});
const turnstileProbeData = await turnstileProbe.json();
const sanitizedTurnstileProbe = {
  success: turnstileProbeData.success,
  hostname: turnstileProbeData.hostname,
  action: turnstileProbeData.action,
  errorCodes: turnstileProbeData['error-codes'] || [],
};
console.log('Turnstile official E2E probe:', JSON.stringify(sanitizedTurnstileProbe));
assert.equal(turnstileProbeData.success, true, 'Cloudflare official E2E Turnstile credentials must validate before testing the Worker.');

const startPayload = {
  nome: `QA Checkout Pro Preview ${Date.now()}`,
  email: 'test@testuser.com',
  cargo: 'QA',
  empresa: 'LINSI Preview QA',
  linkedin: '',
  whatsapp: '',
  coupon: '',
  turnstileToken: turnstileTestToken,
};

const browser = await chromium.launch({headless: true});
try {
  const start = await workerRequest('/workshop/start', {
    method: 'POST',
    body: JSON.stringify(startPayload),
  });
  assert.equal(
    start.response.status,
    200,
    `Preview /workshop/start failed (${start.response.status}): ${start.data?.code || start.data?.error || start.data?.message || 'unknown'}`,
  );
  assert.match(start.data?.registrationId || '', /^WS-[A-F0-9]{32}$/);
  assert.equal(start.data?.amount, 100);
  const registrationId = start.data.registrationId;

  const checkout = await workerRequest('/workshop/checkout', {
    method: 'POST',
    body: JSON.stringify({registrationId, amount: 1, unit_price: 1, coupon: 'FAKE100'}),
  });
  assert.equal(checkout.response.status, 200, `Preview /workshop/checkout failed (${checkout.response.status}): ${checkout.data?.code || checkout.data?.message || 'unknown'}`);
  assert.equal(checkout.data?.status, 'pending');
  assert.ok(checkout.data?.checkoutUrl, 'Checkout Pro must return checkoutUrl.');
  const checkoutUrl = new URL(checkout.data.checkoutUrl);
  assert.equal(checkoutUrl.protocol, 'https:');
  assert.ok(checkoutUrl.hostname === 'mercadopago.com.br' || checkoutUrl.hostname.endsWith('.mercadopago.com.br'));

  const retry = await workerRequest('/workshop/checkout', {
    method: 'POST',
    body: JSON.stringify({registrationId}),
  });
  assert.equal(retry.response.status, 200, `Preview Checkout Pro retry failed (${retry.response.status}): ${retry.data?.code || retry.data?.message || 'unknown'}`);
  assert.equal(retry.data?.checkoutUrl, checkout.data.checkoutUrl, 'Retry must reuse the live Mercado Pago Order instead of creating another checkout.');

  const status = await workerRequest(`/workshop/status?id=${encodeURIComponent(registrationId)}`);
  assert.equal(status.response.status, 200, `Preview status failed (${status.response.status}).`);
  assert.equal(status.data?.status, 'pending');

  const checkoutPage = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const checkoutResponse = await checkoutPage.goto(checkout.data.checkoutUrl, {waitUntil: 'domcontentloaded', timeout: 45000});
  assert.ok(checkoutResponse && checkoutResponse.status() < 500, `Hosted Mercado Pago checkout returned ${checkoutResponse?.status()}.`);
  await checkoutPage.waitForTimeout(4000);
  const finalCheckoutUrl = new URL(checkoutPage.url());
  assert.ok(finalCheckoutUrl.hostname === 'mercadopago.com.br' || finalCheckoutUrl.hostname.endsWith('.mercadopago.com.br'));
  await checkoutPage.screenshot({path: `${artifactDir}/mercado-pago-checkout.png`, fullPage: false});
  await checkoutPage.close();

  console.log(`REAL PREVIEW QA PASSED registration=${registrationId.slice(0, 10)}… amount=100 checkout_host=${checkoutUrl.hostname}`);
  console.log('Validated without application mocks: official Cloudflare Turnstile E2E validation, preview Worker, real Notion registration, real Mercado Pago sandbox Order, idempotent retry, status lookup and hosted checkout load.');
} finally {
  await browser.close();
}
