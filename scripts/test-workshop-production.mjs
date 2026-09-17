import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = (process.env.WORKSHOP_PRODUCTION_URL || 'https://linsi.beamiranda.com.br').replace(/\/$/, '');
const parsedBase = new URL(baseUrl);
assert.ok(!['localhost', '127.0.0.1'].includes(parsedBase.hostname), 'Production smoke refuses localhost/mock mode.');

const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {}),
});

async function inspectViewport({width, height, colorScheme}) {
  const page = await browser.newPage({viewport: {width, height}, colorScheme});
  const network = [];
  const consoleErrors = [];
  page.on('request', (request) => network.push(request.url()));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.getByRole('heading', {name: 'Inscrição no Workshop LINSI'}).waitFor();
  await page.getByRole('button', {name: 'Continuar'}).waitFor();
  await page.getByText('O pagamento será concluído no ambiente do Mercado Pago.', {exact: true}).waitFor();

  assert.equal(await page.getByText('Seus dados', {exact: true}).count(), 0, 'The old two-step stepper must be gone.');
  assert.equal(await page.getByRole('button', {name: 'Cartão', exact: true}).count(), 0, 'The internal card tab must be gone.');
  assert.equal(await page.getByRole('button', {name: 'Pix', exact: true}).count(), 0, 'The internal Pix tab must be gone.');
  assert.equal(await page.getByText('Processado pelo', {exact: true}).count(), 0, 'The internal payment processor badge must be gone.');
  assert.ok(!network.some((url) => url.includes('sdk.mercadopago.com/js/v2')), 'Mercado Pago JS SDK must not load on /workshop.');
  assert.ok(!network.some((url) => url.includes('mercadopago.com/v2/security.js')), 'Mercado Pago device security script must not load on /workshop.');

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(documentWidth <= width, `No horizontal overflow expected (${documentWidth}px > ${width}px).`);

  await page.close();
  return {consoleErrors};
}

try {
  const scenarios = [
    {width: 1440, height: 1000, colorScheme: 'light'},
    {width: 1440, height: 1000, colorScheme: 'dark'},
    {width: 390, height: 844, colorScheme: 'light'},
    {width: 390, height: 844, colorScheme: 'dark'},
  ];

  for (const scenario of scenarios) {
    const result = await inspectViewport(scenario);
    const relevantErrors = result.consoleErrors.filter((message) => !/favicon|Failed to load resource.*404/i.test(message));
    assert.deepEqual(relevantErrors, [], `Unexpected browser console errors in ${scenario.width}px/${scenario.colorScheme}.`);
  }

  console.log('Workshop production smoke passed: real public URL, light/dark desktop/mobile, no local mock and no advanced Mercado Pago frontend SDK.');
} finally {
  await browser.close();
}
