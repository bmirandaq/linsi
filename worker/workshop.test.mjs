import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
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
  MP_WEBHOOK_SECRET: 'test-webhook-secret',
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

function get(path) {
  return new Request(`https://linsi-form-handler.example.test${path}`, {
    method: 'GET',
    headers: {Origin: allowedOrigin},
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

function makeRegistrationPage({
  registrationId = 'WS-0123456789ABCDEF0123456789ABCDEF',
  amount = 90,
  status = 'Inscrição iniciada',
  orderId = '',
  paidAt = null,
} = {}) {
  return {
    id: 'page-workshop',
    properties: {
      Inscrição: {title: [{plain_text: registrationId}]},
      Nome: {rich_text: [{plain_text: 'Pessoa Teste'}]},
      'E-mail': {email: 'pessoa@example.com'},
      Cargo: {rich_text: [{plain_text: 'Product Designer'}]},
      Empresa: {rich_text: [{plain_text: 'Empresa Teste'}]},
      LinkedIn: {url: 'https://www.linkedin.com/in/pessoa-teste'},
      WhatsApp: {phone_number: '81999999999'},
      Cupom: {rich_text: amount === 90 ? [{plain_text: 'CROQ10'}] : []},
      Parceiro: {rich_text: [{plain_text: amount === 90 ? 'Design Croquete' : 'Direto'}]},
      Valor: {number: amount},
      Status: {select: {name: status}},
      'MP Order ID': {rich_text: orderId ? [{plain_text: orderId}] : []},
      'Pago em': {date: paidAt ? {start: paidAt} : null},
      'Confirmação enviada': {checkbox: false},
      'Tentativas de pagamento': {number: 0},
      'Bloqueado até': {date: null},
    },
  };
}

for (const coupon of ['VagasUX10', 'vagasux10', ' CROQ10 ', 'guia10']) {
  const response = await worker.fetch(post('/workshop/coupon', {coupon}), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'valid');
}

let createdRegistration;
await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
    return Response.json({success: true, hostname: 'linsi.beamiranda.com.br', action: 'workshop'});
  }
  if (target === 'https://api.notion.com/v1/pages') {
    createdRegistration = JSON.parse(options.body);
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Unexpected external request: ${target}`);
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
  assert.match(body.registrationId, /^WS-[A-F0-9]{32}$/);
  assert.equal(body.amount, 90);
  assert.equal('publicKey' in body, false);
  assert.equal('attempts' in body, false);
});
assert.equal(createdRegistration.properties.Valor.number, 90);
assert.equal(createdRegistration.properties.Cupom.rich_text[0].text.content, 'CROQ10');
assert.equal(createdRegistration.properties['Tentativas de pagamento'].number, 0);
assert.equal(createdRegistration.properties['Bloqueado até'].date, null);

const registrationId = 'WS-0123456789ABCDEF0123456789ABCDEF';
const initialPage = makeRegistrationPage({registrationId});
let orderBody;
let orderHeaders;
let notionPatches = [];
await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
    return Response.json({results: [initialPage]});
  }
  if (target === 'https://api.mercadopago.com/v1/orders') {
    orderBody = JSON.parse(options.body);
    orderHeaders = options.headers;
    return Response.json({
      id: 'ORD-CHECKOUT-1',
      type: 'online',
      processing_mode: 'manual',
      external_reference: registrationId,
      total_amount: '90.00',
      status: 'created',
      status_detail: 'created',
      checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD-CHECKOUT-1',
    }, {status: 201});
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    notionPatches.push(JSON.parse(options.body));
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Unexpected external request: ${target}`);
}, async () => {
  const response = await worker.fetch(post('/workshop/checkout', {
    registrationId,
    amount: 1,
    unit_price: 1,
    coupon: 'FAKE100',
  }), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'pending');
  assert.equal(body.checkoutUrl, 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD-CHECKOUT-1');
});

assert.equal(orderBody.type, 'online');
assert.equal(orderBody.processing_mode, 'manual');
assert.equal(orderBody.total_amount, '90.00');
assert.equal(orderBody.external_reference, registrationId);
assert.equal(orderBody.payer.email, 'pessoa@example.com');
assert.equal(orderBody.items.length, 1);
assert.equal(orderBody.items[0].quantity, 1);
assert.equal(orderBody.items[0].unit_price, '90.00');
assert.equal('total_amount' in orderBody.items[0], false);
assert.equal('unit_measure' in orderBody.items[0], false);
assert.equal('transactions' in orderBody, false);
assert.equal(orderBody.config.notification_url, 'https://linsi-form-handler.example.test/webhooks/mercadopago');
assert.match(orderBody.config.online.success_url, /checkout=success/);
assert.match(orderBody.config.online.failure_url, /checkout=failure/);
assert.match(orderBody.config.online.pending_url, /checkout=pending/);
assert.match(orderBody.config.online.success_url, new RegExp(registrationId));
assert.equal(orderBody.config.online.auto_return, 'all');
assert.ok(orderHeaders['X-Idempotency-Key']);
assert.equal(notionPatches.at(-1).properties.Status.select.name, 'Aguardando pagamento');
assert.equal(notionPatches.at(-1).properties['MP Order ID'].rich_text[0].text.content, 'ORD-CHECKOUT-1');

let createOrderCalls = 0;
const pendingPage = makeRegistrationPage({registrationId, status: 'Aguardando pagamento', orderId: 'ORD-CHECKOUT-1'});
await withFetch(async (url) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') return Response.json({results: [pendingPage]});
  if (target === 'https://api.mercadopago.com/v1/orders/ORD-CHECKOUT-1') {
    return Response.json({
      id: 'ORD-CHECKOUT-1',
      external_reference: registrationId,
      total_amount: '90.00',
      status: 'created',
      status_detail: 'created',
      checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD-CHECKOUT-1',
    });
  }
  if (target === 'https://api.mercadopago.com/v1/orders') {
    createOrderCalls += 1;
    return Response.json({});
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') return Response.json({id: 'page-workshop'});
  throw new Error(`Unexpected external request: ${target}`);
}, async () => {
  const response = await worker.fetch(post('/workshop/checkout', {registrationId}), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).checkoutUrl, 'https://www.mercadopago.com.br/checkout/v1/redirect?order_id=ORD-CHECKOUT-1');
});
assert.equal(createOrderCalls, 0, 'A retry must reuse a live Checkout Pro order instead of creating a duplicate.');

