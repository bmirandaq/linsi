import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import BackToTopButton from '@theme/BackToTopButton';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import MaterialSymbol from '@site/src/components/MaterialSymbol';
import homeContent from '@site/content/home.json';

import styles from './index.module.css';

export default function Home() {
  const logo = useBaseUrl('/img/linsi-logo.svg');
  const templateCover = useBaseUrl('/img/template-fluxograma-cover.png');

  return (
    <Layout description="LINSI — Linguagem Simplificada de Fluxogramas de UX">
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="home-title">
          <div className={clsx('container', styles.layout)}>
            <div className={styles.copyColumn}>
              <img
                className={styles.logo}
                alt=""
                aria-hidden="true"
                src={logo}
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

        <section className={styles.origin}>
          <div className={clsx('container', styles.originLayout)}>
            <div className={styles.coverWrap}>
              <img
                className={styles.cover}
                src={templateCover}
                alt="Capa do template Fluxograma, com elementos de fluxograma e grafismos"
                width="2048"
                height="1152"
                loading="lazy"
              />
            </div>

            <div className={styles.originCopy}>
              <Heading as="h2" className={styles.originTitle}>
                Talvez você já aplicou o que veio a se tornar a LINSI
              </Heading>

              <div
                className={styles.stats}
                aria-label="Números do template na Figma Community">
                <div className={styles.statCard}>
                  <MaterialSymbol
                    name="visibility"
                    size={26}
                    className={styles.statIcon}
                  />
                  <div className={styles.statContent}>
                    <p className={styles.statValue}>1.141</p>
                    <p className={styles.statLabel}>Visualizações</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <MaterialSymbol
                    name="design_services"
                    size={26}
                    className={styles.statIcon}
                  />
                  <div className={styles.statContent}>
                    <p className={styles.statValue}>412</p>
                    <p className={styles.statLabel}>Usos</p>
                  </div>
                </div>
              </div>

              <p className={styles.statsDate}>
                Estatísticas coletadas em 4 de setembro de 2026
              </p>

              <p className={styles.originText}>
                Os primeiros passos da LINSI vieram de um template simples que
                publiquei na Figma Community há mais de um ano. O que mais você
                pode fazer com ela?
              </p>

              <Link className={styles.originLink} to="/docs/templates">
                Conferir templates
                <MaterialSymbol
                  name="arrow_forward"
                  size={20}
                  className={styles.originLinkArrow}
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <BackToTopButton />
    </Layout>
  );
}
