const REASON_LABELS = Object.freeze({
  duvidas: 'Estou com dúvidas',
  case: 'Enviar case pra ser exposto no site',
  sugestao: 'Enviar sugestão de melhoria',
  'problema-site': 'Problema no site',
  'problema-assistente': 'Problema na Assistente LINSI',
  outro: 'Outro assunto',
});
const ALLOWED_REASONS = Object.keys(REASON_LABELS);
const CONTACT_ACTION = 'contact';
const WORKSHOP_ACTION = 'workshop';
const WORKSHOP_BASE_PRICE = 100;
const WORKSHOP_DISCOUNT_PERCENT = 10;
const WORKSHOP_DISCOUNTED_PRICE = 90;
const WORKSHOP_DATE = '8 de outubro de 2026';
const WORKSHOP_TIME = '19h';
const WORKSHOP_FORMAT = 'Online · YouTube';
const MAX_PAYMENT_ATTEMPTS = 3;
const PAYMENT_LOCK_MS = 4 * 60 * 60 * 1000;
const PIX_EXPIRATION_TIME = 'P1D';
const MAX_LENGTHS = {
  apelido: 120,
  email: 254,
  linkedin: 300,
  whatsapp: 32,
  mensagem: 5000,
  nome: 120,
  cargo: 120,
  empresa: 160,
  coupon: 80,
  registrationId: 64,
  turnstileToken: 2048,
  paymentToken: 4096,
  paymentMethodId: 64,
  paymentTypeId: 64,
  deviceId: 256,
};

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

async function readJson(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function verifyTurnstile(token, ip, env, expectedAction = CONTACT_ACTION) {
  if (!env.TURNSTILE_SECRET_KEY) return false;

  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip || '',
      }),
    });
    if (!resp.ok) return false;

    const result = await resp.json();
    const expectedHostname = new URL(allowedOrigin(env)).hostname;
    return result.success === true && result.hostname === expectedHostname && result.action === expectedAction;
  } catch {
    return false;
  }
}

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
  if (!normalized) return '';
  if (normalized.length > maxLength) return null;
  return normalized;
}

