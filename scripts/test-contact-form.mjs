import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {})});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
let submissions = [];
let apiStatus = 200;
let challengeDelay = 0;
let scriptDelay = 0;
let scriptRequests = 0;
let challengeFails = false;

await context.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', async (route) => {
  scriptRequests += 1;
  if (scriptDelay) await new Promise((resolve) => setTimeout(resolve, scriptDelay));
  await route.fulfill({contentType: 'application/javascript', body: `
    (() => {
      let options;
      window.turnstile = {
        ready: (callback) => queueMicrotask(callback),
        render: (_, value) => { options = value; return 'test-widget'; },
        reset: () => {},
        remove: () => {},
        execute: () => setTimeout(() => ${challengeFails ? "options['error-callback']()" : "options.callback('local-mock-token')"}, ${challengeDelay})
      };
    })();
  `});
});
await context.route('https://linsi-form-handler.bmirandaqux.workers.dev/**', async (route) => {
  submissions.push(route.request().postDataJSON());
  await route.fulfill({status: apiStatus, contentType: 'application/json', body: JSON.stringify(apiStatus === 200 ? {ok: true} : {error: 'mock error'})});
});
await context.route(/https:\/\/api\.(notion|resend)\.com\//, () => {
  throw new Error('O teste não pode chamar Notion ou Resend.');
});
const page = await context.newPage();
async function openForm() {
  await page.goto(`${baseUrl}/contribuir-ajuda`, {waitUntil: 'networkidle'});
  await page.locator('#nome').fill('Teste automatizado');
  await page.locator('#email').fill('teste@example.com');
  await page.locator('#assunto').fill('Teste local com mocks');
  await page.locator('#mensagem').fill('Esta mensagem não sai do teste automatizado.');
}
async function submit() {
  await page.getByRole('button', {name: 'Enviar mensagem', exact: true}).click();
}

