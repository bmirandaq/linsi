const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const checkoutUrl = 'https://pay.herospark.com/workshop-mapeando-experiencias-com-linsi-545805';
const home = JSON.parse(read('content/home.json'));
const page = read('src/pages/index.jsx');
const css = read('src/pages/index.module.css');
const redirect = read('src/pages/workshop.jsx');
const worker = read('worker/index.js');
const wrangler = read('worker/wrangler.toml');

assert.equal(home.workshop.pretitle, 'Workshop');
assert.equal(home.workshop.title, 'Mapeando experiências com LINSI');
assert.equal(home.workshop.dateTime, '12 de novembro, quinta-feira, às 19h');
assert.deepEqual(home.workshop.tags, ['Ao vivo no YouTube', 'Gravação inclusa', '1h30 de duração']);
assert.equal(home.workshop.price, 'R$ 100');
assert.equal(home.workshop.installment, 'Ou até 3x de R$ 35,70');
assert.equal(home.workshop.actionLabel, 'Quero participar');
assert.equal(home.workshop.actionHref, checkoutUrl);
assert.equal(home.workshop.securePayment, 'Pagamento seguro com SparkPay');
assert.equal(
  home.workshop.description,
  'Mapear experiências faz parte do trabalho diário de quem projeta produtos e serviços. Vamos trabalhar em um cenário para transformar esse repertório em um fluxograma com LINSI, e assim usar a representação para revelar definições e lacunas de uma experiência',
);
assert.equal(
  home.workshop.prerequisite,
  'Não é preciso conhecer a LINSI antes. Basta estudar ou atuar em UX/UI/Product Design, Produto ou áreas relacionadas. Espaço para dúvidas e trocas',
);
assert.deepEqual(home.workshop.topics, [
  'Reconhecer o que caracteriza um mapeamento',
  'Organizar o que já foi mapeado',
  'Construir o fluxograma com LINSI',
]);
assert.equal(home.workshop.description.endsWith('.'), false);
assert.equal(home.workshop.prerequisite.endsWith('.'), false);

assert.match(page, /to="#workshop"[\s\S]*?trackClarityEvent\('workshop_view'\)/);
assert.match(page, /href=\{homeContent\.workshop\.actionHref\}[\s\S]*?trackClarityEvent\('workshop_signup_click'\)/);
assert.match(page, /<Heading as="h2" id="workshop-title"/);
assert.match(page, /aria-label="Informações do workshop"/);
assert.match(page, /workshop-fragment-desktop\.svg/);
assert.match(page, /workshop-fragment-compact\.svg/);
assert.match(page, /verified-user-material-symbol\.svg/);
assert.doesNotMatch(page, /to="\/workshop"/);