function validEmail(value) {
  return Boolean(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeLinkedIn(value) {
  const raw = optionalString(value, MAX_LENGTHS.linkedin);
  if (raw === null) return null;
  if (!raw) return '';

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (!['linkedin.com', 'www.linkedin.com'].includes(url.hostname.toLowerCase())) return null;
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (url.search || url.hash || url.username || url.password || url.port) return null;

  const profile = /^\/in\/([A-Za-z0-9-]+)\/?$/i.exec(url.pathname);
  if (!profile) return null;
  return `https://www.linkedin.com/in/${profile[1]}`;
}

function normalizeWhatsApp(value) {
  const raw = optionalString(value, MAX_LENGTHS.whatsapp);
  if (raw === null) return null;
  if (!raw) return '';
  if (!/^\d+$/.test(raw)) return null;
  return raw;
}

function notionRichText(value) {
  const chunks = [];
  let chunk = '';
  for (const character of value) {
    if (chunk.length + character.length > 2000) {
      chunks.push({text: {content: chunk}});
      chunk = '';
    }
    chunk += character;
  }
  if (chunk) chunks.push({text: {content: chunk}});
  return chunks;
}

function notionHeaders(env) {
  return {
    Authorization: `Bearer ${env.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
}

async function registerNotion(payload, env) {
  const {motivo, apelido, email, mensagem} = payload;
  const assunto = REASON_LABELS[motivo];

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: {database_id: env.NOTION_DATABASE_ID},
      properties: {
        Assunto: {title: [{text: {content: assunto}}]},
        Status: {select: {name: 'Novo'}},
        Motivo: {select: {name: assunto}},
        Apelido: {rich_text: [{text: {content: apelido}}]},
        'E-mail': {email},
        Mensagem: {rich_text: notionRichText(mensagem)},
        'Recebido em': {date: {start: new Date().toISOString()}},
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Notion error: ${resp.status} ${err}`);
  }
}

async function sendResend(payload, env) {
  const {motivo, apelido, email, linkedin, whatsapp, mensagem} = payload;
  const assunto = REASON_LABELS[motivo];

  const textLines = [
    `Motivo: ${assunto}`,
    `Apelido: ${apelido}`,
    `E-mail: ${email}`,
    ...(linkedin ? [`LinkedIn: ${linkedin}`] : []),
    ...(whatsapp ? [`WhatsApp: ${whatsapp}`] : []),
    '',
    'Mensagem:',
    mensagem,
  ];

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL || 'LINSI <noreply@beamiranda.com.br>',
      to: [env.CONTACT_TO_EMAIL || 'beatriz@beamiranda.com.br'],
      reply_to: email,
      subject: `[LINSI] ${assunto}`,
      text: textLines.join('\n'),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Resend error: ${resp.status} ${err}`);
  }
}

async function handleContact(request, env, cors) {
  const payload = await readJson(request);
  if (!payload) return json({error: 'Invalid JSON'}, 400, cors);

  const motivo = payload?.motivo;
  const apelido = requiredString(payload?.apelido, MAX_LENGTHS.apelido);
  const email = requiredString(payload?.email, MAX_LENGTHS.email);
  const linkedin = normalizeLinkedIn(payload?.linkedin);
  const whatsapp = normalizeWhatsApp(payload?.whatsapp);
  const mensagem = requiredString(payload?.mensagem, MAX_LENGTHS.mensagem);
  const turnstileToken = requiredString(payload?.turnstileToken, MAX_LENGTHS.turnstileToken);

  if (!ALLOWED_REASONS.includes(motivo)) return json({error: 'Motivo inválido'}, 400, cors);
  if (!apelido) return json({error: 'Apelido obrigatório'}, 400, cors);
  if (!validEmail(email)) return json({error: 'E-mail inválido'}, 400, cors);
  if (linkedin === null) return json({error: 'LinkedIn inválido'}, 400, cors);
  if (whatsapp === null) return json({error: 'WhatsApp inválido'}, 400, cors);
  if (!mensagem) return json({error: 'Mensagem obrigatória'}, 400, cors);
  if (!turnstileToken) return json({error: 'Token Turnstile obrigatório'}, 400, cors);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (!await verifyTurnstile(turnstileToken, ip, env, CONTACT_ACTION)) {
    return json({error: 'Verificação falhou'}, 403, cors);
  }

  const normalizedPayload = {motivo, apelido, email, linkedin, whatsapp, mensagem};

  try {
    await registerNotion(normalizedPayload, env);
  } catch (err) {
    console.error('Notion registration failed:', err);
    return json({error: 'Erro ao registrar'}, 500, cors);
  }

  try {
    await sendResend(normalizedPayload, env);
  } catch (err) {
    console.error('Resend notification failed (non-blocking):', err);
  }

  return json({ok: true}, 200, cors);
}

function normalizeCoupon(value) {
  const raw = optionalString(value, MAX_LENGTHS.coupon);
  return raw === null ? null : raw.toUpperCase();
}

function couponConfig(env) {
  if (!env.WORKSHOP_COUPONS_JSON) return null;
  try {
    const parsed = JSON.parse(env.WORKSHOP_COUPONS_JSON);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function evaluateCoupon(value, env) {
  const coupon = normalizeCoupon(value);
  if (coupon === null) return {status: 'invalid'};
  if (!coupon) {
    return {status: 'empty', coupon: '', partner: 'Direto', amount: WORKSHOP_BASE_PRICE};
  }

  const config = couponConfig(env);
  if (!config) return {status: 'unavailable'};
  const rule = config[coupon];
  if (!rule) return {status: 'invalid'};

  const expired = rule.expiresAt && Number.isFinite(Date.parse(rule.expiresAt)) && Date.parse(rule.expiresAt) < Date.now();
  if (rule.active === false || expired) return {status: 'unavailable'};
  if (Number(rule.discount) !== WORKSHOP_DISCOUNT_PERCENT) return {status: 'unavailable'};

  return {
    status: 'valid',
    coupon,
    partner: requiredString(rule.partner, 120) || 'Parceria',
    amount: WORKSHOP_DISCOUNTED_PRICE,
  };
}

function richTextValue(property) {
  return property?.rich_text?.map((item) => item?.plain_text || item?.text?.content || '').join('') || '';
}

function titleValue(property) {
  return property?.title?.map((item) => item?.plain_text || item?.text?.content || '').join('') || '';
}

function workshopStatusToNotion(status) {
  return {
    started: 'Inscrição iniciada',
    pending: 'Aguardando pagamento',
    paid: 'Pago',
    failed: 'Pagamento não concluído',
    refunded: 'Reembolsado',
  }[status] || 'Inscrição iniciada';
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

async function createWorkshopRegistration({registrationId, nome, email, cargo, empresa, linkedin, whatsapp, coupon, partner, amount}, env) {
  if (!env.NOTION_API_KEY || !env.WORKSHOP_NOTION_DATABASE_ID) {
    throw new Error('Workshop Notion configuration missing');
  }

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: {database_id: env.WORKSHOP_NOTION_DATABASE_ID},
      properties: {
        'Inscrição': {title: [{text: {content: registrationId}}]},
        'Nome': {rich_text: [{text: {content: nome}}]},
        'E-mail': {email},
        'Cargo': {rich_text: [{text: {content: cargo}}]},
        'Empresa': {rich_text: empresa ? [{text: {content: empresa}}] : []},
        'LinkedIn': {url: linkedin || null},
        'WhatsApp': {phone_number: whatsapp || null},
        'Cupom': {rich_text: coupon ? [{text: {content: coupon}}] : []},
        'Parceiro': {rich_text: [{text: {content: partner}}]},
        'Valor': {number: amount},
        'Status': {select: {name: workshopStatusToNotion('started')}},
        'MP Order ID': {rich_text: []},
        'Criado em': {date: {start: new Date().toISOString()}},
        'Pago em': {date: null},
        'Acesso enviado': {checkbox: false},
        'Confirmação enviada': {checkbox: false},
        'Tentativas de pagamento': {number: 0},
        'Bloqueado até': {date: null},
      },
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Workshop Notion create error: ${resp.status} ${body}`);
  }
  return resp.json();
}

