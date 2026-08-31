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
  const leocassieLightUrl = useBaseUrl('/img/leocassie-light.png');
  const leocassieDarkUrl = useBaseUrl('/img/leocassie-dark.png');

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
        throw new Error('Clipboard API indispon\u00edvel');
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
      title="Pagar caf\u00e9 pra Bea"
      description="LINSI \u00e9 um projeto independente. Se te ajudou, ajude a mant\u00ea-la viva tamb\u00e9m">
      <main className={styles.main}>
        <div className={clsx('container', styles.container)}>
          <div className={styles.inner}>
            <div className={styles.contentStack}>
              <header className={styles.header}>
                <Heading as="h1" className={styles.title}>
                  Pagar caf\u00e9 pra Bea
                  <MaterialSymbol name="coffee" size="1em" className={styles.titleIcon} />
                </Heading>
                <p className={styles.paragraph1}>
                  LINSI \u00e9 um projeto independente. Se te ajudou, fique \u00e0 vontade pra
                  mostrar sua gratid\u00e3o que vou converter em caf\u00e9s. Talvez um bolinho de
                  fub\u00e1? Adoro. Qualquer valor conta, t\u00e1?
                </p>
              </header>

              <div className={styles.leftCol}>
                <p className={styles.paragraph2}>
                  Aproveite pra conhecer meus aussistentes, <em>Leo</em> e <em>Cassie</em>. Sugeriram o valor de R$ 10, se voc\u00ea estiver na d\u00favida de quanto enviar. Ou R$ 25, se quiser patrocinar caf\u00e9 + lanchinho da tarde. Mais que isso ent\u00e3o?... Os aussistentes est\u00e3o mais que a fim de um petisco... Se eles merecem ou n\u00e3o, fica ao seu crit\u00e9rio
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
                  <span className={styles.fieldLabel}>C\u00f3digo Pix</span>
                  <textarea
                    readOnly
                    className={styles.pixTextarea}
                    value={PIX_CODE}
                    rows="3"
                    aria-label="C\u00f3digo Pix"
                  />
                  <button
                    type="button"
                    className={clsx(
                      styles.primaryCopyButton,
                      copiedCode && styles.copiedButton,
                    )}
                    onClick={copyToClipboard}>
                    <span aria-live="polite">
                      {copiedCode ? 'C\u00f3digo copiado' : 'Copiar c\u00f3digo Pix'}
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
