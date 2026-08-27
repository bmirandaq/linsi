import React from 'react';
import {translate} from '@docusaurus/Translate';
import IconArrow from '@theme/Icon/Arrow';

import styles from './styles.module.css';

export default function DocRootLayoutSidebarExpandButton({toggleSidebar}) {
  const label = translate({
    id: 'linsi.docs.sidebar.expandButtonAriaLabel',
    message: 'Expandir painel lateral',
    description: 'Rótulo do botão que expande o painel lateral dos documentos',
  });

  return (
    <button
      type="button"
      className={styles.expandButton}
      title={label}
      aria-label={label}
      onClick={toggleSidebar}>
      <IconArrow className={styles.expandButtonIcon} />
    </button>
  );
}
