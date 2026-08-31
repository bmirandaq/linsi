import React, {useState, useCallback, useRef, useEffect} from 'react';
import Layout from '@theme/Layout';
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

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (window.turnstile && turnstileRef.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: 'invisible',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
    };
  }, []);

  const getTurnstileToken = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !window.turnstile) return Promise.resolve(null);
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000);
      window.turnstile.execute(turnstileWidgetId.current, (token) => {
        clearTimeout(timeout);
        resolve(token);
      });
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

        if (!CONTACT_API_URL) {
          await new Promise((r) => setTimeout(r, 650));
          setStatus('success');
          setNome('');
          setEmail('');
          setAssunto('');
          setMensagem('');
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
        setNome('');
        setEmail('');
        setAssunto('');
        setMensagem('');
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

      <main className={styles.page}>
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

          {status === 'success' ? (
            <div className={styles.feedback} role="status" aria-live="polite">
              <strong>Mensagem enviada</strong>
              <br />
              Oi! Aqui é a Bea, criadora da LINSI. Já, já te retorno, tá certo?
              Guenta aí =)
            </div>
          ) : (
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
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>

              {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}

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
            </form>
          )}
        </div>
      </main>
    </Layout>
  );
}
