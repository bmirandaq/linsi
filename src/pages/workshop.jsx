import React, {useCallback, useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './workshop.module.css';

const WORKSHOP_API_URL = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const COUPON_DEBOUNCE_MS = 500;
const MOCK_REQUEST_DELAY_MS = 500;
const MOCK_COUPONS = new Map([
  ['VAGASUX15', {amount: 85, paymentUrl: 'https://mpago.la/linsi-qa-85'}],
  ['CLUBEUXW20', {amount: 80, paymentUrl: 'https://mpago.la/linsi-qa-80'}],
  ['CROQ5', {amount: 95, paymentUrl: 'https://mpago.la/linsi-qa-95'}],
  ['GUIA5', {amount: 95, paymentUrl: 'https://mpago.la/linsi-qa-95'}],
]);

function isWorkshopMockMode() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function mockDelay(result) {
  return new Promise((resolve) => window.setTimeout(() => resolve(result), MOCK_REQUEST_DELAY_MS));
}

function mockApiRequest(path, options = {}) {
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/workshop/coupon') {
    const coupon = String(body.coupon || '').trim().toUpperCase();
    if (MOCK_COUPONS.has(coupon)) return Promise.resolve({status: 'valid', coupon});
    if (coupon === 'EXPIRADO' || coupon === 'INDISPONIVEL') return Promise.resolve({status: 'unavailable'});
    return Promise.resolve({status: 'invalid'});
  }

  if (path === '/workshop/start') {
    const coupon = String(body.coupon || '').trim().toUpperCase();
    const offer = MOCK_COUPONS.get(coupon);
    return mockDelay({
      registrationId: 'WS-0123456789ABCDEF0123456789ABCDEF',
      amount: offer?.amount ?? 100,
      paymentUrl: offer?.paymentUrl ?? 'https://mpago.la/linsi-qa-full',
    });
  }

  return Promise.reject(new Error('Endpoint mock não configurado.'));
}

function normalizeLinkedInForSubmit(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-]+)\/?$/i.exec(trimmed);
  return match ? `https://www.linkedin.com/in/${match[1]}` : trimmed;
}

