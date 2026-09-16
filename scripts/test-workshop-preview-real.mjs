import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const productionUrl = 'https://linsi.beamiranda.com.br';
const productionWorker = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const previewWorker = (process.env.WORKER_PREVIEW_URL || '').replace(/\/$/, '');
const artifactDir = 'artifacts/workshop-preview-real';

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

const browser = await chromium.launch({headless: true});
let capturedStartPayload;
let resolveCapturedStart;
const capturedStart = new Promise((resolve) => { resolveCapturedStart = resolve; });

try {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await page.route(`${productionWorker}/workshop/start`, async (route) => {
    capturedStartPayload = route.request().postDataJSON();
    resolveCapturedStart(capturedStartPayload);
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({message: 'QA intercepted before production submission.'}),
    });
  });

  await page.goto(`${productionUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.locator('#nome').fill(`QA Checkout Pro Preview ${Date.now()}`);
  await page.locator('#email').fill('test@testuser.com');
  await page.locator('#cargo').fill('QA');
  const company = page.locator('#empresa');
  if (await company.count()) await company.fill('LINSI Preview QA');
  await page.getByRole('button', {name: 'Continuar'}).click();

  await Promise.race([
    capturedStart,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out waiting for a real Turnstile token.')), 35000)),
  ]);

  assert.ok(capturedStartPayload?.turnstileToken, 'The production hostname must issue a real Turnstile token.');
  assert.equal(capturedStartPayload.email, 'test@testuser.com');

  const start = await workerRequest('/workshop/start', {
    method: 'POST',
    body: JSON.stringify(capturedStartPayload),
  });
  assert.equal(start.response.status, 200, `Preview /workshop/start failed (${start.response.status}).`);
  assert.match(start.data?.registrationId || '', /^WS-[A-F0-9]{32}$/);
  assert.equal(start.data?.amount, 100);
  const registrationId = start.data.registrationId;

  const checkout = await workerRequest('/workshop/checkout', {
    method: 'POST',
    body: JSON.stringify({registrationId, amount: 1, unit_price: 1, coupon: 'FAKE100'}),
  });
  assert.equal(checkout.response.status, 200, `Preview /workshop/checkout failed (${checkout.response.status}).`);
  assert.equal(checkout.data?.status, 'pending');
  assert.ok(checkout.data?.checkoutUrl, 'Checkout Pro must return checkoutUrl.');
  const checkoutUrl = new URL(checkout.data.checkoutUrl);
  assert.equal(checkoutUrl.protocol, 'https:');
  assert.ok(checkoutUrl.hostname === 'mercadopago.com.br' || checkoutUrl.hostname.endsWith('.mercadopago.com.br'));

  const retry = await workerRequest('/workshop/checkout', {
    method: 'POST',
    body: JSON.stringify({registrationId}),
  });
  assert.equal(retry.response.status, 200, `Preview Checkout Pro retry failed (${retry.response.status}).`);
  assert.equal(retry.data?.checkoutUrl, checkout.data.checkoutUrl, 'Retry must reuse the live Mercado Pago Order instead of creating another checkout.');

  const status = await workerRequest(`/workshop/status?id=${encodeURIComponent(registrationId)}`);
  assert.equal(status.response.status, 200);
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
  console.log('Validated without application mocks: real Turnstile, preview Worker with production secrets, real Notion registration, real Mercado Pago sandbox Order, idempotent retry, status lookup and hosted checkout load.');
} finally {
  await browser.close();
}
