const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');
const scale = [4, 8, 16, 24, 32, 48, 64, 80, 96];

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
walk(srcRoot);

const toPx = (number, unit) => {
  const value = Number(number);
  if (unit === 'px') return value;
  if (unit === 'rem' || unit === 'em') return value * 16;
  return null;
};

const nearestToken = (px, property) => {
  let best = scale[0];
  let bestDistance = Math.abs(px - best);

  for (const candidate of scale.slice(1)) {
    const distance = Math.abs(px - candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
      continue;
    }
    if (distance === bestDistance) {
      const isGap = property === 'gap' || property === 'row-gap' || property === 'column-gap';
      best = isGap ? Math.min(best, candidate) : Math.max(best, candidate);
    }
  }

  return best;
};

const unitPattern = /(-?\d*\.?\d+)(px|rem|em)\b/g;
const normalizeSpacingValue = (value, property) =>
  value.replace(unitPattern, (match, number, unit) => {
    const px = toPx(number, unit);
    if (px === null) return match;
    if (px === 0) return '0';

    const sign = px < 0 ? -1 : 1;
    const token = nearestToken(Math.abs(px), property);
    if (sign < 0) return `calc(var(--linsi-space-${token}) * -1)`;
    return `var(--linsi-space-${token})`;
  });

const spacingDeclaration = /^(\s*)(gap|row-gap|column-gap|margin(?:-(?:top|right|bottom|left|inline|block))?|padding(?:-(?:top|right|bottom|left|inline|block))?)\s*:\s*([^;]+);/gm;

for (const absolutePath of cssFiles) {
  if (absolutePath.endsWith(`${path.sep}spacing.css`)) continue;

  let source = fs.readFileSync(absolutePath, 'utf8');
  source = source.replace(spacingDeclaration, (full, indent, property, value) => {
    const normalized = normalizeSpacingValue(value, property);
    return `${indent}${property}: ${normalized};`;
  });

  // Positional values that act as composition spacing rather than geometry.
  source = source
    .replace(/right:\s*0\.45rem;/g, 'right: var(--linsi-space-8);')
    .replace(/bottom:\s*1\.125rem;/g, 'bottom: var(--linsi-space-16);')
    .replace(/right:\s*1\.125rem;/g, 'right: var(--linsi-space-16);')
    .replace(/right:\s*0\.25rem;/g, 'right: var(--linsi-space-4);')
    .replace(/bottom:\s*1rem;/g, 'bottom: var(--linsi-space-16);')
    .replace(/width:\s*calc\(100% - 2rem\)/g, 'width: calc(100% - var(--linsi-space-32))')
    .replace(/calc\(100vh - var\(--ifm-navbar-height\) - 1\.5rem\)/g, 'calc(100vh - var(--ifm-navbar-height) - var(--linsi-space-24))')
    .replace(/calc\(var\(--ifm-navbar-height\) \+ 0\.5rem\)/g, 'calc(var(--ifm-navbar-height) + var(--linsi-space-8))')
    .replace(/calc\(100vh - var\(--ifm-navbar-height\) - 3rem\)/g, 'calc(100vh - var(--ifm-navbar-height) - var(--linsi-space-48))');

  // Spacing aliases have one source of truth: spacing.css.
  if (absolutePath.endsWith(`${path.sep}custom.css`)) {
    source = source.replace(
      /\n\s*\/\* Gutters laterais padronizados \(home, pages, footer, navbar\) \*\/\n\s*--ifm-spacing-horizontal:\s*1\.5rem;\n\s*--linsi-page-inline:\s*var\(--ifm-spacing-horizontal\);\n/,
      '\n',
    );
  }

  if (absolutePath.endsWith(`${path.sep}layout-fixes.css`)) {
    source = source.replace(
      /:root\s*\{\s*--linsi-doc-column-gap:\s*calc\(var\(--linsi-page-inline\) \* 2\);\s*\}\s*/,
      '',
    );
  }

  fs.writeFileSync(absolutePath, source);
}

const spacingPath = path.join(srcRoot, 'css', 'spacing.css');
fs.writeFileSync(
  spacingPath,
  `/* =========================================================\n   LINSI — Spacing system\n   Primitive scale + semantic layout aliases\n\n   Layout/composition spacing must use this scale. Mechanical\n   dimensions (borders, icon sizes, control geometry, transforms)\n   are intentionally outside the spacing system.\n   ========================================================= */\n\n:root {\n  --linsi-space-4: 4px;\n  --linsi-space-8: 8px;\n  --linsi-space-16: 16px;\n  --linsi-space-24: 24px;\n  --linsi-space-32: 32px;\n  --linsi-space-48: 48px;\n  --linsi-space-64: 64px;\n  --linsi-space-80: 80px;\n  --linsi-space-96: 96px;\n\n  --ifm-spacing-horizontal: var(--linsi-space-24);\n  --linsi-page-inline: var(--linsi-space-24);\n  --linsi-doc-column-gap: var(--linsi-space-48);\n}\n`,
);

const configPath = path.join(root, 'docusaurus.config.js');
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(
  /customCss:\s*\[\s*'\.\/src\/css\/custom\.css',\s*'\.\/src\/css\/palette-v2\.css',\s*'\.\/src\/css\/layout-fixes\.css',\s*'\.\/src\/css\/spacing\.css',\s*\]/m,
  `customCss: [\n            './src/css/spacing.css',\n            './src/css/custom.css',\n            './src/css/palette-v2.css',\n            './src/css/layout-fixes.css',\n          ]`,
);
fs.writeFileSync(configPath, config);

console.log(`Normalized spacing across ${cssFiles.length} authored CSS files.`);
