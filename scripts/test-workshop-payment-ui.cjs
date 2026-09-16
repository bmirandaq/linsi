const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workshop = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.jsx'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.module.css'), 'utf8');

assert.match(workshop, /apiRequest\('\/workshop\/checkout'/, 'The frontend must request a Checkout Pro redirect from the Worker.');
assert.match(workshop, /window\.location\.assign\(result\.checkoutUrl\)/, 'Checkout Pro must redirect in the same tab.');
assert.match(workshop, /Preparando pagamento\.\.\./, 'The form transition must use the broad loading state.');
assert.match(workshop, /Confirmando pagamento\.\.\./, 'The return flow must confirm payment with the backend.');
assert.match(workshop, /O pagamento será concluído no ambiente do Mercado Pago\./, 'The form must explain the hosted payment handoff.');
assert.match(workshop, /Pagamento em processamento/, 'Pending return state must exist.');
assert.match(workshop, /Pagamento não concluído/, 'Failure return state must exist.');
assert.match(workshop, /Inscrição confirmada/, 'Paid feedback must remain available.');
assert.match(workshop, /apiRequest\(`\/workshop\/status\?id=/, 'Paid state must come from the Worker status endpoint.');

for (const forbidden of [
  'sdk.mercadopago.com/js/v2',
  'MercadoPago(',
  'bricksBuilder',
  'cardPaymentBrick_container',
  'Card Payment Brick',
  '/workshop/pay/card',
  '/workshop/pay/pix',
  '/workshop/payment/reset',
  'deviceId',
  'MP_DEVICE_SESSION_ID',
  'qrCode',
  'Pix Copia e Cola',
  'paymentMethods',
  'WorkshopStepper',
  'Processado pelo',
  'publicKey',
]) {
  assert.doesNotMatch(workshop, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.doesNotMatch(css, /\.processorCard|\.paymentBrick|\.pixQr|\.paymentMethods|\.stepper|\.mockPayment/, 'Advanced checkout CSS must be removed.');
assert.match(css, /\.contactRow\s*\{[\s\S]*?grid-template-columns: 1fr 1fr;/, 'Desktop form must keep two columns.');
assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.contactRow\s*\{[\s\S]*?grid-template-columns: 1fr;/, 'Mobile form must stack fields.');
assert.match(css, /\.processingOverlay\s*\{[\s\S]*?position: absolute;/, 'Preparing payment must use the broad overlay.');

console.log('Workshop Checkout Pro UI contracts passed: single form, hosted redirect, authoritative return flow and no advanced checkout residue.');
