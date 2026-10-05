import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const checkoutUrl = 'https://pay.herospark.com/workshop-mapeando-experiencias-com-linsi-545805';
const browser = await chromium.launch({headless: true});
const context = await browser.newContext();
let externalNavigation = false;

await context.route('https://pay.herospark.com/**', async (route) => {
  externalNavigation = true;
  await route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>HeroSpark intercepted for QA</title>',
  });
});

const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

try {
  const response = await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  assert.ok(response, 'Legacy workshop route produced no response.');
  assert.ok(response.status() < 400, `Legacy workshop route returned HTTP ${response.status()}.`);
  await page.waitForURL((url) => url.href.startsWith(checkoutUrl), {timeout: 5_000});
  assert.equal(externalNavigation, true, 'Legacy /workshop did not navigate to HeroSpark.');
  assert.equal(errors.length, 0, `Legacy redirect produced runtime errors: ${errors.join(' | ')}`);
  console.log('Workshop legacy redirect passed: /workshop resolves and exits to the current HeroSpark checkout.');
} finally {
  await context.close();
  await browser.close();
}
