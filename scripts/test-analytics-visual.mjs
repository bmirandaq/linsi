import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const baseline = process.env.ANALYTICS_BASELINE_URL ?? 'http://127.0.0.1:3000';
const candidate = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3001';
const artifactDir = process.env.ANALYTICS_ARTIFACT_DIR ?? 'artifacts/analytics-qa';
await mkdir(artifactDir, {recursive: true});
const browser = await chromium.launch({headless: true});
try {
  for (const viewport of [{name: 'desktop', width: 1440, height: 1000}, {name: 'mobile', width: 390, height: 844}]) {
    for (const theme of ['light', 'dark']) {
      const captures = [];
      for (const [name, url] of [['baseline', baseline], ['analytics', candidate]]) {
        const context = await browser.newContext({viewport, colorScheme: theme, reducedMotion: 'reduce'});
        // Test the UI without sending synthetic traffic to either vendor.
        await context.route(/https:\/\/(static\.cloudflareinsights\.com|www\.clarity\.ms)\//, (route) => route.fulfill({contentType: 'application/javascript', body: ''}));
        await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
        const page = await context.newPage();
        await page.goto(url, {waitUntil: 'networkidle'});
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => {})));
        });
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        captures.push(await page.screenshot({path: `${artifactDir}/${viewport.name}-${theme}-${name}.png`, fullPage: true, animations: 'disabled'}));
        await context.close();
      }
      assert.ok(captures[0].equals(captures[1]), `Home visual difference: ${viewport.name}/${theme}; inspect ${artifactDir}`);
      console.log(`Home identical: ${viewport.name}/${theme}`);
    }
  }
} finally {
  await browser.close();
}
