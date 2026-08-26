import React, {useEffect} from 'react';

import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/material-symbols-outlined/wght.css';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';

import {
  applyStoredFontPreference,
  storeFontPreference,
} from '@site/src/utils/fontPreference';

export default function Root({children}) {
  useEffect(() => {
    const syncSelectors = (value) => {
      document.querySelectorAll('[data-font-selector]').forEach((selector) => {
        selector.value = value;
      });
    };

    const initialPreference = applyStoredFontPreference();
    syncSelectors(initialPreference);

    const handleFontChange = (event) => {
      if (!event.target.matches('[data-font-selector]')) {
        return;
      }

      const preference = storeFontPreference(event.target.value);
      syncSelectors(preference);
    };

    document.addEventListener('change', handleFontChange);

    return () => document.removeEventListener('change', handleFontChange);
  }, []);

  return children;
}
