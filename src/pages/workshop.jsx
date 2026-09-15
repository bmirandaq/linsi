import React, {useCallback, useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './workshop.module.css';

const WORKSHOP_API_URL = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEjIIV8ZHpYobikz';
let turnstileScriptPromise;
let mercadoPagoScriptPromise;

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

function loadMercadoPago() {
  if (mercadoPagoScriptPromise) return mercadoPagoScriptPromise;
  if (window.MercadoPago) return Promise.resolve(window.MercadoPago);

  mercadoPagoScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = () => {
      script.remove();
      mercadoPagoScriptPromise = null;
      reject(new Error('Mercado Pago indisponível'));
    };
    document.head.appendChild(script);
  });

  return mercadoPagoScriptPromise;
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

function WorkshopStepper({active}) {
  return (
    <nav className={styles.stepper} aria-label="Etapas da inscrição">
      <span className={active === 'data' ? styles.stepActive : styles.step}>Seus dados</span>
      <span className={styles.stepSeparator} aria-hidden="true">·</span>
      <span className={active === 'payment' ? styles.stepActive : styles.step}>Pagamento</span>
    </nav>
  );
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
  const [checkoutAmount, setCheckoutAmount] = useState(null);
  const [publicKey, setPublicKey] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitError, setSubmitError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [brickReady, setBrickReady] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);

  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileResolver = useRef(null);
  const turnstileReady = useRef(null);
  const turnstileExecuted = useRef(false);
  const mountedRef = useRef(true);
  const brickController = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    const prefilledCoupon = new URLSearchParams(window.location.search).get('cupom');
    if (prefilledCoupon) setCupom(prefilledCoupon.trim());

    return () => {
      mountedRef.current = false;
      turnstileResolver.current?.(null);
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current);
        } catch {}
      }
      if (brickController.current) {
        try {
          brickController.current.unmount();
        } catch {}
      }
    };
  }, []);

  const ensureTurnstileReady = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') return Promise.resolve(null);
    if (turnstileReady.current) return turnstileReady.current;

    turnstileReady.current = loadTurnstile()
      .then((turnstile) => {
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
      })
      .catch(() => {
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

  const applyCoupon = useCallback(async () => {
    const value = cupom.trim();
    if (!value) {
      setCouponStatus('empty');
      setCouponMessage('');
      return;
    }

    setCouponStatus('checking');
    setCouponMessage('');
    try {
      const result = await apiRequest('/workshop/coupon', {
        method: 'POST',
        body: JSON.stringify({coupon: value}),
      });
      if (result.status === 'valid') {
        setCupom(result.coupon || value);
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
  }, [cupom]);

  const handleContinue = useCallback(async (event) => {
    event.preventDefault();
    if (stage !== 'form') return;

    const formData = new FormData(event.currentTarget);
    const normalizedLinkedIn = normalizeLinkedInForSubmit(String(formData.get('linkedin') || ''));
    const normalizedWhatsapp = String(formData.get('whatsapp') || '').replace(/\D/g, '');
    const payload = {
      nome: String(formData.get('nome') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      cargo: String(formData.get('cargo') || '').trim(),
      empresa: String(formData.get('empresa') || '').trim(),
      linkedin: normalizedLinkedIn,
      whatsapp: normalizedWhatsapp,
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
      const turnstileToken = await getTurnstileToken();
      if (!turnstileToken) {
        throw new Error('Não foi possível concluir a verificação de segurança. Tente novamente.');
      }

      const result = await apiRequest('/workshop/start', {
        method: 'POST',
        body: JSON.stringify({...payload, turnstileToken}),
      });

      setRegistrationId(result.registrationId);
      setCheckoutAmount(result.amount);
      setPublicKey(result.publicKey);
      setStage('checkout');
    } catch (error) {
      if (error.code === 'coupon_invalid') {
        setCouponStatus('invalid');
        setCouponMessage('Cupom inválido. Revise e corrija');
      } else if (error.code === 'coupon_unavailable') {
        setCouponStatus('unavailable');
        setCouponMessage('Esse cupom não está mais disponível');
      }
      setSubmitError(error.message || 'Não foi possível continuar. Tente novamente.');
      setStage('form');
    }
  }, [getTurnstileToken, stage]);

  useEffect(() => {
    if (
      stage !== 'checkout' ||
      paymentMethod !== 'card' ||
      !publicKey ||
      !checkoutAmount ||
      !registrationId
    ) {
      return undefined;
    }

    let cancelled = false;
    setBrickReady(false);
    setPaymentError('');

    loadMercadoPago()
      .then(async (MercadoPago) => {
        if (cancelled) return;
        const mp = new MercadoPago(publicKey, {locale: 'pt-BR'});
        const bricksBuilder = mp.bricks();

        brickController.current = await bricksBuilder.create(
          'cardPayment',
          'cardPaymentBrick_container',
          {
            initialization: {amount: checkoutAmount},
            callbacks: {
              onReady: () => {
                if (!cancelled) setBrickReady(true);
              },
              onSubmit: (formData, additionalData) => new Promise(async (resolve, reject) => {
                try {
                  setPaymentError('');
                  const result = await apiRequest('/workshop/pay/card', {
                    method: 'POST',
                    body: JSON.stringify({
                      registrationId,
                      token: formData.token,
                      paymentMethodId: formData.payment_method_id,
                      paymentTypeId: additionalData.paymentTypeId,
                      installments: formData.installments,
                      identification: formData.payer?.identification,
                    }),
                  });

                  if (result.status === 'paid') {
                    setStage('paid');
                    resolve();
                    return;
                  }

                  if (result.status === 'pending') {
                    setStage('pending');
                    resolve();
                    return;
                  }

                  setPaymentError('O pagamento não foi concluído. Revise os dados e tente novamente.');
                  reject(new Error('Pagamento não concluído'));
                } catch (error) {
                  setPaymentError(error.message || 'Não foi possível processar o pagamento. Tente novamente.');
                  reject(error);
                }
              }),
              onError: () => {
                if (!cancelled) setPaymentError('Não foi possível carregar o pagamento. Tente novamente.');
              },
            },
          },
        );
      })
      .catch(() => {
        if (!cancelled) setPaymentError('Não foi possível carregar o pagamento. Tente novamente.');
      });

    return () => {
      cancelled = true;
      if (brickController.current) {
        try {
          brickController.current.unmount();
        } catch {}
        brickController.current = null;
      }
    };
  }, [checkoutAmount, paymentMethod, publicKey, registrationId, stage]);

  const createPix = useCallback(async () => {
    if (pixLoading) return;

    setPixLoading(true);
    setPaymentError('');
    try {
      const result = await apiRequest('/workshop/pay/pix', {
        method: 'POST',
        body: JSON.stringify({registrationId}),
      });
      setPixData(result.pix || null);
      setStage(result.status === 'paid' ? 'paid' : 'pending');
    } catch (error) {
      setPaymentError(error.message || 'Não foi possível gerar o Pix. Tente novamente.');
    } finally {
      setPixLoading(false);
    }
  }, [pixLoading, registrationId]);

  useEffect(() => {
    if (stage !== 'pending' || !registrationId) return undefined;

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const result = await apiRequest(`/workshop/status?id=${encodeURIComponent(registrationId)}`);
        if (cancelled) return;
        if (result.status === 'paid') setStage('paid');
        if (result.status === 'failed' || result.status === 'refunded') {
          setPaymentError('O pagamento não foi concluído.');
        }
      } catch {}
    };

    void checkStatus();
    const interval = window.setInterval(checkStatus, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [registrationId, stage]);

  const copyPix = useCallback(async () => {
    if (!pixData?.qrCode || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [pixData]);

  const paymentHeader = (
    <header className={styles.header}>
      <h1 className={styles.title}>Inscrição no Workshop LINSI</h1>
      <WorkshopStepper active="payment" />
    </header>
  );

  return (
    <Layout title="Workshop LINSI" description="Inscrição no Workshop LINSI">
      <main className={`${styles.page} linsi-page-enter`}>
        <div className={styles.shell}>
          {stage === 'form' || stage === 'creating' ? (
            <>
              <header className={styles.header}>
                <h1 className={styles.title}>Inscrição no Workshop LINSI</h1>
                <WorkshopStepper active="data" />
              </header>

              <form
                className={styles.form}
                onSubmit={handleContinue}
                onFocusCapture={() => void ensureTurnstileReady()}
                onPointerDownCapture={() => void ensureTurnstileReady()}>
                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="nome">Nome</label>
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      required
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email">E-mail</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="cargo">Cargo</label>
                    <input
                      id="cargo"
                      name="cargo"
                      type="text"
                      autoComplete="organization-title"
                      maxLength={120}
                      required
                      value={cargo}
                      onChange={(event) => setCargo(event.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="empresa">
                      Empresa onde trabalha <span className={styles.optionalLabel}>(opcional)</span>
                    </label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      autoComplete="organization"
                      maxLength={160}
                      value={empresa}
                      onChange={(event) => setEmpresa(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.contactRow}>
                  <div className={styles.field}>
                    <label htmlFor="linkedin">
                      LinkedIn <span className={styles.optionalLabel}>(opcional)</span>
                    </label>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      pattern="(?:https?://)?(?:www[.])?linkedin[.]com/in/[A-Za-z0-9\-]+/?"
                      title="Use um perfil no formato linkedin.com/in/name-user"
                      maxLength={300}
                      value={linkedin}
                      onChange={(event) => setLinkedin(event.target.value)}
                      onBlur={(event) => setLinkedin(normalizeLinkedInForSubmit(event.target.value))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="whatsapp">
                      WhatsApp <span className={styles.optionalLabel}>(opcional)</span>
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      pattern="[0-9]*"
                      maxLength={32}
                      value={whatsapp}
                      onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="cupom">
                    Cupom <span className={styles.optionalLabel}>(opcional)</span>
                  </label>
                  <div className={styles.couponRow}>
                    <input
                      id="cupom"
                      name="cupom"
                      type="text"
                      autoComplete="off"
                      maxLength={80}
                      value={cupom}
                      onChange={(event) => {
                        setCupom(event.target.value);
                        setCouponStatus('empty');
                        setCouponMessage('');
                      }}
                    />
                    <button
                      className={styles.couponButton}
                      type="button"
                      onClick={applyCoupon}
                      disabled={!cupom.trim() || couponStatus === 'checking'}>
                      {couponStatus === 'checking' ? 'Verificando...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponMessage && (
                    <p
                      className={couponStatus === 'valid' ? styles.couponSuccess : styles.couponError}
                      role={couponStatus === 'valid' ? 'status' : 'alert'}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className={styles.turnstile} />}

                <button
                  className={styles.submit}
                  type="submit"
                  disabled={stage === 'creating'}
                  aria-busy={stage === 'creating'}>
                  {stage === 'creating' ? 'Carregando...' : 'Continuar'}
                </button>

                {submitError && <div className={styles.error} role="alert">{submitError}</div>}
              </form>
            </>
          ) : null}

          {stage === 'checkout' ? (
            <section aria-labelledby="payment-title">
              {paymentHeader}
              <h2 id="payment-title" className={styles.sectionTitle}>Pagamento</h2>

              <p className={styles.checkoutAmount}>
                R$ {Number(checkoutAmount).toFixed(2).replace('.', ',')}
              </p>

              <div className={styles.paymentMethods} aria-label="Forma de pagamento">
                <button
                  type="button"
                  className={paymentMethod === 'card' ? styles.methodActive : styles.methodButton}
                  onClick={() => setPaymentMethod('card')}>
                  Cartão de crédito
                </button>
                <button
                  type="button"
                  className={paymentMethod === 'pix' ? styles.methodActive : styles.methodButton}
                  onClick={() => setPaymentMethod('pix')}>
                  Pix
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <>
                  {!brickReady && !paymentError && (
                    <p className={styles.loading} role="status">Carregando pagamento...</p>
                  )}
                  <div id="cardPaymentBrick_container" className={styles.paymentBrick} />
                </>
              ) : (
                <button
                  className={styles.submit}
                  type="button"
                  onClick={createPix}
                  disabled={pixLoading}>
                  {pixLoading ? 'Gerando Pix...' : 'Gerar Pix'}
                </button>
              )}

              {paymentError && <div className={styles.error} role="alert">{paymentError}</div>}
            </section>
          ) : null}

          {stage === 'pending' ? (
            <section className={styles.pending} aria-labelledby="pending-title">
              {paymentHeader}
              <h2 id="pending-title" className={styles.sectionTitle}>Aguardando pagamento</h2>

              {pixData?.qrCodeBase64 ? (
                <img
                  className={styles.pixQr}
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code para pagamento via Pix"
                />
              ) : null}

              {pixData?.qrCode ? (
                <div className={styles.pixCopy}>
                  <label htmlFor="pix-code">Pix Copia e Cola</label>
                  <textarea id="pix-code" readOnly value={pixData.qrCode} />
                  <button className={styles.couponButton} type="button" onClick={copyPix}>
                    {copied ? 'Copiado' : 'Copiar código'}
                  </button>
                </div>
              ) : null}

              <p className={styles.pendingText} role="status" aria-live="polite">
                Estamos aguardando a confirmação do pagamento.
              </p>
              {paymentError && <div className={styles.error} role="alert">{paymentError}</div>}
            </section>
          ) : null}

          {stage === 'paid' ? (
            <section className={styles.feedback} role="status" aria-live="polite">
              <h1 className={styles.feedbackTitle}>Inscrição confirmada</h1>
              <p>Seu pagamento foi aprovado e sua vaga no Workshop LINSI está garantida.</p>
              <p>Enviarei as informações de acesso para:</p>
              <strong>{email}</strong>
            </section>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}
