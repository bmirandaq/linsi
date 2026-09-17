import {writeFile, mkdir} from 'node:fs/promises';

// No trace, video, storageState, raw DOM, bodies, browser console or login screenshots.
export const report = {mock: false, checks: {}, blocker: null};
export const artifactDir = 'artifacts/workshop-preview-real';
export class SafeE2EError extends Error {}
export function check(condition, code) {
  if (!condition) throw new SafeE2EError(code);
}
export function passed(name) {
  report.checks[name] = 'passed';
  console.log('REAL E2E check passed: ' + name);
}
export function requireBuyerSecrets() {
  for (const name of ['MP_TEST_BUYER_USERNAME', 'MP_TEST_BUYER_PASSWORD', 'MP_TEST_BUYER_CODE']) {
    check(Boolean(process.env[name]?.trim()), name + ' ausente');
  }
}
export async function saveReport() {
  await mkdir(artifactDir, {recursive: true});
  const content = JSON.stringify(report, null, 2);
  for (const name of ['MP_TEST_BUYER_USERNAME', 'MP_TEST_BUYER_PASSWORD', 'MP_TEST_BUYER_CODE']) {
    const value = process.env[name];
    check(!value || !content.includes(value), 'secret_found_in_report');
  }
  await writeFile(artifactDir + '/report.json', content);
}
export async function firstVisible(locators) {
  for (const locator of locators) {
    for (const item of await locator.all()) {
      if (await item.isVisible()) return item;
    }
  }
  return null;
}
export async function providerBlock(page) {
  // Only fixed reason codes leave here; provider text may contain PII.
  const body = await page.locator('body').innerText().catch(() => '');
  if (/Hubo un error accediendo a esta p[aá]gina/i.test(body)) return 'mp_page_access_error';
  if (/algo saiu errado|algo sali[oó] mal|something went wrong/i.test(body)) return 'mp_generic_error';
  if (/senha incorreta|contrase[nñ]a incorrecta|incorrect password/i.test(body)) return 'mp_invalid_password';
  if (/n[aã]o foi poss[ií]vel iniciar sess[aã]o|n[aã]o conseguimos iniciar|no pudimos iniciar/i.test(body)) return 'mp_login_rejected';
  if (/prove que|confirme que.*humano|n[aã]o sou um rob[oô]|no soy un robot|verify you are human|complete.*captcha/i.test(body)) return 'mp_captcha_required';
  if (await firstVisible([page.locator('iframe[src*="recaptcha"][title*="challenge"], iframe[src*="hcaptcha"], [data-testid="captcha"]')])) return 'mp_captcha_required';
  return '';
}
export function isMpHost(host) {
  return ['mercadopago.com.br', 'mercadopago.com', 'mercadolivre.com.br', 'mercadolibre.com']
    .some(domain => host === domain || host.endsWith('.' + domain));
}
export async function loginBuyer(page, evidence) {
  const submitted = new Set();
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    check(isMpHost(new URL(page.url()).hostname), 'unexpected_login_host');
    const blocker = await providerBlock(page);
    check(!blocker, blocker);
    const user = await firstVisible([
      page.getByRole('textbox', {name: /e-mail|email|usu[aá]rio|usuario/i}),
      page.locator('input[autocomplete="username"], input[type="email"], input[name="user_id"]'),
    ]);
    const password = await firstVisible([
      page.getByLabel(/senha|contrase[nñ]a|password/i),
      page.locator('input[type="password"]'),
    ]);
    const code = await firstVisible([
      page.getByLabel(/c[oó]digo.*verifica|c[oó]digo.*seguran|verification code/i),
      page.locator('input[autocomplete="one-time-code"]'),
    ]);
    if (password && !submitted.has('password')) {
      await password.fill(process.env.MP_TEST_BUYER_PASSWORD);
      submitted.add('password');
      evidence.passwordSubmitted = true;
    } else if (code && !submitted.has('code')) {
      await code.fill(process.env.MP_TEST_BUYER_CODE);
      submitted.add('code');
      evidence.verificationSubmitted = true;
    } else if (user && !submitted.has('username')) {
      await user.fill(process.env.MP_TEST_BUYER_USERNAME);
      submitted.add('username');
      evidence.usernameSubmitted = true;
    } else {
      const payment = await firstVisible([
        page.getByRole('heading', {name: /como.*pagar|escolha.*pagamento|meio de pagamento|medio de pago/i}),
        page.getByRole('button', {name: /cart[aã]o de cr[eé]dito|tarjeta de cr[eé]dito/i}),
        page.getByLabel(/n[uú]mero do cart[aã]o|n[uú]mero de tarjeta/i),
      ]);
      if (payment && submitted.has('password')) {
        passed('login buyer');
        return;
      }
      const loginLink = await firstVisible([
        page.getByRole('link', {name: /entrar na.*conta|iniciar sess[aã]o|iniciar sesi[oó]n/i}),
        page.getByRole('button', {name: /entrar na.*conta|iniciar sess[aã]o|iniciar sesi[oó]n/i}),
      ]);
      if (loginLink && !submitted.has('loginLink')) {
        submitted.add('loginLink');
        await loginLink.click();
      } else {
        await page.waitForTimeout(750);
      }
      continue;
    }
    const submit = await firstVisible([
      page.getByRole('button', {name: /^(continuar|entrar|iniciar sess[aã]o|iniciar sesi[oó]n|verificar|confirmar|acessar)$/i}),
      page.locator('button[type="submit"], input[type="submit"]'),
    ]);
    check(submit, 'login_submit_control_missing');
    await submit.click();
    await page.waitForTimeout(1500);
  }
  throw new SafeE2EError('login_not_confirmed_timeout');
}
