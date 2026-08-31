const fs = require('fs');
const css = fs.readFileSync('src/css/custom.css', 'utf8');
const lines = css.split('\n');

let searchStart = -1;
let searchEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* Busca — tokens semânticos */')) searchStart = i;
  if (lines[i].includes('/* Busca — sem resultados */') && searchStart >= 0) {
    let depth = 0;
    for (let j = i; j < lines.length; j++) {
      depth += (lines[j].match(/{/g) || []).length;
      depth -= (lines[j].match(/}/g) || []).length;
      if (depth === 0 && j > i) { searchEnd = j; break; }
    }
    break;
  }
}

console.log('Search section: lines ' + (searchStart+1) + ' to ' + (searchEnd+1));
console.log('Total lines: ' + lines.length);

// Extract before + after
const before = lines.slice(0, searchStart).join('\n');
const after = lines.slice(searchEnd + 1).join('\n');

const newSearchCSS = `/* ===========================
   Busca — tokens semânticos
   =========================== */
:root {
  --linsi-search-surface: #ffffff;
  --linsi-search-backdrop: rgba(0, 0, 0, 0.45);
  --linsi-search-result-hover: #f5f8fd;
  --linsi-search-result-active: #ebe8f4;
  --linsi-search-secondary-text: #4b5565;
  --linsi-search-border: #dbdfe6;
  --linsi-search-input-bg: #ffffff;

  --aa-primary-color-rgb: 151, 31, 26 !important;
  --aa-muted-color-rgb: 75, 85, 101 !important;
  --aa-text-color-rgb: 37, 50, 67 !important;
  --aa-input-border-color-rgb: 175, 181, 191 !important;
  --aa-background-color-rgb: 255, 255, 255 !important;
  --aa-input-background-color-rgb: 255, 255, 255 !important;
  --aa-icon-color-rgb: 37, 50, 67 !important;
  --aa-search-input-height: 44px;
}

[data-theme='dark'] {
  --linsi-search-surface: #172637;
  --linsi-search-backdrop: rgba(0, 0, 0, 0.65);
  --linsi-search-result-hover: #253243;
  --linsi-search-result-active: #1f1696;
  --linsi-search-secondary-text: #afb5bf;
  --linsi-search-border: #4b5565;
  --linsi-search-input-bg: #060c2b;

  --aa-primary-color-rgb: 241, 177, 155 !important;
  --aa-muted-color-rgb: 175, 181, 191 !important;
  --aa-text-color-rgb: 245, 248, 253 !important;
  --aa-input-border-color-rgb: 75, 85, 101 !important;
  --aa-background-color-rgb: 6, 12, 43 !important;
  --aa-input-background-color-rgb: 6, 12, 43 !important;
  --aa-icon-color-rgb: 245, 248, 253 !important;
}

/* ===========================
   Busca — trigger na navbar
   =========================== */
.navbar .aa-Autocomplete,
.navbar .dsla-search-wrapper,
.navbar [class*='searchBox'] {
  align-items: center;
  display: flex;
}

.navbar .aa-DetachedSearchButton {
  align-items: center;
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: var(--linsi-radius-md) !important;
  box-shadow: none !important;
  color: var(--ifm-navbar-link-color) !important;
  cursor: pointer;
  display: inline-flex !important;
  flex: 0 0 auto !important;
  height: 36px !important;
  justify-content: center;
  margin: 0 !important;
  min-width: 36px !important;
  padding: 0 !important;
  width: 36px !important;
  transition: background-color var(--linsi-motion-fast) var(--linsi-ease-standard),
    border-color var(--linsi-motion-fast) var(--linsi-ease-standard),
    color var(--linsi-motion-fast) var(--linsi-ease-standard);
}

.navbar .aa-DetachedSearchButton:hover {
  background: var(--linsi-neutral-lightest) !important;
  border-color: var(--linsi-neutral-lighter) !important;
}

.navbar .aa-DetachedSearchButton:focus,
.navbar .aa-DetachedSearchButton:focus-visible {
  border-color: var(--linsi-focus-color) !important;
  box-shadow: none !important;
  outline: 3px solid var(--linsi-focus-color);
  outline-offset: 2px;
}

.navbar .aa-DetachedSearchButtonIcon {
  align-items: center;
  color: var(--ifm-navbar-link-color) !important;
  display: inline-flex;
  height: 36px !important;
  justify-content: center;
  transition: color var(--linsi-motion-fast) var(--linsi-ease-standard);
  width: 36px !important;
}

.navbar .aa-DetachedSearchButtonIcon svg {
  display: none;
}

.navbar .aa-DetachedSearchButtonIcon::before {
  content: 'search';
  font-family: 'Material Symbols Outlined Variable';
  font-size: 24px;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-weight: 400;
  line-height: 1;
}

.navbar .aa-DetachedSearchButtonPlaceholder,
.navbar .aa-DetachedSearchButtonQuery {
  display: none !important;
}

[data-theme='dark'] .navbar .aa-DetachedSearchButton:hover {
  background: var(--linsi-neutral-darker) !important;
  border-color: var(--linsi-neutral-dark) !important;
}

/* ===========================
   Busca — modal (overlay + container)
   =========================== */
.aa-DetachedOverlay {
  background: var(--linsi-search-backdrop);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: linsi-search-backdrop-enter var(--linsi-motion-base) var(--linsi-ease-enter);
}

.aa-DetachedContainer {
  animation: linsi-search-container-enter var(--linsi-motion-base) var(--linsi-ease-enter);
  background: var(--linsi-search-surface) !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  display: flex !important;
  flex-direction: column;
  height: 100% !important;
  left: 0 !important;
  max-height: none !important;
  overflow: hidden !important;
  position: fixed !important;
  top: 0 !important;
  width: 100% !important;
  z-index: 9999 !important;
}

@media (min-width: 680px) {
  .aa-DetachedContainer {
    border-radius: var(--linsi-radius-lg) !important;
    height: auto !important;
    left: 50% !important;
    max-height: 80vh !important;
    max-width: 640px !important;
    top: 8vh !important;
    transform: translateX(-50%) !important;
    width: calc(100% - 2rem) !important;
  }
}

/* ===========================
   Busca — formulário + input
   =========================== */
.aa-DetachedFormContainer {
  border-bottom: 1px solid var(--linsi-search-border) !important;
  padding: 0.75rem 1rem !important;
}

.aa-Form {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.aa-InputWrapperPrefix {
  flex: 0 0 auto;
}

.aa-InputWrapper {
  flex: 1 1 auto;
  min-width: 0;
}

.aa-Input {
  font-family: var(--ifm-font-family-base) !important;
  font-size: 1rem !important;
  height: 44px !important;
  line-height: 1.5 !important;
  padding: 0 0.5rem !important;
  width: 100% !important;
}

.aa-Input::placeholder {
  color: var(--linsi-search-secondary-text) !important;
  opacity: 1;
}

/* ===========================
   Busca — botões de ação (ícones Material)
   =========================== */
.aa-SubmitIcon,
.aa-ClearIcon,
.aa-LoadingIcon,
.aa-ItemActionButton svg {
  display: none !important;
}

.aa-SubmitButton,
.aa-ClearButton,
.aa-LoadingIndicator,
.aa-ItemActionButton {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  height: 44px !important;
  min-width: 44px !important;
  padding: 0 !important;
}

.aa-SubmitButton::before,
.aa-ClearButton::before,
.aa-LoadingIndicator::before,
.aa-ItemActionButton::before {
  display: inline-block;
  font-family: 'Material Symbols Outlined Variable';
  font-feature-settings: 'liga';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-weight: 400;
  line-height: 1;
}

.aa-SubmitButton::before {
  content: 'search';
  font-size: 24px;
}

.aa-ClearButton::before {
  content: 'close';
  font-size: 20px;
}

.aa-LoadingIndicator::before {
  animation: linsi-material-spin 800ms linear infinite;
  content: 'progress_activity';
  font-size: 22px;
}

.aa-ItemActionButton::before {
  content: 'keyboard_return';
  font-size: 20px;
}

/* ===========================
   Busca — botão cancelar (fechar modal)
   =========================== */
.aa-DetachedCancelButton {
  align-items: center;
  background: transparent !important;
  border: none !important;
  border-radius: var(--linsi-radius-sm) !important;
  color: var(--linsi-search-secondary-text) !important;
  cursor: pointer;
  display: inline-flex !important;
  font-family: var(--ifm-font-family-base) !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  height: 36px !important;
  min-width: 36px !important;
  padding: 0 0.5rem !important;
  transition: color var(--linsi-motion-fast) var(--linsi-ease-standard),
    background-color var(--linsi-motion-fast) var(--linsi-ease-standard);
  white-space: nowrap;
}

.aa-DetachedCancelButton:hover {
  color: var(--ifm-font-color-base) !important;
  background: var(--linsi-search-result-hover) !important;
}

.aa-DetachedCancelButton::before {
  content: 'close';
  font-family: 'Material Symbols Outlined Variable';
  font-size: 20px;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
  margin-right: 0.25rem;
}

/* ===========================
   Busca — painel de resultados
   =========================== */
.aa-DetachedContainer:has(.aa-Input:placeholder-shown) .aa-Panel {
  display: none;
}

.aa-Panel {
  background: var(--linsi-search-surface) !important;
  border: none !important;
  border-radius: 0 0 var(--linsi-radius-md) var(--linsi-radius-md) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
  flex: 1 1 auto;
  max-height: 60vh !important;
  overflow-y: auto !important;
  padding: 0 !important;
  scrollbar-gutter: stable;
}

.aa-DetachedContainer .aa-Panel {
  border-radius: 0 !important;
  box-shadow: none !important;
  max-height: none !important;
}

[data-theme='dark'] .aa-Panel {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.32) !important;
}

.aa-PanelLayout {
  padding: 0.5rem 0 !important;
}

.aa-PanelLayout::-webkit-scrollbar {
  width: 6px;
}

.aa-PanelLayout::-webkit-scrollbar-track {
  background: transparent;
}

.aa-PanelLayout::-webkit-scrollbar-thumb {
  background: var(--linsi-neutral-light);
  border-radius: 3px;
}

[data-theme='dark'] .aa-PanelLayout::-webkit-scrollbar-thumb {
  background: var(--linsi-neutral-dark);
}

/* ===========================
   Busca — cabeçalho da fonte
   =========================== */
.aa-SourceHeader {
  padding: 0.5rem 1rem 0.25rem !important;
}

.aa-SourceHeaderTitle {
  color: var(--linsi-search-secondary-text) !important;
  font-family: var(--ifm-font-family-base) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
  text-transform: uppercase !important;
}

.aa-SourceHeaderLine {
  display: none !important;
}

/* ===========================
   Busca — item de resultado
   =========================== */
.aa-Item {
  align-items: center;
  border-radius: var(--linsi-radius-sm) !important;
  cursor: pointer;
  display: flex !important;
  gap: 0.5rem;
  margin: 0 0.5rem !important;
  padding: 0.625rem 0.75rem !important;
  transition: background-color var(--linsi-motion-fast) var(--linsi-ease-standard);
}

.aa-Item--desktop {
  min-height: 48px;
}

.aa-Item[aria-selected='true'],
.aa-Item:hover {
  background: var(--linsi-search-result-hover) !important;
}

.aa-ItemLink {
  align-items: center;
  display: flex !important;
  flex: 1 1 auto;
  gap: 0.5rem;
  min-width: 0;
  text-decoration: none !important;
}

.aa-ItemContent {
  align-items: center;
  display: flex !important;
  flex: 1 1 auto;
  gap: 0.5rem;
  min-width: 0;
}

.aa-ItemContentBody {
  flex: 1 1 auto;
  min-width: 0;
}

.aa-ItemContentTitle {
  color: var(--ifm-font-color-base) !important;
  font-family: var(--ifm-font-family-base) !important;
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.aa-ItemContentSubtitle {
  align-items: center;
  color: var(--linsi-search-secondary-text) !important;
  display: flex !important;
  font-family: var(--ifm-font-family-base) !important;
  font-size: 0.8125rem !important;
  gap: 0.375rem !important;
  line-height: 1.4 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.aa-ItemContentSubtitleIcon {
  display: none !important;
}

.aa-ItemContentDash {
  color: var(--linsi-search-secondary-text) !important;
  flex-shrink: 0;
  font-size: 0.8125rem !important;
  line-height: 1;
}

.aa-ItemContentDescription {
  color: var(--linsi-search-secondary-text) !important;
  font-size: 0.8125rem !important;
  line-height: 1.4 !important;
}

.aa-ItemActionButton {
  align-items: center;
  background: transparent !important;
  border: none !important;
  color: var(--linsi-search-secondary-text) !important;
  cursor: pointer;
  display: flex !important;
  flex: 0 0 auto;
  height: 36px !important;
  justify-content: center;
  min-width: 36px !important;
  padding: 0 !important;
  transition: color var(--linsi-motion-fast) var(--linsi-ease-standard);
}

.aa-ItemActionButton:hover {
  color: var(--ifm-font-color-base) !important;
}

/* ===========================
   Busca — sem resultados
   =========================== */
.aa-SourceNoResults {
  padding: 1.5rem 1rem !important;
  text-align: center;
}

.aa-SourceNoResults::before {
  color: var(--linsi-search-secondary-text) !important;
  content: 'Nenhum resultado encontrado.';
  display: block;
  font-family: var(--ifm-font-family-base) !important;
  font-size: 0.875rem !important;
  line-height: 1.5;
}`;

const newCSS = before + '\n' + newSearchCSS + '\n' + after;
fs.writeFileSync('src/css/custom.css', newCSS);
console.log('New CSS written. Total lines: ' + newCSS.split('\n').length);
