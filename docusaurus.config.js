/** @type {import('@docusaurus/types').Config} */
const fontSelectorHtml = `
  <label class="linsi-font-selector">
    <span class="linsi-font-selector__label">Fonte</span>
    <select class="linsi-font-selector__select" data-font-selector aria-label="Fonte do texto">
      <option value="manrope">Manrope</option>
      <option value="inter">Inter</option>
      <option value="opendyslexic">OpenDyslexic</option>
      <option value="georgia">Georgia</option>
    </select>
    <span class="material-symbols-outlined linsi-font-selector__icon" aria-hidden="true">expand_more</span>
  </label>
`;

const config = {
  title: 'LINSI – Linguagem Simplificada de Fluxogramas de UX',
  tagline: 'Linguagem Simplificada de Fluxogramas de UX',
  favicon: 'img/favicon.png',

  url: process.env.SITE_URL ?? process.env.URL ?? 'http://localhost:3000',
  baseUrl: process.env.BASE_URL ?? '/',
  organizationName: 'bmirandaq',
  projectName: 'linsi',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          breadcrumbs: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    [
      '@cmfcmf/docusaurus-search-local',
      {
        indexDocs: true,
        indexDocSidebarParentCategories: 2,
        includeParentCategoriesInPageTitle: true,
        indexBlog: false,
        indexPages: true,
        language: 'pt',
        maxSearchResults: 8,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'LINSI',
        src: 'img/linsi-logo.svg',
        srcDark: 'img/linsi-logo-dark.svg',
        width: 82,
        height: 48,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Manual',
        },
        {
          to: '/cafe-bea',
          label: 'Pagar café pra Bea',
          position: 'left',
          className: 'linsi-coffee-link',
        },
        {
          href: 'https://github.com/bmirandaq/linsi/discussions/new/choose',
          label: 'Quero contribuir',
          position: 'left',
        },
        {
          href: 'https://github.com/bmirandaq/linsi/discussions/new?category=ajuda',
          label: 'Pedir ajuda',
          position: 'left',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'html',
          position: 'right',
          value: fontSelectorHtml,
          className: 'linsi-font-selector-item',
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  },
};

export default config;