assert.match(css, /\.workshopHeader\s*\{[\s\S]*?background:\s*var\(--linsi-brand-02-base\);[\s\S]*?border-top-right-radius:\s*100px;/);
assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\) 267px;/);
assert.match(css, /\.workshopDetails\s*\{[\s\S]*?background:\s*var\(--linsi-brand-02-darkest\);[\s\S]*?border-bottom-right-radius:\s*100px;[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(css, /\.workshopTags\s*\{[\s\S]*?flex-wrap:\s*wrap;/);
assert.match(css, /@media \(max-width: 996px\)[\s\S]*?\.workshopCard\s*\{[\s\S]*?width:\s*calc\(100% - var\(--linsi-space-16\)\);/);
assert.match(css, /@media \(max-width: 996px\)[\s\S]*?\.workshopHeader\s*\{[\s\S]*?flex-direction:\s*column;/);
assert.match(css, /@media \(max-width: 1440px\) and \(min-width: 997px\)[\s\S]*?\.workshopDetails\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(css, /@media \(max-width: 996px\)[\s\S]*?\.workshopDetails\s*\{[\s\S]*?flex-direction:\s*column;[\s\S]*?padding:\s*var\(--linsi-space-24\) var\(--linsi-space-16\) var\(--linsi-space-32\);/);
assert.match(css, /\[data-theme='dark'\] \.workshopDetails\s*\{[\s\S]*?background:\s*var\(--linsi-brand-02-ultralighter\);/);
assert.match(css, /\[data-theme='dark'\] \.workshopDescription\s*\{[\s\S]*?color:\s*var\(--linsi-neutral-darker\);/);
assert.match(css, /\[data-theme='dark'\] \.workshopPrerequisite\s*\{[\s\S]*?color:\s*var\(--linsi-neutral-dark\);/);
assert.match(css, /\[data-theme='dark'\] \.workshopTopicsTitle,[\s\S]*?\[data-theme='dark'\] \.workshopTopic\s*\{[\s\S]*?color:\s*var\(--linsi-pure-black\);/);
assert.doesNotMatch(css, /\[data-theme='dark'\] \.workshop(?:Card|Header)\s*\{/);

const redirectLines = redirect.split('\n').map((line) => line.trim());
const checkoutDeclarationIndex = redirectLines.indexOf('const WORKSHOP_CHECKOUT_URL =');
assert.notEqual(checkoutDeclarationIndex, -1, 'Legacy workshop redirect must declare WORKSHOP_CHECKOUT_URL.');
assert.equal(
  redirectLines[checkoutDeclarationIndex + 1],
  `'${checkoutUrl}';`,
  'Legacy workshop redirect must declare the exact HeroSpark checkout URL.',
);
assert.match(redirect, /window\.location\.replace\(WORKSHOP_CHECKOUT_URL\)/);
assert.match(redirect, /httpEquiv="refresh"/);
assert.match(redirect, /<a href=\{WORKSHOP_CHECKOUT_URL\}>Ir para o checkout do workshop<\/a>/);
assert.doesNotMatch(redirect, /cupom|Mercado Pago|WORKSHOP_API_URL|\/workshop\/start|\/workshop\/coupon/i);

for (const pattern of [
  /WORKSHOP_BASE_PRICE/,
  /WORKSHOP_COUPONS/,
  /WORKSHOP_PAYMENT_BINDINGS/,
  /WORKSHOP_NOTION_DATABASE_ID/,
  /WORKSHOP_COUPONS_JSON/,
  /\/workshop\/coupon/,
  /\/workshop\/start/,
  /mpago\.la/,
  /mercadopago\.com\.br/,
]) {
  assert.doesNotMatch(worker, pattern);
  assert.doesNotMatch(wrangler, pattern);
}
assert.match(worker, /if \(path === '\/' && request\.method === 'POST'\) return handleContact/);
assert.match(worker, /NOTION_DATABASE_ID/);
assert.match(worker, /RESEND_API_KEY/);
assert.match(wrangler, /TURNSTILE_SECRET_KEY/);
assert.match(wrangler, /NOTION_API_KEY/);
assert.match(wrangler, /NOTION_DATABASE_ID/);
assert.match(wrangler, /RESEND_API_KEY/);

for (const asset of [
  'static/img/workshop-fragment-desktop.svg',
  'static/img/workshop-fragment-compact.svg',
  'static/img/verified-user-material-symbol.svg',
]) {
  assert.equal(exists(asset), true, `${asset} deve existir.`);
  assert.ok(read(asset).length > 100, `${asset} não pode estar vazio.`);
}
assert.match(read('static/img/workshop-fragment-desktop.svg'), /<svg width="54" height="24"/);
assert.match(read('static/img/workshop-fragment-compact.svg'), /<svg width="32" height="14"/);
assert.match(read('static/img/verified-user-material-symbol.svg'), /viewBox="0 -960 960 960"/);

console.log('Workshop Home contracts passed: final copy, Figma-aligned structure, HeroSpark CTA, legacy redirect and old checkout cleanup.');
