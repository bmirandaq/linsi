import React from 'react';
import styles from './styles.module.css';

export default function PrinciplesGrid({children}) {
  return (
    <ol className={styles.grid} aria-label="Princípios da LINSI">
      {children}
    </ol>
  );
}
