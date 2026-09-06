# Versionamento da base do Assistente LINSI

## Estado atual

- Assistente: Fase 1 — beta
- Versao: `0.1-beta`
- Fonte distribuida: `assistant/skill/` na `main`
- Suporte oficial inicial: ChatGPT e Codex CLI
- Fonte conceitual: `docs/` do repositorio `bmirandaq/linsi`
- Background tecnico: camada complementar nao normativa em `technical-background.md` + `public-references.md`

## Snapshot atual das fontes LINSI

| Fonte | Blob SHA observado |
| --- | --- |
| `docs/principios.md` | `c6b4cff372b53768fc74f5413107a3dff39c7f17` |
| `docs/estrutura-linsi/elementos.md` | `a2d90639b308f1b3ccca8bfff973adfc83765042` |
| `docs/estrutura-linsi/caminhos.md` | `05eafc2a8e6de93cf6ad07af6464a4de222237ee` |
| `docs/estrutura-linsi/colunas.md` | `2d190312aba8b2b6b79590ddd32a7888ed17c121` |
| `docs/boas-praticas.md` | `9ee86c7a7626c0010fabdd598063a8f86866b287` |
| `docs/glossario.md` | `6a37c5f0366a81f28cb25dc2372b749f17474790` |

## Snapshot do background tecnico

| Artefato | Blob SHA observado |
| --- | --- |
| `references/technical-background.md` | `14b24d2873487b202ab32bd245907dbafacfa05c` |
| `references/public-references.md` | `def8067974ee19ab2a41db1bfd59d9bdbc0f10f9` |

O background tecnico nao integra a fonte conceitual da LINSI. Seu versionamento serve para rastrear mudancas que possam afetar interpretacao, comparacoes ou testes de contaminacao semantica.

## Compatibilidade da beta

A versao `0.1-beta` tem suporte oficial apenas nos hosts validados nesta rodada:

- ChatGPT;
- Codex CLI.

Outros hosts ficam fora do suporte oficial enquanto nao puderem ser testados.

## Regra de release

Para cada release:

1. comparar as fontes LINSI atuais com este snapshot;
2. identificar arquivos alterados;
3. revisar referencias operacionais afetadas;
4. comparar o background tecnico com o snapshot registrado;
5. verificar se mudancas externas introduzem mapeamentos 1:1, obrigacoes, terminologia ou recomendacoes que possam contaminar a LINSI;
6. atualizar testes quando necessario;
7. confirmar que nenhuma regra nova depende apenas de informacao presente em imagem; a auditoria visual aprofundada pode continuar durante a beta, mas nao autoriza inferir regras;
8. validar links oficiais usados pela Skill;
9. atualizar este arquivo se algum snapshot mudar;
10. somente entao empacotar a Skill.

Uma mudanca em `docs/` nao deve deixar a Skill silenciosamente desatualizada. Uma mudanca no background tecnico nao pode adquirir autoridade normativa por repeticao ou conveniencia.
