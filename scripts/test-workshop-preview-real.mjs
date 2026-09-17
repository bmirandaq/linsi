import {chromium} from 'playwright';
import {SafeE2EError, report, check, passed, requireBuyerSecrets, saveReport, loginBuyer, providerBlock, isMpHost} from './checkout-pro-real-helpers.mjs';

const productionUrl = 'https://linsi.beamiranda.com.br';
const previewWorker = (process.env.WORKER_PREVIEW_URL || '').replace(/\/$/, '');
let browser;
let stage = 'preflight';
const pendingChecks = [
  'Turnstile', 'Notion start', 'Order real', 'checkout_url', 'hosted checkout',
  'login buyer', 'pagamento aprovado', 'pagamento recusado', 'pending',
  'return success', 'return failure', 'webhook real', 'Notion paid',
  'frontend paid', 'frontend failure', 'price tampering', 'coupon tampering',
  'redirect trust', 'authoritative paid', 'old endpoints',
];
for (const name of pendingChecks) report.checks[name] = 'not_run';
report.login = {usernameSubmitted: false, passwordSubmitted: false, verificationSubmitted: false};

async function workerRequest(path, options = {}) {
  const response = await fetch(previewWorker + path, {
    ...options,
    headers: {Origin: productionUrl, ...(options.body ? {'Content-Type': 'application/json'} : {}), ...options.headers},
  });
  const data = await response.json().catch(() => null);
  report.lastWorkerHttpStatus = response.status;
  return {response, data};
}
async function evidence(id) {
  const result = await workerRequest('/__qa/workshop-evidence?id=' + encodeURIComponent(id));
  check(result.response.status === 200, 'notion_readback_http_error');
  return result.data;
}
try {
  requireBuyerSecrets();
  check(/^https:\/\/[a-z0-9-]+-linsi-form-handler\.bmirandaqux\.workers\.dev$/.test(previewWorker), 'worker_must_be_branch_version_preview');
  stage = 'Turnstile';
  const probe = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({secret: '1x0000000000000000000000000000000AA', response: 'XXXX.DUMMY.TOKEN.XXXX'}),
  });
  check((await probe.json()).success === true, 'turnstile_official_e2e_failed');
  stage = 'Notion start';
  const start = await workerRequest('/workshop/start', {
    method: 'POST',
    body: JSON.stringify({
      nome: 'QA Checkout Pro E2E ' + Date.now(), email: 'test@testuser.com',
      cargo: 'QA', empresa: 'LINSI E2E', linkedin: '', whatsapp: '', coupon: '',
      amount: 1, unit_price: 1, turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
    }),
  });
  check(start.response.status === 200, 'registration_http_error');
  check(/^WS-[A-F0-9]{32}$/.test(start.data?.registrationId || ''), 'registration_id_invalid');
  check(start.data?.amount === 100, 'registration_amount_invalid');
  const id = start.data.registrationId;
  const initial = await evidence(id);
  check(initial.registrationMatches && initial.nameMatches && initial.emailMatches, 'notion_identity_mismatch');
  check(initial.status === 'started' && initial.notionStatus === 'Inscrição iniciada', 'notion_initial_status_invalid');
  check(initial.createdAtPresent && !initial.paidAtPresent && initial.blockedUntilEmpty, 'notion_initial_dates_invalid');
  check(initial.amount === 100 && initial.couponEmpty, 'notion_initial_price_invalid');
  check(initial.sandboxCredential === true, 'sandbox_credential_not_confirmed');
  report.notionStart = initial;
  passed('Turnstile');
  passed('Notion start');
  stage = 'Order real';
  const checkout = await workerRequest('/workshop/checkout', {
    method: 'POST',
    body: JSON.stringify({registrationId: id, amount: 1, unit_price: 1, coupon: 'FAKE100'}),
  });
  check(checkout.response.status === 200, 'checkout_http_error');
  check(checkout.data?.status === 'pending', 'checkout_initial_status_invalid');
  const url = new URL(checkout.data?.checkoutUrl);
  check(url.protocol === 'https:' && (url.hostname === 'mercadopago.com.br' || url.hostname.endsWith('.mercadopago.com.br')), 'checkout_url_untrusted');
  const current = await evidence(id);
  check(current.orderSaved && current.order?.idMatches && current.order.referenceMatches, 'order_identity_invalid');
  check(current.amount === 100 && current.order.amount === 10000 && current.couponEmpty, 'order_price_invalid');
  report.notionCheckout = current;
  passed('Order real');
  passed('checkout_url');
  passed('price tampering');
  passed('coupon tampering');
  const retry = await workerRequest('/workshop/checkout', {method: 'POST', body: JSON.stringify({registrationId: id})});
  check(retry.response.status === 200 && retry.data?.checkoutUrl === checkout.data.checkoutUrl, 'checkout_retry_not_idempotent');
  passed('retry idempotent');
  const status = await workerRequest('/workshop/status?id=' + encodeURIComponent(id) + '&status=paid&collection_status=approved&checkout=success');
  check(status.response.status === 200 && status.data?.status === 'pending', 'query_string_marked_paid');
  passed('redirect trust');
  for (const path of ['/workshop/pay/card', '/workshop/pay/pix', '/workshop/payment/reset']) {
    check((await workerRequest(path, {method: 'POST', body: '{}'})).response.status === 410, 'retired_endpoint_not_410');
  }
  passed('old endpoints');
  stage = 'hosted checkout';
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  page.setDefaultTimeout(10000);
  const response = await page.goto(url.href, {waitUntil: 'domcontentloaded', timeout: 45000});
  report.hostedHttpStatus = response?.status() || null;
  check(isMpHost(new URL(page.url()).hostname), 'hosted_checkout_host_invalid');
  await page.waitForTimeout(3000);
  const block = await providerBlock(page);
  check(!block, block);
  check(response && response.status() >= 200 && response.status() < 400, 'hosted_checkout_http_error');
  passed('hosted checkout');
  stage = 'login buyer';
  await loginBuyer(page, report.login);
  // Loading/login alone cannot turn the full E2E green.
  stage = 'payment evidence';
  check(report.checks['pagamento aprovado'] === 'passed'
    && report.checks['pagamento recusado'] === 'passed'
    && report.checks['webhook real'] === 'passed', 'real_payment_return_webhook_evidence_missing');
} catch (error) {
  // Playwright call logs can contain filled values. Never serialize them.
  const safeCode = error instanceof SafeE2EError
    ? error.message : 'operation_failed_details_withheld';
  report.blocker = {stage, code: safeCode, errorType: error.name === 'TimeoutError' ? 'TimeoutError' : 'Error'};
  console.error('REAL E2E BLOCKED stage=' + stage + ' code=' + safeCode);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await saveReport();
}
