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
const WORKSHOP_BASE_PRICE = 100;
const WORKSHOP_DISCOUNT_PERCENT = 10;
const WORKSHOP_DISCOUNTED_PRICE = 90;
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
  turnstileToken: 2048,
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
    Vary: 'Origin',
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
  if (!coupon) return {status: 'empty', coupon: '', partner: '', amount: WORKSHOP_BASE_PRICE};

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

function paymentLink(value) {
  const raw = requiredString(value, 2048);
  if (!raw) return null;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  const trustedHost = hostname === 'mpago.la'
    || hostname === 'mercadopago.com.br'
    || hostname.endsWith('.mercadopago.com.br');

  if (url.protocol !== 'https:' || !trustedHost || url.username || url.password || url.port) return null;
  return url.toString();
}

function workshopPaymentLink(amount, env) {
  return paymentLink(
    amount === WORKSHOP_DISCOUNTED_PRICE
      ? env.WORKSHOP_PAYMENT_LINK_DISCOUNT
      : env.WORKSHOP_PAYMENT_LINK_FULL,
  );
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
        Inscrição: {title: [{text: {content: registrationId}}]},
        Nome: {rich_text: [{text: {content: nome}}]},
        'E-mail': {email},
        Cargo: {rich_text: [{text: {content: cargo}}]},
        Empresa: {rich_text: empresa ? [{text: {content: empresa}}] : []},
        LinkedIn: {url: linkedin || null},
        WhatsApp: {phone_number: whatsapp || null},
        Cupom: {rich_text: coupon ? [{text: {content: coupon}}] : []},
        Parceiro: {rich_text: partner ? [{text: {content: partner}}] : []},
        Valor: {number: amount},
        Status: {select: {name: 'Aguardando pagamento'}},
        'Criado em': {date: {start: new Date().toISOString()}},
        'Pago em': {date: null},
        'Acesso enviado': {checkbox: false},
        'Confirmação enviada': {checkbox: false},
      },
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Workshop Notion create error: ${resp.status} ${body}`);
  }
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
  if (!nome || !validEmail(email) || !cargo || empresa === null || linkedin === null || whatsapp === null) {
    return json({message: 'Confira os campos preenchidos e tente novamente.'}, 400, cors);
  }

  const couponResult = evaluateCoupon(payload.coupon, env);
  if (couponResult.status === 'invalid') {
    return json({code: 'coupon_invalid', message: 'Cupom inválido. Revise e corrija'}, 400, cors);
  }
  if (couponResult.status === 'unavailable') {
    return json({code: 'coupon_unavailable', message: 'Esse cupom não está mais disponível'}, 400, cors);
  }

  const amount = couponResult.amount || WORKSHOP_BASE_PRICE;
  const selectedPaymentLink = workshopPaymentLink(amount, env);
  if (!selectedPaymentLink) {
    return json({message: 'O pagamento está temporariamente indisponível.'}, 503, cors);
  }

  const registrationId = `WS-${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`;
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
      partner: couponResult.partner || '',
      amount,
    }, env);
  } catch (err) {
    console.error('Workshop registration failed:', err?.message || 'unknown_error');
    return json({message: 'Não foi possível registrar sua inscrição. Tente novamente.'}, 500, cors);
  }

  return json({registrationId, amount, paymentUrl: selectedPaymentLink}, 200, cors);
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';


    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) return json({error: 'Origin not allowed'}, 403, {});
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});


    if (path === '/' && request.method === 'POST') return handleContact(request, env, cors);
    if (path === '/workshop/coupon' && request.method === 'POST') return handleCoupon(request, env, cors);
    if (path === '/workshop/start' && request.method === 'POST') return handleWorkshopStart(request, env, cors);

    return json({error: 'Method not allowed'}, 405, cors);
  },
};
