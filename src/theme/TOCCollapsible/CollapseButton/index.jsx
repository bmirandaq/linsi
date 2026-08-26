import React from 'react';
import clsx from 'clsx';

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
      <span
        className={clsx('material-symbols-outlined', styles.icon)}
        aria-hidden="true">
        expand_more
      </span>
    </button>
  );
}
