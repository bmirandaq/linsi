import React, {type ComponentProps, type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';

import styles from './styles.module.css';

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className={`${styles.backIcon} material-symbols-outlined`}
      focusable="false"
      height="20"
      viewBox="0 0 960 960"
      width="20">
      <title>chevron_left</title>
      <g transform="translate(0 960) scale(1 -1)">
        <path
          d="M560 240 320 480 560 720 616 664 432 480 616 296Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

function SecondaryMenuBackButton(props: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type="button"
      className={styles.backButton}
      data-linsi-mobile-back="true">
      <ChevronLeftIcon />
      <span data-linsi-mobile-back-label="true">Voltar ao menu principal</span>
    </button>
  );
}

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const isPrimaryMenuEmpty = useThemeConfig().navbar.items.length === 0;
  const secondaryMenu = useNavbarSecondaryMenu();

  return (
    <>
      {!isPrimaryMenuEmpty && (
        <SecondaryMenuBackButton onClick={() => secondaryMenu.hide()} />
      )}
      {secondaryMenu.content}
    </>
  );
}
