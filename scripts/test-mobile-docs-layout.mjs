import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const viewport = {width: 440, height: 956};

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

try {
  const response = await page.goto(`${baseUrl}/docs/principios`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });
  assert.ok(response, 'navigation produced no response');
  assert.ok(response.status() < 400, `HTTP ${response.status()}`);

  const metrics = await page.evaluate(() => {
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        widthCss: style.width,
        overflowX: style.overflowX,
        display: style.display,
        position: style.position,
        boxSizing: style.boxSizing,
        flex: style.flex,
      };
    };

    const docMain = document.querySelector("[class*='docMainContainer']");
    const container = docMain?.querySelector(':scope > .container') ?? null;
    const row = docMain?.querySelector('.row') ?? null;
    const col = docMain?.querySelector('.col') ?? null;
    const article = document.querySelector('.theme-doc-markdown');
    const lead = article?.querySelector(':scope > p') ?? null;
    const principle = article?.querySelector('.principle') ?? null;
    const principleParagraph = principle?.querySelector('p') ?? null;
    const navbar = document.querySelector('.navbar');
    const navbarRight = document.querySelector('.navbar__items--right');

    return {
      viewport: {
        innerWidth: window.innerWidth,
        visualViewportWidth: window.visualViewport?.width ?? null,
        rootClientWidth: document.documentElement.clientWidth,
        rootScrollWidth: document.documentElement.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
      },
      docsWrapper: rect(document.querySelector("[class*='docsWrapper']")),
      docRoot: rect(document.querySelector("[class*='docRoot']")),
      docMain: rect(docMain),
      container: rect(container),
      row: rect(row),
      col: rect(col),
      article: rect(article),
      lead: rect(lead),
      principle: rect(principle),
      principleParagraph: rect(principleParagraph),
      navbar: rect(navbar),
      navbarRight: rect(navbarRight),
    };
  });

  console.log('iPhone 16 Pro Max docs metrics:');
  console.log(JSON.stringify(metrics, null, 2));

  const assertInsideViewport = (name, box) => {
    assert.ok(box, `${name} box is unavailable`);
    assert.ok(box.left >= -1, `${name} starts outside viewport at ${box.left}px`);
    assert.ok(
      box.right <= viewport.width + 1,
      `${name} exceeds viewport by ${Math.round(box.right - viewport.width)}px`,
    );
  };

  assert.equal(metrics.viewport.innerWidth, viewport.width, 'browser innerWidth differs from emulated viewport');
  assertInsideViewport('docs main', metrics.docMain);
  assertInsideViewport('docs container', metrics.container);
  assertInsideViewport('docs article', metrics.article);
  assertInsideViewport('docs lead paragraph', metrics.lead);
  assertInsideViewport('principle paragraph', metrics.principleParagraph);
  assertInsideViewport('navbar', metrics.navbar);
  assertInsideViewport('navbar right controls', metrics.navbarRight);
} finally {
  await page.close();
  await context.close();
  await browser.close();
}

console.log('iPhone 16 Pro Max docs layout passed viewport-bound checks.');
