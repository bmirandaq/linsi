const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

const config = read('docusaurus.config.js');
const palette = read('src/css/palette-v2.css');
const templateCards = read('src/components/TemplateCards/styles.module.css');
const cafe = read('src/pages/cafe-bea.module.css');
const contribuir = read('src/pages/contribuir.module.css');

const customCssIndex = config.indexOf("'./src/css/custom.css'");
const paletteCssIndex = config.indexOf("'./src/css/palette-v2.css'");

assert.ok(
  customCssIndex >= 0 && paletteCssIndex > customCssIndex,
  'A Palette v2 precisa ser carregada depois do CSS base.',
);

assert.match(
  palette,
  /--linsi-brand-02-ultradark:\s*#04081f;/,
  'Brand 02 ultradark precisa formalizar o canvas dark existente.',
);
assert.match(
  palette,
  /--linsi-brand-02-darker:\s*#15204a;/,
  'Brand 02 darker precisa preservar o tom validado no browser.',
);
assert.match(
  palette,
  /--linsi-brand-02-dark:\s*#1d295a;/,
  'Brand 02 dark precisa preservar o tom raised validado no browser.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\][\s\S]*--linsi-bg-canvas:\s*var\(--linsi-brand-02-ultradark\);/,
  'O canvas dark deve consumir o primitive Brand 02 ultradark.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\][\s\S]*--linsi-bg-surface:\s*var\(--linsi-brand-02-darker\);/,
  'A surface dark deve pertencer à família Brand 02.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\][\s\S]*--linsi-bg-surface-raised:\s*var\(--linsi-brand-02-dark\);/,
  'A surface raised dark deve pertencer à família Brand 02.',
);
assert.match(
  palette,
  /--linsi-focus:\s*var\(--linsi-brand-02-base\);/,
  'O foco no light deve usar Brand 02.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\][\s\S]*--linsi-focus:\s*var\(--linsi-brand-02-lightest\);/,
  'O foco no dark deve usar Brand 02 lightest.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\] \.menu__link:hover[\s\S]*background:\s*var\(--linsi-bg-surface\);/,
  'Hover da sidebar dark deve usar a surface semântica Brand 02.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\] \.pagination-nav__link:hover[\s\S]*background:\s*var\(--linsi-accent-primary-soft\)/,
  'Paginação dark deve permanecer no território semântico de Brand 01.',
);
assert.match(
  palette,
  /\[data-theme=['"]dark['"]\] \.flow-benefit__icon[\s\S]*color:\s*var\(--linsi-accent-secondary\);/,
  'Ícones editoriais secundários devem usar Brand 02 no dark.',
);

assert.doesNotMatch(
  templateCards,
  /#04081f/i,
  'Template Cards não deve repetir o canvas dark como hexadecimal hardcoded.',
);
assert.match(
  templateCards,
  /\.cardDisabled[\s\S]*background:\s*var\(--linsi-bg-surface-muted\);/,
  'Card desabilitado deve consumir o papel semântico de surface muted.',
);

assert.doesNotMatch(
  cafe,
  /#ffffff/i,
  'Café não deve repetir branco puro como hexadecimal hardcoded.',
);
assert.match(
  cafe,
  /\.qrWrapper[\s\S]*background:\s*var\(--linsi-pure-white\);/,
  'O QR deve manter branco puro por função, via token.',
);

for (const token of [
  '--linsi-feedback-success-bg',
  '--linsi-feedback-success-border',
  '--linsi-feedback-success-fg',
  '--linsi-feedback-error-bg',
  '--linsi-feedback-error-border',
  '--linsi-feedback-error-fg',
]) {
  assert.ok(
    contribuir.includes(`var(${token})`),
    `Contribuir precisa consumir ${token}.`,
  );
}
assert.doesNotMatch(
  contribuir,
  /#[0-9a-f]{6}/i,
  'Feedback de Contribuir não deve manter hexadecimais hardcoded.',
);

assert.doesNotMatch(
  palette,
  /--linsi-audit-/,
  'Nomes experimentais de auditoria não podem chegar à implementação final.',
);

console.log('Color token contracts passed: Palette v2 roles and hardcode cleanup.');
