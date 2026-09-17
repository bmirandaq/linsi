const fs = require('node:fs');

const file = 'worker/index.js';
let source = fs.readFileSync(file, 'utf8');

const turnstileBefore = "const requiredAction = env.TURNSTILE_EXPECTED_ACTION || expectedAction;\n    return result.success === true && result.hostname === expectedHostname && result.action === requiredAction;";
const turnstileAfter = "const requiredAction = env.TURNSTILE_EXPECTED_ACTION || expectedAction;\n    const actionMatches = env.TURNSTILE_EXPECTED_ACTION === '__official_e2e_no_action__'\n      ? true\n      : result.action === requiredAction;\n    return result.success === true && result.hostname === expectedHostname && actionMatches;";
if (!source.includes(turnstileBefore)) throw new Error('Turnstile preview adapter target not found');
source = source.replace(turnstileBefore, turnstileAfter);

const mpBefore = "if (!resp.ok) {\n    const errorCode = typeof data?.code === 'string' ? data.code.slice(0, 80) : '';\n    throw new Error(`Mercado Pago request failed (${resp.status}${errorCode ? `/${errorCode}` : ''})`);\n  }";
const mpAfter = `if (!resp.ok) {
    const errorCode = typeof data?.code === 'string' ? data.code.slice(0, 80) : '';
    const safeEntry = (entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const safe = {};
      for (const key of ['code', 'message', 'field', 'path', 'type', 'error']) {
        if (typeof entry[key] === 'string') safe[key] = entry[key].slice(0, 180);
      }
      return safe;
    };
    const safeDiagnostic = {
      ...(typeof data?.code === 'string' ? {code: data.code.slice(0, 80)} : {}),
      ...(typeof data?.error === 'string' ? {error: data.error.slice(0, 120)} : {}),
      ...(typeof data?.message === 'string' ? {message: data.message.slice(0, 180)} : {}),
      ...(Array.isArray(data?.details) ? {details: data.details.map(safeEntry).filter(Boolean).slice(0, 8)} : {}),
      ...(Array.isArray(data?.errors) ? {errors: data.errors.map(safeEntry).filter(Boolean).slice(0, 8)} : {}),
      ...(Array.isArray(data?.cause) ? {cause: data.cause.map(safeEntry).filter(Boolean).slice(0, 8)} : {}),
    };
    const error = new Error(\`Mercado Pago request failed (\${resp.status}\${errorCode ? \`/\${errorCode}\` : ''})\`);
    error.code = \`mp_\${resp.status}_\${errorCode || 'unknown'}\`;
    error.providerMessage = JSON.stringify(safeDiagnostic).slice(0, 1600);
    throw error;
  }`;
if (!source.includes(mpBefore)) throw new Error('Mercado Pago diagnostic target not found');
source = source.replace(mpBefore, mpAfter);

const checkoutBefore = "console.error('Mercado Pago Checkout Pro order failed:', err?.message || 'unknown_error');\n    return json({message: 'Não foi possível preparar o pagamento. Tente novamente.'}, 502, cors);";
const checkoutAfter = "console.error('Mercado Pago Checkout Pro order failed:', err?.message || 'unknown_error');\n    return json({\n      code: err?.code || 'mp_unknown',\n      providerMessage: err?.providerMessage || '',\n      message: 'Não foi possível preparar o pagamento. Tente novamente.',\n    }, 502, cors);";
if (!source.includes(checkoutBefore)) throw new Error('Checkout diagnostic target not found');
source = source.replace(checkoutBefore, checkoutAfter);


const qaEvidence = `
async function handleQaEvidence(request, env, cors) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^WS-[A-F0-9]{32}$/.test(id)) return json({error: 'Not found'}, 404, cors);
  const registration = await findWorkshopRegistration(id, env);
  if (!registration || !/^QA Checkout Pro E2E [0-9]+$/.test(registration.nome)
      || registration.empresa !== 'LINSI E2E' || registration.cargo !== 'QA'
      || registration.email !== 'test@testuser.com') {
    return json({error: 'Not found'}, 404, cors);
  }
  const response = await fetch('https://api.notion.com/v1/pages/' + registration.pageId, {headers: notionHeaders(env)});
  if (!response.ok) return json({error: 'Notion readback failed'}, 502, cors);
  const properties = (await response.json()).properties;
  const order = registration.mpOrderId
    ? await mercadoPagoOrder('/v1/orders/' + encodeURIComponent(registration.mpOrderId), {method: 'GET'}, env)
    : null;
  const seller = await mercadoPagoOrder('/users/me', {method: 'GET'}, env);
  return json({
    sandboxCredential: env.MP_ACCESS_TOKEN.startsWith('TEST-') || seller.tags?.includes('test_user') === true,
    registrationMatches: registration.registrationId === id,
    nameMatches: /^QA Checkout Pro E2E [0-9]+$/.test(registration.nome),
    emailMatches: registration.email === 'test@testuser.com',
    amount: registration.amount,
    couponEmpty: registration.coupon === '',
    status: registration.status,
    notionStatus: properties.Status?.select?.name || '',
    createdAtPresent: Boolean(properties['Criado em']?.date?.start),
    paidAtPresent: Boolean(properties['Pago em']?.date?.start),
    blockedUntilEmpty: !properties['Bloqueado até']?.date,
    orderSaved: Boolean(registration.mpOrderId),
    order: order ? {
      idMatches: order.id === registration.mpOrderId,
      referenceMatches: order.external_reference === id,
      amount: orderAmountInCents(order),
      status: order.status,
      statusDetail: order.status_detail || '',
      liveMode: typeof order.live_mode === 'boolean' ? order.live_mode : null,
      successReturnMatches: order.config?.online?.success_url === checkoutReturnUrl(env, 'success', id),
      failureReturnMatches: order.config?.online?.failure_url === checkoutReturnUrl(env, 'failure', id),
    } : null,
  }, 200, {...cors, 'Cache-Control': 'no-store'});
}
`;
const qaRouteTarget = "    if (path === '/' && request.method === 'POST') return handleContact(request, env, cors);";
if (!source.includes(qaRouteTarget)) throw new Error('Preview QA route target missing');
source = source.replace('export default {', qaEvidence + '\nexport default {');
source = source.replace(qaRouteTarget,
  "    if (path === '/__qa/workshop-evidence' && request.method === 'GET') return handleQaEvidence(request, env, cors);\n" + qaRouteTarget);

fs.writeFileSync(file, source);
console.log('Preview-only Worker diagnostics applied.');
