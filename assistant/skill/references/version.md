# Versionamento da base do Assistente LINSI

## Estado atual

- Assistente: Fase 1 em desenvolvimento
- Branch de trabalho: `assistant-phase-1`
- Fonte conceitual: `docs/` do repositorio `bmirandaq/linsi`
- Background tecnico: camada complementar nao normativa em `technical-background.md` + `public-references.md`

## Snapshot inicial das fontes LINSI

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
| `references/technical-background.md` | `633e401cdf88f642dc762c1d625b18b094a6fe36` |
| `references/public-references.md` | `def8067974ee19ab2a41db1bfd59d9bdbc0f10f9` |

O background tecnico nao integra a fonte conceitual da LINSI. Seu versionamento serve para rastrear mudancas que possam afetar interpretacao, comparacoes ou testes de contaminacao semantica.

## Regra de release

Antes de gerar release:

1. comparar as fontes LINSI atuais com este snapshot;
2. identificar arquivos alterados;
3. revisar referencias operacionais afetadas;
4. comparar o background tecnico com o snapshot registrado;
5. verificar se mudancas externas introduzem mapeamentos 1:1, obrigacoes ou terminologia que possam contaminar a LINSI;
6. atualizar testes quando necessario;
7. atualizar este arquivo;
8. somente entao empacotar a Skill.

Uma mudanca em `docs/` nao deve deixar a Skill silenciosamente desatualizada. Uma mudanca no background tecnico nao pode adquirir autoridade normativa por repeticao ou conveniencia.
