import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const routes = ['/', '/docs/principios'];

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}});

try {
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(`${baseUrl}${route}`, {waitUntil: 'networkidle', timeout: 30_000});
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    const state = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const main = document.querySelector('.main-wrapper');
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--linsi-bg-canvas)';
      document.body.appendChild(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();

      return {
        expected,
        root: getComputedStyle(root).backgroundColor,
        body: getComputedStyle(body).backgroundColor,
        main: main ? getComputedStyle(main).backgroundColor : null,
      };
    });

    assert.notEqual(state.expected, 'rgba(0, 0, 0, 0)', `${route}: token de canvas não pode ser transparente`);
    assert.notEqual(state.expected, 'rgb(0, 0, 0)', `${route}: token de canvas não pode ser preto puro`);
    assert.equal(state.root, state.expected, `${route}: o <html> precisa pintar o canvas do dark mode`);
    assert.equal(state.body, state.expected, `${route}: o <body> precisa usar o mesmo canvas do dark mode`);
    if (state.main) {
      assert.equal(state.main, state.expected, `${route}: o conteúdo principal precisa usar o mesmo canvas do dark mode`);
    }

    await page.close();
  }

  console.log('Dark mode canvas passed: html, body and main preserve the semantic canvas instead of transparent/black.');
} finally {
  await context.close();
  await browser.close();
}
