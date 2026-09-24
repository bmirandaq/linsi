import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {default: worker} = await import(moduleUrl);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const couponConfig = JSON.stringify({
  VAGASUX15: {active: true},
  CLUBEUXW20: {active: true},
  CROQ5: {active: true},
  GUIA5: {active: true},
});
const fullPaymentUrl = 'https://mpago.la/linsi-full-test';
const payment95Url = 'https://mpago.la/linsi-95-test';
const payment85Url = 'https://mpago.la/linsi-85-test';
const payment80Url = 'https://mpago.la/linsi-80-test';

const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  NOTION_API_KEY: 'test-value',
  WORKSHOP_NOTION_DATABASE_ID: 'workshop-db',
  WORKSHOP_COUPONS_JSON: couponConfig,
  WORKSHOP_PAYMENT_LINK_FULL: fullPaymentUrl,
  WORKSHOP_PAYMENT_LINK_95: payment95Url,
  WORKSHOP_PAYMENT_LINK_85: payment85Url,
  WORKSHOP_PAYMENT_LINK_80: payment80Url,
};

function post(path, payload) {
  return new Request(`https://linsi-form-handler.example.test${path}`, {
    method: 'POST',
    headers: {
      Origin: allowedOrigin,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '203.0.113.10',
    },
    body: JSON.stringify(payload),
  });
}

async function withFetch(mock, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

for (const coupon of ['VagasUX15', 'vagasux15', ' CLUBEUXW20 ', 'croq5', 'guia5']) {
  const response = await worker.fetch(post('/workshop/coupon', {coupon}), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'valid');
}

{
  const response = await worker.fetch(post('/workshop/coupon', {coupon: 'NAOEXISTE'}), env);
  assert.deepEqual(await response.json(), {status: 'invalid'});
}

{
  const response = await worker.fetch(post('/workshop/coupon', {coupon: 'VAGASUX10'}), env);
  assert.deepEqual(await response.json(), {status: 'invalid'});
}

async function startWorkshop(payload, customEnv = env) {
  let notionBody;
  const calls = [];
  let response;

  await withFetch(async (url, options = {}) => {
    const target = String(url);
    calls.push(target);
    if (target === 'https://api.notion.com/v1/pages') {
      notionBody = JSON.parse(options.body);
      return Response.json({id: 'page-workshop'});
    }
    throw new Error(`Chamada externa inesperada: ${target}`);
  }, async () => {
    response = await worker.fetch(post('/workshop/start', {
      nome: 'Pessoa Teste',
      email: 'pessoa@example.com',
      cargo: 'Product Designer',
      empresa: 'Empresa Teste',
      linkedin: 'linkedin.com/in/pessoa-teste',
      whatsapp: '81999999999',
      ...payload,
    }), customEnv);
  });

  return {response, notionBody, calls};
}

{
  const {response, notionBody, calls} = await startWorkshop({
    coupon: 'croq5',
    amount: 1,
    paymentUrl: 'https://example.com/ignored',
    partner: 'Ignored',
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.registrationId, /^WS-[A-F0-9]{32}$/);
  assert.equal(body.amount, 95);
  assert.equal(body.paymentUrl, payment95Url);
  assert.deepEqual(calls, ['https://api.notion.com/v1/pages']);
  assert.equal(notionBody.properties.Nome.rich_text[0].text.content, 'Pessoa Teste');
  assert.equal(notionBody.properties['E-mail'].email, 'pessoa@example.com');
  assert.equal(notionBody.properties.Cargo.rich_text[0].text.content, 'Product Designer');
  assert.equal(notionBody.properties.Empresa.rich_text[0].text.content, 'Empresa Teste');
  assert.equal(notionBody.properties.LinkedIn.url, 'https://www.linkedin.com/in/pessoa-teste');
  assert.equal(notionBody.properties.WhatsApp.phone_number, '81999999999');
  assert.equal(notionBody.properties.Cupom.rich_text[0].text.content, 'CROQ5');
  assert.equal(notionBody.properties.Parceiro.rich_text[0].text.content, 'Design Croquete');
  assert.equal(notionBody.properties.Valor.number, 95);
  assert.equal(notionBody.properties.Status.select.name, 'Aguardando pagamento');
  assert.equal(notionBody.properties['Pago em'].date, null);
  assert.equal(notionBody.properties['Acesso enviado'].checkbox, false);
  assert.equal(notionBody.properties['Confirmação enviada'].checkbox, false);
}

{
  const {response, notionBody} = await startWorkshop({coupon: '', amount: 1, paymentUrl: 'https://example.com/ignored'});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.amount, 100);
  assert.equal(body.paymentUrl, fullPaymentUrl);
  assert.deepEqual(notionBody.properties.Cupom.rich_text, []);
  assert.deepEqual(notionBody.properties.Parceiro.rich_text, []);
  assert.equal(notionBody.properties.Valor.number, 100);
  assert.equal(notionBody.properties.Status.select.name, 'Aguardando pagamento');
}

for (const [coupon, expectedPartner, expectedAmount, expectedPaymentUrl] of [
  ['VagasUX15', 'VagasUX', 85, payment85Url],
  ['CLUBEUXW20', 'Clube do UX Writing', 80, payment80Url],
  ['Croq5', 'Design Croquete', 95, payment95Url],
  ['GUIA5', 'GUIA', 95, payment95Url],
]) {
  const {response, notionBody} = await startWorkshop({coupon});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.amount, expectedAmount);
  assert.equal(body.paymentUrl, expectedPaymentUrl);
  assert.equal(notionBody.properties.Parceiro.rich_text[0].text.content, expectedPartner);
  assert.equal(notionBody.properties.Valor.number, expectedAmount);
}

