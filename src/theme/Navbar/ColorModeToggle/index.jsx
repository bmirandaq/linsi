import React from 'react';
import clsx from 'clsx';
import {useColorMode} from '@docusaurus/theme-common';

import styles from './styles.module.css';

export default function NavbarColorModeToggle({className}) {
  const {colorMode, setColorMode} = useColorMode();
  const isDark = colorMode === 'dark';
  const modeLabel = isDark ? 'Modo escuro' : 'Modo claro';
  const actionLabel = isDark ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <button
      type="button"
      className={clsx(styles.toggle, className)}
      role="switch"
      aria-checked={isDark}
      aria-label={`${modeLabel}: ${actionLabel}`}
      title={actionLabel}
      onClick={() => setColorMode(isDark ? 'light' : 'dark')}>
      <span className={styles.label}>{modeLabel}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}
