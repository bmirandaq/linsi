const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

const docusaurusConfig = read('docusaurus.config.js');
const customCss = read('src/css/custom.css');
const spacingCss = read('src/css/spacing.css');
const layoutFixesCss = read('src/css/layout-fixes.css');
const footer = read('src/theme/Footer/index.jsx');
const footerCss = read('src/theme/Footer/styles.module.css');
const homeCss = read('src/pages/index.module.css');
const cafePage = read('src/pages/cafe-bea.tsx');
const colorModeToggle = read('src/theme/Navbar/ColorModeToggle/index.jsx');
const colorModeCss = read(
  'src/theme/Navbar/ColorModeToggle/styles.module.css',
);
const mobileSidebarHeader = read(
  'src/theme/Navbar/MobileSidebar/Header/index.jsx',
);
const mobileSidebarSecondaryMenu = read(
  'src/theme/Navbar/MobileSidebar/SecondaryMenu/index.tsx',
);
const mobileSidebarSecondaryMenuCss = read(
  'src/theme/Navbar/MobileSidebar/SecondaryMenu/styles.module.css',
);
const navbarSearchCss = read('src/theme/Navbar/Search/styles.module.css');
const sidebarLayout = read('src/theme/DocRoot/Layout/Sidebar/index.jsx');
const sidebarLayoutCss = read('src/theme/DocRoot/Layout/Sidebar/styles.module.css');

assert.match(
  docusaurusConfig,
  /sidebar:\s*\{[\s\S]*?hideable:\s*false,[\s\S]*?autoCollapseCategories:\s*false,/,
  'A sidebar desktop da documentação não deve oferecer recolher nem auto-colapsar.',
);
assert.doesNotMatch(
  sidebarLayout,
  /ExpandButton|hiddenSidebarContainer|setHiddenSidebarContainer|getBoundingClientRect/,
  'A sidebar desktop não deve manter estado, medição ou controle de recolhimento.',
);
assert.match(
  sidebarLayout,
  /<DocSidebar[\s\S]*?isHidden=\{false\}/,
  'A sidebar desktop deve ser renderizada permanentemente visível.',
);
assert.doesNotMatch(
  sidebarLayoutCss,
  /docSidebarHidden|sidebarViewportHidden|doc-sidebar-hidden-width|transition:\s*width/,
  'Os estilos da sidebar não devem preservar estados ou transições de recolhimento.',
);
assert.match(
  spacingCss,
  /--linsi-doc-column-gap:\s*var\(--linsi-space-48\);/,
  'O gap estrutural da documentação deve usar o token de 48px.',
);
assert.match(
  layoutFixesCss,
  /grid-template-columns:\s*var\(--doc-sidebar-width\) minmax\(0, 1fr\);/,
  'O layout precisa reservar a coluna da sidebar mesmo com o painel fixo.',
);
assert.match(
  layoutFixesCss,
  /\.theme-doc-sidebar-container\s*\{[\s\S]*?max-height:\s*none !important;[\s\S]*?overflow:\s*hidden !important;[\s\S]*?position:\s*fixed !important;/,
  'A sidebar desktop deve ficar fixa e crescer com o próprio conteúdo.',
);
assert.match(
  layoutFixesCss,
  /\.theme-doc-sidebar-container \.menu\s*\{[\s\S]*?max-height:\s*none !important;[\s\S]*?overflow:\s*visible !important;/,
  'O menu da sidebar desktop não deve criar rolagem interna.',
);
assert.match(
  layoutFixesCss,
  /\.navbar-sidebar[\s\S]*?> :not\(\.linsi-sidebar-section\)[\s\S]*?\+ \.linsi-sidebar-section[\s\S]*?margin-top:\s*var\(--linsi-space-16\);/,
  'No mobile, o primeiro título de seção deve manter o mesmo respiro entre grupos.',
);
assert.doesNotMatch(
  mobileSidebarSecondaryMenu,
  /navbar-sidebar__back|clean-btn/,
  'O retorno do menu mobile não deve herdar o botão do Docusaurus.',
);
assert.match(
  mobileSidebarSecondaryMenu,
  /<MaterialSymbol[\s\S]*?name="chevron_left"[\s\S]*?size=\{20\}/,
  'O retorno do menu mobile deve usar chevron do Material Symbols.',
);
assert.match(
  mobileSidebarSecondaryMenuCss,
  /\.backButton\s*\{[\s\S]*?font-size:\s*0\.875rem;[\s\S]*?font-weight:\s*400;/,
  'O botão-link de retorno mobile deve usar 14px e peso regular.',
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

console.log('UI regression contracts passed: fixed docs sidebar, mobile docs navigation, docs spacing, footer spacing, navbar mobile and key page behavior.');
