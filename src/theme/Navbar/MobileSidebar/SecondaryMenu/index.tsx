import React, {type ComponentProps, type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';
import Translate from '@docusaurus/Translate';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

import styles from './styles.module.css';

function SecondaryMenuBackButton(props: ComponentProps<'button'>) {
  return (
    <button {...props} type="button" className={styles.backButton}>
      <MaterialSymbol
        name="chevron_left"
        size={20}
        className={styles.backIcon}
      />
      <span>
        <Translate
          id="theme.navbar.mobileSidebarSecondaryMenu.backButtonLabel"
          description="The label of the back button to return to main menu, inside the mobile navbar sidebar secondary menu (notably used to display the docs sidebar)">
          Voltar para o menu principal
        </Translate>
      </span>
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
