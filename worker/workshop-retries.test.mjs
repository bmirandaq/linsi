import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const baseSource = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const baseUrl = `data:text/javascript;base64,${Buffer.from(baseSource).toString('base64')}`;
const entrySource = await readFile(new URL('./entry.js', import.meta.url), 'utf8');
const resolvedEntrySource = entrySource.replace("from './index.js'", `from '${baseUrl}'`);
const entryUrl = `data:text/javascript;base64,${Buffer.from(resolvedEntrySource).toString('base64')}`;
const {default: worker} = await import(entryUrl);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  NOTION_API_KEY: 'notion-secret',
  WORKSHOP_NOTION_DATABASE_ID: 'workshop-db',
  MP_ACCESS_TOKEN: 'mp-secret',
};

function post(path, payload) {
  return new Request(`https://linsi-form-handler.example.test${path}`, {
    method: 'POST',
    headers: {Origin: allowedOrigin, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
}

function baseRegistration() {
  return {
    id: 'page-workshop',
    properties: {
      'Inscrição': {title: [{plain_text: 'WS-ABC1234567'}]},
      'Nome': {rich_text: [{plain_text: 'Pessoa Teste'}]},
      'E-mail': {email: 'pessoa@example.com'},
      'Cargo': {rich_text: [{plain_text: 'Product Designer'}]},
      'Empresa': {rich_text: []},
      'LinkedIn': {url: null},
      'WhatsApp': {phone_number: null},
      'Cupom': {rich_text: []},
      'Parceiro': {rich_text: [{plain_text: 'Direto'}]},
      'Valor': {number: 100},
      'Status': {select: {name: 'Inscrição iniciada'}},
      'MP Order ID': {rich_text: []},
      'Pago em': {date: null},
      'Confirmação enviada': {checkbox: false},
      'Tentativas de pagamento': {number: 0},
      'Bloqueado até': {date: null},
    },
  };
}

function richText(value) {
  return value ? [{text: {content: value}, plain_text: value}] : [];
}

function applyPatch(page, properties) {
  for (const [name, value] of Object.entries(properties || {})) {
    page.properties[name] = value;
  }
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

const page = baseRegistration();
let createdAttempts = 0;
let cancelCalls = 0;
let lastIdempotencyKey = '';
let activeOrder = {
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
};

await withFetch(async (url, options = {}) => {
  const target = String(url);

  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
    return Response.json({results: [page]});
  }

  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    applyPatch(page, JSON.parse(options.body).properties);
    return Response.json({id: 'page-workshop'});
  }

  if (target === 'https://api.mercadopago.com/v1/orders' && options.method === 'POST') {
    createdAttempts += 1;
    lastIdempotencyKey = options.headers['X-Idempotency-Key'];
    activeOrder = {
      ...activeOrder,
      id: `ORD-PIX-${createdAttempts}`,
      transactions: {payments: [{payment_method: {
        ...activeOrder.transactions.payments[0].payment_method,
        qr_code: `000201PIXTEST${createdAttempts}`,
      }}]},
    };
    return Response.json(activeOrder);
  }

  if (target.startsWith('https://api.mercadopago.com/v1/orders/')) {
    if (target.endsWith('/cancel')) {
      cancelCalls += 1;
      assert.equal(options.method, 'POST');
      assert.ok(options.headers['X-Idempotency-Key']);
      activeOrder = {...activeOrder, status: 'canceled', status_detail: 'canceled_transaction'};
      return Response.json(activeOrder);
    }
    return Response.json(activeOrder);
  }

  throw new Error(`Chamada externa inesperada: ${target}`);
}, async () => {
  const firstPix = await worker.fetch(post('/workshop/pay/pix', {
    registrationId: 'WS-ABC1234567',
    deviceId: 'device-session-pix',
  }), env);
  assert.equal(firstPix.status, 200);
  const firstBody = await firstPix.json();
  assert.equal(firstBody.status, 'pending');
  assert.equal(firstBody.attempts, 1);
  assert.equal(firstBody.retryAt, null);
  assert.equal(firstBody.pix.qrCode, '000201PIXTEST1');
  assert.equal(lastIdempotencyKey, 'WS-ABC1234567-pix-1');
  assert.equal(page.properties['Tentativas de pagamento'].number, 1);
  assert.equal(page.properties['Bloqueado até'].date, null);
  assert.equal(page.properties.Status.select.name, 'Aguardando pagamento');
  assert.equal(page.properties['MP Order ID'].rich_text[0].text.content, 'ORD-PIX-1');

  const reset = await worker.fetch(post('/workshop/payment/reset', {
    registrationId: 'WS-ABC1234567',
  }), env);
  assert.equal(reset.status, 200);
  assert.deepEqual(await reset.json(), {status: 'started', attempts: 1, retryAt: null});
  assert.equal(cancelCalls, 1);
  assert.equal(page.properties.Status.select.name, 'Inscrição iniciada');
  assert.equal(page.properties['Tentativas de pagamento'].number, 1);

  // Simulate a third attempt in the current 12-hour window.
  page.properties['Tentativas de pagamento'] = {number: 2};
  page.properties['Bloqueado até'] = {date: null};
  page.properties.Status = {select: {name: 'Inscrição iniciada'}};
  page.properties['MP Order ID'] = {rich_text: richText('ORD-PIX-1')};
  activeOrder = {...activeOrder, status: 'action_required', status_detail: 'waiting_payment'};

  const thirdPix = await worker.fetch(post('/workshop/pay/pix', {
    registrationId: 'WS-ABC1234567',
  }), env);
  assert.equal(thirdPix.status, 200);
  const thirdBody = await thirdPix.json();
  assert.equal(thirdBody.status, 'pending');
  assert.equal(thirdBody.attempts, 3);
  assert.ok(Date.parse(thirdBody.retryAt) > Date.now());
  assert.equal(lastIdempotencyKey, 'WS-ABC1234567-pix-3');
  assert.equal(page.properties['Tentativas de pagamento'].number, 3);
  assert.ok(page.properties['Bloqueado até'].date.start);

  let mercadoPagoTouched = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
      return Response.json({results: [page]});
    }
    if (target.startsWith('https://api.mercadopago.com/')) mercadoPagoTouched = true;
    return originalFetch(url, options);
  };
  try {
    const blocked = await worker.fetch(post('/workshop/pay/card', {
      registrationId: 'WS-ABC1234567',
      token: 'card-token',
      paymentMethodId: 'visa',
      paymentTypeId: 'credit_card',
      installments: 1,
    }), env);
    assert.equal(blocked.status, 429);
    const blockedBody = await blocked.json();
    assert.equal(blockedBody.code, 'payment_locked');
    assert.equal(blockedBody.attempts, 3);
    assert.ok(blockedBody.retryAt);
    assert.equal(mercadoPagoTouched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log('Workshop retry tests passed: Pix reset, attempt tracking, 3-attempt lock and 12-hour block.');
