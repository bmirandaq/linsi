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
          <div className={clsx('container', styles.layout)} style={{alignItems: 'start'}}>
            <div className={styles.copyColumn}>
              <img
                className={styles.logo}
                alt=""
                aria-hidden="true"
                src={logo}
                width="163"
                height="96"
                style={{marginBottom: 'var(--linsi-space-16)'}}
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
              style={{alignSelf: 'start', aspectRatio: '1 / 1', justifySelf: 'start'}}>
              <svg
                className={styles.heroFlow}
                viewBox="-168 0 600 600"
                preserveAspectRatio="xMidYMid meet"
                focusable="false">
                <rect className={styles.heroFlowSurface} x="-168" width="600" height="600" rx="28" />

                <g className={styles.heroFlowColumn}>
                  <rect x="104" y="50" width="294" height="30" rx="1" className={styles.heroFlowColumnTitle} />
                  <rect x="104" y="80" width="294" height="29" rx="1" className={styles.heroFlowColumnBand} />
                  <text x="117" y="69" className={styles.heroFlowColumnTitleText}>Funnel</text>
                  <text x="251" y="98" textAnchor="middle" className={styles.heroFlowColumnBandText}>Entrada</text>
                </g>

                <g className={styles.heroFlowColumn}>
                  <rect x="-58" y="50" width="113" height="30" rx="1" className={styles.heroFlowColumnTitle} />
                  <rect x="-58" y="80" width="113" height="29" rx="1" className={styles.heroFlowColumnBand} />
                </g>

                <g className={styles.heroFlowNodeOrange}>
                  <rect x="-51" y="190" width="106" height="36" rx="15" />
                  <text x="6" y="211" textAnchor="middle">pedido</text>
                </g>

                <path className={styles.heroFlowPath} d="M55 208 H120" />
                <path className={styles.heroFlowArrow} d="M116 204 L120 208 L116 212" />

                <g className={styles.heroFlowDecision}>
                  <path d="M162 168 L202 208 L162 248 L122 208 Z" />
                  <text x="162" y="205" textAnchor="middle">Cliente</text>
                  <text x="162" y="216" textAnchor="middle">autenticado?</text>
                </g>

                <path className={styles.heroFlowPathPositive} d="M202 208 H600" />
                <text x="249" y="202" className={styles.heroFlowSmallText}>Sim</text>

                <path className={styles.heroFlowPathNegative} d="M162 248 V336" />
                <path className={styles.heroFlowArrowNegative} d="M158 332 L162 336 L166 332" />
                <text x="153" y="296" className={styles.heroFlowSmallText}>Não</text>

                <g className={styles.heroFlowCard}>
                  <rect x="104" y="339" width="114" height="113" rx="1" />
                  <text x="112" y="355" className={styles.heroFlowCardTitle}>Acessar</text>
                  <text x="112" y="378">Formas de autenticação</text>
                  <text x="112" y="391">• Google, Outlook etc.</text>
                  <text x="112" y="404">• Usuário e senha comum</text>
                  <text x="112" y="425">Outras ações</text>
                  <text x="112" y="438">• Criar conta</text>
                  <text x="112" y="451">• Continuar sem cadastro</text>
                </g>

                <path className={styles.heroFlowPath} d="M218 395 H250 V373 H284" />
                <path className={styles.heroFlowArrow} d="M280 369 L284 373 L280 377" />
                <path className={styles.heroFlowPath} d="M218 395 H250 V423 H284" />
                <path className={styles.heroFlowArrow} d="M280 419 L284 423 L280 427" />

                <g className={styles.heroFlowNodeOrange}>
                  <rect x="284" y="355" width="115" height="36" rx="15" />
                  <text x="341.5" y="377" textAnchor="middle">Entrar (comum)</text>
                </g>

                <g className={styles.heroFlowNodeOrange}>
                  <rect x="284" y="405" width="115" height="36" rx="15" />
                  <text x="341.5" y="427" textAnchor="middle">Entrar com integrações</text>
                </g>

                <path className={styles.heroFlowPath} d="M399 373 H498 V208" />
                <path className={styles.heroFlowPath} d="M399 423 H498 V208" />

                <g className={styles.heroFlowSection}>
                  <rect x="104" y="515" width="455" height="30" rx="1" />
                  <text x="331.5" y="535" textAnchor="middle">Sem cadastro</text>
                </g>
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
