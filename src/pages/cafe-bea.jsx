import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './cafe-bea.module.css';

const PIX_CODE =
  '00020126430014BR.GOV.BCB.PIX0121bmirandaqux@gmail.com5204000053039865802BR5915Beatriz Miranda6011Paulista/PE62190515CAFEPRABEALINSI6304262F';

export default function CafeBea() {
  const [copiedCode, setCopiedCode] = useState(false);
  const qrCodeUrl = useBaseUrl('/img/pix-qrcode.png');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
    }
  };

  return (
    <Layout
      title="Pagar um café pra Bea ☕ — LINSI"
      description="LINSI é um projeto independente. Se te ajudou, ajude a mantê-la viva também">
      <main className={styles.main}>
        <div className={clsx('container', styles.container)}>
          <div className={styles.inner}>
            <header className={styles.header}>
              <Heading as="h1" className={styles.title}>
                Pagar um café pra Bea ☕
              </Heading>
              <p className={styles.subtitle}>
                LINSI é um projeto independente. Se te ajudou, ajude a mantê-la viva
                também
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
                  {copiedCode ? 'Código copiado' : 'Copiar código Pix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
