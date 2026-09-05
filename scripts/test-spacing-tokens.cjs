const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const spacing = read('src/css/spacing.css');
const config = read('docusaurus.config.js');
const expected = [8, 16, 24, 32, 48, 64, 80, 96];

for (const value of expected) {
  assert.match(
    spacing,
    new RegExp(`--linsi-space-${value}:\\s*${value}px;`),
    `Spacing scale must define --linsi-space-${value}: ${value}px.`,
  );
}

const spacingCssIndex = config.indexOf("'./src/css/spacing.css'");
const layoutCssIndex = config.indexOf("'./src/css/layout-fixes.css'");
assert.ok(
  spacingCssIndex > layoutCssIndex,
  'Spacing system must load after legacy/global layout CSS so tokens are authoritative.',
);

const cssModuleFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    if (entry.name.endsWith('.module.css')) {
      cssModuleFiles.push(absolutePath);
    }
  }
};
walk(path.join(root, 'src'));

const spacingDeclaration = /^\s*(gap|row-gap|column-gap|margin(?:-(?:top|right|bottom|left|inline|block))?|padding(?:-(?:top|right|bottom|left|inline|block))?)\s*:\s*([^;]+);/gm;
const rawUnit = /(?:^|[\s(])-?\d*\.?\d+(?:px|rem|em)(?=$|[\s)])/;
const violations = [];

for (const absolutePath of cssModuleFiles) {
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
  `CSS Modules must use LINSI spacing tokens instead of raw px/rem/em values:\n${violations.join('\n')}`,
);

console.log('Spacing token contracts passed: 8/16/24/32/48/64/80/96 and CSS Modules tokenized.');
