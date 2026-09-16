import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const baseSource = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const baseUrl = `data:text/javascript;base64,${Buffer.from(baseSource).toString('base64')}`;
const entrySource = await readFile(new URL('./entry.js', import.meta.url), 'utf8');
const resolvedEntrySource = entrySource.replace("from './index.js'", `from '${baseUrl}'`);
const entryUrl = `data:text/javascript;base64,${Buffer.from(resolvedEntrySource).toString('base64')}`;
const {default: worker} = await import(entryUrl);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const registrationId = 'WS-0123456789ABCDEF0123456789ABCDEF';
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

function richText(value) {
  return value ? [{text: {content: value}, plain_text: value}] : [];
}

const page = {
  id: 'page-workshop',
  properties: {
    'Inscrição': {title: [{plain_text: registrationId}]},
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

function applyPatch(properties) {
  for (const [name, value] of Object.entries(properties || {})) page.properties[name] = value;
}

const orders = new Map();
const ordersByIdempotencyKey = new Map();
const pixKeys = [];
const cardKeys = [];
const cancelKeys = [];
let pixOrdersCreated = 0;
let cardOrdersCreated = 0;

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  const target = String(url);

  if (target === 'https://api.notion.com/v1/databases/workshop-db/query') {
    return Response.json({results: [page]});
  }

  if (target === 'https://api.notion.com/v1/pages/page-workshop') {
    applyPatch(JSON.parse(options.body).properties);
    return Response.json({id: 'page-workshop'});
  }

  if (target === 'https://api.mercadopago.com/v1/orders' && options.method === 'POST') {
    const key = options.headers['X-Idempotency-Key'];
    assert.match(key, /^[a-f0-9]{64}$/);
    const body = JSON.parse(options.body);
    const payment = body.transactions.payments[0];
    const isPix = payment.payment_method.id === 'pix';
    if (isPix) pixKeys.push(key);
    else cardKeys.push(key);
    if (ordersByIdempotencyKey.has(key)) return Response.json(ordersByIdempotencyKey.get(key));

    const sequence = isPix ? ++pixOrdersCreated : ++cardOrdersCreated;
    const order = {
      id: `ORD-${isPix ? 'PIX' : 'CARD'}-${sequence}`,
      external_reference: registrationId,
      total_amount: '100.00',
      status: isPix ? 'action_required' : 'failed',
      status_detail: isPix ? 'waiting_transfer' : 'cc_rejected_other_reason',
      transactions: {payments: [{
        amount: '100.00',
        status: isPix ? 'action_required' : 'failed',
        payment_method: isPix ? {
          id: 'pix',
          type: 'bank_transfer',
          qr_code: `000201PIXTEST${sequence}`,
          qr_code_base64: `BASE64PIX${sequence}`,
        } : {id: 'visa', type: 'credit_card'},
      }]},
    };
    assert.equal(body.total_amount, '100.00');
    if (isPix) {
      assert.equal(payment.expiration_time, 'P1D');
      assert.equal('expiration_time' in payment.payment_method, false);
    } else {
      assert.equal(key.includes(payment.payment_method.token), false);
    }
    orders.set(order.id, order);
    ordersByIdempotencyKey.set(key, order);
    return Response.json(order);
  }

  const orderMatch = /^https:\/\/api\.mercadopago\.com\/v1\/orders\/([^/]+)(\/cancel)?$/.exec(target);
  if (orderMatch) {
    const orderId = decodeURIComponent(orderMatch[1]);
    const order = orders.get(orderId);
    assert.ok(order, `Order ${orderId} deve existir no mock.`);
    if (orderMatch[2]) {
      const key = options.headers['X-Idempotency-Key'];
      assert.match(key, /^[a-f0-9]{64}$/);
      cancelKeys.push(key);
      const canceled = {...order, status: 'canceled', status_detail: 'canceled_transaction'};
      orders.set(orderId, canceled);
      return Response.json(canceled);
    }
    return Response.json(order);
  }

  throw new Error(`Chamada externa inesperada: ${target}`);
};

try {
  for (let cycle = 0; cycle < 10; cycle += 1) {
    const attemptsBeforePix = page.properties['Tentativas de pagamento'].number;
    const pix = await worker.fetch(post('/workshop/pay/pix', {registrationId}), env);
    assert.equal(pix.status, 200);
    const pixBody = await pix.json();
    assert.equal(pixBody.status, 'pending');
    assert.equal(pixBody.attempts, attemptsBeforePix);
    assert.equal(page.properties['Tentativas de pagamento'].number, attemptsBeforePix);
    assert.equal(page.properties['Bloqueado até'].date, null);

    const duplicatePix = await worker.fetch(post('/workshop/pay/pix', {registrationId}), env);
    assert.equal(duplicatePix.status, 200);
    assert.equal((await duplicatePix.json()).pix.qrCode, pixBody.pix.qrCode);
    assert.equal(pixOrdersCreated, cycle + 1, 'Pix pendente deve ser reutilizado.');

    const resetPix = await worker.fetch(post('/workshop/payment/reset', {registrationId}), env);
    assert.equal(resetPix.status, 200);
    assert.equal((await resetPix.json()).status, 'started');

    const card = await worker.fetch(post('/workshop/pay/card', {
      registrationId,
      token: `card-token-${cycle}`,
      paymentMethodId: 'visa',
      paymentTypeId: 'credit_card',
      installments: 1,
      identification: {type: 'CPF', number: '123.456.789-01'},
    }), env);
    assert.equal(card.status, 200);
    const cardBody = await card.json();
    assert.equal(cardBody.status, 'failed');
    assert.equal(cardBody.attempts, cycle + 1);
    assert.equal(page.properties['Tentativas de pagamento'].number, cycle + 1);
    assert.equal(page.properties['Bloqueado até'].date, null);

    const resetCard = await worker.fetch(post('/workshop/payment/reset', {registrationId}), env);
    assert.equal(resetCard.status, 200);
    assert.equal((await resetCard.json()).status, 'started');
  }

  assert.equal(pixOrdersCreated, 10);
  assert.equal(cardOrdersCreated, 10);
  assert.equal(cancelKeys.length, 10);
  assert.equal(new Set(pixKeys).size, 10);
  assert.equal(page.properties['Tentativas de pagamento'].number, 10);
  assert.equal(page.properties['Bloqueado até'].date, null);

  const repeatedToken = 'same-card-token';
  for (let retry = 0; retry < 2; retry += 1) {
    const response = await worker.fetch(post('/workshop/pay/card', {
      registrationId,
      token: repeatedToken,
      paymentMethodId: 'visa',
      paymentTypeId: 'credit_card',
      installments: 1,
    }), env);
    assert.notEqual(response.status, 429);
  }
  assert.equal(cardKeys.at(-1), cardKeys.at(-2), 'A mesma submissão deve manter a chave idempotente.');
  assert.equal(cardOrdersCreated, 11, 'Retry com o mesmo token não deve criar nova cobrança no Mercado Pago.');
  assert.equal(page.properties['Tentativas de pagamento'].number, 12);
  assert.equal(page.properties['Bloqueado até'].date, null);
} finally {
  globalThis.fetch = originalFetch;
}

console.log('Workshop retry tests passed: 10 Card/Pix switches, no lock, Pix reuse, card-only telemetry and deterministic idempotency.');
