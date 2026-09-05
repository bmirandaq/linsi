import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const reportOnly = process.env.SMOKE_REPORT_ONLY === '1';
const routes = [
  '/',
  '/docs/principios',
  '/docs/pq-fluxogramas',
  '/contribuir',
  '/cafe-bea',
];
const viewports = [
  { name: 'desktop-wide', width: 1440, height: 1000 },
  { name: 'desktop', width: 1200, height: 900 },
  { name: 'docs-breakpoint', width: 997, height: 900 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-small', width: 360, height: 800 },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

const recordFailure = (scope, error) => {
  failures.push(`${scope}: ${error instanceof Error ? error.message : String(error)}`);
};

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });

  for (const route of routes) {
    const page = await context.newPage();
    const scope = `${viewport.name} ${route}`;
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    try {
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      });
      assert.ok(response, 'navigation produced no response');
      assert.ok(response.status() < 400, `HTTP ${response.status()}`);

      await page.locator('body').waitFor({ state: 'visible' });
      assert.equal(runtimeErrors.length, 0, `runtime errors: ${runtimeErrors.join(' | ')}`);

      const layout = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const navbar = document.querySelector('.navbar');
        const main = document.querySelector('main, .main-wrapper');
        const footer = document.querySelector('footer');
        return {
          rootOverflow: root.scrollWidth - root.clientWidth,
          bodyOverflow: body.scrollWidth - root.clientWidth,
          navbarOverflow: navbar ? navbar.scrollWidth - navbar.clientWidth : 0,
          hasMain: Boolean(main),
          hasFooter: Boolean(footer),
        };
      });

      assert.ok(layout.hasMain, 'main content is missing');
      assert.ok(layout.hasFooter, 'footer is missing');
      assert.ok(layout.rootOverflow <= 2, `horizontal document overflow of ${layout.rootOverflow}px`);
      assert.ok(layout.bodyOverflow <= 2, `horizontal body overflow of ${layout.bodyOverflow}px`);
      assert.ok(layout.navbarOverflow <= 2, `horizontal navbar overflow of ${layout.navbarOverflow}px`);

      if (route.startsWith('/docs/') && viewport.width >= 997) {
        const sidebar = page.locator('.theme-doc-sidebar-container').first();
        const article = page.locator('.theme-doc-markdown').first();
        await sidebar.waitFor({ state: 'visible' });
        await article.waitFor({ state: 'visible' });
        const sidebarBox = await sidebar.boundingBox();
        const articleBox = await article.boundingBox();
        assert.ok(sidebarBox && articleBox, 'docs layout boxes are unavailable');
        assert.ok(
          sidebarBox.x + sidebarBox.width <= articleBox.x + 2,
          `sidebar overlaps article by ${Math.round(sidebarBox.x + sidebarBox.width - articleBox.x)}px`,
        );
      }

      if (route === '/' && (viewport.width === 1440 || viewport.width === 390)) {
        const searchButton = page.locator('.navbar .aa-DetachedSearchButton').first();
        if (await searchButton.isVisible()) {
          await searchButton.click();
          const modal = page.locator('.aa-DetachedContainer').first();
          await modal.waitFor({ state: 'visible' });
          const modalBox = await modal.boundingBox();
          assert.ok(modalBox, 'search modal has no bounding box');
          assert.ok(modalBox.x >= -1, `search modal starts outside viewport at ${modalBox.x}px`);
          assert.ok(
            modalBox.x + modalBox.width <= viewport.width + 1,
            `search modal exceeds viewport by ${Math.round(modalBox.x + modalBox.width - viewport.width)}px`,
          );
          const cancel = page.locator('.aa-DetachedCancelButton').first();
          if (await cancel.isVisible()) await cancel.click();
        }
      }

      if (route === '/contribuir') {
        await page.locator('button[type="submit"]').first().waitFor({ state: 'visible' });
      }

      if (route === '/cafe-bea') {
        const buttons = page.locator('button');
        assert.ok((await buttons.count()) > 0, 'Pix page lost its interactive button');
      }

      if (route === '/docs/principios' && (viewport.width === 1440 || viewport.width === 390)) {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        const darkOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        assert.ok(darkOverflow <= 2, `dark mode horizontal overflow of ${darkOverflow}px`);
      }
    } catch (error) {
      recordFailure(scope, error);
    } finally {
      await page.close();
    }
  }

  await context.close();
}

await browser.close();

if (failures.length) {
  console.error(`Responsive smoke regressions failed (${failures.length}) against ${baseUrl}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (!reportOnly) process.exit(1);
} else {
  console.log(`Responsive browser smoke passed against ${baseUrl}: ${routes.length} routes × ${viewports.length} viewports, plus search and dark-mode checks.`);
}
