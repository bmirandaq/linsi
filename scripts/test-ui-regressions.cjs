const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

const customCss = read('src/css/custom.css');
const spacingCss = read('src/css/spacing.css');
const layoutFixesCss = read('src/css/layout-fixes.css');
const footer = read('src/theme/Footer/index.jsx');
const footerCss = read('src/theme/Footer/styles.module.css');
const homeCss = read('src/pages/index.module.css');
const cafePage = read('src/pages/cafe-bea.tsx');
const expandButton = read(
  'src/theme/DocRoot/Layout/Sidebar/ExpandButton/index.jsx',
);
const colorModeToggle = read('src/theme/Navbar/ColorModeToggle/index.jsx');
const colorModeCss = read(
  'src/theme/Navbar/ColorModeToggle/styles.module.css',
);
const mobileSidebarHeader = read(
  'src/theme/Navbar/MobileSidebar/Header/index.jsx',
);
const navbarSearchCss = read('src/theme/Navbar/Search/styles.module.css');
const sidebarLayout = read('src/theme/DocRoot/Layout/Sidebar/index.jsx');
const sidebarLayoutCss = read('src/theme/DocRoot/Layout/Sidebar/styles.module.css');
const sidebarExpandCss = read(
  'src/theme/DocRoot/Layout/Sidebar/ExpandButton/styles.module.css',
);

