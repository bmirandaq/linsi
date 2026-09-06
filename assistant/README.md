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

`assistant/skill/` contem a fonte do pacote distribuivel da Agent Skill.

A camada de maquina nao pode criar, completar ou reinterpretar silenciosamente a notacao para facilitar a implementacao.

## Portabilidade

A Assistente LINSI deve permanecer portatil entre ambientes compativeis com Agent Skills.

O nucleo distribuivel e formado por `SKILL.md`, `references/`, `assets/` e demais recursos independentes de host. Metadados ou adapters especificos de uma plataforma podem coexistir no pacote, mas nao podem ser requisito para o comportamento central da Assistente.

Ecossistemas prioritarios para desenvolvimento, distribuicao e validacao:

- **OpenAI:** ChatGPT e Codex;
- **Anthropic:** Claude e Claude Code.

Compatibilidade com outros hosts pode existir quando eles conseguirem consumir a mesma estrutura, sem que isso implique validacao ou garantia de comportamento identico.

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

## Estrutura

```text
assistant/
├── README.md
├── source-map.md
├── open-questions.md
├── decisions.md
├── skill/
│   ├── SKILL.md
│   ├── agents/
│   │   └── openai.yaml
│   ├── assets/
│   └── references/
└── tests/
```

`agents/openai.yaml` e metadata especifica do ecossistema OpenAI e nao faz parte das regras de funcionamento da LINSI.

## Distribuicao da primeira beta

Versao: `0.1-beta`.

A Skill deve ser distribuida como um unico `skill.zip`, com a pasta raiz `linsi-assistant/`, para preservar uma estrutura portatil entre hosts.

A forma de instalacao pode variar conforme o ambiente. O uso do Assistente nao deve exigir clone completo do repositorio.

## Estado

Fase 1 consolidada como beta `0.1-beta`. A fonte distribuida da Skill fica em `assistant/skill/` na `main`; o workflow de empacotamento gera `skill.zip` para distribuicao e testes nos ambientes prioritarios.
