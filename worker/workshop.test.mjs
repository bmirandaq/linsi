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

const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  TURNSTILE_SECRET_KEY: 'test-value',
  NOTION_API_KEY: 'test-value',
  WORKSHOP_NOTION_DATABASE_ID: 'workshop-db',
  WORKSHOP_COUPONS_JSON: couponConfig,
  MP_ACCESS_TOKEN: 'test-value',
  MP_PUBLIC_KEY: 'TEST-public-key',
  RESEND_API_KEY: 'test-value',
  WORKSHOP_CONFIRMATION_TEMPLATE_ID: 'workshop-confirmation-template',
  CONTACT_FROM_EMAIL: 'LINSI <noreply@beamiranda.com.br>',
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

let createdRegistration;
await withFetch(async (url, options = {}) => {
  if (String(url) === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
    return Response.json({success: true, hostname: 'linsi.beamiranda.com.br', action: 'workshop'});
  }
  if (String(url) === 'https://api.notion.com/v1/pages') {
    createdRegistration = JSON.parse(options.body);
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Chamada externa inesperada: ${url}`);
}, async () => {
  const response = await worker.fetch(post('/workshop/start', {
    nome: 'Pessoa Teste',
    email: 'pessoa@example.com',
    cargo: 'Product Designer',
    empresa: 'Empresa Teste',
    linkedin: 'linkedin.com/in/pessoa-teste',
    whatsapp: '81999999999',
    coupon: 'croq10',
    turnstileToken: 'valid-test-value',
  }), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.registrationId, /^WS-[A-Z0-9]{10}$/);
  assert.equal(body.amount, 90);
  assert.equal(body.publicKey, 'TEST-public-key');
});

assert.equal(createdRegistration.properties.Nome.rich_text[0].text.content, 'Pessoa Teste');
assert.equal(createdRegistration.properties['E-mail'].email, 'pessoa@example.com');
assert.equal(createdRegistration.properties.Cargo.rich_text[0].text.content, 'Product Designer');
assert.equal(createdRegistration.properties.Empresa.rich_text[0].text.content, 'Empresa Teste');
assert.equal(createdRegistration.properties.LinkedIn.url, 'https://www.linkedin.com/in/pessoa-teste');
assert.equal(createdRegistration.properties.WhatsApp.phone_number, '81999999999');
assert.equal(createdRegistration.properties.Cupom.rich_text[0].text.content, 'CROQ10');
assert.equal(createdRegistration.properties.Parceiro.rich_text[0].text.content, 'Design Croquete');
assert.equal(createdRegistration.properties.Valor.number, 90);
assert.equal(createdRegistration.properties.Status.select.name, 'Inscrição iniciada');

{
  const response = await worker.fetch(post('/workshop/start', {
    nome: 'Pessoa Teste',
    email: 'pessoa@example.com',
    cargo: '',
    turnstileToken: 'valid-test-value',
  }), env);
  assert.equal(response.status, 400);
}

const registrationPage = {
  id: 'page-workshop',
  properties: {
    'Inscrição': {title: [{plain_text: 'WS-ABC1234567'}]},
    'Nome': {rich_text: [{plain_text: 'Pessoa Teste'}]},
    'E-mail': {email: 'pessoa@example.com'},
    'Cargo': {rich_text: [{plain_text: 'Product Designer'}]},
    'Empresa': {rich_text: [{plain_text: 'Empresa Teste'}]},
    'LinkedIn': {url: 'https://www.linkedin.com/in/pessoa-teste'},
    'WhatsApp': {phone_number: '81999999999'},
    'Cupom': {rich_text: [{plain_text: 'CROQ10'}]},
    'Parceiro': {rich_text: [{plain_text: 'Design Croquete'}]},
    'Valor': {number: 90},
    'Status': {select: {name: 'Inscrição iniciada'}},
    'MP Order ID': {rich_text: []},
    'Pago em': {date: null},
    'Confirmação enviada': {checkbox: false},
  },
};

let mercadoPagoBody;
let mercadoPagoHeaders;
let notionQueryCount = 0;
let confirmationEmails = 0;
let confirmationPayload;
let confirmationHeaders;
await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
    notionQueryCount += 1;
    return Response.json({results: [registrationPage]});
  }
  if (target === 'https://api.mercadopago.com/v1/orders') {
    mercadoPagoBody = JSON.parse(options.body);
    mercadoPagoHeaders = options.headers;
    return Response.json({
      id: 'ORD-CARD-1',
      external_reference: 'WS-ABC1234567',
      status: 'processed',
      status_detail: 'accredited',
      transactions: {payments: [{status: 'processed'}]},
    });
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') return Response.json({id: 'page-workshop'});
  if (target === 'https://api.resend.com/emails') {
    confirmationEmails += 1;
    confirmationPayload = JSON.parse(options.body);
    confirmationHeaders = options.headers;
    return Response.json({id: 'email-1'});
  }
  throw new Error(`Chamada externa inesperada: ${target}`);
}, async () => {
  const response = await worker.fetch(post('/workshop/pay/card', {
    registrationId: 'WS-ABC1234567',
    token: 'test-payment-value',
    paymentMethodId: 'visa',
    paymentTypeId: 'credit_card',
    installments: 1,
    deviceId: 'device-session-card',
    amount: 1,
  }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {status: 'paid'});
});

assert.ok(notionQueryCount >= 2);
assert.equal(mercadoPagoBody.total_amount, '90.00');
assert.equal(mercadoPagoBody.transactions.payments[0].amount, '90.00');
assert.equal(mercadoPagoBody.external_reference, 'WS-ABC1234567');
assert.equal(mercadoPagoBody.payer.email, 'pessoa@example.com');
assert.equal(mercadoPagoHeaders['X-meli-session-id'], 'device-session-card');
assert.equal(confirmationEmails, 1);
assert.equal(confirmationHeaders['Idempotency-Key'], 'workshop-confirmation/WS-ABC1234567');
assert.equal(confirmationPayload.template.id, 'workshop-confirmation-template');
assert.deepEqual(confirmationPayload.template.variables, {
  FIRST_NAME: 'Pessoa',
  WORKSHOP_DATE: '8 de outubro de 2026',
  WORKSHOP_TIME: '19h',
  WORKSHOP_FORMAT: 'Online · YouTube',
  AMOUNT: 'R$ 90,00',
});
assert.equal('COUPON' in confirmationPayload.template.variables, false);
assert.equal('PARTNER' in confirmationPayload.template.variables, false);
assert.equal('html' in confirmationPayload, false);
assert.equal('text' in confirmationPayload, false);

let pixOrderBody;
let pixOrderHeaders;
const pendingRegistrationPage = {
  ...registrationPage,
  properties: {
    ...registrationPage.properties,
    'Cupom': {rich_text: []},
    'Parceiro': {rich_text: [{plain_text: 'Direto'}]},
    'Valor': {number: 100},
    'Status': {select: {name: 'Inscrição iniciada'}},
  },
};

await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') return Response.json({results: [pendingRegistrationPage]});
  if (target === 'https://api.mercadopago.com/v1/orders') {
    pixOrderBody = JSON.parse(options.body);
    pixOrderHeaders = options.headers;
    return Response.json({
      id: 'ORD-PIX-1',
      external_reference: 'WS-ABC1234567',
      status: 'action_required',
      status_detail: 'waiting_payment',
      transactions: {payments: [{payment_method: {
        id: 'pix',
        type: 'bank_transfer',
        qr_code: '000201PIXTEST',
        qr_code_base64: 'BASE64PIX',
        ticket_url: 'https://mercadopago.example/pix',
      }}]},
    });
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') return Response.json({id: 'page-workshop'});
  throw new Error(`Chamada externa inesperada: ${target}`);
}, async () => {
  const response = await worker.fetch(post('/workshop/pay/pix', {
    registrationId: 'WS-ABC1234567',
    deviceId: 'device-session-pix',
    amount: 1,
  }), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'pending');
  assert.equal(body.pix.qrCode, '000201PIXTEST');
  assert.equal(body.pix.qrCodeBase64, 'BASE64PIX');
});

assert.equal(pixOrderBody.total_amount, '100.00');
assert.equal(pixOrderBody.transactions.payments[0].amount, '100.00');
assert.equal(pixOrderBody.transactions.payments[0].payment_method.id, 'pix');
assert.equal(pixOrderHeaders['X-meli-session-id'], 'device-session-pix');

console.log('Workshop tests passed: profile fields, coupons, server-side pricing, Notion, Mercado Pago security headers, Orders and Resend template contract.');
