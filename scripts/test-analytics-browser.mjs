import assert from 'node:assert/strict';
import {chromium} from 'playwright';

// These tests check our integration, not ingestion by the external dashboards.
// Synthetic build IDs and intercepted vendors must never be used as collection evidence.
const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const enabled = process.env.ANALYTICS_TEST_ENABLED === '1';
const workshopCheckout = 'https://pay.herospark.com/workshop-mapeando-experiencias-com-linsi-545805';
const browser = await chromium.launch({headless: true});
const context = await browser.newContext();
const requests = [];
const errors = [];
await context.route('https://static.cloudflareinsights.com/**', async (route) => {
  requests.push('cloudflare');
  await route.fulfill({contentType: 'application/javascript', body: ''});
});
await context.route('https://www.clarity.ms/**', async (route) => {
  requests.push('clarity');
  // Keep the official snippet's queue intact so the exact calls can be asserted.
  await route.fulfill({contentType: 'application/javascript', body: ''});
});
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
const calls = () => page.evaluate(() => Array.from(window.clarity?.q ?? [], (args) => Array.from(args)));
async function clickRoute(path) {
  await page.locator(`a[href="${path}"]:visible`).first().click();
  await page.waitForURL((url) => url.pathname === path);
}

try {
  await page.goto(`${baseUrl}/?utm_source=linkedin&utm_medium=social&utm_campaign=workshop_linsi&utm_content=post`, {waitUntil: 'networkidle'});
  assert.equal(await page.locator('[data-linsi-analytics="cloudflare"]').count(), enabled ? 1 : 0);
  assert.equal(await page.locator('[data-linsi-analytics="clarity"]').count(), enabled ? 1 : 0);
  const tags = enabled ? [
    ['set', 'utm_source', 'linkedin'], ['set', 'utm_medium', 'social'],
    ['set', 'utm_campaign', 'workshop_linsi'], ['set', 'utm_content', 'post'],
  ] : [];
  assert.deepEqual(await calls(), tags);

  await page.getByRole('link', {name: 'Participar do workshop'}).click();
  await page.waitForURL((url) => url.hash === '#workshop');
  await page.locator('#workshop').waitFor({state: 'visible'});

  const checkoutLink = page.locator(`#workshop a[href="${workshopCheckout}"]`);
  assert.equal(await checkoutLink.count(), 1, 'Workshop checkout link must point directly to HeroSpark.');
  assert.equal(await checkoutLink.getAttribute('href'), workshopCheckout);
  await page.evaluate((url) => {
    const link = document.querySelector(`#workshop a[href="${url}"]`);
    link?.addEventListener('click', (event) => event.preventDefault(), {once: true});
  }, workshopCheckout);
  await checkoutLink.click();

  const expectedCalls = enabled ? [...tags, ['event', 'workshop_view'], ['event', 'workshop_signup_click']] : [];
  assert.deepEqual(await calls(), expectedCalls);

  await clickRoute('/docs/principios');
  await clickRoute('/cafe-bea');
  await clickRoute('/contribuir-ajuda');
  await clickRoute('/');
  assert.deepEqual(await calls(), expectedCalls, 'SPA navigation must not reinitialize tags or emit manual pageviews');
  assert.deepEqual(requests.sort(), enabled ? ['clarity', 'cloudflare'] : [], 'Vendor scripts must load once per document, or never when disabled');
  assert.deepEqual(errors, []);
  console.log(`Analytics browser passed (${enabled ? 'synthetic IDs; vendors intercepted' : 'no IDs'}): UTMs, workshop view/signup events, external HeroSpark CTA isolation, SPA links, single script load and clean console.`);
} finally {
  await context.close();
  await browser.close();
}