async function findWorkshopRegistration(registrationId, env) {
  if (!env.NOTION_API_KEY || !env.WORKSHOP_NOTION_DATABASE_ID) return null;

  const resp = await fetch(`https://api.notion.com/v1/databases/${env.WORKSHOP_NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      page_size: 1,
      filter: {property: 'Inscrição', title: {equals: registrationId}},
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Workshop Notion query error: ${resp.status} ${body}`);
  }

  const data = await resp.json();
  const page = data.results?.[0];
  if (!page) return null;
  const properties = page.properties || {};
  return {
    pageId: page.id,
    registrationId: titleValue(properties['Inscrição']),
    nome: richTextValue(properties['Nome']),
    email: properties['E-mail']?.email || '',
    cargo: richTextValue(properties['Cargo']),
    empresa: richTextValue(properties['Empresa']),
    linkedin: properties['LinkedIn']?.url || '',
    whatsapp: properties['WhatsApp']?.phone_number || '',
    coupon: richTextValue(properties['Cupom']),
    partner: richTextValue(properties['Parceiro']),
    amount: Number(properties['Valor']?.number),
    status: notionStatusToWorkshop(properties['Status']?.select?.name),
    mpOrderId: richTextValue(properties['MP Order ID']),
    paidAt: properties['Pago em']?.date?.start || '',
    confirmationSent: properties['Confirmação enviada']?.checkbox === true,
    attempts: Number(properties['Tentativas de pagamento']?.number || 0),
    retryAt: properties['Bloqueado até']?.date?.start || '',
  };
}

