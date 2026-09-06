# Source map

Rastreia a relacao entre a documentacao publica da LINSI e a camada operacional do Assistente.

## Regras

- `docs/` permanece a fonte conceitual de verdade.
- Cada regra, definicao, representacao canonica ou boa pratica operacionalizada deve apontar para sua fonte.
- Mudancas nas fontes devem disparar revisao das referencias operacionais afetadas antes de uma release.
- Exemplos e imagens nao criam regras por si so.
- Orientacoes derivadas devem ser identificadas como `derived-guidance` e nunca apresentadas como regra oficial sem suporte da documentacao.
- Fontes externas ampliam repertorio, mas nao entram na cadeia normativa da LINSI.
- `technical-background.md` e `public-references.md` sao camadas complementares e nao normativas.

## Registro atual

| Fonte | Blob SHA | Papel | Referencia operacional | Status |
| --- | --- | --- | --- | --- |
| `docs/principios.md` | `c6b4cff372b53768fc74f5413107a3dff39c7f17` | principios orientadores | `skill/references/principles.md` | primeira rodada concluida |
| `docs/estrutura-linsi/elementos.md` | `a2d90639b308f1b3ccca8bfff973adfc83765042` | Elementos, Setas e representacao | `skill/references/elements.md`; `visual-grammar.md` | primeira rodada concluida; nenhuma regra operacional registrada depende de semantica exclusiva de imagem; auditoria visual aprofundada continua como validacao da beta |
| `docs/estrutura-linsi/caminhos.md` | `05eafc2a8e6de93cf6ad07af6464a4de222237ee` | Caminhos, ordem e convergencia | `skill/references/paths.md` | primeira rodada concluida |
| `docs/estrutura-linsi/colunas.md` | `2d190312aba8b2b6b79590ddd32a7888ed17c121` | Colunas | `skill/references/columns.md` | primeira rodada concluida |
| `docs/boas-praticas.md` | `9ee86c7a7626c0010fabdd598063a8f86866b287` | heuristicas e boas praticas | `skill/references/best-practices.md` | primeira rodada concluida |
| `docs/glossario.md` | `6a37c5f0366a81f28cb25dc2372b749f17474790` | terminologia geral | `skill/references/terminology.md` | primeira rodada concluida |
| `docs/Utilitários/automatizacao.md` | `eeda53ce7dd9147a557afeafca715c062987c0a9` | pagina publica do Assistente | `skill/references/navigation.md` | pagina Beta publicada; rota publica `/assistente` consolidada |

## Background tecnico externo

- `skill/references/technical-background.md`: sintese offline nao normativa.
- `skill/references/public-references.md`: procedencia e manutencao das fontes externas.
- Essa camada pode ajudar a interpretar e comparar quando pertinente, mas nao pode definir ou corrigir a LINSI nem encaminhar a pessoa para outra solucao metodologica.

## Gate de sincronizacao

Antes de uma release:

1. comparar os blobs atuais com os registrados;
2. identificar fontes alteradas;
3. revisar referencias afetadas;
4. revisar casos de teste correspondentes;
5. revisar se mudancas no background tecnico introduzem equivalencias, obrigacoes externas ou recomendacoes de outros artefatos;
6. confirmar que nenhuma regra nova da Skill depende apenas de informacao presente em imagem; lacunas visuais concretas devem ser registradas antes de virar regra;
7. validar os links de `skill/references/navigation.md`;
8. atualizar `skill/references/version.md`;
9. somente entao empacotar.

A auditoria visual aprofundada continua como tarefa de validacao durante a beta e nao autoriza inferir regras a partir de exemplos visuais.
