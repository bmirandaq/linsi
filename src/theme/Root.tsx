import React, {useEffect, type ReactNode} from 'react';

import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/material-symbols-outlined/wght.css';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';
import CursorTrail from '@site/src/components/CursorTrail';

import {
  applyStoredFontPreference,
  storeFontPreference,
  type FontPreference,
} from '@site/src/utils/fontPreference';

type Props = {
  children: ReactNode;
};

export default function Root({children}: Props) {
  useEffect(() => {
    const syncSelectors = (value: FontPreference) => {
      document
        .querySelectorAll<HTMLSelectElement>('[data-font-selector]')
        .forEach((selector) => {
          selector.value = value;
        });
    };

    const initialPreference = applyStoredFontPreference();
    syncSelectors(initialPreference);

    const handleFontChange = (event: Event) => {
      const target = event.target;

      if (!(target instanceof HTMLSelectElement)) {
        return;
      }

      if (!target.matches('[data-font-selector]')) {
        return;
      }

      const preference = storeFontPreference(target.value);
      syncSelectors(preference);
    };

    document.addEventListener('change', handleFontChange);

    return () => document.removeEventListener('change', handleFontChange);
  }, []);

  return <>{children}<CursorTrail /></>;
}
