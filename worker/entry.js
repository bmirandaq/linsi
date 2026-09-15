import baseWorker from './index.js';

const WORKSHOP_BASE_PRICE = 100;
const WORKSHOP_DISCOUNTED_PRICE = 90;
const MAX_PAYMENT_ATTEMPTS = 3;
const PAYMENT_LOCK_MS = 12 * 60 * 60 * 1000;
const MAX_LENGTHS = {
  registrationId: 64,
  deviceId: 256,
};

function requiredString(value, maxLength) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

function optionalString(value, maxLength) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (normalized.length > maxLength) return null;
  return normalized;
}

function validEmail(value) {
  return Boolean(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readJson(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function allowedOrigin(env) {
  return (env.ALLOWED_ORIGIN || 'https://linsi.beamiranda.com.br').replace(/\/$/, '');
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && origin.replace(/\/$/, '') === allowedOrigin(env);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, status, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function responseJson(baseResponse, data) {
  const headers = new Headers(baseResponse.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), {
    status: baseResponse.status,
    statusText: baseResponse.statusText,
    headers,
  });
}

function notionHeaders(env) {
  return {
    Authorization: `Bearer ${env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
}

function titleValue(property) {
  return property?.title?.map((item) => item?.plain_text || item?.text?.content || '').join('') || '';
}

function richTextValue(property) {
  return property?.rich_text?.map((item) => item?.plain_text || item?.text?.content || '').join('') || '';
}

function notionStatusToWorkshop(value) {
  return {
    'Inscrição iniciada': 'started',
    'Aguardando pagamento': 'pending',
    'Pago': 'paid',
    'Pagamento não concluído': 'failed',
    'Reembolsado': 'refunded',
  }[value] || 'started';
}

function workshopStatusToNotion(value) {
  return {
    started: 'Inscrição iniciada',
    pending: 'Aguardando pagamento',
    paid: 'Pago',
    failed: 'Pagamento não concluído',
    refunded: 'Reembolsado',
  }[value] || 'Inscrição iniciada';
}

async function findRegistration(registrationId, env) {
  if (!env.NOTION_API_KEY || !env.WORKSHOP_NOTION_DATABASE_ID) return null;
  const response = await fetch(`https://api.notion.com/v1/databases/${env.WORKSHOP_NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      page_size: 1,
      filter: {
        property: 'Inscrição',
        title: {equals: registrationId},
      },
    }),
  });
  if (!response.ok) throw new Error(`Workshop Notion query error: ${response.status} ${await response.text()}`);

  const page = (await response.json()).results?.[0];
  if (!page) return null;
  const properties = page.properties || {};
  return {
    pageId: page.id,
    registrationId: titleValue(properties['Inscrição']),
    email: properties['E-mail']?.email || '',
    amount: Number(properties['Valor']?.number),
    status: notionStatusToWorkshop(properties['Status']?.select?.name),
    mpOrderId: richTextValue(properties['MP Order ID']),
    paymentAttempts: Number(properties['Tentativas de pagamento']?.number || 0),
    lockedUntil: properties['Bloqueado até']?.date?.start || '',
  };
}

async function updateRegistration(pageId, updates, env) {
  const properties = {};
  if (updates.status) properties['Status'] = {select: {name: workshopStatusToNotion(updates.status)}};
  if (updates.mpOrderId !== undefined) {
    properties['MP Order ID'] = {rich_text: updates.mpOrderId ? [{text: {content: updates.mpOrderId}}] : []};
  }
  if (updates.paymentAttempts !== undefined) properties['Tentativas de pagamento'] = {number: updates.paymentAttempts};
  if (updates.lockedUntil !== undefined) properties['Bloqueado até'] = {date: updates.lockedUntil ? {start: updates.lockedUntil} : null};

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(env),
    body: JSON.stringify({properties}),
  });
  if (!response.ok) throw new Error(`Workshop Notion update error: ${response.status} ${await response.text()}`);
}

