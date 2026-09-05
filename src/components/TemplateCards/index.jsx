import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const TEMPLATES = [
  {
    id: 'figjam',
    title: 'FigJam',
    actionLabel: 'Acessar template',
    href: 'https://www.figma.com/community',
    disabled: false,
  },
  {
    id: 'figma-design',
    title: 'Figma Design',
    description: 'Screenflow',
    actionLabel: 'Acessar template',
    href: 'https://www.figma.com/community',
    disabled: false,
  },
  {
    id: 'miro',
    title: 'Miro',
    actionLabel: 'Em breve',
    href: '#',
    disabled: true,
  },
];

export default function TemplateCards() {
  return (
    <div className={styles.grid}>
      {TEMPLATES.map((item) => (
        <div
          key={item.id}
          className={clsx(styles.card, item.disabled && styles.cardDisabled)}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>{item.title}</h3>
            {item.description ? (
              <p className={styles.description}>{item.description}</p>
            ) : null}
          </div>

          <div className={styles.cardFooter}>
            {item.disabled ? (
              <span
                className={clsx(
                  styles.actionButton,
                  styles.actionButtonDisabled,
                )}>
                Em breve
              </span>
            ) : (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.actionLabel}: ${item.title} (abre em uma nova aba)`}
                className={styles.actionButton}>
                {item.actionLabel}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
