import React, {useCallback} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import ExpandButton from '@theme/DocRoot/Layout/Sidebar/ExpandButton';
import styles from './styles.module.css';

function ResetOnSidebarChange({children}) {
  const sidebar = useDocsSidebar();

  return (
    <React.Fragment key={sidebar?.name ?? 'noSidebar'}>
      {children}
    </React.Fragment>
  );
}

export default function DocRootLayoutSidebar({
  sidebar,
  hiddenSidebarContainer,
  setHiddenSidebarContainer,
}) {
  const {pathname} = useLocation();
  const toggleSidebar = useCallback(() => {
    setHiddenSidebarContainer((value) => !value);
  }, [setHiddenSidebarContainer]);

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerHidden,
      )}>
      <ResetOnSidebarChange>
        <div
          className={clsx(
            styles.sidebarViewport,
            hiddenSidebarContainer && styles.sidebarViewportHidden,
          )}>
          {hiddenSidebarContainer ? (
            <ExpandButton toggleSidebar={toggleSidebar} />
          ) : (
            <DocSidebar
              sidebar={sidebar}
              path={pathname}
              onCollapse={toggleSidebar}
              isHidden={false}
            />
          )}
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
