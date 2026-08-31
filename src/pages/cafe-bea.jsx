import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import MaterialSymbol from '@site/src/components/MaterialSymbol';
import styles from './cafe-bea.module.css';

const PIX_CODE =
  '00020126430014BR.GOV.BCB.PIX0121bmirandaqux@gmail.com5204000053039865802BR5915Beatriz Miranda6011Paulista/PE62190515CAFEPRABEALINSI6304262F';

export default function CafeBea() {
  const [copyStatus, setCopyStatus] = useState('idle');
  const qrCodeUrl = useBaseUrl('/img/pix-qrcode.png');

  useEffect(() => {
    if (copyStatus !== 'success') {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const copyToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API indisponível');
      }

      await navigator.clipboard.writeText(PIX_CODE);
      setCopyStatus('success');
    } catch (err) {
      setCopyStatus('error');
      console.error('Falha ao copiar texto: ', err);
    }
  };

  const copiedCode = copyStatus === 'success';

  return (
    <Layout
      title="Pagar café pra Bea"
      description="LINSI é um projeto independente. Se te ajudou, ajude a mantê-la viva também">
      <main className={styles.main}>
        <div className={clsx('container', styles.container)}>
          <div className={styles.inner}>
            <header className={styles.header}>
              <Heading as="h1" className={styles.title}>
                Pagar café pra Bea
                <MaterialSymbol name="coffee" size="1em" className={styles.titleIcon} />
              </Heading>
              <p className={styles.subtitle}>
                LINSI é um projeto independente. Se te ajudou, fique à vontade pra
                mostrar sua gratidão que vou converter em cafés. Talvez um bolinho de
                fubá? Adoro. Qualquer valor conta, tá?
                <br />
                <br />
                Meus aussistentes, vulgo cachorros caramelos Leo e Cassie, sugeriram R$
                10, se você estiver na dúvida. Ou R$ 25, se quiser patrocinar café +
                lanchinho da tarde. Mais que isso então?... Aussistentes estão mais que
                a fim de um petisco... Se eles merecem ou não, fica ao seu critério
              </p>
            </header>

            <div className={styles.contentStack}>
              <div className={styles.qrSection}>
                <div className={styles.qrWrapper}>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Pix para pagamento de Beatriz Miranda"
                    className={styles.qrImage}
                    width="260"
                    height="260"
                  />
                </div>
                <span className={styles.qrCaption}>
                  Abra o app do seu banco e escaneie o QR Code
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Código Pix</span>
                <textarea
                  readOnly
                  className={styles.pixTextarea}
                  value={PIX_CODE}
                  rows="3"
                  aria-label="Código Pix"
                />
                <button
                  type="button"
                  className={clsx(
                    styles.primaryCopyButton,
                    copiedCode && styles.copiedButton,
                  )}
                  onClick={copyToClipboard}>
                  <span aria-live="polite">
                    {copiedCode ? 'Código copiado' : 'Copiar código Pix'}
                  </span>
                  <MaterialSymbol
                    name={copiedCode ? 'check' : 'content_copy'}
                    size={20}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
