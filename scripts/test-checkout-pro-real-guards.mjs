import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {providerBlock, check, SafeE2EError, requireBuyerSecrets, isMpHost} from './checkout-pro-real-helpers.mjs';

// Unit tests only: reproduces the provider error screenshot previously accepted.
const pageWith = text => ({locator: () => ({innerText: async () => text, all: async () => []})});
assert.equal(await providerBlock(pageWith('Hubo un error accediendo a esta pagina...')), 'mp_page_access_error');
assert.equal(await providerBlock(pageWith('Confirme que você é humano')), 'mp_captcha_required');
assert.equal(await providerBlock(pageWith('Senha incorreta')), 'mp_invalid_password');
assert.equal(await providerBlock(pageWith('Como você quer pagar?')), '');
assert.throws(() => check(false, 'expected_failure'), SafeE2EError);
assert.equal(isMpHost('www.mercadopago.com.br'), true);
assert.equal(isMpHost('mercadopago.com.br.attacker.test'), false);

const names = ['MP_TEST_BUYER_USERNAME', 'MP_TEST_BUYER_PASSWORD', 'MP_TEST_BUYER_CODE'];
const saved = names.map(name => process.env[name]);
try {
  names.forEach(name => delete process.env[name]);
  assert.throws(requireBuyerSecrets, {message: 'MP_TEST_BUYER_USERNAME ausente'});
} finally {
  names.forEach((name, i) => saved[i] === undefined ? delete process.env[name] : process.env[name] = saved[i]);
}
const source = fs.readFileSync('worker/index.js', 'utf8').replace(/\r\n/g, '\n');
let patched;
vm.runInNewContext(fs.readFileSync('scripts/patch-worker-preview-diagnostics.cjs', 'utf8'), {
  require(name) {
    assert.equal(name, 'node:fs');
    return {readFileSync: () => source, writeFileSync: (_name, value) => { patched = value; }};
  },
  console: {log() {}},
});
assert.ok(patched.includes("path === '/__qa/workshop-evidence'"));
assert.ok(!source.includes('/__qa/workshop-evidence'));
assert.ok(!source.includes('__official_e2e_no_action__'));
const worker = await import('data:text/javascript;base64,' + Buffer.from(patched).toString('base64'));
assert.equal(typeof worker.default.fetch, 'function');
console.log('Real E2E guard unit tests passed: provider errors/CAPTCHA, missing secrets, host allowlist and preview-only instrumentation.');