try {
  await mkdir('test-results/contact-form', {recursive: true});
  await openForm();
  for (const value of ['texto qualquer', 'https://example.com/in/teste', 'https://linkedin.com/company/teste']) {
    await page.locator('#linkedin').fill(value);
    assert.equal(await page.locator('#linkedin').evaluate((e) => e.validity.patternMismatch), true);
    await submit();
    assert.equal(submissions.length, 0, 'LinkedIn inválido deve impedir o envio no navegador.');
  }
  await page.locator('#linkedin').fill('');
  assert.equal(await page.locator('form').evaluate((form) => form.checkValidity()), true);
  await submit();
  await page.getByRole('status').filter({hasText: 'Mensagem recebida'}).waitFor();
  assert.equal(submissions[0].linkedin, '');
  assert.equal(submissions[0].whatsapp, '');

  await openForm();
  apiStatus = 500;
  await page.locator('#email').fill('');
  // Simulate a browser/password manager filling the DOM without an input event.
  await page.locator('#email').evaluate((input) => { input.value = 'autofill@example.com'; });
  await submit();
  await page.getByRole('alert').filter({hasText: 'Não foi possível registrar'}).waitFor();
  assert.equal(submissions.at(-1).email, 'autofill@example.com', 'O payload deve usar o e-mail visível, mesmo sem evento de autofill.');
  assert.equal(await page.locator('#email').inputValue(), 'autofill@example.com', 'Uma falha não pode apagar o valor preenchido automaticamente.');
  apiStatus = 200;
  await submit();
  await page.getByRole('status').filter({hasText: 'Mensagem recebida'}).waitFor();

  await openForm();
  for (const value of ['linkedin.com/in/name-user', 'http://www.linkedin.com/in/name-user/', ' HTTPS://LINKEDIN.COM/IN/name-user ']) {
    await page.locator('#linkedin').fill(value);
    await page.locator('#whatsapp').focus();
    assert.equal(await page.locator('#linkedin').inputValue(), 'https://www.linkedin.com/in/name-user');
    assert.equal(await page.locator('#linkedin').evaluate((e) => e.validity.valid), true);
  }
  await page.locator('#whatsapp').fill('+55 (11) 99999-9999');
  assert.equal(await page.locator('#whatsapp').inputValue(), '5511999999999');
  await submit();
  await page.getByRole('status').filter({hasText: 'Mensagem recebida'}).waitFor();
  assert.equal(submissions.at(-1).linkedin, 'https://www.linkedin.com/in/name-user');
  assert.equal(submissions.at(-1).whatsapp, '5511999999999');

  // SPA navigation must reuse the script and create a fresh widget.
  const scriptsBeforeNavigation = scriptRequests;
  await page.locator('a.navbar__brand').click();
  await page.locator('footer').getByRole('link', {name: 'Contribuir e pedir ajuda'}).click();
  await page.locator('#nome').waitFor();
  assert.equal(scriptRequests, scriptsBeforeNavigation);

  for (const [status, message] of [[403, 'A verificação de segurança'], [400, 'Confira os campos'], [500, 'Não foi possível registrar']]) {
    apiStatus = status;
    await openForm();
    await submit();
    await page.getByRole('alert').filter({hasText: message}).waitFor();
    assert.equal(await page.getByRole('button', {name: 'Enviar mensagem', exact: true}).isEnabled(), true);
  }
  apiStatus = 200;
  challengeFails = true;
  const submissionsBeforeChallengeFailure = submissions.length;
  await openForm();
  await submit();
  await page.getByRole('alert').filter({hasText: 'Não foi possível concluir a verificação de segurança'}).waitFor();
  assert.equal(submissions.length, submissionsBeforeChallengeFailure, 'Falha no Turnstile não pode enviar ao Worker.');
  challengeFails = false;
  challengeDelay = 11000;
  await openForm();
  await submit();
  await page.getByRole('status').filter({hasText: 'Mensagem recebida'}).waitFor({timeout: 20000});

  // Submitting while the external script loads must wait for its readiness.
  scriptDelay = 3000;
  challengeDelay = 0;
  await page.goto(`${baseUrl}/contribuir-ajuda`, {waitUntil: 'domcontentloaded'});
  for (const [id, value] of Object.entries({nome: 'Teste', email: 'teste@example.com', assunto: 'Teste', mensagem: 'Teste local'})) {
    await page.locator(`#${id}`).fill(value);
  }
  await submit();
  await page.getByRole('status').filter({hasText: 'Mensagem recebida'}).waitFor();
  scriptDelay = 0;

  // Force Chromium's autofill pseudo-state, which overrides background-color.
  const cdp = await context.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
    const {root} = await cdp.send('DOM.getDocument');
    for (const id of ['nome', 'email', 'linkedin', 'whatsapp', 'assunto']) {
      const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: root.nodeId, selector: `#${id}`});
      await cdp.send('CSS.forcePseudoState', {nodeId, forcedPseudoClasses: ['autofill']});
      await page.locator(`#${id}`).focus();
      await page.waitForTimeout(250);
      const state = await page.locator(`#${id}`).evaluate((input) => {
        const normal = getComputedStyle(document.querySelector('textarea'));
        const style = getComputedStyle(input);
        return {text: style.webkitTextFillColor, expectedText: normal.color, shadow: style.boxShadow, surface: normal.backgroundColor, border: style.borderColor};
      });
      assert.equal(state.text, state.expectedText, `${theme}/${id}: cor do texto em autofill`);
      assert.ok(state.shadow.includes(state.surface) && state.shadow.includes('1000px'), `${theme}/${id}: surface em autofill`);
      assert.ok(state.shadow.includes('3px'), `${theme}/${id}: foco preservado em autofill`);
      await cdp.send('CSS.forcePseudoState', {nodeId, forcedPseudoClasses: []});
    }
    await page.locator('#mensagem').focus();
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    await page.screenshot({path: `test-results/contact-form/${theme}.png`, fullPage: true});
  }
  await page.setViewportSize({width: 390, height: 844});
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({path: 'test-results/contact-form/mobile.png', fullPage: true});
  await context.close();
  console.log('Contact browser tests passed: native validation, optional contacts, normalization, Turnstile readiness/slow verification, SPA navigation, API errors and light/dark autofill. No production submissions.');
} finally {
  await browser.close();
}
