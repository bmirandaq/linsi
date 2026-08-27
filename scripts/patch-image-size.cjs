const fs = require('node:fs');
const path = require('node:path');

// Temporary upstream remediation for GHSA-w3rx-r6r6-pgpr and
// GHSA-5p2g-fcmc-qvqq. Remove this script after image-size publishes a
// non-vulnerable release and @docusaurus/mdx-loader accepts it.
const packageRoot = path.resolve(path.dirname(require.resolve('image-size')), '..');
const packageJson = require(path.join(packageRoot, 'package.json'));
const distRoot = path.join(packageRoot, 'dist');

if (packageJson.version !== '2.0.2') {
  throw new Error(
    `Unsupported image-size version ${packageJson.version}; review and remove the local security patch.`,
  );
}

const replacements = [
  {
    name: 'ICNS zero-length entry',
    vulnerable: '      imageOffset += imageHeader[1];',
    patched: [
      '      if (imageHeader[1] < 8) {',
      '        throw new TypeError("Invalid ICNS entry length");',
      '      }',
      '      imageOffset += imageHeader[1];',
    ].join('\n'),
    expected: 12,
  },
  {
    name: 'JXL zero-length box',
    vulnerable: '    partialStreams.push(',
    patched: [
      '    if (jxlpBox.size < 12) {',
      '      throw new TypeError("Invalid JXL box size");',
      '    }',
      '    partialStreams.push(',
    ].join('\n'),
    expected: 12,
  },
  {
    name: 'HEIF zero-length box',
    vulnerable: '      if (!ispeBox) break;',
    patched: [
      '      if (!ispeBox) break;',
      '      if (ispeBox.size < 20) {',
      '        throw new TypeError("Invalid HEIF box size");',
      '      }',
    ].join('\n'),
    expected: 12,
  },
];

function listBundles(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listBundles(entryPath);
    return /\.(?:cjs|mjs)$/.test(entry.name) ? [entryPath] : [];
  });
}

const bundles = listBundles(distRoot);
const counts = Object.fromEntries(replacements.map(({name}) => [name, 0]));

for (const bundle of bundles) {
  const original = fs.readFileSync(bundle, 'utf8');
  let updated = original;

  for (const replacement of replacements) {
    const vulnerableCount = updated.split(replacement.vulnerable).length - 1;
    const patchedCount = updated.split(replacement.patched).length - 1;

    if (vulnerableCount > 0 && patchedCount === 0) {
      updated = updated.replaceAll(replacement.vulnerable, replacement.patched);
      counts[replacement.name] += vulnerableCount;
    } else {
      counts[replacement.name] += patchedCount;
    }
  }

  if (updated !== original) fs.writeFileSync(bundle, updated);
}

for (const replacement of replacements) {
  const actual = counts[replacement.name];
  if (actual !== replacement.expected) {
    throw new Error(
      `${replacement.name}: expected ${replacement.expected} patched bundles, found ${actual}.`,
    );
  }
}

console.log('Applied image-size infinite-loop security patches.');
