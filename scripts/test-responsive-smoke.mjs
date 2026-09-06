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
  { name: 'mobile', width: 390, height: 844, mobile: true },
  { name: 'mobile-small', width: 360, height: 800, mobile: true },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

const recordFailure = (scope, error) => {
  failures.push(`${scope}: ${error instanceof Error ? error.message : String(error)}`);
};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.mobile ? 2 : 1,
    isMobile: Boolean(viewport.mobile),
    hasTouch: Boolean(viewport.mobile),
    ignoreHTTPSErrors: true,
  });

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

      if (viewport.width === 390 && (route === '/' || route === '/docs/principios')) {
        const backToTop = page.locator('[data-linsi-back-to-top="true"]');
        assert.equal(await backToTop.count(), 1, 'global back to top should render exactly once');
        assert.equal(await backToTop.isVisible(), false, 'back to top should start hidden');

        const scrollableDistance = await page.evaluate(() => {
          const scroller = document.scrollingElement ?? document.documentElement;
          return scroller.scrollHeight - window.innerHeight;
        });
        assert.ok(scrollableDistance > 300, 'route is not long enough to validate back to top');

        await page.evaluate(() => {
          const scroller = document.scrollingElement ?? document.documentElement;
          const maxScroll = scroller.scrollHeight - window.innerHeight;
          window.scrollTo(0, Math.min(700, maxScroll));
        });
        await page.waitForFunction(() => window.scrollY > 300);
        await backToTop.waitFor({state: 'visible', timeout: 3_000});
        await page.waitForTimeout(180);

        const visualState = await backToTop.evaluate((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const hit = document.elementFromPoint(centerX, centerY);
          return {
            opacity: Number(style.opacity),
            visibility: style.visibility,
            pointerEvents: style.pointerEvents,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            hitTested: hit === element || element.contains(hit),
          };
        });

        assert.ok(visualState.opacity >= 0.99, `back to top opacity is ${visualState.opacity}`);
        assert.equal(visualState.visibility, 'visible', 'back to top visibility is not visible');
        assert.equal(visualState.pointerEvents, 'auto', 'back to top is not interactive');
        assert.ok(visualState.width >= 47 && visualState.height >= 47, 'back to top rendered smaller than 48px');
        assert.ok(visualState.left >= 0 && visualState.top >= 0, 'back to top starts outside viewport');
        assert.ok(visualState.right <= viewport.width, 'back to top exceeds viewport width');
        assert.ok(visualState.bottom <= viewport.height, 'back to top exceeds viewport height');
        assert.equal(visualState.hitTested, true, 'back to top is visually covered by another element');

        await backToTop.tap();
        await page.waitForFunction(() => window.scrollY < 10);
        await backToTop.waitFor({state: 'hidden', timeout: 3_000});
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
  console.log(`Responsive browser smoke passed against ${baseUrl}: ${routes.length} routes × ${viewports.length} viewports, plus search, dark-mode and touch-emulated mobile back-to-top checks.`);
}
