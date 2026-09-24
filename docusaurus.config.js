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
    <svg class="linsi-font-selector__icon" aria-hidden="true" viewBox="0 0 960 960" focusable="false">
      <g transform="translate(0 960) scale(1 -1)">
        <path d="M480 345 240 585 296 641 480 457 664 641 720 585" fill="currentColor" />
      </g>
    </svg>
  </label>
`;

const fontPreferenceInitScript = `
  try {
    var fontPreference = window.localStorage.getItem('linsi-font-family');
    if (['manrope', 'inter', 'opendyslexic', 'georgia'].includes(fontPreference)) {
      document.documentElement.dataset.fontFamily = fontPreference;
    }
  } catch (_) {}
`;

// Mantém o canvas do navegador alinhado ao tema antes de o CSS principal terminar de carregar.
// Os fallbacks espelham os tokens atuais; quando a paleta carrega, --linsi-bg-canvas assume a fonte de verdade.
const rootCanvasInitStyle = `
  html {
    background-color: var(--linsi-bg-canvas, #f5f8fd);
  }

  html[data-theme='dark'] {
    background-color: var(--linsi-bg-canvas, #04081f);
  }
`;

function readAnalyticsEnv(name) {
  const value = process.env[name]?.trim();
  return value && /^[A-Za-z0-9_-]+$/.test(value) ? value : undefined;
}

const analyticsEnabled = process.env.NODE_ENV === 'production';
const cloudflareAnalyticsToken = analyticsEnabled
  ? readAnalyticsEnv('CLOUDFLARE_WEB_ANALYTICS_TOKEN')
  : undefined;
const clarityProjectId = analyticsEnabled
  ? readAnalyticsEnv('CLARITY_PROJECT_ID')
  : undefined;

const clarityInitScript = clarityProjectId
  ? `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});

    try {
      var linsiCampaignParams = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function(key) {
        var value = linsiCampaignParams.get(key);
        if (value) window.clarity('set', key, value.slice(0, 120));
      });
    } catch (_) {}
  `
  : undefined;

const config = {
  title: 'LINSI – Linguagem Simplificada de Fluxogramas de UX',
  tagline: 'Linguagem Simplificada de Fluxogramas de UX',
  favicon: 'img/favicon.svg',

  url: process.env.SITE_URL ?? 'http://localhost:3000',
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

  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: fontPreferenceInitScript,
    },
    {
      tagName: 'style',
      attributes: {'data-linsi-root-canvas': 'true'},
      innerHTML: rootCanvasInitStyle,
    },
    ...(cloudflareAnalyticsToken
      ? [
          {
            tagName: 'script',
            attributes: {
              type: 'module',
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'data-cf-beacon': JSON.stringify({token: cloudflareAnalyticsToken}),
              'data-linsi-analytics': 'cloudflare',
            },
          },
        ]
      : []),
    ...(clarityInitScript
      ? [
          {
            tagName: 'script',
            attributes: {'data-linsi-analytics': 'clarity'},
            innerHTML: clarityInitScript,
          },
        ]
      : []),
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:type',
        content: 'image/png',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:width',
        content: '1200',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:height',
        content: '630',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:alt',
        content: 'LINSI — Sistema de notação visual para fluxogramas de User Experience',
      },
    },
  ],

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
          customCss: [
            './src/css/spacing.css',
            './src/css/custom.css',
            './src/css/changelog.css',
            './src/css/palette-v2.css',
            './src/css/layout-fixes.css',
            './src/css/performance.css',
          ],
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
        style: 'none',
      },
    ],
  ],

  themeConfig: {
    image: 'img/linsi-social-card-live.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
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
          to: '/contribuir-ajuda',
          label: 'Contribuir ou pedir ajuda',
          position: 'left',
          className: 'linsi-contribute-link',
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
        hideable: false,
        autoCollapseCategories: false,
      },
    },
  },
};

export default config;
