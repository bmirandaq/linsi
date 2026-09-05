---
title: Assistente LINSI
sidebar_position: 8
slug: /assistente
hide_title: true
---

import styles from './automatizacao.module.css';

<div className={styles.titleRow}>
  <h1>Assistente LINSI</h1>
  <span className={styles.beta}>Beta</span>
</div>

<p className={styles.version}>Versão 0.1-beta</p>

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

Suporte oficial nesta Beta:

- ChatGPT – Importar conforme descrito em <a href="https://help.openai.com/pt-br/articles/20001066-skills-in-chatgpt" target="_blank" rel="noopener noreferrer">Skills no ChatGPT</a>
- Codex CLI – Instale com o comando: <code className={styles.installCommand}>python "$HOME/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py" --repo bmirandaq/linsi --ref assistant-phase-1 --path assistant/skill --name linsi-assistant</code>

Itens contemplados:

- Consulta à documentação;
- Criação de propostas;
- Output textual estruturado;
- Revisão de fluxogramas;
- Análise visual quando suportada pelo ambiente.

---

## Encontrou algum problema?

Acesse a página [Contribuir ou pedir ajuda](/contribuir) e envie uma mensagem caso você encontre:

- Algum comportamento inesperado, erro ou dificuldade no uso da Assistente;
- Algum caso ou lacuna não coberta pela documentação da LINSI. A Assistente pode te ajudar a preencher o formulário;
- Qualquer outra dúvida pertinente.

:::secondary[Próximas fases]
- Output em JSON para plugins e integrações;
- Plugin para Figma;
- Integração com Miro.
:::
