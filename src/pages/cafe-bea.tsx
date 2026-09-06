import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import MaterialSymbol from '@site/src/components/MaterialSymbol';
import styles from './cafe-bea.module.css';

const PIX_CODE =
  '00020126430014BR.GOV.BCB.PIX0121bmirandaqux@gmail.com5204000053039865802BR5915Beatriz Miranda6011Paulista/PE62190515CAFEPRABEALINSI6304262F';

type CopyStatus = 'idle' | 'success' | 'error';

export default function CafeBea() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const qrCodeUrl = useBaseUrl('/img/pix-qrcode.png');
  const leocassieLightUrl = useBaseUrl('/img/leocassie-light.png');
  const leocassieDarkUrl = useBaseUrl('/img/leocassie-dark.png');

  useEffect(() => {
    if (copyStatus !== 'success') {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const copyToClipboard = async (): Promise<void> => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API indisponível');
      }

      await navigator.clipboard.writeText(PIX_CODE);
      setCopyStatus('success');
    } catch (error: unknown) {
      setCopyStatus('error');
      console.error('Falha ao copiar texto: ', error);
    }
  };

  const copiedCode = copyStatus === 'success';

  return (
    <Layout
      title="Pagar café pra Bea"
      description="LINSI é um projeto independente. Se te ajudou, ajude a mantê-la viva também">
      <main className={clsx(styles.main, 'linsi-page-enter')}>
        <div className={clsx('container', styles.container)}>
          <div className={styles.inner}>
            <div className={styles.contentStack}>
              <header className={styles.header}>
                <Heading as="h1" className={styles.title}>
                  Pagar café pra Bea
                  <MaterialSymbol name="coffee" size="1em" className={styles.titleIcon} />
                </Heading>
                <p className={styles.paragraph1}>
                  LINSI é um projeto independente. Se te ajudou, fique à vontade pra
                  mostrar sua gratidão que vou converter em cafés. Talvez um bolinho de
                  fubá? Adoro. Qualquer valor conta, tá?
                </p>
              </header>

              <div className={styles.leftCol}>
                <p className={styles.paragraph2}>
                  Aproveite pra conhecer meus aussistentes, <em>Leo</em> e <em>Cassie</em>. Sugeriram o valor de R$ 10, se você estiver na dúvida de quanto enviar. Ou R$ 25, se quiser patrocinar café + lanchinho da tarde. Mais que isso então?... Os aussistentes estão mais que a fim de um petisco... Se eles merecem ou não, fica ao seu critério
                </p>
                <img
                  src={leocassieLightUrl}
                  alt="Leo e Cassie - aussistentes da LINSI"
                  className={styles.leocassieImg}
                />
                <img
                  src={leocassieDarkUrl}
                  alt="Leo e Cassie - aussistentes da LINSI"
                  className={styles.leocassieImgDark}
                />
              </div>

              <div className={styles.rightCol}>
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
                    rows={3}
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
        </div>
      </main>
    </Layout>
  );
}
