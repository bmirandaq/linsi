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

const rootSourceFiles = [
  ...listFiles(sourceDirectory, (entry) => /\.(?:css|[jt]sx?)$/.test(entry)),
  path.join(root, 'docusaurus.config.js'),
];

for (const file of rootSourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (/@fontsource-variable\/material-symbols-outlined/i.test(source)) {
    fail(`${relative(file)} ainda importa a fonte Material Symbols.`);
  }
}

const materialFontFiles = listFiles(
  buildDirectory,
  (entry) =>
    /material-symbols/i.test(path.basename(entry)) && /\.(?:woff2?|ttf|otf)$/i.test(entry),
);

for (const file of materialFontFiles) {
  fail(`${relative(file)} ainda publica a fonte Material Symbols.`);
}

let svgSymbolCount = 0;
let navbarContributionChecked = false;
const ligaturePattern =
  /<[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*(?:menu|expand_more|search|coffee|arrow_[a-z_]+|content_copy|visibility|design_services|post_add|help|chat_bubble|checklist|edit_note|handshake|info|savings|troubleshoot|link|close)\s*<\//gi;

for (const file of listFiles(buildDirectory, (entry) => entry.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  svgSymbolCount += (html.match(/<svg\b[^>]*class="[^"]*material-symbols-outlined/g) ?? []).length;

  if (ligaturePattern.test(html)) {
    fail(`${relative(file)} ainda contém ligatura textual de Material Symbols.`);
  }
  ligaturePattern.lastIndex = 0;

  if (!navbarContributionChecked) {
    const canonicalContribution = html.match(
      /<a\b(?=[^>]*class="[^"]*linsi-contribute-link)(?=[^>]*href="\/contribuir-ajuda")[^>]*>/i,
    );
    const legacyContribution = html.match(
      /<a\b(?=[^>]*class="[^"]*linsi-contribute-link)(?=[^>]*href="\/contribuir")[^>]*>/i,
    );

    if (canonicalContribution) navbarContributionChecked = true;
    if (legacyContribution) {
      fail('A navbar ainda aponta para a rota legada /contribuir.');
    }
  }
}

if (svgSymbolCount === 0) {
  fail('Nenhum Material Symbol SVG local foi encontrado no HTML gerado.');
}

if (!navbarContributionChecked) {
  fail('Não foi possível localizar a rota canônica /contribuir-ajuda na navbar gerada.');
}

const performanceCss = fs.readFileSync(
  path.join(sourceDirectory, 'css', 'performance.css'),
  'utf8',
);

for (const {description, pattern} of [
  {description: 'busca', pattern: /--linsi-icon-search:/},
  {description: 'fechar busca', pattern: /--linsi-icon-close:/},
  {description: 'caret', pattern: /--linsi-icon-expand-more:/},
  {description: 'âncora', pattern: /--linsi-icon-link:/},
  {description: 'café', pattern: /--linsi-icon-coffee:/},
  {description: 'navegação anterior', pattern: /--linsi-icon-arrow-back:/},
  {description: 'navegação seguinte', pattern: /--linsi-icon-arrow-forward:/},
  {description: 'voltar ao topo', pattern: /--linsi-icon-arrow-upward:/},
]) {
  if (!pattern.test(performanceCss)) {
    fail(`Falta cobertura SVG local para ${description}.`);
  }
}

if (failures.length > 0) {
  console.error('Auditoria de ícones reprovada:\n');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `Auditoria de ícones aprovada: ${svgSymbolCount} ocorrências SVG locais e nenhuma font Material Symbols publicada.`,
);
console.log('Navbar validada com rota canônica /contribuir-ajuda e sem ligaturas visíveis.');
