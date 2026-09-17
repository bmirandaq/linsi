const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workshop = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.jsx'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.module.css'), 'utf8');

assert.match(workshop, /<strong>Registrando inscrição\.\.\.<\/strong>/, 'O submit deve usar loading amplo e explícito.');
assert.match(workshop, /<h1 className=\{styles\.feedbackTitle\}>Inscrição recebida<\/h1>/, 'O sucesso local deve afirmar apenas que a inscrição foi recebida.');
assert.match(workshop, /Agora falta concluir o pagamento para garantir sua vaga no Workshop LINSI\./);
assert.match(workshop, /Pagar no Mercado Pago<\/a>/, 'A cobrança deve ser apenas um link externo.');
assert.match(workshop, /href=\{paymentUrl\}/, 'O CTA deve usar a paymentUrl devolvida pelo Worker.');
assert.match(workshop, /A confirmação da vaga será enviada após a conferência do pagamento\./);
assert.match(workshop, /setAmount\(result\.amount\)/, 'O valor mostrado deve vir do Worker.');
assert.match(workshop, /setPaymentUrl\(result\.paymentUrl \|\| ''\)/, 'O frontend deve aceitar somente o link devolvido pelo Worker.');
assert.match(workshop, /aria-busy=\{stage === 'creating'\}>Continuar<\/button>/, 'O CTA deve permanecer Continuar durante o submit.');

for (const forbidden of [
  /MercadoPago\(/,
  /sdk\.mercadopago\.com/,
  /security\.js/,
  /cardPayment/i,
  /qrCode/i,
  /Pix Copia e Cola/i,
  /Processando pagamento/i,
  /Confirmando pagamento/i,
  /Pagamento em processamento/i,
  /Pagamento não concluído/i,
  /Inscrição confirmada/i,
  /workshop\/pay\/card/,
  /workshop\/pay\/pix/,
  /workshop\/checkout/,
  /workshop\/status/,
  /payment\/reset/,
  /WorkshopStepper/,
  /external_reference/,
]) {
  assert.doesNotMatch(workshop, forbidden, `Não pode restar integração/estado antigo: ${forbidden}`);
}

assert.doesNotMatch(workshop, /window\.location\.(assign|replace)/, 'A LINSI não deve redirecionar automaticamente para pagamento.');
assert.doesNotMatch(workshop, /target="_blank"/, 'O pagamento deve abrir na mesma janela por padrão.');
assert.doesNotMatch(workshop, /MP_PUBLIC_KEY|MP_ACCESS_TOKEN|MP_WEBHOOK_SECRET/);

assert.match(css, /\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr 1fr;/, 'O desktop deve preservar duas colunas.');
assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr;/, 'O mobile deve empilhar os campos.');
assert.match(css, /\.paymentLink\s*\{[\s\S]*?justify-self:\s*start;/, 'O CTA externo deve permanecer explícito no desktop.');
assert.doesNotMatch(css, /processorCard|paymentBrick|pixQr|mockQr|paymentMethods|methodActive/, 'CSS legado de pagamento não deve permanecer.');

console.log('Workshop manual payment UI contracts passed: registration-only flow, server-returned amount/link and no embedded Mercado Pago payment integration.');
