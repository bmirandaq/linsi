const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const buildDirectory = path.join(root, 'build');
const staticImagesDirectory = path.join(root, 'static', 'img');
const configuredBaseUrl = process.env.BASE_URL ?? '/';
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

function fail(message) {
  failures.push(message);
}

function assertPngIntegrity(file) {
  const buffer = fs.readFileSync(file);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    fail(`${path.relative(root, file)} não é um PNG íntegro.`);
    return;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width === 0 || height === 0) {
    fail(`${path.relative(root, file)} possui dimensões inválidas.`);
  }
}

for (const file of listFiles(staticImagesDirectory, (entry) => entry.endsWith('.png'))) {
  assertPngIntegrity(file);
}

const htmlFiles = listFiles(buildDirectory, (entry) => entry.endsWith('.html'));
assert.ok(htmlFiles.length > 0, 'Nenhum HTML foi encontrado no build.');

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');

  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/gi)) {
    const reference = match[1];
    if (
      !reference.startsWith('/') ||
      reference.startsWith('//') ||
      reference.startsWith('/#')
    ) {
      continue;
    }

    let pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    if (configuredBaseUrl !== '/' && pathname.startsWith(configuredBaseUrl)) {
      pathname = `/${pathname.slice(configuredBaseUrl.length)}`;
    }

    const relativePath = pathname.replace(/^\/+/, '');
    const directFile = path.join(buildDirectory, relativePath);
    const indexFile = path.join(directFile, 'index.html');

    if (!fs.existsSync(directFile) && !fs.existsSync(indexFile)) {
      fail(
        `${path.relative(root, htmlFile)} referencia asset/rota inexistente: ${reference}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error('Regressão de assets reprovada:\n');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `Assets aprovados: ${htmlFiles.length} páginas e PNGs com assinatura/dimensões válidas.`,
);
