import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import styles from './styles.module.css';

const ignoreCollapse = () => {};

function ResetOnSidebarChange({children}) {
  const sidebar = useDocsSidebar();

  return (
    <React.Fragment key={sidebar?.name ?? 'noSidebar'}>
      {children}
    </React.Fragment>
  );
}

export default function DocRootLayoutSidebar({sidebar}) {
  const {pathname} = useLocation();

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
      )}>
      <ResetOnSidebarChange>
        <div className={styles.sidebarViewport}>
          <DocSidebar
            sidebar={sidebar}
            path={pathname}
            onCollapse={ignoreCollapse}
            isHidden={false}
          />
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
