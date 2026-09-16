import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {}),
});

async function openCheckout(page) {
  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.locator('#nome').fill('Pessoa QA');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#cargo').fill('Product Designer');
  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.getByText('Carregando...', {exact: true}).waitFor();
  assert.equal(await page.getByRole('button', {name: 'Continuar'}).count(), 1);
  await page.getByRole('heading', {name: 'Inscrição no Workshop LINSI'}).waitFor();
  await page.getByText('Valor do workshop', {exact: true}).waitFor();
}

async function switchTenTimes(page) {
  const durations = [];
  for (let index = 0; index < 10; index += 1) {
    await page.getByRole('button', {name: 'Pix', exact: true}).click();
    await page.getByText('Gerando QR Code Pix', {exact: true}).waitFor();
    await page.getByLabel('QR Code Pix simulado').waitFor();

    const startedAt = performance.now();
    await page.getByRole('button', {name: 'Cartão', exact: true}).click();
    await page.getByText('Número do cartão', {exact: true}).waitFor();
    durations.push(Math.round(performance.now() - startedAt));

    assert.equal(await page.getByText('Alterando forma de pagamento', {exact: true}).count(), 0);
    assert.equal(await page.getByText('Carregando pagamento', {exact: true}).count(), 0);
    assert.equal(await page.getByText('Processando pagamento...', {exact: true}).count(), 0);
  }
  return durations;
}

try {
  const desktop = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await openCheckout(desktop);

  assert.equal(await desktop.getByRole('button', {name: 'Cartão', exact: true}).count(), 1);
  assert.equal(await desktop.getByText('Carregando pagamento', {exact: true}).count(), 0);
  assert.equal(await desktop.getByText('Processando pagamento...', {exact: true}).count(), 0);

  const desktopDurations = await switchTenTimes(desktop);
  await desktop.getByRole('button', {name: 'Simular pendente'}).click();
  await desktop.getByText('Processando pagamento...', {exact: true}).waitFor();
  await desktop.getByRole('button', {name: 'Resetar mock local'}).click();
  await desktop.getByRole('button', {name: 'Simular pagamento aprovado'}).click();
  await desktop.getByRole('heading', {name: 'Inscrição confirmada'}).waitFor();

  const mobile = await browser.newPage({viewport: {width: 390, height: 844}});
  await openCheckout(mobile);
  const cardButton = mobile.getByRole('button', {name: 'Cartão', exact: true});
  const pixButton = mobile.getByRole('button', {name: 'Pix', exact: true});
  const cardBox = await cardButton.boundingBox();
  const pixBox = await pixButton.boundingBox();
  assert.ok(cardBox && pixBox, 'As tabs precisam estar visíveis no mobile.');
  assert.ok(pixBox.y > cardBox.y, 'No mobile, as formas de pagamento devem empilhar sem overflow.');
  const documentWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(documentWidth <= 390, `A página mobile não pode ter overflow horizontal (${documentWidth}px).`);
  const mobileDurations = await switchTenTimes(mobile);

  const allDurations = [...desktopDurations, ...mobileDurations];
  const maxSwitchDuration = Math.max(...allDurations);
  const averageSwitchDuration = Math.round(allDurations.reduce((sum, value) => sum + value, 0) / allDurations.length);
  console.log(`Workshop browser smoke passed. Pix -> Cartão visual: média ${averageSwitchDuration}ms, máximo ${maxSwitchDuration}ms.`);
} finally {
  await browser.close();
}