async function updateWorkshopRegistration(pageId, updates, env) {
  const properties = {};
  if (updates.status) properties['Status'] = {select: {name: workshopStatusToNotion(updates.status)}};
  if (updates.mpOrderId !== undefined) {
    properties['MP Order ID'] = {rich_text: updates.mpOrderId ? [{text: {content: updates.mpOrderId}}] : []};
  }
  if (updates.paidAt !== undefined) properties['Pago em'] = {date: updates.paidAt ? {start: updates.paidAt} : null};
  if (updates.confirmationSent !== undefined) properties['Confirmação enviada'] = {checkbox: updates.confirmationSent};
  if (updates.attempts !== undefined) properties['Tentativas de pagamento'] = {number: updates.attempts};
  if (updates.retryAt !== undefined) properties['Bloqueado até'] = {date: updates.retryAt ? {start: updates.retryAt} : null};

  const resp = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(env),
    body: JSON.stringify({properties}),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Workshop Notion update error: ${resp.status} ${body}`);
  }
}

function firstName(value) {
  return String(value || '').trim().split(/\s+/)[0] || '';
}

function formatBrlAmount(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

async function sendWorkshopConfirmation(registration, env) {
  if (!env.RESEND_API_KEY || !env.WORKSHOP_CONFIRMATION_TEMPLATE_ID) return false;

  const variables = {
    FIRST_NAME: firstName(registration.nome),
    WORKSHOP_DATE,
    WORKSHOP_TIME,
    WORKSHOP_FORMAT,
    AMOUNT: formatBrlAmount(registration.amount),
  };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `workshop-confirmation/${registration.registrationId}`,
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL || 'LINSI <noreply@beamiranda.com.br>',
      to: [registration.email],
      template: {id: env.WORKSHOP_CONFIRMATION_TEMPLATE_ID, variables},
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Workshop Resend error: ${resp.status} ${body}`);
  }
  return true;
}

function mapOrderStatus(order) {
  if (order?.status === 'processed') return 'paid';
  if (order?.status === 'refunded') return 'refunded';
  if (['failed', 'canceled', 'expired'].includes(order?.status)) return 'failed';
  return 'pending';
}

async function mercadoPagoOrder(path, options, env) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('Mercado Pago access token missing');
  const resp = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new Error(`Mercado Pago error: ${resp.status} ${JSON.stringify(data)}`);
  return data;
}

function orderPixData(order) {
  const payment = order?.transactions?.payments?.[0];
  const method = payment?.payment_method || {};
  return {
    qrCode: method.qr_code || '',
    qrCodeBase64: method.qr_code_base64 || '',
    ticketUrl: method.ticket_url || '',
  };
}

function paymentLockActive(registration) {
  const retryAt = Date.parse(registration.retryAt || '');
  return Number.isFinite(retryAt) && retryAt > Date.now();
}

async function clearExpiredPaymentLock(registration, env) {
  if (!registration?.retryAt) return registration;
  const retryAt = Date.parse(registration.retryAt);
  if (!Number.isFinite(retryAt) || retryAt > Date.now()) return registration;

  await updateWorkshopRegistration(registration.pageId, {attempts: 0, retryAt: ''}, env);
  return {...registration, attempts: 0, retryAt: ''};
}

async function beginPaymentAttempt(registration, env) {
  const current = await clearExpiredPaymentLock(registration, env);
  if (paymentLockActive(current)) return {locked: true, registration: current};

  const attempts = current.attempts + 1;
  const retryAt = attempts >= MAX_PAYMENT_ATTEMPTS
    ? new Date(Date.now() + PAYMENT_LOCK_MS).toISOString()
    : '';
  await updateWorkshopRegistration(current.pageId, {attempts, retryAt}, env);
  return {locked: false, registration: {...current, attempts, retryAt}};
}

function lockedPaymentResponse(registration, cors) {
  return json({
    code: 'payment_locked',
    message: 'Não foi possível confirmar o pagamento.',
    attempts: registration.attempts,
    retryAt: registration.retryAt || null,
  }, 429, cors);
}

async function applyOrderStatus(order, env) {
  const registrationId = requiredString(order?.external_reference, MAX_LENGTHS.registrationId);
  if (!registrationId) return null;

  const registration = await findWorkshopRegistration(registrationId, env);
  if (!registration) return null;

  const status = mapOrderStatus(order);
  const paidAt = status === 'paid' && !registration.paidAt ? new Date().toISOString() : undefined;
  await updateWorkshopRegistration(registration.pageId, {
    status,
    mpOrderId: order.id || registration.mpOrderId,
    paidAt,
  }, env);

  if (status === 'paid' && !registration.confirmationSent) {
    try {
      const sent = await sendWorkshopConfirmation(registration, env);
      if (sent) await updateWorkshopRegistration(registration.pageId, {confirmationSent: true}, env);
    } catch (err) {
      console.error('Workshop confirmation email failed:', err);
    }
  }

  return {
    ...registration,
    status,
    mpOrderId: order.id || registration.mpOrderId,
    paidAt: paidAt || registration.paidAt,
  };
}

