const ALLOWED_REASONS = ['contribuir', 'ajuda', 'outro'];
const CONTACT_ACTION = 'contact';
const MAX_LENGTHS = {
  apelido: 120,
  email: 254,
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
        Mensagem: { rich_text: [{ text: { content: mensagem } }] },
        'Recebido em': { date: { start: new Date().toISOString() } },
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Notion error: ${resp.status} ${err}`);
  }
}

async function sendResend(payload, env) {
  const { motivo, apelido, email, assunto, mensagem } = payload;

  const reasonLabels = {
    contribuir: 'Quero contribuir',
    ajuda: 'Preciso de ajuda',
    outro: 'Outros assuntos',
  };

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
      text: [
        `Motivo: ${reasonLabels[motivo] || motivo}`,
        `Apelido: ${apelido}`,
        `E-mail: ${email}`,
        `Assunto: ${assunto}`,
        '',
        'Mensagem:',
        mensagem,
      ].join('\n'),
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

    try {
      await registerNotion({ motivo, apelido, email, assunto, mensagem }, env);
    } catch (err) {
      console.error('Notion registration failed:', err);
      return json({ error: 'Erro ao registrar' }, 500, cors);
    }

    try {
      await sendResend({ motivo, apelido, email, assunto, mensagem }, env);
    } catch (err) {
      console.error('Resend notification failed (non-blocking):', err);
    }

    return json({ ok: true }, 200, cors);
  },
};
