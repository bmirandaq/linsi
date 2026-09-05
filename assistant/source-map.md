# Source map

Rastreia a relacao entre a documentacao publica da LINSI e a camada operacional do Assistente.

## Regras

- `docs/` permanece a fonte conceitual de verdade.
- Cada regra, definicao, representacao canonica ou boa pratica operacionalizada deve apontar para sua fonte.
- Mudancas nas fontes devem disparar revisao das referencias operacionais afetadas antes de uma release.
- Exemplos e imagens nao criam regras por si so.
- Orientacoes derivadas devem ser identificadas como `derived-guidance` e nunca apresentadas como regra oficial sem suporte da documentacao.

## Registro atual

| Fonte | Blob SHA | Papel | Referencia operacional | Status |
| --- | --- | --- | --- | --- |
| `docs/principios.md` | `c6b4cff372b53768fc74f5413107a3dff39c7f17` | principios orientadores | `skill/references/principles.md` | primeira rodada concluida |
| `docs/estrutura-linsi/elementos.md` | `a2d90639b308f1b3ccca8bfff973adfc83765042` | Elementos, Setas e representacao | `skill/references/elements.md`; `visual-grammar.md` | primeira rodada concluida; auditoria visual pendente |
| `docs/estrutura-linsi/caminhos.md` | `05eafc2a8e6de93cf6ad07af6464a4de222237ee` | Caminhos, ordem e convergencia | `skill/references/paths.md` | primeira rodada concluida |
| `docs/estrutura-linsi/colunas.md` | `2d190312aba8b2b6b79590ddd32a7888ed17c121` | Colunas | `skill/references/columns.md` | primeira rodada concluida; casos-limite pendentes |
| `docs/boas-praticas.md` | `9ee86c7a7626c0010fabdd598063a8f86866b287` | heuristicas e boas praticas | `skill/references/best-practices.md` | primeira rodada concluida |
| `docs/glossario.md` | `6a37c5f0366a81f28cb25dc2372b749f17474790` | terminologia geral | `skill/references/terminology.md` | primeira rodada concluida |
| `docs/Utilitarios/automatizacao.md` | `3614714e6edf09c006f046b800b3d8762893eb2b` | pagina publica do Assistente | `skill/references/navigation.md` | placeholder publico; atualizar antes da release |

## Gate de sincronizacao

Antes de uma release:

1. comparar os blobs atuais com os registrados;
2. identificar fontes alteradas;
3. revisar referencias afetadas;
4. revisar casos de teste correspondentes;
5. atualizar `skill/references/version.md`;
6. somente entao empacotar.
