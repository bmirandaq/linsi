import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const artifactDir = 'artifacts/workshop-manual-qa';
await mkdir(artifactDir, {recursive: true});

const browser = await chromium.launch({headless: true});

async function prepare(page, theme) {
  await page.goto(`${baseUrl}/workshop`, {waitUntil: 'networkidle'});
  await page.evaluate((value) => {
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('theme', value);
  }, theme);
  await page.reload({waitUntil: 'networkidle'});
}

async function fillRequired(page) {
  await page.locator('#nome').fill('Pessoa QA');
  await page.locator('#email').fill('qa@example.com');
  await page.locator('#cargo').fill('Product Designer');
}

try {
  for (const viewport of [
    {name: 'desktop', width: 1440, height: 1000},
    {name: 'mobile', width: 390, height: 844},
  ]) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({viewport: {width: viewport.width, height: viewport.height}});
      await prepare(page, theme);
      await page.screenshot({path: `${artifactDir}/${viewport.name}-${theme}-form.png`, fullPage: true});
      await fillRequired(page);
      await page.getByRole('button', {name: 'Continuar'}).click();
      await page.getByText('Registrando inscrição...', {exact: true}).waitFor();
      await page.screenshot({path: `${artifactDir}/${viewport.name}-${theme}-loading.png`, fullPage: true});
      await page.getByRole('heading', {name: 'Inscrição recebida'}).waitFor();
      await page.screenshot({path: `${artifactDir}/${viewport.name}-${theme}-registered-100.png`, fullPage: true});
      await page.close();
    }
  }

  const details = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await prepare(details, 'light');
  await details.locator('#cupom').fill('Croq10');
  await details.getByText('Cupom aplicado', {exact: true}).waitFor();
  await details.screenshot({path: `${artifactDir}/desktop-light-coupon-valid.png`, fullPage: true});
  await fillRequired(details);
  await details.getByRole('button', {name: 'Continuar'}).click();
  await details.getByRole('heading', {name: 'Inscrição recebida'}).waitFor();
  await details.getByText('R$ 90,00', {exact: true}).waitFor();
  await details.screenshot({path: `${artifactDir}/desktop-light-registered-90.png`, fullPage: true});
  await details.close();

  const invalid = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await prepare(invalid, 'light');
  await invalid.locator('#cupom').fill('NAOEXISTE');
  await invalid.getByText('Cupom inválido. Revise e corrija', {exact: true}).waitFor();
  await invalid.screenshot({path: `${artifactDir}/desktop-light-coupon-invalid.png`, fullPage: true});
  await invalid.close();

  console.log('Workshop manual visual QA screenshots captured.');
} finally {
  await browser.close();
}
