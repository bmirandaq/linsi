import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const outputDir = path.resolve('artifacts/workshop-qa');
const scenarios = [
  {name: 'desktop-1920-light', width: 1920, height: 1080, theme: 'light'},
  {name: 'desktop-1920-dark', width: 1920, height: 1080, theme: 'dark'},
  {name: 'desktop-1440-light', width: 1440, height: 1000, theme: 'light'},
  {name: 'desktop-1440-dark', width: 1440, height: 1000, theme: 'dark'},
  {name: 'mobile-390-light', width: 390, height: 844, theme: 'light', mobile: true},
  {name: 'mobile-390-dark', width: 390, height: 844, theme: 'dark', mobile: true},
];

await mkdir(outputDir, {recursive: true});

const browser = await chromium.launch({headless: true});

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: {width: scenario.width, height: scenario.height},
      deviceScaleFactor: scenario.mobile ? 2 : 1,
      isMobile: Boolean(scenario.mobile),
      hasTouch: Boolean(scenario.mobile),
    });

    const page = await context.newPage();
    await page.goto(baseUrl, {waitUntil: 'networkidle'});
    await page.evaluate((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }, scenario.theme);

    const workshop = page.locator('#workshop');
    await workshop.waitFor({state: 'visible'});
    await workshop.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);

    const rootOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (rootOverflow > 2) {
      throw new Error(`${scenario.name}: horizontal overflow of ${rootOverflow}px`);
    }

    await workshop.screenshot({
      path: path.join(outputDir, `${scenario.name}.png`),
      animations: 'disabled',
    });

    await context.close();
  }

  console.log(`Workshop visual QA captured: ${scenarios.length} screenshots in ${outputDir}.`);
} finally {
  await browser.close();
}
