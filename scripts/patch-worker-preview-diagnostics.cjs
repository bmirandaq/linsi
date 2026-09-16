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

fs.writeFileSync(file, source);
console.log('Preview-only Worker diagnostics applied.');
