const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const spacing = read('src/css/spacing.css');
const config = read('docusaurus.config.js');
const expected = [4, 8, 16, 24, 32, 48, 64, 80, 96];

for (const value of expected) {
  assert.match(
    spacing,
    new RegExp(`--linsi-space-${value}:\\s*${value}px;`),
    `Spacing scale must define --linsi-space-${value}: ${value}px.`,
  );
}

assert.doesNotMatch(
  spacing,
  /--linsi-space-0\s*:/,
  'Zero represents absence of spacing and must remain a literal 0, not a token.',
);

const spacingCssIndex = config.indexOf("'./src/css/spacing.css'");
const customCssIndex = config.indexOf("'./src/css/custom.css'");
assert.ok(
  spacingCssIndex !== -1 && spacingCssIndex < customCssIndex,
  'Spacing tokens must load as a foundation before authored component/global CSS.',
);

const componentSelector = /}\s*[^@\s][^{]*\{/m;
assert.doesNotMatch(
  spacing,
  componentSelector,
  'spacing.css must contain only the :root token foundation, not component overrides.',
);

const cssFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    if (entry.name.endsWith('.css')) cssFiles.push(absolutePath);
  }
};
walk(path.join(root, 'src'));

const spacingDeclaration = /^\s*(gap|row-gap|column-gap|margin(?:-(?:top|right|bottom|left|inline|block))?|padding(?:-(?:top|right|bottom|left|inline|block))?)\s*:\s*([^;]+);/gm;
const rawUnit = /(?:^|[\s(])-?\d*\.?\d+(?:px|rem|em)(?=$|[\s)])/;
const violations = [];

for (const absolutePath of cssFiles) {
  const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/');
  const source = fs.readFileSync(absolutePath, 'utf8');
  let match;
  while ((match = spacingDeclaration.exec(source))) {
    const [, property, value] = match;
    if (rawUnit.test(value)) {
      violations.push(`${relativePath}: ${property}: ${value.trim()}`);
    }
  }
}

assert.deepEqual(
  violations,
  [],
  `Authored CSS must use LINSI spacing tokens instead of raw px/rem/em values:\n${violations.join('\n')}`,
);

const aliases = ['--ifm-spacing-horizontal', '--linsi-page-inline', '--linsi-doc-column-gap'];
for (const alias of aliases) {
  for (const absolutePath of cssFiles) {
    if (absolutePath.endsWith(`${path.sep}spacing.css`)) continue;
    const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/');
    const source = fs.readFileSync(absolutePath, 'utf8');
    assert.doesNotMatch(
      source,
      new RegExp(`${alias.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*:`),
      `${alias} must be defined only in src/css/spacing.css, not ${relativePath}.`,
    );
  }
}

console.log('Spacing token contracts passed: 4/8/16/24/32/48/64/80/96, literal 0, one alias source and no raw authored spacing.');
