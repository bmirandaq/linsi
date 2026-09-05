import React, {useLayoutEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  useAnnouncementBar,
  useScrollPosition,
} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import DocSidebarItems from '@theme/DocSidebarItems';
import type {Props} from '@theme/DocSidebar/Desktop/Content';

import styles from './styles.module.css';

function useShowAnnouncementBar() {
  const {isActive} = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);

  useScrollPosition(
    ({scrollY}) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0);
      }
    },
    [isActive],
  );

  return isActive && showAnnouncementBar;
}

export default function DocSidebarDesktopContent({path, sidebar, className}: Props) {
  const showAnnouncementBar = useShowAnnouncementBar();
  const menuRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const menu = menuRef.current;
      const indicator = indicatorRef.current;
      const activeLink = menu?.querySelector<HTMLElement>(
        '.theme-doc-sidebar-item-link > .menu__link--active:not(.menu__link--sublist)',
      );

      if (!menu || !indicator || !activeLink) {
        indicator?.removeAttribute('data-ready');
        return;
      }

      const menuRect = menu.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      indicator.style.setProperty(
        '--linsi-active-x',
        `${activeRect.left - menuRect.left + menu.scrollLeft}px`,
      );
      indicator.style.setProperty(
        '--linsi-active-y',
        `${activeRect.top - menuRect.top + menu.scrollTop}px`,
      );
      indicator.style.setProperty('--linsi-active-width', `${activeRect.width}px`);
      indicator.style.setProperty(
        '--linsi-active-height',
        `${activeRect.height}px`,
      );
      indicator.setAttribute('data-ready', 'true');
    };

    updateIndicator();
    const activeLink = menuRef.current?.querySelector<HTMLElement>(
      '.theme-doc-sidebar-item-link > .menu__link--active:not(.menu__link--sublist)',
    );
    const resizeObserver =
      activeLink && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateIndicator)
        : null;
    resizeObserver?.observe(activeLink);
    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [path]);

  return (
    <nav
      ref={menuRef}
      aria-label={translate({
        id: 'theme.docs.sidebar.navAriaLabel',
        message: 'Docs sidebar',
        description: 'The ARIA label for the sidebar navigation',
      })}
      className={clsx(
        'menu thin-scrollbar',
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className,
      )}>
      <span ref={indicatorRef} className={styles.activeIndicator} aria-hidden="true" />
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list')}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} />
      </ul>
    </nav>
  );
}
