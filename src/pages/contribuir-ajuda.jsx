import React, {useState, useCallback, useRef, useEffect} from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import MaterialSymbol from '@site/src/components/MaterialSymbol';
import styles from './contribuir.module.css';

const REASONS = [
  {
    id: 'contribuir',
    title: 'Quero contribuir',
    copy: 'Enviar sugestão, case ou referência pra evolução da LINSI',
    icon: 'post_add',
  },
  {
    id: 'ajuda',
    title: 'Preciso de ajuda',
    copy: 'Tirar dúvidas ou reportar problemas',
    icon: 'help',
  },
  {
    id: 'outro',
    title: 'Outros assuntos',
    copy: null,
    icon: 'chat_bubble',
  },
];

const CONTACT_API_URL = 'https://linsi-form-handler.bmirandaqux.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEjIIV8ZHpYobikz';
let turnstileScriptPromise;

function loadTurnstile() {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      window.onLinsiTurnstileLoad = () => {
        delete window.onLinsiTurnstileLoad;
        resolve(window.turnstile);
      };
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onLinsiTurnstileLoad';
      script.async = true;
      script.onerror = () => {
        script.remove();
        delete window.onLinsiTurnstileLoad;
        turnstileScriptPromise = null;
        reject(new Error('Turnstile indisponível'));
      };
      document.head.appendChild(script);
    });
  }
  return turnstileScriptPromise;
}

function normalizeLinkedInForSubmit(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-]+)\/?$/i.exec(trimmed);
  return match ? `https://www.linkedin.com/in/${match[1]}` : trimmed;
}

