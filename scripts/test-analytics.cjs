const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('docusaurus.config.js', 'utf8');
const fixtureToken = '00000000000000000000000000000000';
const fixtureProject = 'analyticsqa';

function analytics(env) {
  const config = vm.runInNewContext(source.replace('export default config;', 'config;'), {
    process: {env},
  });
  assert.equal(config.headTags.some((tag) => tag.attributes?.['data-linsi-analytics']), false,
    'Analytics IDs must not be part of the serialized client siteConfig');
  return config.plugins.find((plugin) => typeof plugin === 'function' && plugin.name === 'analyticsPlugin')().injectHtmlTags().headTags;
}

for (const env of [
  {},
  {NODE_ENV: 'production'},
  {NODE_ENV: 'development', CLOUDFLARE_WEB_ANALYTICS_TOKEN: fixtureToken, CLARITY_PROJECT_ID: fixtureProject},
  {NODE_ENV: 'production', CLOUDFLARE_WEB_ANALYTICS_TOKEN: ' ', CLARITY_PROJECT_ID: '</script>'},
]) {
  assert.equal(analytics(env).length, 0, 'Absent/invalid IDs or development must omit analytics');
}

const env = {NODE_ENV: 'production', CLOUDFLARE_WEB_ANALYTICS_TOKEN: fixtureToken, CLARITY_PROJECT_ID: fixtureProject};
assert.equal(analytics({...env, CLARITY_PROJECT_ID: ''}).length, 1);
assert.equal(analytics({...env, CLOUDFLARE_WEB_ANALYTICS_TOKEN: ''}).length, 1);
const tags = analytics(env);
assert.equal(tags.length, 2);
const cloudflare = tags.find((tag) => tag.attributes['data-linsi-analytics'] === 'cloudflare');
assert.equal(cloudflare.attributes.src, 'https://static.cloudflareinsights.com/beacon.min.js');
assert.equal(JSON.parse(cloudflare.attributes['data-cf-beacon']).token, fixtureToken);
const clarity = tags.find((tag) => tag.attributes['data-linsi-analytics'] === 'clarity');

const inserted = [];
const window = {location: {search: '?utm_source=linkedin&utm_medium=social&utm_campaign=workshop_linsi&utm_content=post&nome=Pessoa&email=qa%40example.com'}};
const document = {
  createElement: () => ({}),
  getElementsByTagName: () => [{parentNode: {insertBefore: (script) => inserted.push(script)}}],
};
vm.runInNewContext(clarity.innerHTML, {window, document, URLSearchParams});
assert.equal(inserted.length, 1);
assert.equal(inserted[0].src, `https://www.clarity.ms/tag/${fixtureProject}`);
assert.equal(inserted[0].async, 1);
assert.deepEqual(Array.from(window.clarity.q, (args) => Array.from(args)), [
  ['set', 'utm_source', 'linkedin'],
  ['set', 'utm_medium', 'social'],
  ['set', 'utm_campaign', 'workshop_linsi'],
  ['set', 'utm_content', 'post'],
]);

const helper = fs.readFileSync('src/utils/analytics.js', 'utf8').replace('export function', 'function');
const serverTrack = vm.runInNewContext(`${helper}; trackClarityEvent;`);
assert.doesNotThrow(() => serverTrack('workshop_view'));
const disabledTrack = vm.runInNewContext(`${helper}; trackClarityEvent;`, {window: {}});
assert.doesNotThrow(() => disabledTrack('workshop_signup_click'));
const track = vm.runInNewContext(`${helper}; trackClarityEvent;`, {window});
track('workshop_view');
track('workshop_signup_click');
assert.deepEqual(Array.from(window.clarity.q.slice(4), (args) => Array.from(args)), [
  ['event', 'workshop_view'], ['event', 'workshop_signup_click'],
]);
console.log('Analytics contracts passed: conditional scripts, official endpoints, UTM allowlist, event-only payloads and safe SSR/disabled calls.');
