const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');

const allowedAdvisories = new Set([
  // image-size is locally patched and covered by test:security.
  'https://github.com/advisories/GHSA-w3rx-r6r6-pgpr',
  'https://github.com/advisories/GHSA-5p2g-fcmc-qvqq',

  // braces@3.0.3 is transitive build tooling. No patched npm release exists yet.
  // Remove this waiver as soon as an upstream fixed release is available.
  'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',

  // http-cache-semantics is transitive via update-notifier/package-json/got.
  // LINSI does not use it as a shared runtime cache, and upstream disputes this advisory.
  // Remove this waiver if the advisory is revised or a fixed release is published.
  'https://github.com/advisories/GHSA-ch52-4w7c-c8xp',
]);

const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'O caminho do npm não está disponível. Execute via npm run audit:dependencies.');

const audit = spawnSync(process.execPath, [npmCli, 'audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

assert.equal(audit.error, undefined, `Falha ao executar npm audit: ${audit.error?.message}`);
assert.ok(audit.stdout, `npm audit não retornou JSON: ${audit.stderr}`);

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  throw new Error(`Resposta inválida do npm audit: ${audit.stderr || audit.stdout}`);
}

if (audit.status === 0) {
  console.log('Auditoria aprovada: nenhuma vulnerabilidade conhecida.');
  process.exit(0);
}

assert.equal(
  report.error,
  undefined,
  `npm audit falhou: ${report.error?.summary || audit.stderr}`,
);

const vulnerabilities = report.vulnerabilities || {};

function isAllowedChain(name, path = new Set()) {
  if (path.has(name)) return false;
  const vulnerability = vulnerabilities[name];
  if (!vulnerability || !Array.isArray(vulnerability.via)) return false;

  const nextPath = new Set(path).add(name);
  return vulnerability.via.every((cause) => {
    if (typeof cause === 'string') return isAllowedChain(cause, nextPath);
    return Boolean(cause?.url) && allowedAdvisories.has(cause.url);
  });
}

const unexpected = Object.keys(vulnerabilities).filter(
  (name) => !isAllowedChain(name),
);

assert.deepEqual(
  unexpected,
  [],
  `Vulnerabilidades não tratadas: ${unexpected.join(', ')}`,
);

assert.ok(
  vulnerabilities['image-size'],
  'A exceção temporária só pode existir para image-size.',
);

console.log(
  'Auditoria aprovada: somente advisories explicitamente revisados permanecem; image-size possui correção local validada por test:security e os demais waivers são transitivos e temporários.',
);