function activeLock(registration) {
  const timestamp = registration?.lockedUntil ? Date.parse(registration.lockedUntil) : NaN;
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

async function normalizeExpiredLock(registration, env) {
  if (!registration?.lockedUntil) return registration;
  const timestamp = Date.parse(registration.lockedUntil);
  if (!Number.isFinite(timestamp) || timestamp > Date.now()) return registration;

  await updateRegistration(registration.pageId, {paymentAttempts: 0, lockedUntil: null}, env);
  return {...registration, paymentAttempts: 0, lockedUntil: ''};
}

function lockedResponse(registration, cors) {
  return json({
    code: 'payment_locked',
    message: 'Limite de tentativas atingido. Tente novamente em 12 horas.',
    attempts: registration.paymentAttempts,
    retryAt: registration.lockedUntil,
  }, 429, cors);
}

async function mercadoPagoRequest(path, options, env) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('Mercado Pago access token missing');
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Mercado Pago error: ${response.status} ${JSON.stringify(data)}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function mapOrderStatus(order) {
  if (order?.status === 'processed') return 'paid';
  if (order?.status === 'refunded') return 'refunded';
  if (['failed', 'canceled', 'expired'].includes(order?.status)) return 'failed';
  return 'pending';
}

function orderPixData(order) {
  const method = order?.transactions?.payments?.[0]?.payment_method || {};
  return {
    qrCode: method.qr_code || '',
    qrCodeBase64: method.qr_code_base64 || '',
    ticketUrl: method.ticket_url || '',
  };
}

function nextLock(status, attempts) {
  if (status === 'paid' || attempts < MAX_PAYMENT_ATTEMPTS) return null;
  return new Date(Date.now() + PAYMENT_LOCK_MS).toISOString();
}

async function handleStart(request, env) {
  const response = await baseWorker.fetch(request, env);
  if (!response.ok) return response;

  const data = await response.clone().json().catch(() => null);
  if (!data?.registrationId) return response;
  const registration = await findRegistration(data.registrationId, env);
  if (registration) {
    await updateRegistration(registration.pageId, {paymentAttempts: 0, lockedUntil: null}, env);
  }
  return responseJson(response, {...data, attempts: 0, retryAt: null});
}

async function handleCard(request, env, cors) {
  const payload = await readJson(request.clone());
  const registrationId = requiredString(payload?.registrationId, MAX_LENGTHS.registrationId);
  if (!registrationId) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration = await findRegistration(registrationId, env);
  if (!registration) return json({message: 'Inscrição não encontrada.'}, 404, cors);
  registration = await normalizeExpiredLock(registration, env);
  if (activeLock(registration)) return lockedResponse(registration, cors);

  const previousOrderId = registration.mpOrderId;
  const response = await baseWorker.fetch(request, env);
  if (!response.ok) return response;
  const data = await response.clone().json().catch(() => ({}));

  const after = await findRegistration(registrationId, env);
  if (!after) return responseJson(response, data);

  let attempts = registration.paymentAttempts;
  let retryAt = registration.lockedUntil || null;
  if (after.mpOrderId && after.mpOrderId !== previousOrderId) {
    attempts += 1;
    retryAt = nextLock(after.status, attempts);
    await updateRegistration(after.pageId, {paymentAttempts: attempts, lockedUntil: retryAt}, env);
  }

  return responseJson(response, {...data, attempts, retryAt});
}

async function handlePix(request, env, cors) {
  const payload = await readJson(request);
  const registrationId = requiredString(payload?.registrationId, MAX_LENGTHS.registrationId);
  const deviceId = optionalString(payload?.deviceId, MAX_LENGTHS.deviceId);
  if (!registrationId || deviceId === null) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration = await findRegistration(registrationId, env);
  if (!registration || !validEmail(registration.email) || ![WORKSHOP_BASE_PRICE, WORKSHOP_DISCOUNTED_PRICE].includes(registration.amount)) {
    return json({message: 'Inscrição não encontrada.'}, 404, cors);
  }
  registration = await normalizeExpiredLock(registration, env);
  if (activeLock(registration)) return lockedResponse(registration, cors);
  if (registration.status === 'paid') {
    return json({status: 'paid', attempts: registration.paymentAttempts, retryAt: null}, 200, cors);
  }

  const nextAttempt = registration.paymentAttempts + 1;
  let order;
  try {
    order = await mercadoPagoRequest('/v1/orders', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': `${registrationId}-pix-${nextAttempt}`,
        ...(deviceId ? {'X-meli-session-id': deviceId} : {}),
      },
      body: JSON.stringify({
        type: 'online',
        processing_mode: 'automatic',
        total_amount: registration.amount.toFixed(2),
        external_reference: registration.registrationId,
        payer: {email: registration.email},
        transactions: {
          payments: [{
            amount: registration.amount.toFixed(2),
            payment_method: {id: 'pix', type: 'bank_transfer'},
          }],
        },
      }),
    }, env);
  } catch (error) {
    console.error('Mercado Pago Pix order failed:', error);
    return json({message: 'Não foi possível gerar o Pix. Tente novamente.'}, 502, cors);
  }

  const provisionalStatus = mapOrderStatus(order);
  const retryAt = nextLock(provisionalStatus, nextAttempt);
  await updateRegistration(registration.pageId, {
    status: 'pending',
    mpOrderId: order.id || registration.mpOrderId,
    paymentAttempts: nextAttempt,
    lockedUntil: retryAt,
  }, env);

  // Let the existing worker remain authoritative for final order mapping and paid-email side effects.
  const statusRequest = new Request(`${new URL(request.url).origin}/workshop/status?id=${encodeURIComponent(registrationId)}`, {
    method: 'GET',
    headers: {Origin: request.headers.get('Origin') || allowedOrigin(env)},
  });
  await baseWorker.fetch(statusRequest, env);
  const after = await findRegistration(registrationId, env);

  return json({
    status: after?.status || provisionalStatus,
    attempts: nextAttempt,
    retryAt,
    pix: orderPixData(order),
  }, 200, cors);
}

