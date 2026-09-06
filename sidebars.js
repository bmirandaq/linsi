/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'principios',
    'por-que-fluxogramas',
    {
      type: 'category',
      label: 'Estrutura LINSI',
      collapsible: false,
      collapsed: false,
      className: 'linsi-sidebar-section',
      items: [
        'estrutura-linsi/elementos',
        'estrutura-linsi/caminhos',
        'estrutura-linsi/colunas',
        'boas-praticas',
      ],
    },
    {
      type: 'category',
      label: 'Utilitários',
      collapsible: false,
      collapsed: false,
      className: 'linsi-sidebar-section',
      items: [
        'glossario',
        'Utilitários/templates',
        'Utilitários/automatizacao',
        'Utilitários/cases',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
