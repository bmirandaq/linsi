const fs = require('node:fs');

const file = 'worker/index.js';
let source = fs.readFileSync(file, 'utf8');

const before = "const expectedHostname = new URL(allowedOrigin(env)).hostname;\n    return result.success === true && result.hostname === expectedHostname && result.action === expectedAction;";
const after = "const expectedHostname = env.TURNSTILE_EXPECTED_HOSTNAME || new URL(allowedOrigin(env)).hostname;\n    const actionMatches = env.TURNSTILE_EXPECTED_ACTION === '__official_e2e_no_action__'\n      ? true\n      : result.action === expectedAction;\n    return result.success === true && result.hostname === expectedHostname && actionMatches;";

if (!source.includes(before)) throw new Error('Turnstile preview adapter target not found');
source = source.replace(before, after);
fs.writeFileSync(file, source);
console.log('Preview-only Turnstile E2E adapter applied.');
