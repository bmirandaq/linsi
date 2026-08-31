const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'src/css/custom.css'), 'utf8');
const lines = css.split('\n');

const issues = [];

// 1. Unclosed blocks
let depth = 0;
lines.forEach((line, i) => {
  for (const ch of line) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
});
if (depth !== 0) {
  issues.push(`BLOCKS: ${depth} unclosed brace(s)`);
}

// 2. Duplicate exact selectors (simple check)
const selectors = {};
let current = '';
lines.forEach((line, i) => {
  const t = line.trim();
  if (t === '' || t.startsWith('/*') || t.startsWith('*') || t.startsWith('@') || t.startsWith(':root') || t.startsWith('[data-theme')) return;
  if (t.endsWith('{')) {
    const sel = t.replace('{', '').trim();
    if (!selectors[sel]) selectors[sel] = [];
    selectors[sel].push(i + 1);
  }
});
Object.entries(selectors).forEach(([sel, nums]) => {
  if (nums.length > 1) {
    issues.push(`DUP: "${sel}" at lines ${nums.join(', ')}`);
  }
});

// 3. Check that aa- panel hiding rule exists
if (!css.includes('.aa-DetachedContainer:has(.aa-Input:placeholder-shown) .aa-Panel')) {
  issues.push('MISSING: panel hiding rule for empty input');
}

// 4. Check semantic tokens exist
const requiredTokens = [
  '--linsi-search-surface',
  '--linsi-search-backdrop',
  '--linsi-search-result-hover',
  '--linsi-search-result-active',
  '--linsi-search-secondary-text',
  '--linsi-search-border',
  '--linsi-search-input-bg',
];
requiredTokens.forEach(tok => {
  if (!css.includes(tok)) {
    issues.push(`MISSING token: ${tok}`);
  }
});

// 5. Check dark mode tokens
if (!css.includes("[data-theme='dark'] .aa-")) {
  issues.push('MISSING: dark mode overrides for search');
}

// 6. Check mobile safe areas
if (!css.includes('safe-area-inset')) {
  issues.push('MISSING: safe-area-inset for mobile');
}

// 7. Check 100dvh for mobile
if (!css.includes('100dvh')) {
  issues.push('MISSING: 100dvh for mobile modal');
}

// 8. Check font-family inheritance in input
if (!css.includes('.aa-Input') || !css.includes('ifm-font-family-base')) {
  issues.push('MISSING: font-family inheritance for search input');
}

// 9. Check backdrop-filter
if (!css.includes('backdrop-filter')) {
  issues.push('MISSING: backdrop-filter blur');
}

// 10. Check scrollbar styling
if (!css.includes('.aa-PanelLayout::-webkit-scrollbar')) {
  issues.push('MISSING: scrollbar styling');
}

if (issues.length === 0) {
  console.log('PASS: No CSS audit issues found');
} else {
  console.log('ISSUES FOUND (' + issues.length + '):');
  issues.forEach(i => console.log('  - ' + i));
}

process.exit(issues.length > 0 ? 1 : 0);
