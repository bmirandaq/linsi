import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

import homeContent from '@site/content/home.json';

import styles from './index.module.css';

export default function Home() {
  const lightLogo = useBaseUrl('/img/linsi-logo.svg');
  const darkLogo = useBaseUrl('/img/linsi-logo-dark.svg');

  return (
    <Layout
      title="Linguagem Simplificada de Fluxogramas de UX"
      description="LINSI — Linguagem Simplificada de Fluxogramas de UX">
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="home-title">
          <div className={clsx('container', styles.layout)}>
            <div className={styles.copyColumn}>
              <ThemedImage
                className={styles.logo}
                alt="LINSI"
                sources={{
                  light: lightLogo,
                  dark: darkLogo,
                }}
                width="163"
                height="96"
              />
              <Heading as="h1" id="home-title" className={styles.visuallyHidden}>
                LINSI
              </Heading>
              <p className={styles.subtitle}>{homeContent.subtitle}</p>
              <div className={styles.positioningCopy}>
                {homeContent.positioning.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <Link
                className={clsx('button', styles.primaryAction)}
                to={homeContent.primaryAction.href}>
                {homeContent.primaryAction.label}
              </Link>
            </div>

            <div
              className={styles.mediaColumn}
              aria-hidden="true"
              data-home-media-placeholder>
              {/* Imagem da home será inserida posteriormente */}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
