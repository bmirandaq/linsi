# Assistente LINSI

Workspace de desenvolvimento do Assistente LINSI.

## Objetivo da Fase 1

Entregar uma Agent Skill portatil, baseada em texto, capaz de:

1. **Consultar** a LINSI e responder duvidas sobre suas diretrizes.
2. **Criar** propostas de fluxogramas a partir de contexto bruto ou incompleto.
3. **Revisar** fluxogramas existentes considerando experiencia, aplicacao da LINSI e legibilidade.

A Fase 1 nao inclui JSON, plugin Figma, integracao Miro ou automacao de board.

## Fonte de verdade

`docs/` define a LINSI.

`assistant/` operacionaliza a LINSI para consumo por agentes e governa a implementacao do Assistente.

`assistant/skill/` contera apenas o pacote distribuivel da Agent Skill.

A camada de maquina nao pode criar, completar ou reinterpretar silenciosamente a notacao para facilitar a implementacao.

## Roadmap

### Fase 1 — Assistente textual

Consulta, criacao e revisao com output textual padronizado.

### Fase 2 — Figma

Adicionar representacao estruturada, output JSON ou equivalente e plugin Figma.

### Fase 3 — Miro

Reutilizar o mesmo modelo estruturado da Fase 2 em uma integracao especifica para Miro.

Figma e Miro devem implementar a LINSI, nunca definir sua gramatica.

## Governanca

A operacionalizacao deve preservar a diferenca entre definicao, regra, representacao canonica, boa pratica, racional, exemplo, orientacao derivada e questao em aberto.

Toda instrucao normativa relevante deve manter provenance ate sua fonte em `docs/`.

Lacunas conceituais devem ser registradas em `open-questions.md` e nao resolvidas silenciosamente na Skill.

Decisoes consolidadas devem ser registradas em `decisions.md`.

## Estrutura planejada

```text
assistant/
├── README.md
├── source-map.md
├── open-questions.md
├── decisions.md
├── skill/
│   ├── SKILL.md
│   ├── agents/
│   └── references/
└── tests/
```

A estrutura sera criada progressivamente conforme os arquivos adquirirem funcao real.

## Distribuicao

O uso do Assistente nao deve exigir clone completo do repositorio.

A Fase 1 deve prever:

- pacote `skill.zip` para hosts que aceitem upload de Agent Skills;
- instalacao simplificada para Codex CLI;
- instalacao simplificada para Claude Code;
- documentacao de compatibilidade verificada por host.

## Estado

Fase 1 em desenvolvimento na branch `assistant-phase-1`.
