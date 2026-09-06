import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const screenshotPath = process.env.SCREENSHOT_PATH;
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
const page = await context.newPage();

try {
  const response = await page.goto(`${baseUrl}/docs/principios`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });
  assert.ok(response, 'navigation produced no response');
  assert.ok(response.status() < 400, `HTTP ${response.status()}`);

  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(250);

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
        overflowY: style.overflowY,
        display: style.display,
        position: style.position,
        boxSizing: style.boxSizing,
        flex: style.flex,
        transform: style.transform,
        clipPath: style.clipPath,
        contain: style.contain,
      };
    };

    const lineRects = (element) => {
      if (!element) return [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const rects = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent ?? '';
        for (let i = 0; i < text.length; i += 1) {
          if (/\s/.test(text[i])) continue;
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const box = range.getBoundingClientRect();
          if (!box.width && !box.height) continue;
          rects.push({left: box.left, right: box.right, top: box.top, bottom: box.bottom});
        }
      }
      return rects;
    };

    const ancestorStyles = (element) => {
      const result = [];
      let current = element;
      while (current && current !== document.documentElement) {
        const style = getComputedStyle(current);
        const box = current.getBoundingClientRect();
        result.push({
          tag: current.tagName,
          className: typeof current.className === 'string' ? current.className : '',
          left: box.left,
          right: box.right,
          width: box.width,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          transform: style.transform,
          clipPath: style.clipPath,
          contain: style.contain,
        });
        current = current.parentElement;
      }
      return result;
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
    const leadChars = lineRects(lead);
    const principleChars = lineRects(principleParagraph);

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
      textPaint: {
        leadMaxRight: leadChars.length ? Math.max(...leadChars.map((item) => item.right)) : null,
        principleMaxRight: principleChars.length ? Math.max(...principleChars.map((item) => item.right)) : null,
        leadMinLeft: leadChars.length ? Math.min(...leadChars.map((item) => item.left)) : null,
        principleMinLeft: principleChars.length ? Math.min(...principleChars.map((item) => item.left)) : null,
      },
      leadAncestors: ancestorStyles(lead),
      principleAncestors: ancestorStyles(principleParagraph),
    };
  });

  console.log(`iPhone 16 Pro Max docs metrics for ${baseUrl}:`);
  console.log(JSON.stringify(metrics, null, 2));

  if (screenshotPath) {
    fs.mkdirSync(path.dirname(screenshotPath), {recursive: true});
    await page.screenshot({path: screenshotPath, fullPage: true});
    console.log(`Saved screenshot to ${screenshotPath}`);
  }

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
  assert.ok(metrics.textPaint.leadMaxRight <= viewport.width + 1, `lead text paint exceeds viewport at ${metrics.textPaint.leadMaxRight}px`);
  assert.ok(metrics.textPaint.principleMaxRight <= viewport.width + 1, `principle text paint exceeds viewport at ${metrics.textPaint.principleMaxRight}px`);
} finally {
  await page.close();
  await context.close();
  await browser.close();
}

console.log(`iPhone 16 Pro Max docs layout passed viewport-bound checks for ${baseUrl}.`);
