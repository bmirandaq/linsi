/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'LINSI',
  tagline: 'Linguagem Simplificada de Fluxogramas de UX',
  favicon: 'img/linsi-logo.svg',

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
          label: 'Documentação',
        },
        {
          href: 'https://example.com/quero-contribuir',
          label: 'QUERO CONTRIBUIR',
          position: 'right',
          className: 'navbarCta navbarCta--secondary',
        },
        {
          href: 'https://example.com/enviar-case',
          label: 'ENVIAR CASE',
          position: 'right',
          className: 'navbarCta navbarCta--primary',
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