async function handleCoupon(request, env, cors) {
  const payload = await readJson(request);
  if (!payload) return json({status: 'unavailable'}, 400, cors);

  const result = evaluateCoupon(payload.coupon, env);
  if (result.status === 'valid') return json({status: 'valid', coupon: result.coupon}, 200, cors);
  if (result.status === 'invalid') return json({status: 'invalid'}, 200, cors);
  return json({status: 'unavailable'}, 200, cors);
}

async function handleWorkshopStart(request, env, cors) {
  const payload = await readJson(request);
  if (!payload) return json({message: 'Confira os campos preenchidos e tente novamente.'}, 400, cors);

  const nome = requiredString(payload.nome, MAX_LENGTHS.nome);
  const email = requiredString(payload.email, MAX_LENGTHS.email);
  const cargo = requiredString(payload.cargo, MAX_LENGTHS.cargo);
  const empresa = optionalString(payload.empresa, MAX_LENGTHS.empresa);
  const linkedin = normalizeLinkedIn(payload.linkedin);
  const whatsapp = normalizeWhatsApp(payload.whatsapp);
  const turnstileToken = requiredString(payload.turnstileToken, MAX_LENGTHS.turnstileToken);
  if (!nome || !validEmail(email) || !cargo || empresa === null || linkedin === null || whatsapp === null || !turnstileToken) {
    return json({message: 'Confira os campos preenchidos e tente novamente.'}, 400, cors);
  }

  const couponResult = evaluateCoupon(payload.coupon, env);
  if (couponResult.status === 'invalid') {
    return json({code: 'coupon_invalid', message: 'Cupom inválido. Revise e corrija'}, 400, cors);
  }
  if (couponResult.status === 'unavailable') {
    return json({code: 'coupon_unavailable', message: 'Esse cupom não está mais disponível'}, 400, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (!await verifyTurnstile(turnstileToken, ip, env, WORKSHOP_ACTION)) {
    return json({message: 'Não foi possível concluir a verificação de segurança. Tente novamente.'}, 403, cors);
  }

  if (!env.MP_PUBLIC_KEY) return json({message: 'O pagamento está temporariamente indisponível.'}, 503, cors);

  const registrationId = `WS-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  try {
    await createWorkshopRegistration({
      registrationId,
      nome,
      email,
      cargo,
      empresa,
      linkedin,
      whatsapp,
      coupon: couponResult.coupon || '',
      partner: couponResult.partner || 'Direto',
      amount: couponResult.amount || WORKSHOP_BASE_PRICE,
    }, env);
  } catch (err) {
    console.error('Workshop registration failed:', err);
    return json({message: 'Não foi possível iniciar sua inscrição. Tente novamente.'}, 500, cors);
  }

  return json({
    registrationId,
    amount: couponResult.amount || WORKSHOP_BASE_PRICE,
    publicKey: env.MP_PUBLIC_KEY,
    attempts: 0,
    retryAt: null,
  }, 200, cors);
}

async function handlePaymentReset(request, env, cors) {
  const payload = await readJson(request);
  const registrationId = requiredString(payload?.registrationId, MAX_LENGTHS.registrationId);
  if (!registrationId) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration = await findWorkshopRegistration(registrationId, env);
  if (!registration) return json({message: 'Inscrição não encontrada.'}, 404, cors);
  if (registration.status === 'paid') {
    return json({status: 'paid', attempts: registration.attempts, retryAt: null}, 200, cors);
  }

  registration = await clearExpiredPaymentLock(registration, env);
  if (paymentLockActive(registration)) return lockedPaymentResponse(registration, cors);

  if (registration.status === 'pending' && registration.mpOrderId) {
    try {
      await mercadoPagoOrder(`/v1/orders/${encodeURIComponent(registration.mpOrderId)}/cancel`, {method: 'POST'}, env);
    } catch (err) {
      console.error('Mercado Pago pending order cancel failed:', err);
      return json({message: 'Não foi possível alterar a forma de pagamento.'}, 502, cors);
    }
  }

  await updateWorkshopRegistration(registration.pageId, {status: 'started', mpOrderId: ''}, env);
  return json({status: 'started', attempts: registration.attempts, retryAt: null}, 200, cors);
}

async function handleCardPayment(request, env, cors) {
  const payload = await readJson(request);
  if (!payload) return json({message: 'Não foi possível processar o pagamento.'}, 400, cors);

  const registrationId = requiredString(payload.registrationId, MAX_LENGTHS.registrationId);
  const token = requiredString(payload.token, MAX_LENGTHS.paymentToken);
  const paymentMethodId = requiredString(payload.paymentMethodId, MAX_LENGTHS.paymentMethodId);
  const paymentTypeId = requiredString(payload.paymentTypeId, MAX_LENGTHS.paymentTypeId);
  const deviceId = optionalString(payload.deviceId, MAX_LENGTHS.deviceId);
  const installments = Number(payload.installments);
  if (!registrationId || !token || !paymentMethodId || !paymentTypeId || deviceId === null || !Number.isInteger(installments) || installments < 1 || installments > 12) {
    return json({message: 'Não foi possível processar o pagamento.'}, 400, cors);
  }

  let registration = await findWorkshopRegistration(registrationId, env);
  if (!registration || !validEmail(registration.email) || ![WORKSHOP_BASE_PRICE, WORKSHOP_DISCOUNTED_PRICE].includes(registration.amount)) {
    return json({message: 'Inscrição não encontrada.'}, 404, cors);
  }
  if (registration.status === 'paid') {
    return json({status: 'paid', attempts: registration.attempts, retryAt: null}, 200, cors);
  }

  const attempt = await beginPaymentAttempt(registration, env);
  if (attempt.locked) return lockedPaymentResponse(attempt.registration, cors);
  registration = attempt.registration;

  const identification = payload.identification && typeof payload.identification === 'object' ? payload.identification : undefined;
  const orderBody = {
    type: 'online',
    processing_mode: 'automatic',
    total_amount: registration.amount.toFixed(2),
    external_reference: registration.registrationId,
    payer: {
      email: registration.email,
      ...(identification?.type && identification?.number ? {
        identification: {type: identification.type, number: identification.number},
      } : {}),
    },
    transactions: {
      payments: [{
        amount: registration.amount.toFixed(2),
        payment_method: {
          id: paymentMethodId,
          type: paymentTypeId,
          token,
          installments,
        },
      }],
    },
  };

  let order;
  try {
    order = await mercadoPagoOrder('/v1/orders', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': `${registrationId}-card-${registration.attempts}-${token.slice(0, 20)}`,
        ...(deviceId ? {'X-meli-session-id': deviceId} : {}),
      },
      body: JSON.stringify(orderBody),
    }, env);
  } catch (err) {
    console.error('Mercado Pago card order failed:', err);
    if (registration.retryAt) return lockedPaymentResponse(registration, cors);
    return json({
      code: 'payment_failed',
      message: 'Não foi possível confirmar o pagamento.',
      attempts: registration.attempts,
      retryAt: null,
    }, 502, cors);
  }

  const updated = await applyOrderStatus(order, env);
  return json({
    status: updated?.status || mapOrderStatus(order),
    attempts: registration.attempts,
    retryAt: registration.retryAt || null,
  }, 200, cors);
}

async function handlePixPayment(request, env, cors) {
  const payload = await readJson(request);
  if (!payload) return json({message: 'Não foi possível gerar o Pix.'}, 400, cors);

  const registrationId = requiredString(payload.registrationId, MAX_LENGTHS.registrationId);
  const deviceId = optionalString(payload.deviceId, MAX_LENGTHS.deviceId);
  if (!registrationId || deviceId === null) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration = await findWorkshopRegistration(registrationId, env);
  if (!registration || !validEmail(registration.email) || ![WORKSHOP_BASE_PRICE, WORKSHOP_DISCOUNTED_PRICE].includes(registration.amount)) {
    return json({message: 'Inscrição não encontrada.'}, 404, cors);
  }
  if (registration.status === 'paid') {
    return json({status: 'paid', attempts: registration.attempts, retryAt: null}, 200, cors);
  }

  const attempt = await beginPaymentAttempt(registration, env);
  if (attempt.locked) return lockedPaymentResponse(attempt.registration, cors);
  registration = attempt.registration;

  let order;
  try {
    order = await mercadoPagoOrder('/v1/orders', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': `${registrationId}-pix-${registration.attempts}`,
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
            expiration_time: PIX_EXPIRATION_TIME,
            payment_method: {id: 'pix', type: 'bank_transfer'},
          }],
        },
      }),
    }, env);
  } catch (err) {
    console.error('Mercado Pago Pix order failed:', err);
    if (registration.retryAt) return lockedPaymentResponse(registration, cors);
    return json({
      code: 'payment_failed',
      message: 'Não foi possível gerar o Pix.',
      attempts: registration.attempts,
      retryAt: null,
    }, 502, cors);
  }

  const updated = await applyOrderStatus(order, env);
  return json({
    status: updated?.status || mapOrderStatus(order),
    attempts: registration.attempts,
    retryAt: registration.retryAt || null,
    pix: orderPixData(order),
  }, 200, cors);
}

async function handleWorkshopStatus(request, env, cors) {
  const registrationId = requiredString(new URL(request.url).searchParams.get('id'), MAX_LENGTHS.registrationId);
  if (!registrationId) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  let registration;
  try {
    registration = await findWorkshopRegistration(registrationId, env);
    if (registration) registration = await clearExpiredPaymentLock(registration, env);
  } catch (err) {
    console.error('Workshop status query failed:', err);
    return json({message: 'Não foi possível consultar o pagamento.'}, 500, cors);
  }
  if (!registration) return json({message: 'Inscrição não encontrada.'}, 404, cors);

  if (registration.status === 'pending' && registration.mpOrderId) {
    try {
      const order = await mercadoPagoOrder(`/v1/orders/${encodeURIComponent(registration.mpOrderId)}`, {method: 'GET'}, env);
      const current = mapOrderStatus(order);
      if (current !== registration.status) registration = await applyOrderStatus(order, env) || registration;
    } catch (err) {
      console.error('Mercado Pago status refresh failed (non-blocking):', err);
    }
  }

  return json({
    status: registration.status,
    attempts: registration.attempts,
    retryAt: paymentLockActive(registration) ? registration.retryAt : null,
  }, 200, cors);
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function validateMercadoPagoSignature(request, dataId, env) {
  if (!env.MP_WEBHOOK_SECRET) return false;
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !requestId || !dataId) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.MP_WEBHOOK_SECRET),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  return timingSafeEqual(hex(digest), v1.toLowerCase());
}

async function handleMercadoPagoWebhook(request, env) {
  const body = await readJson(request);
  if (!body) return json({ok: false}, 400);

  const dataId = body?.data?.id || new URL(request.url).searchParams.get('data.id');
  if (!await validateMercadoPagoSignature(request, dataId, env)) return json({ok: false}, 401);

  try {
    const order = await mercadoPagoOrder(`/v1/orders/${encodeURIComponent(dataId)}`, {method: 'GET'}, env);
    await applyOrderStatus(order, env);
  } catch (err) {
    console.error('Mercado Pago webhook processing failed:', err);
    return json({ok: false}, 500);
  }

  return json({ok: true}, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (path === '/webhooks/mercadopago') {
      if (request.method !== 'POST') return json({error: 'Method not allowed'}, 405);
      return handleMercadoPagoWebhook(request, env);
    }

    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) return json({error: 'Origin not allowed'}, 403, {});
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});

    if (path === '/' && request.method === 'POST') return handleContact(request, env, cors);
    if (path === '/workshop/coupon' && request.method === 'POST') return handleCoupon(request, env, cors);
    if (path === '/workshop/start' && request.method === 'POST') return handleWorkshopStart(request, env, cors);
    if (path === '/workshop/payment/reset' && request.method === 'POST') return handlePaymentReset(request, env, cors);
    if (path === '/workshop/pay/card' && request.method === 'POST') return handleCardPayment(request, env, cors);
    if (path === '/workshop/pay/pix' && request.method === 'POST') return handlePixPayment(request, env, cors);
    if (path === '/workshop/status' && request.method === 'GET') return handleWorkshopStatus(request, env, cors);

    return json({error: 'Method not allowed'}, 405, cors);
  },
};
