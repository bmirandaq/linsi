import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true});

async function openCheckout(page) {
  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.locator('#nome').fill('Pessoa QA');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#cargo').fill('Product Designer');
  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.getByRole('heading', {name: 'Inscrição no Workshop LINSI'}).waitFor();
  await page.getByText('Valor do workshop', {exact: true}).waitFor();
}

try {
  const desktop = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await openCheckout(desktop);

  assert.equal(await desktop.getByRole('button', {name: 'Cartão', exact: true}).count(), 1);
  assert.equal(await desktop.getByRole('button', {name: 'Cartão de crédito', exact: true}).count(), 0);
  assert.equal(await desktop.getByText('Carregando pagamento...', {exact: true}).count(), 0);
  assert.equal(await desktop.getByText('Gerando Pix...', {exact: true}).count(), 0);
  assert.equal(await desktop.getByText('Processando pagamento...', {exact: true}).count(), 0);

  await desktop.getByRole('button', {name: 'Pix', exact: true}).click();
  const mockQr = desktop.getByLabel('QR Code Pix simulado');
  await mockQr.waitFor();
  assert.equal(await mockQr.evaluate((element) => getComputedStyle(element).justifySelf), 'center');

  const switchStartedAt = Date.now();
  await desktop.getByRole('button', {name: 'Cartão', exact: true}).click();
  await desktop.getByText('Número do cartão', {exact: true}).waitFor();
  const switchDuration = Date.now() - switchStartedAt;
  assert.ok(switchDuration < 750, `Troca Pix -> Cartão levou ${switchDuration}ms no smoke local.`);
  assert.equal(await desktop.getByText('Processando pagamento...', {exact: true}).count(), 0);

  await desktop.getByRole('button', {name: 'Simular pendente'}).click();
  await desktop.getByText('Processando pagamento...', {exact: true}).waitFor();

  const mobile = await browser.newPage({viewport: {width: 390, height: 844}});
  await openCheckout(mobile);
  const cardButton = mobile.getByRole('button', {name: 'Cartão', exact: true});
  const pixButton = mobile.getByRole('button', {name: 'Pix', exact: true});
  const cardBox = await cardButton.boundingBox();
  const pixBox = await pixButton.boundingBox();
  assert.ok(cardBox && pixBox, 'As tabs precisam estar visíveis no mobile.');
  assert.ok(pixBox.y > cardBox.y, 'No mobile, as formas de pagamento devem empilhar sem overflow.');

  console.log(`Workshop browser smoke passed. Pix -> Cartão local switch: ${switchDuration}ms.`);
} finally {
  await browser.close();
}
