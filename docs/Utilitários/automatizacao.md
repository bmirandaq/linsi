---
title: Assistente LINSI
sidebar_position: 8
sidebar_class_name: linsi-sidebar-assistant-beta
slug: /assistente
hide_title: true
---

import MaterialSymbol from '@site/src/components/MaterialSymbol';
import styles from './automatizacao.module.css';

<div className={styles.titleRow}>
  <h1>Assistente LINSI</h1>
  <span className={styles.beta}>Beta</span>
</div>

## O que você pode fazer

<div className={'flow-benefits__grid ' + styles.capabilitiesGrid}>

<article className="flow-benefit">

### Consultar

Tire dúvidas sobre aplicação da LINSI com base na documentação oficial.

<MaterialSymbol name="search" size={24} className="flow-benefit__icon" aria-hidden />

</article>

<article className="flow-benefit">

### Criar

Envie o contexto da experiência, mesmo que incompleto. A Assistente interpreta e propõe pra você.

<MaterialSymbol name="edit_note" size={24} className="flow-benefit__icon" aria-hidden />

</article>

<article className="flow-benefit">

### Revisar

Envie um fluxograma existente. A Assistente revisa a estrutura, aplicação LINSI e clareza da representação.

<MaterialSymbol name="checklist" size={24} className="flow-benefit__icon" aria-hidden />

</article>

</div>

<a className={'button button--primary ' + styles.downloadCta} href="/downloads/assistente-linsi/skill.zip" download>Baixar Skill Assistente LINSI</a>

## Compatibilidade

A Assistente LINSI 0.1-beta é portátil e pode ser usada no ChatGPT, Claude, Codex, Claude Code e outros ambientes compatíveis com Agent Skills.

A forma de instalação e algumas capacidades podem variar conforme o ambiente.

Para CLIs, você pode solicitar a instalação desta forma:

`Instale a skill: https://github.com/bmirandaq/linsi/tree/main/assistant/skill`

## Detalhes da versão

- Consulta à documentação;
- Criação de propostas;
- Output textual estruturado;
- Revisão de fluxogramas, incluindo análise visual quando suportada pelo ambiente.

:::secondary[Próximas fases]

- Output em JSON para materializar a proposta por meio de plugins e integrações;
- Plugin para Figma para importar JSON e gerar o fluxograma LINSI no arquivo.
:::

---

## Encontrou algum problema?

Acesse a página [Contribuir ou pedir ajuda](/contribuir-ajuda) e envie uma mensagem caso você encontre:

- Algum comportamento inesperado, erro ou dificuldade no uso da Assistente;
- Algum caso ou lacuna não coberta pela documentação da LINSI. A Assistente pode te ajudar a preencher o formulário;
- Qualquer outra dúvida pertinente.
