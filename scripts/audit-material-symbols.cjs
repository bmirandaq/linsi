const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const buildDirectory = path.join(root, 'build');
const sourceDirectory = path.join(root, 'src');
const failures = [];

function listFiles(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(entryPath, predicate)
      : predicate(entryPath)
        ? [entryPath]
        : [];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function fail(message) {
  failures.push(message);
}

if (!fs.existsSync(buildDirectory)) {
  fail('A pasta build/ não existe. Execute npm run build antes da auditoria.');
}

for (const file of listFiles(sourceDirectory, (entry) => /\.[jt]sx?$/.test(entry))) {
  const source = fs.readFileSync(file, 'utf8');
  const sourceWithoutEditorialHero = source.replace(
    /<svg\b(?=[^>]*className=\{styles\.heroFlow\})[^>]*>[\s\S]*?<\/svg>/gi,
    '',
  );
  if (/<svg\b/i.test(sourceWithoutEditorialHero)) {
    fail(`${relative(file)} contém SVG inline em código de interface.`);
  }
}

for (const file of [
  ...listFiles(sourceDirectory, (entry) => /\.(?:css|[jt]sx?)$/.test(entry)),
  path.join(root, 'docusaurus.config.js'),
]) {
  if (/\u2615|\uFE0F/u.test(fs.readFileSync(file, 'utf8'))) {
    fail(`${relative(file)} contém emoji usado como ícone de interface.`);
  }
}

let materialSymbolCount = 0;
let navbarContributionChecked = false;
for (const file of listFiles(buildDirectory, (entry) => entry.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  materialSymbolCount += (html.match(/material-symbols-outlined/g) ?? []).length;

  if (!navbarContributionChecked) {
    const navbarContribution = html.match(
      /<a\b(?=[^>]*class="[^"]*linsi-contribute-link)(?=[^>]*href="\/contribuir")[^>]*>[\s\S]*?<\/a>/i,
    )?.[0];

    if (navbarContribution) {
      navbarContributionChecked = true;
      if (/<svg\b/i.test(navbarContribution)) {
        fail('Quero contribuir na navbar contém SVG em vez de Material Symbols.');
      }
    }
  }

  for (const match of html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi)) {
    const svg = match[0];
    const isHiddenSprite = /^<svg\b[^>]*style=["'][^"']*display\s*:\s*none/i.test(svg);
    const isEditorialHero = /^<svg\b[^>]*class="[^"]*\bheroFlow_[^"]*"/i.test(svg);
    if (!isHiddenSprite && !isEditorialHero) {
      fail(`${relative(file)} contém SVG visível: ${svg.replace(/\s+/g, ' ').slice(0, 140)}…`);
    }
  }
}

if (materialSymbolCount === 0) {
  fail('Nenhum Material Symbol foi encontrado no HTML gerado.');
}

if (!navbarContributionChecked) {
  fail('Não foi possível localizar Quero contribuir na navbar gerada.');
}

const customCss = fs.readFileSync(path.join(sourceDirectory, 'css', 'custom.css'), 'utf8');
for (const {description, pattern} of [
  {
    description: 'ícones injetados pelo Algolia',
    pattern:
      /\.aa-SubmitIcon,[\s\S]*?\.aa-ItemActionButton svg\s*\{[^}]*display:\s*none\s*!important;/,
  },
  {
    description: 'caret da navegação lateral',
    pattern: /\.menu__caret::before,[\s\S]*?content:\s*'expand_more';/,
  },
  {
    description: 'navegação anterior',
    pattern:
      /\.pagination-nav__link--prev \.pagination-nav__label::before\s*\{[^}]*content:\s*'arrow_back';/,
  },
  {
    description: 'navegação seguinte',
    pattern:
      /\.pagination-nav__link--next \.pagination-nav__label::after\s*\{[^}]*content:\s*'arrow_forward';/,
  },
  {
    description: 'âncora de títulos',
    pattern: /\.theme-doc-markdown \.hash-link::before\s*\{[^}]*content:\s*'link';/,
  },
  {
    description: 'atalho de café na navbar',
    pattern: /\.linsi-coffee-link::after\s*\{[^}]*content:\s*'coffee';/,
  },
]) {
  if (!pattern.test(customCss)) {
    fail(`Falta a cobertura Material Symbols para ${description}.`);
  }
}

if (failures.length > 0) {
  console.error('Auditoria de ícones reprovada:\n');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `Auditoria de ícones aprovada: ${materialSymbolCount} ocorrências Material Symbols e nenhum SVG funcional visível.`,
);
console.log(
  'Navbar validada: Quero contribuir usa material-symbols-outlined/open_in_new e não contém SVG.',
);
console.log('Exceções preservadas: logos, favicon, QR Code, imagens editoriais/de conteúdo e a ilustração SVG da Hero v1.');