assert.match(
  customCss,
  /transition:\s*width var\(--ifm-transition-fast\) ease,/,
  'A sidebar precisa preservar a transição de largura usada pelo Docusaurus.',
);
assert.match(
  expandButton,
  /<button[\s\S]*?onClick=\{toggleSidebar\}/,
  'A reabertura da sidebar precisa usar um botão nativo clicável.',
);
assert.doesNotMatch(
  expandButton,
  /onKeyDown/,
  'O botão da sidebar não deve sobrescrever o comportamento nativo do teclado.',
);
assert.doesNotMatch(
  sidebarLayout,
  /onTransitionEnd/,
  'A sidebar não deve depender de transitionend para poder reabrir.',
);
assert.match(
  sidebarLayout,
  /hiddenSidebarContainer \? \([\s\S]*?<ExpandButton/,
  'O botão de reabertura precisa acompanhar diretamente o estado colapsado.',
);
assert.match(
  sidebarLayout,
  /getBoundingClientRect\(\)\.height/,
  'A sidebar deve medir sua altura expandida antes de ser recolhida.',
);
assert.match(
  sidebarLayout,
  /--linsi-sidebar-expanded-height/,
  'A altura medida da sidebar precisa ser compartilhada com o estado colapsado.',
);
assert.match(
  sidebarExpandCss,
  /@media \(min-width: 997px\)[\s\S]*?height:\s*100%;[\s\S]*?position:\s*absolute;/,
  'O botão da sidebar colapsada deve ocupar a mesma altura preservada do painel.',
);
assert.match(
  sidebarLayoutCss,
  /\.sidebarViewportHidden\s*\{[\s\S]*?height:\s*var\(--linsi-sidebar-expanded-height, 240px\);[\s\S]*?max-height:\s*var\(--linsi-sidebar-expanded-height, 240px\);/,
  'O viewport colapsado deve reutilizar a altura medida da sidebar expandida.',
);
assert.match(
  layoutFixesCss,
  /docSidebarContainerHidden[\s\S]*?height:\s*var\(--linsi-sidebar-expanded-height, 240px\) !important;[\s\S]*?min-height:\s*var\(--linsi-sidebar-expanded-height, 240px\) !important;/,
  'O override final da sidebar colapsada precisa preservar a altura expandida.',
);
assert.match(
  spacingCss,
  /--linsi-doc-column-gap:\s*var\(--linsi-space-48\);/,
  'O gap estrutural da documentação deve usar o token de 48px.',
);
assert.match(
  layoutFixesCss,
  /html\.docs-doc-page \[class\*='docRoot'\]\s*\{[\s\S]*?column-gap:\s*var\(--linsi-doc-column-gap\);/,
  'Sidebar e conteúdo devem usar o mesmo gap estrutural da documentação.',
);
assert.match(
  layoutFixesCss,
  /button\[class\*='collapseSidebarButton'\]:hover[\s\S]*?color:\s*var\(--linsi-accent-secondary\) !important;/,
  'O chevron de recolher precisa manter contraste legível no hover.',
);
assert.match(
  layoutFixesCss,
  /html\.docs-doc-page \.main-wrapper\s*\{[\s\S]*?padding-bottom:\s*var\(--linsi-space-64\);/,
  'As páginas da documentação precisam manter 64px antes do footer via token.',
);

assert.match(
  footer,
  /to="\/contribuir"/,
  'O destino de Quero contribuir no footer deve apontar para /contribuir.',
);
assert.match(
  footerCss,
  /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
  'As colunas mobile do footer precisam poder encolher sem overflow.',
);
assert.match(
  footerCss,
  /\.creatorLink\s*\{[\s\S]*?gap:\s*var\(--linsi-space-4\);/,
  'O símbolo da Bea deve manter 4px de distância do nome via token.',
);
assert.match(
  footerCss,
  /\.creatorSymbol\s*\{[\s\S]*?height:\s*16px;[\s\S]*?width:\s*16px;/,
  'O símbolo da Bea precisa manter 16 por 16 pixels.',
);

assert.match(
  colorModeToggle,
  /NavbarColorModeToggle\(\{className\}\)/,
  'O seletor de tema precisa aceitar a classe responsiva do Docusaurus.',
);
assert.match(
  colorModeToggle,
  /clsx\(styles\.toggle, className\)/,
  'O seletor de tema precisa aplicar a classe responsiva do Docusaurus.',
);
assert.doesNotMatch(
  colorModeCss,
  /margin-right:\s*48px/,
  'O seletor de tema não pode ampliar o viewport do menu mobile.',
);
assert.doesNotMatch(
  mobileSidebarHeader,
  /NavbarColorModeToggle/,
  'O switch de tema não deve aparecer dentro do menu mobile.',
);
assert.match(
  colorModeCss,
  /@media \(max-width: 996px\)[\s\S]*?display:\s*inline-flex !important;/,
  'O switch de tema precisa continuar visível na navbar mobile.',
);
assert.match(
  customCss,
  /\.navbar__items--right\s*\{[^}]*column-gap:\s*var\(--linsi-space-8\);/,
  'Busca e switch precisam manter 8px de separação na navbar mobile.',
);
assert.match(
  navbarSearchCss,
  /@media \(max-width: 996px\)[\s\S]*?position:\s*static;/,
  'A busca mobile precisa permanecer no fluxo para não sobrepor o switch.',
);
assert.doesNotMatch(
  navbarSearchCss,
  /@media \(max-width: 996px\)[\s\S]*?position:\s*absolute;/,
  'A busca mobile não pode voltar ao posicionamento absoluto do tema.',
);

assert.match(
  homeCss,
  /\.mediaColumn\s*\{[\s\S]*?order:\s*3;/,
  'A imagem da home precisa ficar depois do subtítulo no layout mobile.',
);
assert.ok(
  cafePage.indexOf("{copiedCode ? 'Código copiado' : 'Copiar código Pix'}") <
    cafePage.indexOf("name={copiedCode ? 'check' : 'content_copy'}"),
  'O ícone de copiar precisa aparecer depois do label do botão.',
);
assert.doesNotMatch(
  cafePage,
  /className=\{clsx\(\s*styles\.copyStatus/,
  'O feedback do Pix deve permanecer no próprio botão.',
);

console.log('UI regression contracts passed: sidebar, docs spacing, footer spacing, navbar mobile and key page behavior.');