let statusPatch;
await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') return Response.json({results: [pendingPage]});
  if (target === 'https://api.mercadopago.com/v1/orders/ORD-CHECKOUT-1') {
    return Response.json({
      id: 'ORD-CHECKOUT-1',
      external_reference: registrationId,
      total_amount: '90.00',
      status: 'processed',
      status_detail: 'accredited',
    });
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    statusPatch = JSON.parse(options.body);
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Unexpected external request: ${target}`);
}, async () => {
  const response = await worker.fetch(get(`/workshop/status?id=${encodeURIComponent(registrationId)}`), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'paid');
  assert.equal(body.email, 'pessoa@example.com');
});
assert.equal(statusPatch.properties.Status.select.name, 'Pago');

let mismatchPatchCount = 0;
await withFetch(async (url, options = {}) => {
  const target = String(url);
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') return Response.json({results: [pendingPage]});
  if (target === 'https://api.mercadopago.com/v1/orders/ORD-CHECKOUT-1') {
    return Response.json({
      id: 'ORD-CHECKOUT-1',
      external_reference: registrationId,
      total_amount: '1.00',
      status: 'processed',
      status_detail: 'accredited',
    });
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    mismatchPatchCount += 1;
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Unexpected external request: ${target}`);
}, async () => {
  const response = await worker.fetch(get(`/workshop/status?id=${encodeURIComponent(registrationId)}`), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'pending');
});
assert.equal(mismatchPatchCount, 0, 'An amount mismatch must never mark the registration as paid.');

for (const retiredPath of ['/workshop/pay/card', '/workshop/pay/pix', '/workshop/payment/reset']) {
  const response = await worker.fetch(post(retiredPath, {registrationId}), env);
  assert.equal(response.status, 410);
  assert.equal((await response.json()).code, 'checkout_moved');
}

function webhookSignature(dataId) {
  const manifest = `id:${dataId};request-id:webhook-request-1;ts:1770000000;`;
  return createHmac('sha256', env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');
}

let oldOrderPatchCount = 0;
await withFetch(async (url) => {
  const target = String(url);
  if (target === 'https://api.mercadopago.com/v1/orders/ORD-OLD') {
    return Response.json({
      id: 'ORD-OLD',
      external_reference: registrationId,
      total_amount: '90.00',
      status: 'processed',
      status_detail: 'accredited',
    });
  }
  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
    return Response.json({results: [makeRegistrationPage({registrationId, status: 'Aguardando pagamento', orderId: 'ORD-CURRENT'})]});
  }
  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    oldOrderPatchCount += 1;
    return Response.json({id: 'page-workshop'});
  }
  throw new Error(`Unexpected external request: ${target}`);
}, async () => {
  const response = await worker.fetch(new Request(
    'https://linsi-form-handler.example.test/webhooks/mercadopago?data.id=ORD-OLD&type=order',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': 'webhook-request-1',
        'x-signature': `ts=1770000000,v1=${webhookSignature('ORD-OLD')}`,
      },
      body: JSON.stringify({type: 'order', data: {id: 'ORD-OLD'}}),
    },
  ), env);
  assert.equal(response.status, 200);
});
assert.equal(oldOrderPatchCount, 0, 'A late webhook from an old order must not replace the current order.');

console.log('Workshop Checkout Pro tests passed: server-side price, manual Orders API, minimal item schema, trusted redirect, idempotent reuse, authoritative paid state, integrity checks and retired advanced endpoints.');
