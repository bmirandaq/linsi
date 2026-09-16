import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const outputDir = path.resolve('artifacts/workshop-qa');
await mkdir(outputDir, {recursive: true});

const browser = await chromium.launch({headless: true});

const scenarios = [
  {name: 'desktop-light', width: 1440, height: 1000, colorScheme: 'light'},
  {name: 'desktop-dark', width: 1440, height: 1000, colorScheme: 'dark'},
  {name: 'mobile-light', width: 390, height: 844, colorScheme: 'light'},
  {name: 'mobile-dark', width: 390, height: 844, colorScheme: 'dark'},
];

function installFakeTurnstile(page) {
  return page.addInitScript(() => {
    window.turnstile = {
      render(_element, options) {
        window.__workshopTurnstileOptions = options;
        return 1;
      },
      execute() {
        setTimeout(() => window.__workshopTurnstileOptions?.callback?.('qa-turnstile-token'), 20);
      },
      reset() {},
      remove() {},
    };
  });
}

async function mockApi(page, {startDelay = 0, checkoutDelay = 0, status = 'pending'} = {}) {
  await page.route('https://linsi-form-handler.bmirandaqux.workers.dev/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/workshop/coupon') {
      return route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'valid', coupon: 'CROQ10'})});
    }
    if (url.pathname === '/workshop/start') {
      if (startDelay) await new Promise((resolve) => setTimeout(resolve, startDelay));
      return route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({registrationId: 'WS-0123456789ABCDEF0123456789ABCDEF', amount: 90})});
    }
    if (url.pathname === '/workshop/checkout') {
      if (checkoutDelay) await new Promise((resolve) => setTimeout(resolve, checkoutDelay));
      return route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'pending', checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD-QA'})});
    }
    if (url.pathname === '/workshop/status') {
      const response = status === 'paid' ? {status: 'paid', email: 'qa@linsi.test'} : {status};
      return route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(response)});
    }
    return route.abort();
  });
}

async function screenshot(page, scenario, state) {
  await page.screenshot({
    path: path.join(outputDir, `${scenario.name}-${state}.png`),
    fullPage: true,
  });
}

for (const scenario of scenarios) {
  const page = await browser.newPage({
    viewport: {width: scenario.width, height: scenario.height},
    colorScheme: scenario.colorScheme,
  });
  await installFakeTurnstile(page);
  await mockApi(page, {startDelay: 2500, checkoutDelay: 2500});

  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.getByRole('heading', {name: 'Inscrição no Workshop LINSI'}).waitFor();
  await screenshot(page, scenario, 'form');

  await page.locator('#nome').fill('Pessoa QA');
  await page.locator('#email').fill('qa@linsi.test');
  await page.locator('#cargo').fill('Product Designer');
  await page.locator('#cupom').fill('CROQ10');
  await page.getByText('Cupom aplicado', {exact: true}).waitFor();
  await screenshot(page, scenario, 'coupon');

  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.getByText('Preparando pagamento...', {exact: true}).waitFor();
  await screenshot(page, scenario, 'preparing');
  await page.close();

  for (const state of ['pending', 'failed', 'paid']) {
    const returnPage = await browser.newPage({
      viewport: {width: scenario.width, height: scenario.height},
      colorScheme: scenario.colorScheme,
    });
    await mockApi(returnPage, {status: state});
    await returnPage.goto(`${baseUrl}/workshop?checkout=${state === 'failed' ? 'failure' : state}&registrationId=WS-0123456789ABCDEF0123456789ABCDEF`, {waitUntil: 'networkidle'});
    if (state === 'pending') await returnPage.getByRole('heading', {name: 'Pagamento em processamento'}).waitFor();
    if (state === 'failed') await returnPage.getByRole('heading', {name: 'Pagamento não concluído'}).waitFor();
    if (state === 'paid') await returnPage.getByRole('heading', {name: 'Inscrição confirmada'}).waitFor();
    await screenshot(returnPage, scenario, state);
    await returnPage.close();
  }
}

await browser.close();
console.log(`Workshop visual QA screenshots generated in ${outputDir}`);
