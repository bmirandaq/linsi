const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workshop = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.jsx'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.module.css'), 'utf8');

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

const cardSubmitBlock = workshop.match(/onSubmit: \(formData, additionalData\) => new Promise\(async \(resolve, reject\) => \{([\s\S]*?)\n          \}\),/);
assert.ok(cardSubmitBlock, 'O callback real onSubmit do Card Payment Brick deve existir.');
assert.match(cardSubmitBlock[1], /setCardSubmitting\(true\);/, 'A submissão real deve iniciar o estado de processamento.');
assert.equal(
  [...workshop.matchAll(/setCardSubmitting\(true\)/g)].length,
  2,
  'Somente o Card Brick real e a simulação local explícita podem iniciar Processando pagamento.',
);
assert.match(
  workshop,
  /const mockPending = useCallback\(\(\) => \{\s*setCardSubmitting\(true\);/,
  'A segunda ocorrência deve pertencer somente ao mock local explícito.',
);

assert.match(workshop, /deviceId: deviceIdRef\.current/, 'O Card Brick deve ler o device id por ref.');
assert.doesNotMatch(
  workshop,
  /\[checkoutAmount,[^\]]*(methodSwitching|paymentMethod|paymentState)/,
  'Trocas de método e estado não podem remontar o Card Brick.',
);
assert.match(
  workshop,
  /<div className=\{styles\.paymentPane\} hidden=\{paymentMethod !== 'card'\}>\{renderCardContent\(\)\}<\/div>/,
  'O Card Brick deve permanecer montado enquanto a aba Pix estiver visível.',
);
assert.doesNotMatch(workshop, /Carregando pagamento|Alterando forma de pagamento/, 'Pix -> Cartão não pode mostrar spinner próprio da LINSI.');

const selectPaymentMethod = workshop.match(/const selectPaymentMethod = useCallback\(async \(method\) => \{([\s\S]*?)\n  \}, \[[^\]]+\]\);/);
assert.ok(selectPaymentMethod, 'A troca de forma de pagamento deve continuar explícita.');
assert.ok(
  selectPaymentMethod[1].indexOf('setPaymentMethod(method);') < selectPaymentMethod[1].indexOf('const reset = resetPayment();'),
  'A aba escolhida deve mudar imediatamente antes do cancelamento remoto.',
);
assert.match(
  selectPaymentMethod[1],
  /resetInFlightRef\.current = reset;[\s\S]*?await reset;/,
  'A submissão do cartão deve aguardar o reset/cancelamento remoto.',
);
assert.match(cardSubmitBlock[1], /await resetInFlightRef\.current;/, 'onSubmit deve aguardar o cancelamento pendente.');

assert.match(workshop, />Cartão<\/button>/, 'A tab deve usar o rótulo curto Cartão.');
assert.match(workshop, /aria-busy=\{stage === 'creating'\}>Continuar<\/button>/, 'O CTA deve continuar exibindo Continuar.');
assert.match(workshop, /<strong>Carregando\.\.\.<\/strong>/, 'A criação da inscrição deve usar loader amplo com label visível.');
assert.match(workshop, /<LoadingState label="Gerando QR Code Pix" \/>/, 'A geração do Pix deve mostrar label visível.');
assert.doesNotMatch(workshop, /<LoadingSpinner/, 'Não deve restar spinner compacto ou sobre o Card Brick.');

assert.match(workshop, /className=\{styles\.pixQr\} src=/, 'O QR Code deve usar classe CSS própria.');
assert.doesNotMatch(workshop, /className=\{styles\.pixQr\} style=/, 'O QR Code não deve usar borda inline.');
assert.match(css, /\.pixQr,[\s\S]*?border: 1px solid var\(--linsi-border-color\);[\s\S]*?justify-self: center;/);

const processorBlock = css.match(/\.processorCard\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.ok(processorBlock, 'O estilo do selo Mercado Pago deve existir.');
assert.doesNotMatch(processorBlock, /background:|border:|border-radius:|padding:/, 'O selo Mercado Pago não deve parecer um card.');

assert.match(workshop, /void loadMercadoPago\(\);/, 'O SDK do Mercado Pago deve ser pré-carregado.');
assert.match(workshop, /void loadMercadoPagoSecurity\(\)/, 'O device security deve ser aquecido.');

console.log('Workshop payment UI contracts passed: visible loaders, persistent Brick, immediate safe tabs, QR border and processor without card chrome.');
