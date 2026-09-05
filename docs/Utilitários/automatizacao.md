---
title: Assistente LINSI
sidebar_position: 8
sidebar_class_name: linsi-sidebar-assistant-beta
slug: /assistente
hide_title: true
---

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

<span className="material-symbols-outlined flow-benefit__icon" aria-hidden="true">search</span>

</article>

<article className="flow-benefit">

### Criar

Envie o contexto da experiência, mesmo que incompleto. A Assistente interpreta e propõe pra você.

<span className="material-symbols-outlined flow-benefit__icon" aria-hidden="true">edit_note</span>

</article>

<article className="flow-benefit">

### Revisar

Envie um fluxograma existente. A Assistente revisa a estrutura, aplicação LINSI e clareza da representação.

<span className="material-symbols-outlined flow-benefit__icon" aria-hidden="true">checklist</span>

</article>

</div>

<span className={'button button--primary ' + styles.downloadCta} aria-disabled="true">Baixar Skill Assistente LINSI</span>

## Detalhes da versão

Suporte oficial nesta versão 0.1-beta:

- ChatGPT – Importar conforme descrito em <a href="https://help.openai.com/pt-br/articles/20001066-skills-in-chatgpt" target="_blank" rel="noopener noreferrer">Skills no ChatGPT</a>
- Codex CLI – Comando: `codex "Instale a Skill: https://linsi.beamiranda.com.br/assistant"`

Itens contemplados:

- Consulta à documentação;
- Criação de propostas;
- Output textual estruturado;
- Revisão de fluxogramas;
- Análise visual quando suportada pelo ambiente.

:::secondary[Próximas fases]
- Output em JSON para plugins e integrações;
- Plugin para Figma;
- Integração com Miro.
:::

---

## Encontrou algum problema?

Acesse a página [Contribuir ou pedir ajuda](/contribuir) e envie uma mensagem caso você encontre:

- Algum comportamento inesperado, erro ou dificuldade no uso da Assistente;
- Algum caso ou lacuna não coberta pela documentação da LINSI. A Assistente pode te ajudar a preencher o formulário;
- Qualquer outra dúvida pertinente.
