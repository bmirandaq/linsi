export const DEFAULT_FONT_PREFERENCE = 'manrope';
export const FONT_PREFERENCE_STORAGE_KEY = 'linsi-font-family';

export const FONT_OPTIONS = [
  {value: 'manrope', label: 'Manrope'},
  {value: 'inter', label: 'Inter'},
  {value: 'opendyslexic', label: 'OpenDyslexic'},
  {value: 'georgia', label: 'Georgia'},
];

const validPreferences = new Set(FONT_OPTIONS.map(({value}) => value));

export function normalizeFontPreference(value) {
  return validPreferences.has(value) ? value : DEFAULT_FONT_PREFERENCE;
}

export function applyFontPreference(value) {
  const normalizedValue = normalizeFontPreference(value);

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.fontFamily = normalizedValue;
  }

  return normalizedValue;
}

export function applyStoredFontPreference() {
  if (typeof window === 'undefined') {
    return DEFAULT_FONT_PREFERENCE;
  }

  let storedValue;

  try {
    storedValue = window.localStorage.getItem(FONT_PREFERENCE_STORAGE_KEY);
  } catch {
    storedValue = DEFAULT_FONT_PREFERENCE;
  }

  return applyFontPreference(storedValue);
}

export function storeFontPreference(value) {
  const normalizedValue = applyFontPreference(value);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(FONT_PREFERENCE_STORAGE_KEY, normalizedValue);
    } catch {
      // A preferência continua aplicada nesta sessão mesmo sem armazenamento.
    }
  }

  return normalizedValue;
}
