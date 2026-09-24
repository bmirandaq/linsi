const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const directory = process.argv[2] || 'build';
const enabled = process.env.ANALYTICS_TEST_ENABLED === '1';
// These are intentionally fake IDs used only in the test build.
const token = '00000000000000000000000000000000';
const project = 'analyticsqa';
let pages = 0;

function inspect(folder) {
  for (const entry of fs.readdirSync(folder, {withFileTypes: true})) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      inspect(file);
    } else if (/\.(html|js|json|map)$/.test(entry.name)) {
      const source = fs.readFileSync(file, 'utf8');
      if (entry.name.endsWith('.html')) {
        pages++;
        // Standalone HTML copied from static/ does not run Docusaurus plugins.
        const staticFile = path.join('static', path.relative(directory, file));
        const copiedStatic = fs.existsSync(staticFile);
        if (copiedStatic) assert.equal(source, fs.readFileSync(staticFile, 'utf8'), file);
        const tracked = enabled && !copiedStatic;
        assert.equal((source.match(/data-linsi-analytics="cloudflare"/g) || []).length, tracked ? 1 : 0, file);
        assert.equal((source.match(/data-linsi-analytics="clarity"/g) || []).length, tracked ? 1 : 0, file);
        assert.equal((source.match(/https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || []).length, tracked ? 1 : 0, file);
        assert.equal(source.includes(token), tracked, file);
        assert.equal(source.includes(project), tracked, file);
      } else {
        assert.ok(!source.includes(token), `Cloudflare ID leaked outside HTML: ${file}`);
        assert.ok(!source.includes(project), `Clarity ID leaked outside HTML: ${file}`);
      }
    }
  }
}
inspect(directory);
assert.ok(pages > 0);
console.log(`Analytics build passed: ${pages} HTML pages, ${enabled ? 'one script per vendor; IDs only in HTML' : 'no analytics scripts or IDs'}.`);