async function apiRequest(path, options = {}) {
  if (isWorkshopMockMode()) return mockApiRequest(path, options);

  const response = await fetch(`${WORKSHOP_API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || 'Não foi possível concluir a solicitação.');
    error.code = data?.code;
    throw error;
  }
  return data;
}

export default function Workshop() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cupom, setCupom] = useState('');
  const [couponStatus, setCouponStatus] = useState('empty');
  const [couponMessage, setCouponMessage] = useState('');
  const [stage, setStage] = useState('form');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const prefilledCoupon = new URLSearchParams(window.location.search).get('cupom');
    if (prefilledCoupon) setCupom(prefilledCoupon.trim());
  }, []);

  const validateCoupon = useCallback(async (value) => {
    setCouponStatus('checking');
    setCouponMessage('');
    try {
      const result = await apiRequest('/workshop/coupon', {
        method: 'POST',
        body: JSON.stringify({coupon: value}),
      });
      if (result.status === 'valid') {
        setCouponStatus('valid');
        setCouponMessage('Cupom aplicado');
      } else if (result.status === 'invalid') {
        setCouponStatus('invalid');
        setCouponMessage('Cupom inválido. Revise e corrija');
      } else {
        setCouponStatus('unavailable');
        setCouponMessage('Esse cupom não está mais disponível');
      }
    } catch {
      setCouponStatus('unavailable');
      setCouponMessage('Esse cupom não está mais disponível');
    }
  }, []);

  useEffect(() => {
    if (stage !== 'form') return undefined;
    const value = cupom.trim();
    if (!value) {
      setCouponStatus('empty');
      setCouponMessage('');
      return undefined;
    }

    setCouponStatus('checking');
    setCouponMessage('');
    const timeout = window.setTimeout(() => void validateCoupon(value), COUPON_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [cupom, stage, validateCoupon]);

  const handleContinue = useCallback(async (event) => {
    event.preventDefault();
    if (stage !== 'form') return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      nome: String(formData.get('nome') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      cargo: String(formData.get('cargo') || '').trim(),
      empresa: String(formData.get('empresa') || '').trim(),
      linkedin: normalizeLinkedInForSubmit(String(formData.get('linkedin') || '')),
      whatsapp: String(formData.get('whatsapp') || '').replace(/\D/g, ''),
      coupon: String(formData.get('cupom') || '').trim(),
    };

    setNome(payload.nome);
    setEmail(payload.email);
    setCargo(payload.cargo);
    setEmpresa(payload.empresa);
    setLinkedin(payload.linkedin);
    setWhatsapp(payload.whatsapp);
    setCupom(payload.coupon);
    setSubmitError('');
    setStage('creating');

    try {
      const result = await apiRequest('/workshop/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setPaymentUrl(result.paymentUrl || '');
      setStage('registered');
    } catch (error) {
      if (error.code === 'coupon_invalid') {
        setCouponStatus('invalid');
        setCouponMessage('Cupom inválido. Revise e corrija');
      } else if (error.code === 'coupon_unavailable') {
        setCouponStatus('unavailable');
        setCouponMessage('Esse cupom não está mais disponível');
      }
      setSubmitError(error.message || 'Não foi possível registrar sua inscrição. Tente novamente.');
      setStage('form');
    }
  }, [stage]);

  return (
    <Layout title="Workshop" description="Inscrição no Workshop LINSI">
      <main className={`${styles.page} linsi-page-enter`}>
        <div className={styles.shell}>
          {stage === 'form' || stage === 'creating' ? (
            <>
              <header className={styles.header}>
                <h1 className={styles.title}>Inscrição no Workshop LINSI</h1>
                <p className={styles.subtitle}>Valor: R$ 100</p>
              </header>

              <form className={styles.form} onSubmit={handleContinue}>
                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" name="nome" type="text" autoComplete="name" maxLength={120} required value={nome} onChange={(event) => setNome(event.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">E-mail</label>
                    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </div>

                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="cargo">Cargo</label>
                    <input id="cargo" name="cargo" type="text" autoComplete="organization-title" maxLength={120} required value={cargo} onChange={(event) => setCargo(event.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="empresa">Empresa onde trabalha <span className={styles.optionalLabel}>(opcional)</span></label>
                    <input id="empresa" name="empresa" type="text" autoComplete="organization" maxLength={160} value={empresa} onChange={(event) => setEmpresa(event.target.value)} />
                  </div>
                </div>

                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="linkedin">LinkedIn <span className={styles.optionalLabel}>(opcional)</span></label>
                    <input id="linkedin" name="linkedin" type="text" inputMode="url" autoComplete="url" pattern="(?:https?://)?(?:www[.])?linkedin[.]com/in/[A-Za-z0-9\-]+/?" title="Use um perfil no formato linkedin.com/in/name-user" maxLength={300} value={linkedin} onChange={(event) => setLinkedin(event.target.value)} onBlur={(event) => setLinkedin(normalizeLinkedInForSubmit(event.target.value))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="whatsapp">WhatsApp <span className={styles.optionalLabel}>(opcional)</span></label>
                    <input id="whatsapp" name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9]*" maxLength={32} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="cupom">Cupom <span className={styles.optionalLabel}>(opcional)</span></label>
                  <input id="cupom" name="cupom" type="text" autoComplete="off" maxLength={80} value={cupom} onChange={(event) => setCupom(event.target.value)} />
                  {couponMessage && (
                    <p className={couponStatus === 'valid' ? styles.couponSuccess : styles.couponError} role={couponStatus === 'valid' ? 'status' : 'alert'}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                <button className={styles.submit} type="submit" disabled={stage === 'creating'}>Continuar para pagamento</button>
                {submitError && <div className={styles.error} role="alert">{submitError}</div>}
              </form>
            </>
          ) : null}

          {stage === 'registered' ? (
            <section className={styles.feedback} role="status" aria-live="polite">
              <h1 className={styles.feedbackTitle}>Falta pouco!</h1>
              <p>
                Seus dados foram recebidos. Agora faça o pagamento pra garantir sua vaga no workshop{' '}
                <strong>Mapeando experiências com LINSI</strong>
              </p>

              <a className={styles.paymentLink} href={paymentUrl}>Pagar no Mercado Pago</a>
            </section>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}
