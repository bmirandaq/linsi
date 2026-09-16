import React, {useCallback, useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './workshop.module.css';

const WORKSHOP_API_URL = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEjIIV8ZHpYobikz';
const MOCK_VALID_COUPONS = new Set(['VAGASUX10', 'CROQ10', 'GUIA10']);
const MAX_PAYMENT_ATTEMPTS = 3;
const PAYMENT_LOCK_MS = 4 * 60 * 60 * 1000;
const MOCK_PENDING_PREVIEW_MS = 4000;
const COUPON_DEBOUNCE_MS = 500;
let turnstileScriptPromise;
let mercadoPagoScriptPromise;
let mercadoPagoSecurityScriptPromise;

function isWorkshopMockMode() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function LoadingSpinner({label = 'Carregando', compact = false}) {
  const size = compact ? 20 : 28;
  return (
    <span
      role="status"
      aria-label={label}
      style={{display: 'inline-grid', minHeight: compact ? 20 : 48, placeItems: 'center', width: compact ? 20 : '100%'}}>
      <span
        className={styles.processingSpinner}
        aria-hidden="true"
        style={{borderWidth: 2, height: size, width: size}}
      />
    </span>
  );
}

function mockLockedError(attempts, retryAt) {
  const error = new Error('Não foi possível confirmar o pagamento.');
  error.code = 'payment_locked';
  error.attempts = attempts;
  error.retryAt = retryAt;
  return error;
}

function mockApiRequest(path, options = {}) {
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/workshop/coupon') {
    const coupon = String(body.coupon || '').trim().toUpperCase();
    if (MOCK_VALID_COUPONS.has(coupon)) return Promise.resolve({status: 'valid', coupon});
    if (coupon === 'EXPIRADO' || coupon === 'INDISPONIVEL') return Promise.resolve({status: 'unavailable'});
    return Promise.resolve({status: 'invalid'});
  }

  if (path === '/workshop/start') {
    const coupon = String(body.coupon || '').trim().toUpperCase();
    return Promise.resolve({
      registrationId: 'WS-MOCKLOCAL1',
      amount: MOCK_VALID_COUPONS.has(coupon) ? 90 : 100,
      publicKey: 'MOCK_PUBLIC_KEY',
      attempts: 0,
      retryAt: null,
    });
  }

  if (path === '/workshop/payment/reset') {
    const attempts = Number(body.attempts || 0);
    if (attempts >= MAX_PAYMENT_ATTEMPTS && body.retryAt) {
      return Promise.reject(mockLockedError(attempts, body.retryAt));
    }
    return Promise.resolve({status: 'started', attempts, retryAt: null});
  }

  if (path === '/workshop/pay/pix') {
    const attempts = Number(body.attempts || 0);
    return Promise.resolve({
      status: 'pending',
      attempts,
      retryAt: null,
      pix: {
        qrCode: '00020126580014BR.GOV.BCB.PIX0136WORKSHOP-LINSI-MOCK-LOCAL5204000053039865406100.005802BR5920BEATRIZ MIRANDA MOCK6006RECIFE62070503***6304ABCD',
        qrCodeBase64: '',
        ticketUrl: '',
      },
    });
  }

  if (path.startsWith('/workshop/status')) {
    return Promise.resolve({status: 'pending', attempts: Number(body.attempts || 0), retryAt: null});
  }

  return Promise.reject(new Error('Endpoint mock não configurado.'));
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

function loadMercadoPagoSecurity() {
  if (mercadoPagoSecurityScriptPromise) return mercadoPagoSecurityScriptPromise;
  if (window.linsiMercadoPagoDeviceId || window.MP_DEVICE_SESSION_ID) {
    return Promise.resolve(window.linsiMercadoPagoDeviceId || window.MP_DEVICE_SESSION_ID);
  }

  mercadoPagoSecurityScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://www.mercadopago.com/v2/security.js';
    script.async = true;
    script.setAttribute('view', 'checkout');
    script.setAttribute('output', 'linsiMercadoPagoDeviceId');
    script.onload = () => resolve(window.linsiMercadoPagoDeviceId || window.MP_DEVICE_SESSION_ID || '');
    script.onerror = () => {
      script.remove();
      mercadoPagoSecurityScriptPromise = null;
      resolve('');
    };
    document.head.appendChild(script);
  });

  return mercadoPagoSecurityScriptPromise;
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
    error.retryAt = data?.retryAt || null;
    error.attempts = Number(data?.attempts || 0);
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

