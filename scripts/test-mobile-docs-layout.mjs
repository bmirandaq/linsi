import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const fontPreference = process.env.FONT_PREFERENCE ?? 'manrope';
const viewport = {width: 440, height: 956};

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
  ignoreHTTPSErrors: true,
});

await context.addInitScript((font) => {
  try {
    window.localStorage.setItem('linsi-font-family', font);
  } catch {
    // The site falls back to its default font when storage is unavailable.
  }
}, fontPreference);

const page = await context.newPage();

const getTextPaintBounds = async (locator) =>
  locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const rects = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent ?? '';

      for (let index = 0; index < text.length; index += 1) {
        if (/\s/.test(text[index])) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const box = range.getBoundingClientRect();

        if (box.width || box.height) {
          rects.push({left: box.left, right: box.right});
        }
      }
    }

    return {
      minLeft: rects.length ? Math.min(...rects.map(({left}) => left)) : null,
      maxRight: rects.length ? Math.max(...rects.map(({right}) => right)) : null,
    };
  });

try {
  const response = await page.goto(`${baseUrl}/docs/principios`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });

  assert.ok(response, 'navigation produced no response');
  assert.ok(response.status() < 400, `HTTP ${response.status()}`);

  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForFunction(
    (font) => document.documentElement.dataset.fontFamily === font,
    fontPreference,
  );

  const article = page.locator('.theme-doc-markdown').first();
  const lead = article.locator(':scope > p').first();
  const principle = article.locator('.principle').first();
  const principleParagraph = principle.locator('p').first();
  const navbar = page.locator('.navbar').first();
  const navbarRight = page.locator('.navbar__items--right').first();

  for (const locator of [article, lead, principle, principleParagraph, navbar, navbarRight]) {
    await locator.waitFor({state: 'visible'});
  }

  const viewportState = await page.evaluate(() => ({
    fontFamily: document.documentElement.dataset.fontFamily ?? null,
    innerWidth: window.innerWidth,
    rootClientWidth: document.documentElement.clientWidth,
    rootScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  assert.equal(viewportState.fontFamily, fontPreference, 'stored font preference was not applied');
  assert.equal(viewportState.innerWidth, viewport.width, 'browser innerWidth differs from emulated viewport');
  assert.equal(viewportState.rootClientWidth, viewport.width, 'document client width differs from emulated viewport');
  assert.equal(viewportState.rootScrollWidth, viewport.width, 'document creates horizontal overflow');
  assert.equal(viewportState.bodyScrollWidth, viewport.width, 'body creates horizontal overflow');

  const assertInsideViewport = async (name, locator) => {
    const box = await locator.boundingBox();
    assert.ok(box, `${name} box is unavailable`);
    assert.ok(box.x >= -1, `${name} starts outside viewport at ${box.x}px`);
    assert.ok(
      box.x + box.width <= viewport.width + 1,
      `${name} exceeds viewport by ${Math.round(box.x + box.width - viewport.width)}px`,
    );
  };

  await assertInsideViewport('docs article', article);
  await assertInsideViewport('docs lead paragraph', lead);
  await assertInsideViewport('principle', principle);
  await assertInsideViewport('principle paragraph', principleParagraph);
  await assertInsideViewport('navbar', navbar);
  await assertInsideViewport('navbar right controls', navbarRight);

  const leadPaint = await getTextPaintBounds(lead);
  const principlePaint = await getTextPaintBounds(principleParagraph);

  assert.ok(leadPaint.minLeft >= -1, `lead text paint starts outside viewport at ${leadPaint.minLeft}px`);
  assert.ok(leadPaint.maxRight <= viewport.width + 1, `lead text paint exceeds viewport at ${leadPaint.maxRight}px`);
  assert.ok(principlePaint.minLeft >= -1, `principle text paint starts outside viewport at ${principlePaint.minLeft}px`);
  assert.ok(principlePaint.maxRight <= viewport.width + 1, `principle text paint exceeds viewport at ${principlePaint.maxRight}px`);

  const principleOverflow = await principle.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  assert.ok(
    principleOverflow <= 1,
    `principle creates ${principleOverflow}px of internal horizontal overflow`,
  );
} finally {
  await page.close();
  await context.close();
  await browser.close();
}

console.log(`iPhone 16 Pro Max docs layout passed at 440x956 using ${fontPreference}.`);
