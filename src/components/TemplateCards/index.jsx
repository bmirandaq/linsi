import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const TEMPLATES = [
  {
    id: 'figma-design',
    title: 'Figma Design',
    tool: 'Figma',
    actionLabel: 'Acessar template',
    href: 'https://www.figma.com/community',
    disabled: false,
  },
  {
    id: 'figjam',
    title: 'FigJam',
    tool: 'FigJam',
    actionLabel: 'Acessar template',
    href: 'https://www.figma.com/community',
    disabled: false,
  },
  {
    id: 'miro',
    title: 'Miro',
    tool: 'Em breve',
    actionLabel: 'Em breve',
    href: '#',
    disabled: true,
  },
  {
    id: 'drawio',
    title: 'Draw.io',
    tool: 'Em breve',
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
            <span
              className={clsx(
                styles.badge,
                item.disabled && styles.badgeDisabled
              )}>
              {item.tool}
            </span>
            <h3 className={styles.title}>{item.title}</h3>
          </div>

          <div className={styles.cardFooter}>
            {item.disabled ? (
              <span className={clsx(styles.actionButton, styles.actionButtonDisabled)}>
                Em breve
              </span>
            ) : (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
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
