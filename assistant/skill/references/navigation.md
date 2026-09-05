# Navegacao da documentacao LINSI

Este arquivo mapeia conceitos para paginas publicas relevantes.

Links devem ser verificados antes de cada release. Nao registrar rota planejada como existente.

## Mapa inicial

| Tema | Fonte no repo | URL publica esperada | Quando indicar |
| --- | --- | --- | --- |
| Principios | `docs/principios.md` | `/docs/principios` | mentalidade, simplificacao, adaptacao, foco na pessoa |
| Glossario | `docs/glossario.md` | `/docs/glossario` | significado de termos gerais |
| Elementos | `docs/estrutura-linsi/elementos.md` | `/docs/estrutura-linsi/elementos` | funcao de Elementos, Setas e representacao |
| Caminhos | `docs/estrutura-linsi/caminhos.md` | `/docs/estrutura-linsi/caminhos` | bifurcacoes, ordem, convergencia |
| Colunas | `docs/estrutura-linsi/colunas.md` | `/docs/estrutura-linsi/colunas` | Etapa, Secao, Equivalencia e agrupamentos |
| Boas praticas | `docs/boas-praticas.md` | `/docs/boas-praticas` | escopo, legibilidade, espacamento, revisao |
| Assistente LINSI | `docs/Utilitários/automatizacao.md` | `/assistente` | uso, instalacao e capacidades do Assistente |
| Contribuir | `src/pages/contribuir.jsx` | `/contribuir` | lacunas da LINSI, propostas de melhoria, duvidas ou pedidos de ajuda |

Base publica: `https://linsi.beamiranda.com.br`

## Regra de uso

Sempre indicar os links oficiais correspondentes aos conceitos tratados quando essas fontes existirem. A interacao com a Assistente nao deve substituir nem ocultar a documentacao.

Preferir a pagina mais especifica para o tema em vez de apontar apenas para a home.

Quando houver mais de uma pagina relevante, indicar somente as que ajudam a localizar as fontes efetivamente usadas na resposta.

Nao adicionar links sem relacao com o conteudo tratado apenas para cumprir a regra de navegacao.

Quando identificar uma lacuna da LINSI, indicar tambem `/contribuir`.

## Gate de release

Antes de publicar a Skill, validar todas as URLs deste arquivo contra o site em producao e atualizar rotas divergentes.
