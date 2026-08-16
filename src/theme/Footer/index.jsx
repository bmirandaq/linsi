import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Rodapé">
      <div className={clsx('container', styles.container)}>
        <strong className={styles.title}>
          LINSI — Linguagem Simplificada de Fluxogramas de UX
        </strong>
        <p className={styles.licenseLine}>
          Licenciada sob{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}>
            CC BY-NC-SA 4.0
          </a>{' '}
          · Criada por{' '}
          <a
            href="https://www.linkedin.com/in/bmirandaq"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}>
            Bea Miranda
          </a>
        </p>
        <p className={styles.contactLine}>
          Precisa de uma permissão além desses termos?{' '}
          <a
            href="https://www.linkedin.com/in/bmirandaq"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}>
            Entre em contato
          </a>
        </p>
      </div>
    </footer>
  );
}
