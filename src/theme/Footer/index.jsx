import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import MaterialSymbol from '@site/src/components/MaterialSymbol';
import styles from './styles.module.css';

const exploreLinks = [
  {label: 'Manual', to: '/docs/'},
  {label: 'Princípios', to: '/docs/principios'},
  {label: 'Boas práticas', to: '/docs/boas-praticas'},
  {label: 'Changelog', to: '/docs/changelog'},
];

export default function Footer() {
  const lightLogo = useBaseUrl('/img/linsi-logo.svg');
  const darkLogo = useBaseUrl('/img/linsi-logo-dark.svg');
  const creatorSymbol = useBaseUrl('/img/bea-symbol.svg');

  return (
    <footer className={styles.footer} aria-label="Rodapé">
      <div className={styles.accent} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.main}>
          <section className={styles.brand} aria-label="Sobre a LINSI">
            <img
              className={`${styles.logo} ${styles.logoLight}`}
              src={lightLogo}
              alt="LINSI"
              width="163"
              height="96"
            />
            <img
              className={`${styles.logo} ${styles.logoDark}`}
              src={darkLogo}
              alt="LINSI"
              width="163"
              height="96"
            />
            <p className={styles.brandCopy}>
              Linguagem Simplificada de Fluxogramas de UX para representar,
              discutir e revisar experiências com mais clareza.
            </p>
          </section>

          <nav className={styles.navGroup} aria-labelledby="footer-explorar">
            <p className={styles.navLabel} id="footer-explorar">
              Explorar
            </p>
            <ul className={styles.navList}>
              {exploreLinks.map(({label, to}) => (
                <li key={to}>
                  <Link className={styles.link} to={to}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.navGroup} aria-labelledby="footer-projeto">
            <p className={styles.navLabel} id="footer-projeto">
              Projeto
            </p>
            <ul className={styles.navList}>
              <li>
                <a
                  className={`${styles.link} ${styles.linkWithIcon}`}
                  href="https://github.com/bmirandaq/linsi/discussions/new/choose"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Quero contribuir (abre em uma nova aba)">
                  Quero contribuir
                  <MaterialSymbol
                    className={styles.navIcon}
                    name="open_in_new"
                    size={18}
                  />
                </a>
              </li>
              <li>
                <Link
                  className={`${styles.link} ${styles.linkWithIcon}`}
                  to="/cafe-bea">
                  Pagar café pra Bea
                  <MaterialSymbol
                    className={styles.navIcon}
                    name="coffee"
                    size={18}
                  />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.legal}>
          <p>
            Licenciada sob{' '}
            <a
              className={styles.link}
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CC BY-NC-SA 4.0 (abre em uma nova aba)">
              CC BY-NC-SA 4.0
            </a>
          </p>
          <p>
            Criada por{' '}
            <a
              className={`${styles.link} ${styles.creatorLink}`}
              href="https://www.linkedin.com/in/bmirandaq"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bea Miranda (abre em uma nova aba)">
              <img
                className={styles.creatorSymbol}
                src={creatorSymbol}
                alt=""
                aria-hidden="true"
                width="32"
                height="32"
              />
              Bea Miranda
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
