import React, {type ComponentProps, type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

import styles from './styles.module.css';

function SecondaryMenuBackButton(props: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type="button"
      className={styles.backButton}
      data-linsi-mobile-back="true">
      <MaterialSymbol
        name="chevron_left"
        size={20}
        className={styles.backIcon}
      />
      <span>Voltar ao menu principal</span>
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
