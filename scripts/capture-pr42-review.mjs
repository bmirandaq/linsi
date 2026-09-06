import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true});
await fs.mkdir('/tmp/linsi-review', {recursive: true});

// 1) Back to top — mobile viewport, after meaningful scroll.
{
  const context = await browser.newContext({viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, {waitUntil: 'networkidle'});
  await page.evaluate(() => window.scrollTo({top: 900, behavior: 'auto'}));
  await page.waitForTimeout(150);
  const button = page.locator('.theme-back-to-top-button').first();
  await button.waitFor({state: 'visible'});
  await page.screenshot({path: '/tmp/linsi-review/back-to-top-mobile.jpg', type: 'jpeg', quality: 78});
  await context.close();
}

// 2) Cursor trail — desktop pointer. Browser screenshots do not capture the OS/native cursor,
// so an exact copy of the current cursor SVG is overlaid only for this review capture.
{
  const context = await browser.newContext({viewport: {width: 900, height: 620}});
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, {waitUntil: 'networkidle'});

  const points = [];
  for (let i = 0; i < 64; i += 1) {
    const t = i / 63;
    points.push({
      x: 170 + t * 500,
      y: 260 + Math.sin(t * Math.PI * 2.2) * 62,
    });
  }

  for (const point of points) {
    await page.mouse.move(point.x, point.y);
  }

  const last = points.at(-1);
  await page.evaluate(({x, y}) => {
    const img = document.createElement('img');
    img.src = '/img/cursor-linsi.svg';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    Object.assign(img.style, {
      position: 'fixed',
      left: `${x - 1}px`,
      top: `${y - 1}px`,
      width: '20px',
      height: '24px',
      pointerEvents: 'none',
      zIndex: '10001',
    });
    document.body.appendChild(img);
  }, last);

  await page.screenshot({
    path: '/tmp/linsi-review/cursor-trail.jpg',
    type: 'jpeg',
    quality: 82,
    clip: {x: 110, y: 145, width: 650, height: 300},
  });
  await context.close();
}

await browser.close();

for (const file of ['back-to-top-mobile.jpg', 'cursor-trail.jpg']) {
  const data = await fs.readFile(`/tmp/linsi-review/${file}`);
  console.log(`LINSI_SCREENSHOT_BEGIN:${file}`);
  console.log(data.toString('base64'));
  console.log(`LINSI_SCREENSHOT_END:${file}`);
}