await withFetch(async () => {
  throw new Error('Cupom inválido não deve chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(post('/workshop/start', {
    nome: 'Pessoa Teste',
    email: 'pessoa@example.com',
    cargo: 'Product Designer',
    coupon: 'FAKE100',
  }), env);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'coupon_invalid');
});

for (const [key, coupon] of [
  ['WORKSHOP_PAYMENT_LINK_FULL', ''],
  ['WORKSHOP_PAYMENT_LINK_95', 'CROQ5'],
  ['WORKSHOP_PAYMENT_LINK_85', 'VAGASUX15'],
  ['WORKSHOP_PAYMENT_LINK_80', 'CLUBEUXW20'],
]) {
  const brokenEnv = {...env};
  delete brokenEnv[key];
  await withFetch(async () => {
    throw new Error('Configuração de link ausente não deve chamar serviços externos.');
  }, async () => {
    const response = await worker.fetch(post('/workshop/start', {
      nome: 'Pessoa Teste',
      email: 'pessoa@example.com',
      cargo: 'Product Designer',
      coupon,
    }), brokenEnv);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).message, 'O pagamento está temporariamente indisponível.');
  });
}

for (const invalidUrl of [
  'http://mpago.la/inseguro',
  'https://example.com/pagamento',
  'javascript:alert(1)',
  'https://user:pass@mpago.la/credenciais',
  'https://mpago.la:8443/porta',
]) {
  const brokenEnv = {...env, WORKSHOP_PAYMENT_LINK_FULL: invalidUrl};
  await withFetch(async () => {
    throw new Error('Link inválido não deve chamar serviços externos.');
  }, async () => {
    const response = await worker.fetch(post('/workshop/start', {
      nome: 'Pessoa Teste',
      email: 'pessoa@example.com',
      cargo: 'Product Designer',
      coupon: '',
    }), brokenEnv);
    assert.equal(response.status, 503);
  });
}

console.log('Workshop registration tests passed: Notion registration, server-side coupon/value/link selection and no Turnstile dependency in the workshop flow.');
