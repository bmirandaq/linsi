import React, {useCallback, useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './workshop.module.css';

const WORKSHOP_API_URL = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEjIIV8ZHpYobikz';
const COUPON_DEBOUNCE_MS = 500;
const STATUS_POLL_MS = 5000;
let turnstileScriptPromise;

function LoadingState({label}) {
  return (
    <div className={styles.loadingState} role="status" aria-live="polite">
      <span className={styles.processingSpinner} aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

function loadTurnstile() {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  if (window.turnstile) return Promise.resolve(window.turnstile);

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    window.onLinsiWorkshopTurnstileLoad = () => {
      delete window.onLinsiWorkshopTurnstileLoad;
      resolve(window.turnstile);
    };
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onLinsiWorkshopTurnstileLoad';
    script.async = true;
    script.onerror = () => {
      script.remove();
      delete window.onLinsiWorkshopTurnstileLoad;
      turnstileScriptPromise = null;
      reject(new Error('Turnstile indisponível'));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function normalizeLinkedInForSubmit(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-]+)\/?$/i.exec(trimmed);
  return match ? `https://www.linkedin.com/in/${match[1]}` : trimmed;
}

async function apiRequest(path, options = {}) {
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
  const [registrationId, setRegistrationId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileResolver = useRef(null);
  const turnstileReady = useRef(null);
  const turnstileExecuted = useRef(false);
  const mountedRef = useRef(true);

  const ensureTurnstileReady = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') return Promise.resolve(null);
    if (turnstileReady.current) return turnstileReady.current;

    turnstileReady.current = loadTurnstile().then((turnstile) => {
      if (!mountedRef.current || !turnstileRef.current) return null;
      if (turnstileWidgetId.current !== null) return turnstileWidgetId.current;
      turnstileExecuted.current = false;
      turnstileWidgetId.current = turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: 'normal',
        appearance: 'always',
        execution: 'execute',
        action: 'workshop',
        callback: (token) => turnstileResolver.current?.(token),
        'error-callback': () => turnstileResolver.current?.(null),
        'timeout-callback': () => turnstileResolver.current?.(null),
      });
      return turnstileWidgetId.current;
    }).catch(() => {
      turnstileReady.current = null;
      return null;
    });

    return turnstileReady.current;
  }, []);

  const getTurnstileToken = useCallback(() => new Promise((resolve) => {
    let settled = false;
    const finish = (token) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      turnstileResolver.current = null;
      resolve(token);
    };
    const timeout = setTimeout(() => finish(null), 30000);

    ensureTurnstileReady().then((widgetId) => {
      if (settled) return;
      if (widgetId === null || !window.turnstile) return finish(null);
      turnstileResolver.current = finish;
      try {
        if (turnstileExecuted.current) window.turnstile.reset(widgetId);
        turnstileExecuted.current = true;
        window.turnstile.execute(widgetId);
      } catch {
        finish(null);
      }
    });
  }), [ensureTurnstileReady]);

  const refreshStatus = useCallback(async (id, returnHint = '') => {
    if (!id) return;
    try {
      const result = await apiRequest(`/workshop/status?id=${encodeURIComponent(id)}`);
      if (result.status === 'paid') {
        if (result.email) setEmail(result.email);
        setPaymentError('');
        setStage('paid');
        return;
      }
      if (result.status === 'pending') {
        setPaymentError('');
        setStage('pending');
        return;
      }
      if (result.status === 'failed' || result.status === 'refunded' || returnHint === 'failure') {
        setStage('failed');
        return;
      }
      setStage(returnHint === 'pending' ? 'pending' : 'failed');
    } catch (error) {
      setPaymentError(error.message || 'Não foi possível confirmar o pagamento.');
      setStage('failed');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const returnedRegistrationId = params.get('registrationId')?.trim() || '';
    const returnHint = params.get('checkout')?.trim() || '';
    const prefilledCoupon = params.get('cupom');

    if (returnedRegistrationId && returnHint) {
      setRegistrationId(returnedRegistrationId);
      setStage('confirming');
      void refreshStatus(returnedRegistrationId, returnHint);
    } else if (prefilledCoupon) {
      setCupom(prefilledCoupon.trim());
    }

    const timeout = window.setTimeout(() => {
      if (!returnedRegistrationId) void ensureTurnstileReady();
    }, 0);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeout);
      turnstileResolver.current?.(null);
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(turnstileWidgetId.current); } catch {}
      }
    };
  }, [ensureTurnstileReady, refreshStatus]);

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

  const beginCheckout = useCallback(async (id) => {
    setPaymentError('');
    setStage('preparing');
    try {
      const result = await apiRequest('/workshop/checkout', {
        method: 'POST',
        body: JSON.stringify({registrationId: id}),
      });
      if (result.status === 'paid') {
        if (result.email) setEmail(result.email);
        setStage('paid');
        return;
      }
      if (!result.checkoutUrl) throw new Error('Não foi possível preparar o pagamento. Tente novamente.');
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setPaymentError(error.message || 'Não foi possível preparar o pagamento. Tente novamente.');
      setStage('failed');
    }
  }, []);

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
    setPaymentError('');
    setStage('preparing');

    try {
      const turnstileToken = await getTurnstileToken();
      if (!turnstileToken) throw new Error('Não foi possível concluir a verificação de segurança. Tente novamente.');

      const result = await apiRequest('/workshop/start', {
        method: 'POST',
        body: JSON.stringify({...payload, turnstileToken}),
      });
      setRegistrationId(result.registrationId);
      await beginCheckout(result.registrationId);
    } catch (error) {
      if (error.code === 'coupon_invalid') {
        setCouponStatus('invalid');
        setCouponMessage('Cupom inválido. Revise e corrija');
        setSubmitError(error.message);
        setStage('form');
        return;
      }
      if (error.code === 'coupon_unavailable') {
        setCouponStatus('unavailable');
        setCouponMessage('Esse cupom não está mais disponível');
        setSubmitError(error.message);
        setStage('form');
        return;
      }
      setSubmitError(error.message || 'Não foi possível continuar. Tente novamente.');
      setStage(registrationId ? 'failed' : 'form');
    }
  }, [beginCheckout, getTurnstileToken, registrationId, stage]);

  useEffect(() => {
    if (stage !== 'pending' || !registrationId) return undefined;
    const interval = window.setInterval(() => void refreshStatus(registrationId, 'pending'), STATUS_POLL_MS);
    return () => window.clearInterval(interval);
  }, [refreshStatus, registrationId, stage]);

  return (
    <Layout title="Workshop" description="Inscrição no Workshop LINSI">
      <main className={`${styles.page} linsi-page-enter`}>
        <div className={styles.shell}>
          {stage === 'form' || stage === 'preparing' ? (
            <>
              <header className={styles.header}>
                <h1 className={styles.title}>Inscrição no Workshop LINSI</h1>
              </header>
              <div className={styles.formArea}>
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

                  {TURNSTILE_SITE_KEY ? <div ref={turnstileRef} className={styles.turnstile} /> : null}
                  <p className={styles.paymentNotice}>O pagamento será concluído no ambiente do Mercado Pago.</p>
                  <button className={styles.submit} type="submit" disabled={stage === 'preparing'} aria-busy={stage === 'preparing'}>Continuar</button>
                  {submitError && <div className={styles.error} role="alert">{submitError}</div>}
                </form>

                {stage === 'preparing' ? (
                  <div className={styles.processingOverlay} role="status" aria-live="polite">
                    <span className={styles.processingSpinner} aria-hidden="true" />
                    <strong>Preparando pagamento...</strong>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {stage === 'confirming' ? (
            <section className={styles.returnState} aria-live="polite">
              <LoadingState label="Confirmando pagamento..." />
            </section>
          ) : null}

          {stage === 'pending' ? (
            <section className={styles.returnState} aria-live="polite">
              <h1 className={styles.feedbackTitle}>Pagamento em processamento</h1>
              <p>Assim que o Mercado Pago confirmar o pagamento, sua inscrição será atualizada.</p>
              <button className={styles.methodButton} type="button" onClick={() => void refreshStatus(registrationId, 'pending')}>Verificar novamente</button>
            </section>
          ) : null}

          {stage === 'failed' ? (
            <section className={styles.returnState} role="alert">
              <h1 className={styles.feedbackTitle}>Pagamento não concluído</h1>
              <p>{paymentError || 'Você pode tentar novamente.'}</p>
              {registrationId ? (
                <button className={styles.methodButton} type="button" onClick={() => void beginCheckout(registrationId)}>Tentar novamente</button>
              ) : (
                <button className={styles.methodButton} type="button" onClick={() => setStage('form')}>Voltar para inscrição</button>
              )}
            </section>
          ) : null}

          {stage === 'paid' ? (
            <section className={styles.feedback} role="status" aria-live="polite">
              <h1 className={styles.feedbackTitle}>Inscrição confirmada</h1>
              <p>Seu pagamento foi aprovado e sua vaga no Workshop LINSI está garantida</p>
              <p>Vou te enviar as informações de acesso para:</p>
              <strong>{email}</strong>
              <div className={styles.feedbackSignoff}>
                <p>Te vejo lá!<br />Bea</p>
                <img src="/img/workshop/bea-symbol.webp" alt="" />
              </div>
              <button className={styles.methodButton} type="button" onClick={() => { window.location.href = '/docs/principios'; }}>Ir para manual LINSI</button>
            </section>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}
