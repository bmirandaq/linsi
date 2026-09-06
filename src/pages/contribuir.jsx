import React, {useState, useCallback, useRef, useEffect} from 'react';
import Layout from '@theme/Layout';
import BackToTopButton from '@theme/BackToTopButton';
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

export default function Contato() {
  const [motivo, setMotivo] = useState('contribuir');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileResolver = useRef(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') return;

    let cancelled = false;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (cancelled || !window.turnstile || !turnstileRef.current) return;
      try {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: 'invisible',
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
      } catch {
        turnstileWidgetId.current = null;
      }
    };
    script.onerror = () => {
      turnstileWidgetId.current = null;
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      turnstileResolver.current?.(null);
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current);
        } catch {}
      }
    };
  }, []);

  const getTurnstileToken = useCallback(() => {
    if (!window.turnstile || turnstileWidgetId.current === null) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = (token) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        turnstileResolver.current = null;
        resolve(token);
      };
      const timeout = setTimeout(() => finish(null), 10000);
      turnstileResolver.current = finish;
      try {
        window.turnstile.reset(turnstileWidgetId.current);
        window.turnstile.execute(turnstileWidgetId.current);
      } catch {
        finish(null);
      }
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (status === 'loading') return;

      setStatus('loading');
      setErrorMsg('');

      try {
        const turnstileToken = await getTurnstileToken();

        if (!turnstileToken) {
          throw new Error('Verificação de segurança indisponível');
        }

        if (!CONTACT_API_URL) {
          await new Promise((r) => setTimeout(r, 650));
          setStatus('success');
          return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(CONTACT_API_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            motivo,
            apelido: nome,
            email,
            assunto,
            mensagem,
            turnstileToken,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) throw new Error('Erro ao enviar');

        setStatus('success');
      } catch {
        setStatus('error');
        setErrorMsg(
          'Não foi possível enviar sua mensagem. Tente novamente.',
        );
      }
    },
    [motivo, nome, email, assunto, mensagem, status, getTurnstileToken],
  );

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

          <form className={styles.form} onSubmit={handleSubmit}>
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
      <BackToTopButton />
    </Layout>
  );
}
