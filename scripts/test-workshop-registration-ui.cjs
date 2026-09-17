const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workshop = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.jsx'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../src/pages/workshop.module.css'), 'utf8');

assert.match(workshop, /<h1 className=\{styles\.feedbackTitle\}>Inscrição recebida<\/h1>/, 'O sucesso local deve afirmar apenas que a inscrição foi recebida.');
assert.match(workshop, /Agora falta concluir o pagamento para garantir sua vaga no Workshop LINSI\./);
assert.match(workshop, /Pagar no Mercado Pago<\/a>/, 'A cobrança deve permanecer como link externo.');
assert.match(workshop, /href=\{paymentUrl\}/, 'O CTA deve usar a URL devolvida pelo Worker.');
assert.match(workshop, /A confirmação da vaga será enviada após a conferência do pagamento\./);
assert.match(workshop, /setAmount\(result\.amount\)/, 'O valor mostrado deve vir do Worker.');
assert.match(workshop, /setPaymentUrl\(result\.paymentUrl \|\| ''\)/, 'O frontend deve aceitar somente o link devolvido pelo Worker.');
assert.match(workshop, />Continuar para pagamento<\/button>/, 'O CTA deve explicar que a próxima ação é o pagamento.');
assert.match(workshop, /<p className=\{styles\.subtitle\}>Valor: R\$ 100<\/p>/, 'O preço integral deve aparecer abaixo do título do Workshop.');
assert.doesNotMatch(workshop, /TURNSTILE_SITE_KEY|loadTurnstile|getTurnstileToken|turnstileToken|window\.turnstile|styles\.turnstile/, 'O Workshop não deve depender de Turnstile.');
assert.doesNotMatch(workshop, /Registrando inscrição|processingOverlay|processingSpinner|aria-busy/, 'O submit não deve trocar a página por um loading dedicado.');
assert.doesNotMatch(workshop, /window\.location\.(assign|replace)/, 'A LINSI não deve redirecionar automaticamente para pagamento.');
assert.doesNotMatch(workshop, /target="_blank"/, 'O pagamento deve abrir na mesma janela por padrão.');

assert.match(css, /\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr 1fr;/, 'O desktop deve preservar duas colunas.');
assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.contactRow\s*\{[\s\S]*?grid-template-columns:\s*1fr;/, 'O mobile deve empilhar os campos.');
assert.match(css, /\.paymentLink\s*\{[\s\S]*?justify-self:\s*start;/, 'O CTA externo deve permanecer explícito no desktop.');
assert.doesNotMatch(css, /processingOverlay|processingSpinner|turnstile/, 'CSS de loading ou Turnstile não deve permanecer no Workshop.');

console.log('Workshop registration UI contracts passed: direct Notion submit, no Turnstile, no dedicated loading screen and external payment link.');
