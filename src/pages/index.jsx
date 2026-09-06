import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
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

            <div className={styles.mediaColumn} aria-hidden="true">
              <svg
                className={styles.heroFlow}
                viewBox="0 0 720 900"
                preserveAspectRatio="xMidYMid meet"
                focusable="false">
                <defs>
                  <marker
                    id="hero-v1-negative-arrow"
                    markerWidth="12"
                    markerHeight="12"
                    refX="9"
                    refY="6"
                    orient="auto"
                    markerUnits="strokeWidth">
                    <path d="M 0 0 L 12 6 L 0 12 z" className={styles.heroFlowNegativeFill} />
                  </marker>
                  <marker
                    id="hero-v1-positive-arrow"
                    markerWidth="12"
                    markerHeight="12"
                    refX="9"
                    refY="6"
                    orient="auto"
                    markerUnits="strokeWidth">
                    <path d="M 0 0 L 12 6 L 0 12 z" className={styles.heroFlowPositiveFill} />
                  </marker>
                </defs>

                <rect
                  className={styles.heroFlowSurface}
                  x="0"
                  y="0"
                  width="720"
                  height="900"
                  rx="18"
                />

                <path
                  className={styles.heroFlowMainPath}
                  d="M 0 112 H 122 V 0 M 122 112 V 510"
                />

                <path
                  className={styles.heroFlowNegativePath}
                  d="M 122 112 L 654 20"
                  markerEnd="url(#hero-v1-negative-arrow)"
                />

                <text className={styles.heroFlowLabel} x="538" y="91">
                  Pix
                </text>

                <text className={styles.heroFlowLabel} x="322" y="184">
                  Pagamento
                </text>

                <g className={styles.heroFlowInterface}>
                  <rect x="304" y="223" width="294" height="156" rx="8" />
                  <path d="M 304 300 H 598" />
                  <circle cx="322" cy="243" r="7" />
                  <path d="M 336 240 H 360" />
                  <path d="M 342 255 H 556" />
                  <path d="M 342 267 H 524" />
                  <path d="M 342 279 H 548" />
                </g>

                <circle className={styles.heroFlowPositiveNode} cx="122" cy="436" r="13" />
                <path
                  className={styles.heroFlowPositivePath}
                  d="M 122 436 H 654"
                  markerEnd="url(#hero-v1-positive-arrow)"
                />

                <text className={styles.heroFlowLabel} x="535" y="407">
                  Sucesso
                </text>

                <circle className={styles.heroFlowNegativeNode} cx="122" cy="514" r="13" />

                <text
                  className={styles.heroFlowCaption}
                  x="360"
                  y="842"
                  textAnchor="middle">
                  O fluxo se adapta às decisões da pessoa.
                </text>
              </svg>
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
    </Layout>
  );
}
