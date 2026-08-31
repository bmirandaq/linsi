const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');

function ascii(value) {
  return [...Buffer.from(value, 'ascii')];
}

const cases = [
  {
    name: 'ICNS rejects a zero-length entry',
    module: 'icns',
    handler: 'ICNS',
    input: [...ascii('icns'), 0, 0, 0, 16, ...ascii('ic10'), 0, 0, 0, 0],
  },
  {
    name: 'JXL rejects a zero-length partial-stream box',
    module: 'jxl',
    handler: 'JXL',
    input: [0, 0, 0, 0, ...ascii('jxlp'), 0, 0, 0, 0],
  },
  {
    name: 'HEIF rejects a zero-length image-property box',
    module: 'heif',
    handler: 'HEIF',
    input: [
      0, 0, 0, 56, ...ascii('meta'), 0, 0, 0, 0,
      0, 0, 0, 44, ...ascii('iprp'),
      0, 0, 0, 36, ...ascii('ipco'),
      0, 0, 0, 0, ...ascii('ispe'),
      ...Array(20).fill(0),
    ],
  },
];

for (const testCase of cases) {
  const source = [
    `const {${testCase.handler}} = require(${JSON.stringify(`image-size/types/${testCase.module}`)});`,
    `const input = Uint8Array.from(${JSON.stringify(testCase.input)});`,
    `try { ${testCase.handler}.calculate(input); } catch { process.exit(0); }`,
    'process.exit(1);',
  ].join('\n');
  const result = spawnSync(process.execPath, ['-e', source], {
    encoding: 'utf8',
    timeout: 1_500,
  });

  assert.notEqual(
    result.error?.code,
    'ETIMEDOUT',
    `${testCase.name}: parser entered an infinite loop`,
  );
  assert.equal(
    result.status,
    0,
    `${testCase.name}: malformed input was not rejected\n${result.stderr}`,
  );
  console.log(`PASS ${testCase.name}`);
}
