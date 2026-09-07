const ALLOWED_REASONS = ['contribuir', 'ajuda', 'outro'];
const CONTACT_ACTION = 'contact';
const MAX_LENGTHS = {
  apelido: 120,
  email: 254,
  linkedin: 300,
  whatsapp: 32,
  assunto: 200,
  mensagem: 5000,
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, status, cors) {
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

async function verifyTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET_KEY) return false;

  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip || '',
      }),
    });
    if (!resp.ok) return false;

    const result = await resp.json();
    const expectedHostname = new URL(allowedOrigin(env)).hostname;
    return result.success === true &&
      result.hostname === expectedHostname &&
      result.action === CONTACT_ACTION;
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

  if (!['linkedin.com', 'www.linkedin.com'].includes(url.hostname.toLowerCase())) {
    return null;
  }
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

async function registerNotion(payload, env) {
  const { motivo, apelido, email, assunto, mensagem } = payload;

  const reasonLabels = {
    contribuir: 'Quero contribuir',
    ajuda: 'Preciso de ajuda',
    outro: 'Outros assuntos',
  };

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: env.NOTION_DATABASE_ID },
      properties: {
        Assunto: { title: [{ text: { content: assunto } }] },
        Status: { select: { name: 'Novo' } },
        Motivo: { select: { name: reasonLabels[motivo] || motivo } },
        Apelido: { rich_text: [{ text: { content: apelido } }] },
        'E-mail': { email },
        Mensagem: { rich_text: notionRichText(mensagem) },
        'Recebido em': { date: { start: new Date().toISOString() } },
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Notion error: ${resp.status} ${err}`);
  }
}

function notionRichText(value) {
  const chunks = [];
  let chunk = '';
  for (const character of value) {
    if (chunk.length + character.length > 2000) {
      chunks.push({ text: { content: chunk } });
      chunk = '';
    }
    chunk += character;
  }
  if (chunk) chunks.push({ text: { content: chunk } });
  return chunks;
}

async function sendResend(payload, env) {
  const { motivo, apelido, email, linkedin, whatsapp, assunto, mensagem } = payload;

  const reasonLabels = {
    contribuir: 'Quero contribuir',
    ajuda: 'Preciso de ajuda',
    outro: 'Outros assuntos',
  };

  const textLines = [
    `Motivo: ${reasonLabels[motivo] || motivo}`,
    `Apelido: ${apelido}`,
    `E-mail: ${email}`,
    ...(linkedin ? [`LinkedIn: ${linkedin}`] : []),
    ...(whatsapp ? [`WhatsApp: ${whatsapp}`] : []),
    `Assunto: ${assunto}`,
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: 'Origin not allowed' }, 403, {});
    }
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return json({ error: 'Content-Type inválido' }, 415, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const motivo = payload?.motivo;
    const apelido = requiredString(payload?.apelido, MAX_LENGTHS.apelido);
    const email = requiredString(payload?.email, MAX_LENGTHS.email);
    const linkedin = normalizeLinkedIn(payload?.linkedin);
    const whatsapp = normalizeWhatsApp(payload?.whatsapp);
    const assunto = requiredString(payload?.assunto, MAX_LENGTHS.assunto);
    const mensagem = requiredString(payload?.mensagem, MAX_LENGTHS.mensagem);
    const turnstileToken = requiredString(
      payload?.turnstileToken,
      MAX_LENGTHS.turnstileToken,
    );

    if (!ALLOWED_REASONS.includes(motivo)) {
      return json({ error: 'Motivo inválido' }, 400, cors);
    }
    if (!apelido) {
      return json({ error: 'Apelido obrigatório' }, 400, cors);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'E-mail inválido' }, 400, cors);
    }
    if (linkedin === null) {
      return json({ error: 'LinkedIn inválido' }, 400, cors);
    }
    if (whatsapp === null) {
      return json({ error: 'WhatsApp inválido' }, 400, cors);
    }
    if (!assunto) {
      return json({ error: 'Assunto obrigatório' }, 400, cors);
    }
    if (!mensagem) {
      return json({ error: 'Mensagem obrigatória' }, 400, cors);
    }
    if (!turnstileToken) {
      return json({ error: 'Token Turnstile obrigatório' }, 400, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const turnstileValid = await verifyTurnstile(turnstileToken, ip, env);
    if (!turnstileValid) {
      return json({ error: 'Verificação falhou' }, 403, cors);
    }

    const normalizedPayload = {
      motivo,
      apelido,
      email,
      linkedin,
      whatsapp,
      assunto,
      mensagem,
    };

    try {
      await registerNotion(normalizedPayload, env);
    } catch (err) {
      console.error('Notion registration failed:', err);
      return json({ error: 'Erro ao registrar' }, 500, cors);
    }

    try {
      await sendResend(normalizedPayload, env);
    } catch (err) {
      console.error('Resend notification failed (non-blocking):', err);
    }

    return json({ ok: true }, 200, cors);
  },
};