async function handleReset(request, env, cors) {
  const payload = await readJson(request);
  const registrationId = requiredString(payload?.registrationId, MAX_LENGTHS.registrationId);
  if (!registrationId) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration = await findRegistration(registrationId, env);
  if (!registration) return json({message: 'Inscrição não encontrada.'}, 404, cors);
  registration = await normalizeExpiredLock(registration, env);
  if (activeLock(registration)) return lockedResponse(registration, cors);
  if (registration.status === 'paid') {
    return json({status: 'paid', attempts: registration.paymentAttempts, retryAt: null}, 200, cors);
  }

  if (registration.status === 'pending' && registration.mpOrderId) {
    try {
      const currentOrder = await mercadoPagoRequest(`/v1/orders/${encodeURIComponent(registration.mpOrderId)}`, {method: 'GET'}, env);
      const currentStatus = mapOrderStatus(currentOrder);
      if (currentStatus === 'paid') {
        const statusRequest = new Request(`${new URL(request.url).origin}/workshop/status?id=${encodeURIComponent(registrationId)}`, {
          method: 'GET',
          headers: {Origin: request.headers.get('Origin') || allowedOrigin(env)},
        });
        await baseWorker.fetch(statusRequest, env);
        return json({status: 'paid', attempts: registration.paymentAttempts, retryAt: null}, 200, cors);
      }
      if (currentStatus === 'pending') {
        await mercadoPagoRequest(`/v1/orders/${encodeURIComponent(registration.mpOrderId)}/cancel`, {
          method: 'POST',
          headers: {'X-Idempotency-Key': `${registrationId}-cancel-${registration.mpOrderId}`.slice(0, 64)},
        }, env);
      }
    } catch (error) {
      console.error('Mercado Pago order reset failed:', error);
      return json({message: 'Não foi possível alterar a forma de pagamento. Tente novamente.'}, 502, cors);
    }
  }

  await updateRegistration(registration.pageId, {status: 'started'}, env);
  return json({
    status: 'started',
    attempts: registration.paymentAttempts,
    retryAt: registration.lockedUntil || null,
  }, 200, cors);
}

async function handleStatus(request, env) {
  const response = await baseWorker.fetch(request, env);
  if (!response.ok) return response;
  const data = await response.clone().json().catch(() => ({}));
  const registrationId = requiredString(new URL(request.url).searchParams.get('id'), MAX_LENGTHS.registrationId);
  if (!registrationId) return response;

  let registration = await findRegistration(registrationId, env);
  if (!registration) return responseJson(response, data);
  registration = await normalizeExpiredLock(registration, env);
  return responseJson(response, {
    ...data,
    attempts: registration.paymentAttempts,
    retryAt: activeLock(registration) ? registration.lockedUntil : null,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (path === '/webhooks/mercadopago') return baseWorker.fetch(request, env);

    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) return baseWorker.fetch(request, env);
    const cors = corsHeaders(origin);

    if (path === '/workshop/start' && request.method === 'POST') return handleStart(request, env);
    if (path === '/workshop/pay/card' && request.method === 'POST') return handleCard(request, env, cors);
    if (path === '/workshop/pay/pix' && request.method === 'POST') return handlePix(request, env, cors);
    if (path === '/workshop/payment/reset' && request.method === 'POST') return handleReset(request, env, cors);
    if (path === '/workshop/status' && request.method === 'GET') return handleStatus(request, env);

    return baseWorker.fetch(request, env);
  },
};