export default function Contato() {
  const [motivo, setMotivo] = useState('contribuir');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileResolver = useRef(null);
  const turnstileReady = useRef(null);
  const turnstileExecuted = useRef(false);
  const turnstileCancelled = useRef(false);

  useEffect(() => {
    turnstileCancelled.current = false;

    return () => {
      turnstileCancelled.current = true;
      turnstileResolver.current?.(null);
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current);
        } catch {}
      }
      turnstileWidgetId.current = null;
      turnstileReady.current = null;
    };
  }, []);

  const ensureTurnstileReady = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') {
      return Promise.resolve(null);
    }

    if (turnstileReady.current) {
      return turnstileReady.current;
    }

    turnstileReady.current = loadTurnstile()
      .then((turnstile) => {
        if (turnstileCancelled.current || !turnstileRef.current) return null;
        if (turnstileWidgetId.current !== null) return turnstileWidgetId.current;

        try {
          turnstileExecuted.current = false;
          turnstileWidgetId.current = turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            size: 'normal',
            appearance: 'always',
            execution: 'execute',
            action: 'contact',
            callback: (token) => {
              turnstileResolver.current?.(token);
            },
            'error-callback': () => {
              turnstileResolver.current?.(null);
            },
            'timeout-callback': () => {
              turnstileResolver.current?.(null);
            },
          });
          return turnstileWidgetId.current;
        } catch {
          turnstileWidgetId.current = null;
          return null;
        }
      })
      .catch(() => {
        turnstileReady.current = null;
        return null;
      });

    return turnstileReady.current;
  }, []);

  const getTurnstileToken = useCallback(() => {
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
          if (turnstileExecuted.current) window.turnstile.reset(turnstileWidgetId.current);
          turnstileExecuted.current = true;
          window.turnstile.execute(turnstileWidgetId.current);
        } catch {
          finish(null);
        }
      });
    });
  }, [ensureTurnstileReady]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (status === 'loading') return;

      // Autofill can update the DOM without updating React's controlled state.
      const formData = new FormData(e.currentTarget);
      const payload = {
        motivo: formData.get('motivo'),
        apelido: formData.get('nome'),
        email: formData.get('email'),
        linkedin: normalizeLinkedInForSubmit(String(formData.get('linkedin') || '')),
        whatsapp: String(formData.get('whatsapp') || '').replace(/\D/g, ''),
        assunto: formData.get('assunto'),
        mensagem: formData.get('mensagem'),
      };
      setNome(String(payload.apelido || ''));
      setEmail(String(payload.email || ''));
      setLinkedin(payload.linkedin);
      setWhatsapp(payload.whatsapp);
      setAssunto(String(payload.assunto || ''));
      setMensagem(String(payload.mensagem || ''));
      setStatus('loading');
      setErrorMsg('');

      let timeout;
      let failureMessage = 'Não foi possível concluir a verificação de segurança. Recarregue a página e tente novamente.';
      try {
        const turnstileToken = await getTurnstileToken();

        if (!turnstileToken) {
          throw new Error('Verificação de segurança indisponível');
        }

        failureMessage = 'Não foi possível conectar ao serviço de envio. Verifique sua conexão e tente novamente.';
        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(CONTACT_API_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            ...payload,
            turnstileToken,
          }),
          signal: controller.signal,
        });

        const result = await res.json().catch(() => null);
        if (!res.ok || result?.ok !== true) {
          if (res.status === 403) {
            failureMessage = 'A verificação de segurança expirou ou foi recusada. Tente enviar novamente.';
          } else if (res.status === 400) {
            failureMessage = 'Confira os campos preenchidos e tente novamente. Use um perfil pessoal do LinkedIn e somente números no WhatsApp.';
          } else {
            failureMessage = 'Não foi possível registrar sua mensagem agora. Tente novamente em alguns minutos.';
          }
          throw new Error('Envio não confirmado');
        }

        setStatus('success');
      } catch {
        setStatus('error');
        setErrorMsg(failureMessage);
      } finally {
        clearTimeout(timeout);
      }
    },
    [status, getTurnstileToken],
  );

  const warmTurnstile = useCallback(() => {
    void ensureTurnstileReady();
  }, [ensureTurnstileReady]);

  return (
    <Layout title="Contribuir ou pedir ajuda" description="Contribuir ou pedir ajuda — LINSI">

      <main className={clsx(styles.page, 'linsi-page-enter')}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <h1 className={styles.title}>Contribuir ou pedir ajuda</h1>
          </header>

          <p className={styles.subtitle}>
            Escolha a opção que fizer mais sentido pra você:
          </p>

          <div className={styles.reasonGrid} role="group" aria-label="Motivo do contato">
            {REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={styles.reasonCard}
                aria-pressed={motivo === r.id}
                onClick={() => {
                  setMotivo(r.id);
                  setStatus('idle');
                }}>
                <h2 className={styles.reasonTitle}>{r.title}</h2>
                {r.copy && <p className={styles.reasonCopy}>{r.copy}</p>}
                <MaterialSymbol
                  className={styles.reasonIcon}
                  name={r.icon}
                  size={26}
                  aria-hidden
                />
              </button>
            ))}
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            onFocusCapture={warmTurnstile}
            onPointerDownCapture={warmTurnstile}>
            <input type="hidden" name="motivo" value={motivo} />

              <div className={styles.contactRow}>
                <div className={styles.field}>
                  <label htmlFor="nome">Apelido</label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="linkedin">
                    Perfil do LinkedIn <span className={styles.optionalLabel}>(opcional)</span>
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
                    onChange={(e) => setLinkedin(e.target.value)}
                    onBlur={(e) => setLinkedin(normalizeLinkedInForSubmit(e.target.value))}
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
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="assunto">Assunto</label>
                <input
                  id="assunto"
                  name="assunto"
                  type="text"
                  placeholder="Resuma em poucas palavras"
                  maxLength={200}
                  required
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="mensagem">Mensagem</label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  placeholder="Conte o contexto, o que você precisa e inclua links se forem úteis."
                  maxLength={5000}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>

              {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className={styles.turnstile} />}

              <button
                className={styles.submit}
                type="submit"
                disabled={status === 'loading'}
                aria-busy={status === 'loading'}>
                {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
              </button>

              {status === 'error' && (
                <div className={styles.error} role="alert">
                  {errorMsg}
                </div>
              )}

              {status === 'success' && (
                <div className={styles.feedback} role="status" aria-live="polite">
                  <strong>Mensagem recebida</strong>
                  <br />
                  Oi! Aqui é a Bea, criadora da LINSI. Já, já te retorno, tá certo?
                  Guenta aí =)
                </div>
              )}
            </form>
        </div>
      </main>
    </Layout>
  );
}