function PaymentProcessor() {
  return (
    <aside className={styles.processorCard} aria-label="Processado pelo Mercado Pago">
      <span>Processado pelo</span>
      <img className={`${styles.processorLogo} ${styles.processorLogoLight}`} src="/img/workshop/mercado-pago-color.webp" alt="Mercado Pago" />
      <img className={`${styles.processorLogo} ${styles.processorLogoDark}`} src="/img/workshop/mercado-pago-pluma.webp" alt="Mercado Pago" />
    </aside>
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
  const [paymentState, setPaymentState] = useState('idle');
  const [paymentAttempts, setPaymentAttempts] = useState(0);
  const [retryAt, setRetryAt] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [brickReady, setBrickReady] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [methodSwitching, setMethodSwitching] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);

  const mockMode = isWorkshopMockMode();
  const paymentLocked = paymentState === 'locked' || Boolean(retryAt && Date.parse(retryAt) > Date.now());
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileResolver = useRef(null);
  const turnstileReady = useRef(null);
  const turnstileExecuted = useRef(false);
  const mountedRef = useRef(true);
  const brickController = useRef(null);
  const deviceIdRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    const prefilledCoupon = new URLSearchParams(window.location.search).get('cupom');
    if (prefilledCoupon) setCupom(prefilledCoupon.trim());

    return () => {
      mountedRef.current = false;
      turnstileResolver.current?.(null);
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(turnstileWidgetId.current); } catch {}
      }
      if (brickController.current) {
        try { brickController.current.unmount(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    deviceIdRef.current = deviceId;
  }, [deviceId]);

  const ensureTurnstileReady = useCallback(() => {
    if (isWorkshopMockMode()) return Promise.resolve('mock');
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

  const warmCheckout = useCallback(() => {
    void ensureTurnstileReady();
    if (mockMode) return;
    void loadMercadoPago();
    void loadMercadoPagoSecurity().then((value) => {
      if (!mountedRef.current || !value) return;
      deviceIdRef.current = value;
      setDeviceId(value);
    });
  }, [ensureTurnstileReady, mockMode]);

  useEffect(() => {
    if (mockMode) return undefined;
    const timeout = window.setTimeout(warmCheckout, 0);
    return () => window.clearTimeout(timeout);
  }, [mockMode, warmCheckout]);

  const getTurnstileToken = useCallback(() => {
    if (isWorkshopMockMode()) return Promise.resolve('mock-turnstile-token');
    return new Promise((resolve) => {
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
        } catch { finish(null); }
      });
    });
  }, [ensureTurnstileReady]);

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
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void validateCoupon(value).then(() => {
        if (cancelled) return;
      });
    }, COUPON_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
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
    setNome(payload.nome); setEmail(payload.email); setCargo(payload.cargo); setEmpresa(payload.empresa);
    setLinkedin(payload.linkedin); setWhatsapp(payload.whatsapp); setCupom(payload.coupon);
    setSubmitError(''); setStage('creating');
    try {
      const turnstileToken = await getTurnstileToken();
      if (!turnstileToken) throw new Error('Não foi possível concluir a verificação de segurança. Tente novamente.');
      const result = await apiRequest('/workshop/start', {
        method: 'POST', body: JSON.stringify({...payload, turnstileToken}),
      });
      setRegistrationId(result.registrationId);
      setCheckoutAmount(result.amount);
      setPublicKey(result.publicKey);
      setPaymentAttempts(Number(result.attempts || 0));
      setRetryAt(result.retryAt || null);
      setPaymentState('idle');
      setStage('checkout');
    } catch (error) {
      if (error.code === 'coupon_invalid') {
        setCouponStatus('invalid'); setCouponMessage('Cupom inválido. Revise e corrija');
      } else if (error.code === 'coupon_unavailable') {
        setCouponStatus('unavailable'); setCouponMessage('Esse cupom não está mais disponível');
      }
      setSubmitError(error.message || 'Não foi possível continuar. Tente novamente.');
      setStage('form');
    }
  }, [getTurnstileToken, stage]);

  const applyPaymentMeta = useCallback((result) => {
    setPaymentAttempts(Number(result?.attempts || 0));
    setRetryAt(result?.retryAt || null);
  }, []);

  const resetPayment = useCallback(async () => {
    if (!registrationId) return false;
    setPaymentError('');
    try {
      const result = await apiRequest('/workshop/payment/reset', {
        method: 'POST',
        body: JSON.stringify({registrationId, attempts: paymentAttempts, retryAt}),
      });
      applyPaymentMeta(result);
      setPixData(null);
      setCardSubmitting(false);
      setPaymentState('idle');
      return true;
    } catch (error) {
      setCardSubmitting(false);
      if (error.code === 'payment_locked') {
        setPaymentState('locked');
        setRetryAt(error.retryAt);
        setPaymentAttempts(error.attempts);
      } else {
        setPaymentState('failed');
      }
      setPaymentError(error.message || 'Não foi possível alterar a forma de pagamento.');
      return false;
    }
  }, [applyPaymentMeta, paymentAttempts, registrationId, retryAt]);

  const resetMockCheckout = useCallback(() => {
    if (!mockMode) return;
    setPaymentError('');
    setPixData(null);
    setCopied(false);
    setPaymentMethod('card');
    setPaymentState('idle');
    setPaymentAttempts(0);
    setRetryAt(null);
    setMethodSwitching(false);
    setCardSubmitting(false);
  }, [mockMode]);

  const selectPaymentMethod = useCallback(async (method) => {
    if (paymentLocked || cardSubmitting || methodSwitching) return;
    if (method === paymentMethod && !(method === 'pix' && !pixData)) return;

    setPaymentMethod(method);
    setPaymentError('');
    setCopied(false);
    if (method === 'pix') setPixData(null);

    if (mockMode) {
      setPaymentState('idle');
      return;
    }

    const needsReset = paymentState === 'pending' || paymentState === 'failed';
    if (!needsReset) {
      setPaymentState('idle');
      return;
    }

    setMethodSwitching(true);
    setPaymentState('switching');
    await resetPayment();
    setMethodSwitching(false);
  }, [cardSubmitting, methodSwitching, mockMode, paymentLocked, paymentMethod, paymentState, pixData, resetPayment]);

  useEffect(() => {
    if (stage !== 'checkout' || paymentMethod !== 'card' || methodSwitching || paymentState !== 'idle' || !publicKey || !checkoutAmount || !registrationId) return undefined;
    if (isWorkshopMockMode()) { setBrickReady(true); setPaymentError(''); return undefined; }

    let cancelled = false;
    setBrickReady(false); setPaymentError('');
    loadMercadoPago().then(async (MercadoPago) => {
      if (cancelled) return;
      const mp = new MercadoPago(publicKey, {locale: 'pt-BR'});
      const bricksBuilder = mp.bricks();
      brickController.current = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
        initialization: {amount: checkoutAmount},
        callbacks: {
          onReady: () => { if (!cancelled) setBrickReady(true); },
          onSubmit: (formData, additionalData) => new Promise(async (resolve, reject) => {
            setCardSubmitting(true);
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
                  deviceId: deviceIdRef.current,
                }),
              });
              applyPaymentMeta(result);
              if (result.status === 'paid') {
                setCardSubmitting(false);
                setStage('paid');
              } else if (result.status === 'pending') {
                setPaymentState('pending');
              } else if (result.retryAt) {
                setCardSubmitting(false);
                setPaymentState('locked');
              } else {
                setCardSubmitting(false);
                setPaymentState('failed');
              }
              resolve();
            } catch (error) {
              setCardSubmitting(false);
              if (error.code === 'payment_locked') {
                setPaymentState('locked');
                setRetryAt(error.retryAt);
                setPaymentAttempts(error.attempts);
              } else {
                setPaymentState('failed');
              }
              setPaymentError(error.message || 'Não foi possível processar o pagamento. Tente novamente.');
              reject(error);
            }
          }),
          onError: () => {
            if (!cancelled) {
              setCardSubmitting(false);
              setPaymentState('failed');
              setPaymentError('Não foi possível carregar o pagamento. Tente novamente.');
            }
          },
        },
      });
    }).catch(() => {
      if (!cancelled) {
        setCardSubmitting(false);
        setPaymentState('failed');
        setPaymentError('Não foi possível carregar o pagamento. Tente novamente.');
      }
    });

    return () => {
      cancelled = true;
      if (brickController.current) {
        try { brickController.current.unmount(); } catch {}
        brickController.current = null;
      }
    };
  }, [applyPaymentMeta, checkoutAmount, methodSwitching, paymentMethod, paymentState, publicKey, registrationId, stage]);

  const createPix = useCallback(async () => {
    if (pixLoading || paymentLocked || methodSwitching) return;
    setPixLoading(true); setPaymentError(''); setPaymentState('loading');
    try {
      const result = await apiRequest('/workshop/pay/pix', {
        method: 'POST',
        body: JSON.stringify({registrationId, deviceId: deviceIdRef.current, attempts: paymentAttempts}),
      });
      applyPaymentMeta(result);
      setPixData(result.pix || null);
      if (result.status === 'paid') setStage('paid');
      else setPaymentState('pending');
    } catch (error) {
      if (error.code === 'payment_locked') {
        setPaymentState('locked'); setRetryAt(error.retryAt); setPaymentAttempts(error.attempts);
      } else {
        setPaymentState('failed');
      }
      setPaymentError(error.message || 'Não foi possível gerar o Pix. Tente novamente.');
    } finally { setPixLoading(false); }
  }, [applyPaymentMeta, methodSwitching, paymentAttempts, paymentLocked, pixLoading, registrationId]);

  useEffect(() => {
    if (stage === 'checkout' && paymentMethod === 'pix' && paymentState === 'idle' && !methodSwitching && !pixData) void createPix();
  }, [createPix, methodSwitching, paymentMethod, paymentState, pixData, stage]);

  useEffect(() => {
    if (stage !== 'checkout' || paymentState !== 'pending' || methodSwitching || !registrationId || isWorkshopMockMode()) return undefined;
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const result = await apiRequest(`/workshop/status?id=${encodeURIComponent(registrationId)}`);
        if (cancelled) return;
        applyPaymentMeta(result);
        if (result.status === 'paid') {
          setCardSubmitting(false);
          setStage('paid');
        }
        if (result.status === 'failed' || result.status === 'refunded') {
          setCardSubmitting(false);
          setPaymentState(result.retryAt ? 'locked' : 'failed');
        }
      } catch {}
    };
    void checkStatus();
    const interval = window.setInterval(checkStatus, 5000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [applyPaymentMeta, methodSwitching, paymentState, registrationId, stage]);

  useEffect(() => {
    if (!mockMode || stage !== 'checkout' || paymentMethod !== 'card' || paymentState !== 'pending') return undefined;
    const timeout = window.setTimeout(() => {
      setCardSubmitting(false);
      setPaymentState('failed');
      setPaymentError('Não foi possível confirmar o pagamento.');
    }, MOCK_PENDING_PREVIEW_MS);
    return () => window.clearTimeout(timeout);
  }, [mockMode, paymentMethod, paymentState, stage]);

  const copyPix = useCallback(async () => {
    if (!pixData?.qrCode || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true); window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [pixData]);

  const mockFail = useCallback(() => {
    const nextAttempts = paymentAttempts + 1;
    const nextRetryAt = nextAttempts >= MAX_PAYMENT_ATTEMPTS
      ? new Date(Date.now() + PAYMENT_LOCK_MS).toISOString()
      : null;
    setCardSubmitting(false);
    setPaymentAttempts(nextAttempts);
    setRetryAt(nextRetryAt);
    setPaymentState(nextRetryAt ? 'locked' : 'failed');
    setPaymentError('Não foi possível confirmar o pagamento.');
  }, [paymentAttempts]);

  const mockPending = useCallback(() => {
    const nextAttempts = paymentAttempts + 1;
    const nextRetryAt = nextAttempts >= MAX_PAYMENT_ATTEMPTS
      ? new Date(Date.now() + PAYMENT_LOCK_MS).toISOString()
      : null;
    setPaymentAttempts(nextAttempts);
    setRetryAt(nextRetryAt);
    if (nextRetryAt) {
      setCardSubmitting(false);
      setPaymentState('locked');
    } else {
      setCardSubmitting(true);
      setPaymentState('pending');
    }
  }, [paymentAttempts]);

  const renderCardContent = () => {
    if (methodSwitching) return <LoadingSpinner label="Alterando forma de pagamento" />;
    if (paymentLocked) {
      return (
        <div className={styles.paymentStatus} role="alert">
          <strong>Não foi possível confirmar o pagamento</strong>
          <p>Você pode realizar uma nova tentativa daqui algumas horas</p>
          {mockMode ? <button className={styles.mockReset} type="button" onClick={resetMockCheckout}>Resetar mock local</button> : null}
        </div>
      );
    }
    if (paymentState === 'pending') return null;
    if (paymentState === 'failed') return (
      <div className={styles.paymentStatus} role="alert">
        <strong>Não foi possível confirmar o pagamento</strong>
        <p>Você pode tentar de novo</p>
        <button className={styles.methodButton} type="button" onClick={() => void resetPayment()}>Trocar cartão</button>
      </div>
    );
    if (mockMode) return (
      <div className={styles.mockPayment}>
        <div className={styles.mockCardFields} aria-hidden="true">
          <div className={styles.mockFieldFull}><span>Número do cartão</span><div className={styles.mockInput}>•••• •••• •••• 4242</div></div>
          <div className={styles.mockField}><span>Validade</span><div className={styles.mockInput}>12/30</div></div>
          <div className={styles.mockField}><span>CVV</span><div className={styles.mockInput}>•••</div></div>
          <div className={styles.mockFieldFull}><span>Nome no cartão</span><div className={styles.mockInput}>BEATRIZ MIRANDA</div></div>
        </div>
        <div className={styles.mockActions}>
          <button className={styles.submit} type="button" onClick={() => setStage('paid')}>Simular pagamento aprovado</button>
          <button className={styles.methodButton} type="button" onClick={mockPending}>Simular pendente</button>
          <button className={styles.methodButton} type="button" onClick={mockFail}>Simular recusado</button>
        </div>
      </div>
    );
    return <>{!brickReady && !paymentError ? <LoadingSpinner label="Carregando pagamento" /> : null}<div id="cardPaymentBrick_container" className={styles.paymentBrick} /></>;
  };

  const renderPixContent = () => {
    if (methodSwitching) return <LoadingSpinner label="Alterando forma de pagamento" />;
    if (paymentLocked && !pixData) {
      return (
        <div className={styles.paymentStatus} role="alert">
          <strong>Não foi possível confirmar o pagamento</strong>
          <p>Você pode realizar uma nova tentativa daqui algumas horas</p>
          {mockMode ? <button className={styles.mockReset} type="button" onClick={resetMockCheckout}>Resetar mock local</button> : null}
        </div>
      );
    }
    if (paymentState === 'loading') return <LoadingSpinner label="Gerando Pix" />;
    if (paymentState === 'failed') return <div className={styles.paymentStatus} role="alert"><strong>Não foi possível gerar o Pix</strong><p>Você pode tentar de novo</p><button className={styles.methodButton} type="button" onClick={() => void resetPayment().then((ok) => ok && createPix())}>Tentar novamente</button></div>;
    if (!pixData) return null;
    return (
      <div className={styles.pixArea}>
        {pixData.qrCodeBase64 ? <img className={styles.pixQr} style={{border: '1px solid var(--linsi-border-color)', justifySelf: 'center'}} src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code para pagamento via Pix" /> : null}
        {mockMode && pixData.qrCode && !pixData.qrCodeBase64 ? <div className={styles.mockQr} style={{justifySelf: 'center'}} aria-label="QR Code Pix simulado"><span>PIX</span><strong>MOCK</strong></div> : null}
        {pixData.qrCode ? <div className={styles.pixCopy}><label htmlFor="pix-code">Pix Copia e Cola</label><textarea id="pix-code" readOnly value={pixData.qrCode} /><button className={styles.couponButton} type="button" onClick={copyPix}>{copied ? 'Copiado' : 'Copiar código'}</button></div> : null}
        <p className={styles.lockNote}>Válido por 24 horas.</p>
        {mockMode ? <button className={styles.submit} type="button" onClick={() => setStage('paid')}>Simular pagamento confirmado</button> : null}
      </div>
    );
  };

  const cardProcessing = stage === 'checkout' && paymentMethod === 'card' && cardSubmitting;
  const methodBusy = paymentLocked || cardSubmitting || methodSwitching;

  return (
    <Layout title="Workshop" description="Inscrição no Workshop LINSI">
      <main className={`${styles.page} linsi-page-enter`}><div className={styles.shell}>
        {stage === 'form' || stage === 'creating' ? <>
          <header className={styles.header}><h1 className={styles.title}>Inscrição no Workshop LINSI</h1><WorkshopStepper active="data" /></header>
          <form className={styles.form} onSubmit={handleContinue} onFocusCapture={warmCheckout} onPointerDownCapture={warmCheckout}>
            <div className={styles.contactRow}>
              <div className={styles.field}><label htmlFor="nome">Nome</label><input id="nome" name="nome" type="text" autoComplete="name" maxLength={120} required value={nome} onChange={(event) => setNome(event.target.value)} /></div>
              <div className={styles.field}><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.field}><label htmlFor="cargo">Cargo</label><input id="cargo" name="cargo" type="text" autoComplete="organization-title" maxLength={120} required value={cargo} onChange={(event) => setCargo(event.target.value)} /></div>
              <div className={styles.field}><label htmlFor="empresa">Empresa onde trabalha <span className={styles.optionalLabel}>(opcional)</span></label><input id="empresa" name="empresa" type="text" autoComplete="organization" maxLength={160} value={empresa} onChange={(event) => setEmpresa(event.target.value)} /></div>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.field}><label htmlFor="linkedin">LinkedIn <span className={styles.optionalLabel}>(opcional)</span></label><input id="linkedin" name="linkedin" type="text" inputMode="url" autoComplete="url" pattern="(?:https?://)?(?:www[.])?linkedin[.]com/in/[A-Za-z0-9\-]+/?" title="Use um perfil no formato linkedin.com/in/name-user" maxLength={300} value={linkedin} onChange={(event) => setLinkedin(event.target.value)} onBlur={(event) => setLinkedin(normalizeLinkedInForSubmit(event.target.value))} /></div>
              <div className={styles.field}><label htmlFor="whatsapp">WhatsApp <span className={styles.optionalLabel}>(opcional)</span></label><input id="whatsapp" name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9]*" maxLength={32} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ''))} /></div>
            </div>
            <div className={styles.field}><label htmlFor="cupom">Cupom <span className={styles.optionalLabel}>(opcional)</span></label><input id="cupom" name="cupom" type="text" autoComplete="off" maxLength={80} value={cupom} onChange={(event) => setCupom(event.target.value)} />{couponMessage && <p className={couponStatus === 'valid' ? styles.couponSuccess : styles.couponError} role={couponStatus === 'valid' ? 'status' : 'alert'}>{couponMessage}</p>}</div>
            {!mockMode && TURNSTILE_SITE_KEY && <div ref={turnstileRef} className={styles.turnstile} />}
            <button className={styles.submit} type="submit" disabled={stage === 'creating'} aria-busy={stage === 'creating'}>{stage === 'creating' ? <LoadingSpinner compact label="Carregando inscrição" /> : 'Continuar'}</button>
            {submitError && <div className={styles.error} role="alert">{submitError}</div>}
          </form>
        </> : null}

        {stage === 'checkout' ? <section aria-labelledby="payment-title" className={styles.checkout}>
          <header className={styles.header}><h1 id="payment-title" className={styles.title}>Inscrição no Workshop LINSI</h1><WorkshopStepper active="payment" /></header>
          <div className={styles.checkoutBody} aria-busy={cardProcessing || methodSwitching}>
            <p className={styles.paymentChoiceLabel} style={{marginBottom: 0}}>Valor do workshop</p>
            <p className={styles.checkoutAmount}>R$ {Number(checkoutAmount).toFixed(2).replace('.', ',')}</p>
            <p className={styles.paymentChoiceLabel}>Escolha a melhor opção pra você:</p>
            <div className={styles.paymentMethods} aria-label="Forma de pagamento">
              <button type="button" className={paymentMethod === 'card' ? styles.methodActive : styles.methodButton} disabled={methodBusy} onClick={() => void selectPaymentMethod('card')}>Cartão</button>
              <button type="button" className={paymentMethod === 'pix' ? styles.methodActive : styles.methodButton} disabled={methodBusy || pixLoading} onClick={() => void selectPaymentMethod('pix')}>Pix</button>
            </div>
            <div className={styles.paymentDynamic}>{paymentMethod === 'card' ? renderCardContent() : renderPixContent()}</div>
            <PaymentProcessor />
            {mockMode && !paymentLocked ? <button className={styles.mockReset} type="button" onClick={resetMockCheckout}>Resetar mock local</button> : null}
            {cardProcessing ? (
              <div className={styles.processingOverlay} role="status" aria-live="polite">
                <span className={styles.processingSpinner} aria-hidden="true" />
                <strong>Processando pagamento...</strong>
              </div>
            ) : null}
          </div>
        </section> : null}

        {stage === 'paid' ? <section className={styles.feedback} role="status" aria-live="polite">
          <h1 className={styles.feedbackTitle}>Inscrição confirmada</h1>
          <p>Seu pagamento foi aprovado e sua vaga no Workshop LINSI está garantida</p>
          <p>Vou te enviar as informações de acesso para:</p>
          <strong>{email}</strong>
          <div className={styles.feedbackSignoff}><p>Te vejo lá!<br />Bea</p><img src="/img/workshop/bea-symbol.webp" alt="" /></div>
          <button className={styles.methodButton} type="button" onClick={() => { window.location.href = '/docs/principios'; }}>Ir para manual LINSI</button>
          {mockMode ? <button className={styles.mockReset} type="button" onClick={() => { resetMockCheckout(); setStage('form'); }}>Reiniciar mock</button> : null}
        </section> : null}
      </div></main>
    </Layout>
  );
}
