import React from 'react';
import clsx from 'clsx';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

import styles from './styles.module.css';

export default function TOCCollapsibleCollapseButton({collapsed, ...props}) {
  return (
    <button
      type="button"
      {...props}
      aria-expanded={!collapsed}
      className={clsx(
        'clean-btn',
        styles.button,
        !collapsed && styles.expanded,
        props.className,
      )}>
      <span>{collapsed ? 'Expandir índice' : 'Recolher índice'}</span>
      <MaterialSymbol
        name="expand_more"
        size={20}
        className={styles.icon}
        aria-hidden
      />
    </button>
  );
}
