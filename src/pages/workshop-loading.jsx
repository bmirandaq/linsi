import React from 'react';
import styles from './workshop.module.css';

export function WorkshopSpinner({small = false, label = 'Carregando'}) {
  return (
    <span className={small ? styles.spinnerInline : styles.spinnerBlock} role="status" aria-label={label}>
      <span className={styles.processingSpinner} aria-hidden="true" />
    </span>
  );
}
