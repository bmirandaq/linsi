import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';

import MaterialSymbol from '@site/src/components/MaterialSymbol';
import {trackClarityEvent} from '@site/src/utils/analytics';
import homeContent from '@site/content/home.json';

import styles from './index.module.css';

export default function Home() {
  const logo = useBaseUrl('/img/linsi-logo.svg');
  const heroCover = useBaseUrl('/img/cover-hero.png');
  const templateCover = useBaseUrl('/img/template-fluxograma-cover.png');
  const workshopFragmentDesktop = useBaseUrl('/img/workshop-fragment-desktop.svg');
  const workshopFragmentCompact = useBaseUrl('/img/workshop-fragment-compact.svg');
  const workshopSecureIcon = useBaseUrl('/img/verified-user-material-symbol.svg');

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

              <p className={styles.subtitle}>{homeContent.subtitle}</p>

              <Heading as="h1" id="home-title" className={styles.heroTitle}>
                {homeContent.title}
              </Heading>

              <p className={styles.heroDescription}>{homeContent.description}</p>

              <div className={styles.heroActions}>
                <Link
                  className={clsx('button', styles.primaryAction)}
                  to={homeContent.primaryAction.href}>
                  {homeContent.primaryAction.label}
                </Link>

                <Link className={styles.workshopAnchor} to="#workshop" onClick={() => trackClarityEvent('workshop_view')}>
                  Participar do workshop
                  <MaterialSymbol
                    name="arrow_forward"
                    size={20}
                    className={styles.workshopAnchorIcon}
                  />
                </Link>
              </div>
            </div>

            <div className={styles.mediaColumn} aria-hidden="true">
              <img
                className={styles.heroCover}
                src={heroCover}
                alt=""
                width="600"
                height="600"
              />
            </div>
          </div>
        </section>

        <section
          className={styles.workshop}
          id="workshop"
          aria-labelledby="workshop-title">
          <div className={clsx('container', styles.workshopCard)}>
            <div className={styles.workshopHeader}>
              <div className={styles.workshopHeaderContent}>
                <p className={styles.workshopPretitle}>{homeContent.workshop.pretitle}</p>

                <div className={styles.workshopHeadingGroup}>
                  <Heading as="h2" id="workshop-title" className={styles.workshopTitle}>
                    {homeContent.workshop.title}
                  </Heading>
                  <p className={styles.workshopDate}>{homeContent.workshop.dateTime}</p>
                </div>

                <div className={styles.workshopTags} aria-label="Informações do workshop">
                  {homeContent.workshop.tags.map((tag) => (
                    <span className={styles.workshopTag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.workshopPurchase}>
                <div className={styles.workshopPriceGroup}>
                  <p className={styles.workshopPrice}>{homeContent.workshop.price}</p>
                  <p className={styles.workshopInstallment}>{homeContent.workshop.installment}</p>
                </div>

                <div className={styles.workshopActionGroup}>
                  <a
                    className={styles.workshopAction}
                    href={homeContent.workshop.actionHref}
                    onClick={() => trackClarityEvent('workshop_signup_click')}>
                    <span>{homeContent.workshop.actionLabel}</span>
                    <MaterialSymbol name="arrow_forward" size={24} />
                  </a>

                  <p className={styles.workshopSecurePayment}>
                    <img
                      className={styles.workshopSecurePaymentIcon}
                      src={workshopSecureIcon}
                      alt=""
                      aria-hidden="true"
                      width="16"
                      height="16"
                    />
                    <span>{homeContent.workshop.securePayment}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.workshopDetails}>
              <div className={styles.workshopDescriptionGroup}>
                <p className={styles.workshopDescription}>{homeContent.workshop.description}</p>
                <p className={styles.workshopPrerequisite}>{homeContent.workshop.prerequisite}</p>
              </div>

              <div className={styles.workshopTopics}>
                <p className={styles.workshopTopicsTitle}>Tópicos</p>
                <ul className={styles.workshopTopicList}>
                  {homeContent.workshop.topics.map((topic) => (
                    <li className={styles.workshopTopic} key={topic}>
                      <picture className={styles.workshopTopicIcon} aria-hidden="true">
                        <source media="(max-width: 996px)" srcSet={workshopFragmentCompact} />
                        <img src={workshopFragmentDesktop} alt="" width="54" height="24" />
                      </picture>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

              <p className={styles.originText}>
                Os primeiros passos da LINSI vieram de um template simples que
                publiquei na Figma Community há mais de um ano.
                <br />
                O que mais você pode fazer com ela?
              </p>

              <Link className={styles.originLink} to="/docs/templates">
                Conferir templates
                <MaterialSymbol
                  name="arrow_forward"
                  size={20}
                  className={styles.originLinkArrow}
                />
              </Link>

              <div
                className={styles.stats}
                aria-label="Números do template na Figma Community">
                <div className={styles.stat}>
                  <p className={styles.statValue}>1.141</p>
                  <p className={styles.statLabel}>visualizações</p>
                </div>

                <div className={styles.stat}>
                  <p className={styles.statValue}>412</p>
                  <p className={styles.statLabel}>usos</p>
                </div>
              </div>

              <p className={styles.statsDate}>Consulta em 04/09/2026</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}