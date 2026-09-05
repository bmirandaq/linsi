# Versionamento da base do Assistente LINSI

## Estado atual

- Assistente: Fase 1 em desenvolvimento
- Branch de trabalho: `assistant-phase-1`
- Fonte conceitual: `docs/` do repositorio `bmirandaq/linsi`

## Snapshot inicial das fontes

| Fonte | Blob SHA observado |
| --- | --- |
| `docs/principios.md` | `c6b4cff372b53768fc74f5413107a3dff39c7f17` |
| `docs/estrutura-linsi/elementos.md` | `a2d90639b308f1b3ccca8bfff973adfc83765042` |
| `docs/estrutura-linsi/caminhos.md` | `05eafc2a8e6de93cf6ad07af6464a4de222237ee` |
| `docs/estrutura-linsi/colunas.md` | `2d190312aba8b2b6b79590ddd32a7888ed17c121` |
| `docs/boas-praticas.md` | `9ee86c7a7626c0010fabdd598063a8f86866b287` |
| `docs/glossario.md` | `6a37c5f0366a81f28cb25dc2372b749f17474790` |

## Regra de release

Antes de gerar release:

1. comparar as fontes atuais com este snapshot;
2. identificar arquivos alterados;
3. revisar referencias operacionais afetadas;
4. atualizar testes;
5. atualizar este arquivo;
6. somente entao empacotar a Skill.

Uma mudanca em `docs/` nao deve deixar a Skill silenciosamente desatualizada.
