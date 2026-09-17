import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');

for (const forbidden of [
  'MAX_PAYMENT_ATTEMPTS',
  'PAYMENT_LOCK_MS',
  'payment_locked',
  'retryAt',
  'Bloqueado até: {date: {start:',
  "processing_mode: 'automatic'",
]) {
  assert.doesNotMatch(source, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(source, /path === '\/workshop\/checkout'/, 'Checkout Pro endpoint must exist.');
assert.match(source, /processing_mode: 'manual'/, 'Checkout Pro Orders must use manual processing mode.');
assert.match(source, /checkout_url/, 'The Worker must consume the Mercado Pago checkout_url.');
assert.match(source, /checkout-pro:\$\{registration\.registrationId\}:\$\{previousOrderId \|\| 'initial'\}/, 'Order creation must use a deterministic idempotency seed.');
assert.match(source, /reusableCheckoutOrder\(existingOrder\)/, 'A live order must be reused on retry.');
assert.doesNotMatch(source, /updates\.attempts/, 'Checkout Pro must not mutate payment attempts.');

console.log('Workshop retry contracts passed: no artificial lock, deterministic Checkout Pro idempotency, live order reuse and no attempt counter enforcement.');
