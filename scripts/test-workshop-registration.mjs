import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {}),
});

async function fillForm(page, {coupon = ''} = {}) {
  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.locator('#nome').fill('Pessoa QA');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#cargo').fill('Product Designer');
  if (coupon) {
    await page.locator('#cupom').fill(coupon);
    await page.getByText('Cupom aplicado', {exact: true}).waitFor();
  }
}

async function submitAndAssert(page, expectedAmount, expectedHref) {
  await page.getByRole('button', {name: 'Continuar para pagamento'}).click();
  assert.equal(await page.getByText('Registrando inscrição...', {exact: true}).count(), 0, 'O submit não deve abrir uma tela de loading.');
  await page.getByRole('heading', {name: 'Falta pouco!'}).waitFor();
  await page.getByText('Mapeando experiências com LINSI', {exact: true}).waitFor();
  assert.equal(await page.getByText(`R$ ${expectedAmount},00`, {exact: true}).count(), 0, 'O feedback não deve repetir o valor.');
  assert.equal(await page.getByText('A confirmação da vaga será enviada após a conferência do pagamento.', {exact: true}).count(), 0, 'O aviso antigo não deve permanecer.');

  const paymentLink = page.getByRole('link', {name: 'Pagar no Mercado Pago'});
  assert.equal(await paymentLink.getAttribute('href'), expectedHref);
  assert.equal(await paymentLink.getAttribute('target'), null);
}

try {
  const desktop = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await fillForm(desktop);
  await submitAndAssert(desktop, '100', 'https://mpago.la/linsi-qa-full');
  assert.ok((await desktop.evaluate(() => document.documentElement.scrollWidth)) <= 1440);

  const discounted = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await fillForm(discounted, {coupon: 'Croq10'});
  await submitAndAssert(discounted, '90', 'https://mpago.la/linsi-qa-discount');

  const mobile = await browser.newPage({viewport: {width: 390, height: 844}});
  await fillForm(mobile, {coupon: 'GUIA10'});
  await submitAndAssert(mobile, '90', 'https://mpago.la/linsi-qa-discount');
  const documentWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(documentWidth <= 390, `A página mobile não pode ter overflow horizontal (${documentWidth}px).`);
  const ctaBox = await mobile.getByRole('link', {name: 'Pagar no Mercado Pago'}).boundingBox();
  assert.ok(ctaBox && ctaBox.width > 340, 'O CTA de pagamento deve ocupar a largura útil no mobile.');

  console.log('Workshop browser smoke passed: concise post-registration feedback, correct payment links and mobile layout.');
} finally {
  await browser.close();
}
