import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
const frontend = await readFile(
  new URL('../src/pages/contribuir-ajuda.jsx', import.meta.url),
  'utf8',
);
const redirectPage = await readFile(
  new URL('../src/pages/contribuir.jsx', import.meta.url),
  'utf8',
);
const frontendCss = await readFile(
  new URL('../src/pages/contribuir.module.css', import.meta.url),
  'utf8',
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {default: worker} = await import(moduleUrl);

assert.match(frontend, /TURNSTILE_SITE_KEY = '0x4AAAAAAEjIIV8ZHpYobikz'/);
assert.match(frontend, /execution: 'execute'/);
assert.match(frontend, /action: 'contact'/);
assert.match(frontend, /turnstile\.execute\(turnstileWidgetId\.current\)/);
assert.doesNotMatch(frontend, /['"]skip['"]/);
assert.doesNotMatch(source, /['"]skip['"]/);
assert.match(redirectPage, /<Redirect to="\/contribuir-ajuda" \/>/);
assert.match(
  frontend,
  /pattern="\(\?:https\?:\/\/\)\?\(\?:www\[\.\]\)\?linkedin\[\.\]com\/in\/\[A-Za-z0-9-\]\+\/\?"/,
);
assert.match(frontend, /linkedin: normalizeLinkedInForSubmit\(linkedin\)/);
assert.match(frontend, /setWhatsapp\(e\.target\.value\.replace\(\/\\D\/g, ''\)\)/);

const fieldOrder = ['id="nome"', 'id="email"', 'id="linkedin"', 'id="whatsapp"'];
for (let i = 1; i < fieldOrder.length; i += 1) {
  assert.ok(
    frontend.indexOf(fieldOrder[i - 1]) < frontend.indexOf(fieldOrder[i]),
    `A ordem dos campos deve preservar ${fieldOrder[i - 1]} antes de ${fieldOrder[i]}`,
  );
}
assert.match(
  frontendCss,
  /\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr 1fr;/,
  'No desktop, a linha de contato deve manter duas colunas.',
);
assert.match(
  frontendCss,
  /@media \(max-width: 700px\)[\s\S]*?\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  'No mobile, a linha de contato deve virar uma coluna e seguir a ordem do DOM.',
);

const allowedOrigin = 'https://linsi.beamiranda.com.br';
const env = {
  ALLOWED_ORIGIN: allowedOrigin,
  TURNSTILE_SECRET_KEY: 'test-secret',
  NOTION_API_KEY: 'test-notion',
  NOTION_DATABASE_ID: 'test-database',
  RESEND_API_KEY: 'test-resend',
  CONTACT_FROM_EMAIL: 'LINSI <noreply@beamiranda.com.br>',
  CONTACT_TO_EMAIL: 'beatriz@beamiranda.com.br',
};
const validPayload = {
  motivo: 'ajuda',
  apelido: 'Pessoa de teste',
  email: 'teste@example.com',
  assunto: 'Teste automatizado',
  mensagem: 'Esta mensagem não deve sair do teste automatizado.',
  turnstileToken: 'valid-token',
};
const validContactPayload = {
  ...validPayload,
  linkedin: 'linkedin.com/in/name-user',
  whatsapp: '14155552671',
};

function request(payload = validPayload, origin = allowedOrigin, contentType = 'application/json') {
  return new Request('https://linsi-form-handler.example.test', {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': contentType,
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

await withFetch(async () => {
  throw new Error('Uma origem falsa não pode chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(request(validPayload, 'https://evil.example'), env);
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

await withFetch(async () => {
  throw new Error('Um payload grande não pode chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(request({...validPayload, mensagem: 'x'.repeat(5001)}), env);
  assert.equal(response.status, 400);
});

await withFetch(async () => {
  throw new Error('LinkedIn inválido não pode chamar serviços externos.');
}, async () => {
  const company = await worker.fetch(
    request({...validPayload, linkedin: 'https://www.linkedin.com/company/linsi'}),
    env,
  );
  assert.equal(company.status, 400);

  const external = await worker.fetch(
    request({...validPayload, linkedin: 'https://example.com/in/name-user'}),
    env,
  );
  assert.equal(external.status, 400);
});

await withFetch(async () => {
  throw new Error('WhatsApp inválido não pode chamar serviços externos.');
}, async () => {
  const response = await worker.fetch(
    request({...validPayload, whatsapp: '+5511999999999'}),
    env,
  );
  assert.equal(response.status, 400);
});

await withFetch(async (url) => {
  assert.match(String(url), /turnstile\/v0\/siteverify/);
  return Response.json({success: false});
}, async () => {
  const response = await worker.fetch(request({...validPayload, turnstileToken: 'skip'}), env);
  assert.equal(response.status, 403);
});

let calls = [];
await withFetch(async (url) => {
  calls.push(String(url));
  if (String(url).includes('siteverify')) {
    return Response.json({
      success: true,
      hostname: 'outro.example',
      action: 'contact',
    });
  }
  throw new Error('Hostname incorreto não pode chegar a serviços externos.');
}, async () => {
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 403);
  assert.equal(calls.length, 1);
});

calls = [];
let resendBody;
await withFetch(async (url, options = {}) => {
  calls.push(String(url));
  if (String(url).includes('siteverify')) {
    return Response.json({
      success: true,
      hostname: 'linsi.beamiranda.com.br',
      action: 'contact',
    });
  }
  if (String(url).includes('api.resend.com')) {
    resendBody = JSON.parse(options.body);
  }
  return new Response('{}', {status: 200});
}, async () => {
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    'https://api.notion.com/v1/pages',
    'https://api.resend.com/emails',
  ]);
  assert.doesNotMatch(resendBody.text, /^LinkedIn:/m);
  assert.doesNotMatch(resendBody.text, /^WhatsApp:/m);
});

calls = [];
resendBody = undefined;
await withFetch(async (url, options = {}) => {
  calls.push(String(url));
  if (String(url).includes('siteverify')) {
    return Response.json({
      success: true,
      hostname: 'linsi.beamiranda.com.br',
      action: 'contact',
    });
  }
  if (String(url).includes('api.resend.com')) {
    resendBody = JSON.parse(options.body);
  }
  return new Response('{}', {status: 200});
}, async () => {
  const response = await worker.fetch(request(validContactPayload), env);
  assert.equal(response.status, 200);
  assert.match(resendBody.text, /^LinkedIn: https:\/\/www\.linkedin\.com\/in\/name-user$/m);
  assert.match(resendBody.text, /^WhatsApp: 14155552671$/m);
});

calls = [];
resendBody = undefined;
await withFetch(async (url, options = {}) => {
  if (String(url).includes('siteverify')) {
    return Response.json({
      success: true,
      hostname: 'linsi.beamiranda.com.br',
      action: 'contact',
    });
  }
  if (String(url).includes('api.resend.com')) {
    resendBody = JSON.parse(options.body);
  }
  return new Response('{}', {status: 200});
}, async () => {
  const response = await worker.fetch(
    request({...validPayload, linkedin: 'http://www.linkedin.com/in/name-user'}),
    env,
  );
  assert.equal(response.status, 200);
  assert.match(resendBody.text, /^LinkedIn: https:\/\/www\.linkedin\.com\/in\/name-user$/m);
});

console.log('Worker security/contact tests passed: origin, limits, optional contacts, LinkedIn normalization, WhatsApp digits and Turnstile fail closed.');
