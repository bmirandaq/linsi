const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workshop = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.jsx'), 'utf8');

assert.match(
  workshop,
  /const cardProcessing = stage === 'checkout' && paymentMethod === 'card' && cardSubmitting;/,
  'O overlay de processamento do cartão só pode depender de uma submissão real do cartão.',
);
assert.doesNotMatch(
  workshop,
  /cardProcessing[^\n]*paymentState === 'pending'/,
  'Um estado pending genérico, como Pix aguardando pagamento, não pode ativar o overlay do cartão.',
);
assert.match(
  workshop,
  /deviceId: deviceIdRef\.current/,
  'O Card Brick deve ler o device id por ref sem depender de remontagem.',
);
assert.doesNotMatch(
  workshop,
  /\[applyPaymentMeta, checkoutAmount, deviceId,/,
  'Mudanças no device id não podem remontar o Card Brick.',
);

const selectPaymentMethod = workshop.match(/const selectPaymentMethod = useCallback\(async \(method\) => \{([\s\S]*?)\n  \}, \[[^\]]+\]\);/);
assert.ok(selectPaymentMethod, 'A troca de forma de pagamento deve continuar explícita.');
assert.ok(
  selectPaymentMethod[1].indexOf('setPaymentMethod(method);') < selectPaymentMethod[1].indexOf('await resetPayment();'),
  'A aba escolhida deve mudar imediatamente antes do cancelamento/reset remoto da forma anterior.',
);
assert.match(
  selectPaymentMethod[1],
  /setPaymentState\('switching'\);[\s\S]*?await resetPayment\(\);/,
  'A troca de forma deve interromper polling pendente enquanto o reset remoto acontece.',
);

assert.match(workshop, />Cartão<\/button>/, 'A tab deve usar o rótulo curto Cartão.');
assert.doesNotMatch(workshop, />Cartão de crédito<\/button>/, 'A tab não deve voltar a usar Cartão de crédito.');
assert.match(
  workshop,
  /<h1 id="payment-title" className=\{styles\.title\}>Inscrição no Workshop LINSI<\/h1>/,
  'A etapa Pagamento deve preservar o título de página da inscrição.',
);
assert.match(
  workshop,
  /<p className=\{styles\.paymentChoiceLabel\} style=\{\{marginBottom: 0\}\}>Valor do workshop<\/p>/,
  'Valor do workshop deve ser rótulo acima do preço, não o título da página.',
);

assert.doesNotMatch(workshop, />Carregando\.\.\.</, 'O carregamento do botão não deve trocar o label por texto estático.');
assert.doesNotMatch(workshop, /Carregando pagamento\.\.\./, 'O carregamento inicial do Brick deve usar spinner.');
assert.doesNotMatch(workshop, /Gerando Pix\.\.\./, 'A geração do Pix deve usar spinner.');
assert.match(workshop, /<LoadingSpinner compact label="Carregando inscrição" \/>/, 'Continuar deve mostrar spinner durante a criação da inscrição.');
assert.match(workshop, /<LoadingSpinner label="Carregando pagamento" \/>/, 'O Brick deve mostrar spinner enquanto carrega.');
assert.match(workshop, /<LoadingSpinner label="Gerando Pix" \/>/, 'Pix deve mostrar spinner enquanto é criado.');

assert.match(
  workshop,
  /className=\{styles\.pixQr\} style=\{\{border: '1px solid var\(--linsi-border-color\)', justifySelf: 'center'\}\}/,
  'O QR Code deve ficar centralizado e usar o mesmo token de borda dos campos.',
);

assert.match(workshop, /void loadMercadoPago\(\);/, 'O SDK do Mercado Pago deve ser pré-carregado antes da etapa de pagamento.');
assert.match(workshop, /void loadMercadoPagoSecurity\(\)/, 'O device security deve ser aquecido antes da etapa de pagamento.');

console.log('Workshop payment UI contracts passed: spinners, stable Brick, immediate tabs, title hierarchy and QR layout.');
