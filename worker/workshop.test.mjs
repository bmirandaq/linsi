import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {default: worker} = await import(moduleUrl);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const couponConfig = JSON.stringify({
  VAGASUX10: {partner: 'Vagas UX', discount: 10, active: true},
  CROQ10: {partner: 'Design Croquete', discount: 10, active: true},
  GUIA10: {partner: 'GUIA', discount: 10, active: true},
});
const fullPaymentUrl = 'https://mpago.la/linsi-full-test';
const discountPaymentUrl = 'https://link.mercadopago.com.br/linsi-discount-test';

const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  TURNSTILE_SECRET_KEY: 'test-value',
  NOTION_API_KEY: 'test-value',
  WORKSHOP_NOTION_DATABASE_ID: 'workshop-db',
  WORKSHOP_COUPONS_JSON: couponConfig,
  WORKSHOP_PAYMENT_LINK_FULL: fullPaymentUrl,
  WORKSHOP_PAYMENT_LINK_DISCOUNT: discountPaymentUrl,
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

for (const coupon of ['VagasUX10', 'vagasux10', ' CROQ10 ', 'guia10']) {
  const response = await worker.fetch(post('/workshop/coupon', {coupon}), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'valid');
}

{
  const response = await worker.fetch(post('/workshop/coupon', {coupon: 'NAOEXISTE'}), env);
  assert.deepEqual(await response.json(), {status: 'invalid'});
}

async function startWorkshop(payload, customEnv = env) {
  let notionBody;
  const calls = [];
  let response;

  await withFetch(async (url, options = {}) => {
    const target = String(url);
    calls.push(target);
    if (target === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      return Response.json({success: true, hostname: 'linsi.beamiranda.com.br', action: 'workshop'});
    }
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
      turnstileToken: 'valid-test-value',
      ...payload,
    }), customEnv);
  });

  return {response, notionBody, calls};
}

{
  const {response, notionBody, calls} = await startWorkshop({
    coupon: 'croq10',
    amount: 1,
    paymentUrl: 'https://evil.example/roubo',
    partner: 'Atacante',
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.registrationId, /^WS-[A-F0-9]{32}$/);
  assert.equal(body.amount, 90);
  assert.equal(body.paymentUrl, discountPaymentUrl);
  assert.equal('publicKey' in body, false);
  assert.equal('attempts' in body, false);

  assert.deepEqual(calls, [
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    'https://api.notion.com/v1/pages',
  ]);
  assert.equal(notionBody.properties.Nome.rich_text[0].text.content, 'Pessoa Teste');
  assert.equal(notionBody.properties['E-mail'].email, 'pessoa@example.com');
  assert.equal(notionBody.properties.Cargo.rich_text[0].text.content, 'Product Designer');
  assert.equal(notionBody.properties.Empresa.rich_text[0].text.content, 'Empresa Teste');
  assert.equal(notionBody.properties.LinkedIn.url, 'https://www.linkedin.com/in/pessoa-teste');
  assert.equal(notionBody.properties.WhatsApp.phone_number, '81999999999');
  assert.equal(notionBody.properties.Cupom.rich_text[0].text.content, 'CROQ10');
  assert.equal(notionBody.properties.Parceiro.rich_text[0].text.content, 'Design Croquete');
  assert.equal(notionBody.properties.Valor.number, 90);
  assert.equal(notionBody.properties.Status.select.name, 'Aguardando pagamento');
  assert.deepEqual(notionBody.properties['MP Order ID'].rich_text, []);
  assert.equal(notionBody.properties['Pago em'].date, null);
  assert.equal(notionBody.properties['Tentativas de pagamento'].number, 0);
  assert.equal(notionBody.properties['Bloqueado até'].date, null);
}

{
  const {response, notionBody} = await startWorkshop({coupon: '', amount: 1, paymentUrl: 'https://evil.example'});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.amount, 100);
  assert.equal(body.paymentUrl, fullPaymentUrl);
  assert.deepEqual(notionBody.properties.Cupom.rich_text, []);
  assert.deepEqual(notionBody.properties.Parceiro.rich_text, []);
  assert.equal(notionBody.properties.Valor.number, 100);
  assert.equal(notionBody.properties.Status.select.name, 'Aguardando pagamento');
}

for (const [coupon, expectedPartner] of [
  ['VagasUX10', 'Vagas UX'],
  ['Croq10', 'Design Croquete'],
  ['GUIA10', 'GUIA'],
]) {
  const {response, notionBody} = await startWorkshop({coupon});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).amount, 90);
  assert.equal(notionBody.properties.Parceiro.rich_text[0].text.content, expectedPartner);
}

await withFetch(async () => {
  throw new Error('Cupom inválido não deve chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(post('/workshop/start', {
    nome: 'Pessoa Teste',
    email: 'pessoa@example.com',
    cargo: 'Product Designer',
    coupon: 'FAKE100',
    turnstileToken: 'valid-test-value',
  }), env);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'coupon_invalid');
});

for (const key of ['WORKSHOP_PAYMENT_LINK_FULL', 'WORKSHOP_PAYMENT_LINK_DISCOUNT']) {
  const brokenEnv = {...env};
  delete brokenEnv[key];
  const coupon = key.endsWith('DISCOUNT') ? 'CROQ10' : '';
  await withFetch(async () => {
    throw new Error('Configuração de link ausente não deve chamar serviços externos.');
  }, async () => {
    const response = await worker.fetch(post('/workshop/start', {
      nome: 'Pessoa Teste',
      email: 'pessoa@example.com',
      cargo: 'Product Designer',
      coupon,
      turnstileToken: 'valid-test-value',
    }), brokenEnv);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).message, 'O pagamento está temporariamente indisponível.');
  });
}

for (const invalidUrl of [
  'http://mpago.la/inseguro',
  'https://evil.example/pagamento',
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
      turnstileToken: 'valid-test-value',
    }), brokenEnv);
    assert.equal(response.status, 503);
  });
}

for (const path of [
  '/workshop/payment/reset',
  '/workshop/pay/card',
  '/workshop/pay/pix',
  '/workshop/checkout',
]) {
  await withFetch(async () => {
    throw new Error('Endpoint aposentado não pode chamar serviços externos.');
  }, async () => {
    const response = await worker.fetch(post(path, {registrationId: 'WS-TEST'}), env);
    assert.equal(response.status, 410, path);
  });
}

await withFetch(async () => {
  throw new Error('Status aposentado não pode chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(new Request('https://linsi-form-handler.example.test/workshop/status?id=WS-TEST', {
    method: 'GET',
    headers: {Origin: allowedOrigin},
  }), env);
  assert.equal(response.status, 410);
});

await withFetch(async () => {
  throw new Error('Webhook aposentado não pode chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(new Request('https://linsi-form-handler.example.test/webhooks/mercadopago', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: '{}',
  }), env);
  assert.equal(response.status, 410);
});

assert.doesNotMatch(source, /api\.mercadopago\.com/);
assert.doesNotMatch(source, /MP_ACCESS_TOKEN|MP_PUBLIC_KEY|MP_WEBHOOK_SECRET/);
assert.doesNotMatch(source, /processing_mode|external_reference|qr_code|payment_method/);

console.log('Workshop manual payment tests passed: server-side coupon/value/link selection, Notion pending state, no Mercado Pago API and retired payment endpoints.');
