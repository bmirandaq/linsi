import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {}),
});

async function inspect(page, width) {
  const network = [];
  page.on('request', (request) => network.push(request.url()));
  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});

  await page.getByRole('heading', {name: 'Inscrição no Workshop LINSI'}).waitFor();
  await page.getByRole('button', {name: 'Continuar'}).waitFor();
  await page.getByText('O pagamento será concluído no ambiente do Mercado Pago.', {exact: true}).waitFor();

  assert.equal(await page.getByRole('button', {name: 'Cartão', exact: true}).count(), 0);
  assert.equal(await page.getByRole('button', {name: 'Pix', exact: true}).count(), 0);
  assert.equal(await page.getByText('Processado pelo', {exact: true}).count(), 0);
  assert.ok(!network.some((url) => url.includes('sdk.mercadopago.com/js/v2')));
  assert.ok(!network.some((url) => url.includes('mercadopago.com/v2/security.js')));

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(documentWidth <= width, `A página não pode ter overflow horizontal (${documentWidth}px > ${width}px).`);
}

try {
  const desktop = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await inspect(desktop, 1440);

  const mobile = await browser.newPage({viewport: {width: 390, height: 844}});
  await inspect(mobile, 390);

  console.log('Workshop local browser smoke passed: single registration form, hosted-payment notice, no internal payment UI and no Mercado Pago frontend SDK.');
} finally {
  await browser.close();
}
