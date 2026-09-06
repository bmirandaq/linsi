# Referências públicas externas

Última revisão: 2026-09-05

Este arquivo registra as fontes públicas usadas para construir o repertório técnico complementar do Assistente LINSI.

Ele serve para rastreabilidade, manutenção e indicação de leitura. O conhecimento sintetizado para uso offline fica em `technical-background.md`.

## Regra de precedência

As fontes externas ampliam o repertório do Assistente, mas **não definem a LINSI**.

1. A documentação oficial da LINSI é a fonte de verdade sobre a notação.
2. As referências abaixo podem apoiar interpretação, comparação, modelagem e revisão.
3. Nenhuma regra, símbolo ou terminologia de BPMN, UML, ISO, service design ou outra disciplina deve ser importada automaticamente para a LINSI.
4. Quando uma prática externa divergir da LINSI, preservar a LINSI e explicar a diferença quando ela for relevante para a tarefa.

## Política de propriedade intelectual

Disponibilidade pública não significa permissão de redistribuição.

Por padrão, a LINSI armazena somente:

- metadados bibliográficos;
- URL da fonte legítima;
- classificação de acesso/licença;
- síntese original escrita para o Assistente.

Não armazenar no repositório cópias integrais de normas, livros, artigos, templates ou outros materiais protegidos, salvo quando houver licença explícita que permita redistribuição e uma necessidade concreta para isso.

Quando a permissão de reutilização não estiver clara, adotar **link-only** como tratamento conservador.

As classificações abaixo são operacionais e não constituem aconselhamento jurídico.

## Níveis de uso

- **core** — repertório diretamente útil para consulta, criação e revisão.
- **comparative** — ajuda a comparar LINSI com outras linguagens ou métodos sem criar equivalência.
- **adjacent** — disciplina complementar, carregada quando o contexto pedir.
- **reading** — leitura adicional para aprofundamento; não necessária ao funcionamento básico da Skill.

---

# 1. Fundamentos de fluxogramas e processos

## REF-FLOW-ISO5807 — ISO 5807:1985

- **Título:** Information processing — Documentation symbols and conventions for data, program and system flowcharts, program network charts and system resources charts
- **Organização:** International Organization for Standardization — ISO
- **URL:** https://www.iso.org/standard/11955.html
- **Autoridade:** norma internacional / fonte oficial
- **Acesso:** página pública com abstract e amostra; texto integral comercializado pela ISO
- **Reutilização:** `link-only`
- **Papel:** `core`, `comparative`
- **Usar para:** repertório histórico e formal sobre símbolos e convenções de flowcharts; distinção entre diferentes finalidades de diagramas.
- **Não usar para:** impor simbologia ISO à LINSI.

## REF-FLOW-ASQ — What is a Flowchart?

- **Organização:** American Society for Quality — ASQ
- **URL:** https://asq.org/quality-resources/flowchart
- **Autoridade:** referência profissional consolidada
- **Acesso:** artigo público
- **Reutilização:** `link-only`
- **Papel:** `core`
- **Usar para:** escopo e limites de um fluxo, sequência, decisões, revisão do processo e convenções comuns de flowcharts.

## REF-FLOW-AHRQ — Process Mapping: How To Do It

- **Organização:** Agency for Healthcare Research and Quality — U.S. Department of Health and Human Services
- **URL:** https://www.ahrq.gov/cahps/improvement-guide/resource-library/process-mapping.html
- **Autoridade:** órgão público
- **Acesso:** publicação pública
- **Reutilização:** `link-only` por tratamento conservador; verificar eventuais componentes de terceiros antes de reutilizar material literal
- **Papel:** `core`
- **Usar para:** começar pelo macro, aumentar detalhe progressivamente, manter simbologia consistente e validar mapas contra o processo real.

## REF-ABNT-CATALOG — Catálogo oficial ABNT

- **Organização:** Associação Brasileira de Normas Técnicas — ABNT
- **URL:** https://www.abntcatalogo.com.br/pav.aspx
- **URL institucional:** https://abnt.org.br/normalizacao/normas-publicadas/
- **Autoridade:** organismo nacional de normalização
- **Acesso:** consulta pública de catálogo; normas podem exigir aquisição/licença
- **Reutilização:** `link-only`; o catálogo declara direitos reservados
- **Papel:** `adjacent`
- **Usar para:** localizar e verificar normas brasileiras ou adoções de normas internacionais quando uma consulta normativa for necessária.
- **Não usar para:** obter ou redistribuir cópias de normas por fontes não oficiais.

---

# 2. Design centrado nas pessoas

## REF-HCD-ISO9241 — ISO 9241-210:2019

- **Título:** Ergonomics of human-system interaction — Part 210: Human-centred design for interactive systems
- **Organização:** ISO
- **URL:** https://www.iso.org/standard/77520.html
- **Autoridade:** norma internacional / fonte oficial
- **Acesso:** abstract público; texto integral comercializado pela ISO
- **Reutilização:** `link-only`
- **Papel:** `core`, `adjacent`
- **Usar para:** princípios e atividades de human-centred design ao longo do ciclo de vida de sistemas interativos.
- **Não usar para:** apresentar requisitos da norma como regras da LINSI.

---

# 3. Notações formais e tradicionais

## REF-BPMN-OMG — BPMN 2.0.2

- **Título:** Business Process Model and Notation, Version 2.0.2
- **Organização:** Object Management Group — OMG
- **URL:** https://www.omg.org/spec/BPMN/2.0.2
- **Autoridade:** especificação oficial
- **Acesso:** especificação e artefatos oficiais disponíveis publicamente
- **Reutilização:** `link-only`; material possui avisos de copyright
- **Papel:** `core`, `comparative`
- **Usar para:** repertório sobre processos de negócio, eventos, atividades, gateways, sequence/message flows, pools e lanes.
- **Não usar para:** tratar conceitos BPMN como equivalentes formais a Elementos, Caminhos ou Colunas LINSI.

## REF-UML-OMG — UML 2.5.1

- **Título:** Unified Modeling Language, Version 2.5.1
- **Organização:** Object Management Group — OMG
- **URL:** https://www.omg.org/spec/UML/
- **Visão geral oficial:** https://www.omg.org/uml/what-is-uml.htm
- **Autoridade:** especificação oficial
- **Acesso:** especificação oficial disponível publicamente
- **Reutilização:** `link-only`; material possui copyright
- **Papel:** `core`, `comparative`
- **Usar para:** reconhecer UML como família de diagramas e entender, quando pertinente, Activity, State Machine, Use Case e Interaction diagrams.
- **Não usar para:** tratar UML como uma única linguagem de fluxo nem transplantar sua semântica para LINSI.

## REF-DMN-OMG — DMN 1.5

- **Título:** Decision Model and Notation, Version 1.5
- **Organização:** Object Management Group — OMG
- **URL:** https://www.omg.org/spec/DMN/1.5
- **Autoridade:** especificação oficial
- **Acesso:** especificação e artefatos oficiais disponíveis publicamente
- **Reutilização:** `link-only`; material possui avisos de copyright
- **Papel:** `comparative`, `adjacent`
- **Usar para:** distinguir decisão simples em um fluxo de modelagem dedicada de lógica decisória e regras de decisão.

## REF-CMMN-OMG — CMMN 1.1

- **Título:** Case Management Model and Notation, Version 1.1
- **Organização:** Object Management Group — OMG
- **URL:** https://www.omg.org/spec/CMMN/1.1
- **Visão geral oficial:** https://www.omg.org/cmmn/index.htm
- **Autoridade:** especificação oficial
- **Acesso:** especificação pública
- **Reutilização:** `link-only`; material possui copyright
- **Papel:** `comparative`, `adjacent`
- **Usar para:** repertório sobre casos adaptativos e situações menos determinadas por uma sequência fixa de atividades.

## REF-IDEF0-NIST — IDEF0 / FIPS 183

- **Título:** Integration Definition for Function Modeling (IDEF0)
- **Organização:** National Institute of Standards and Technology — NIST
- **Publicação:** Federal Information Processing Standards Publication 183, 1993
- **URL:** https://www.govinfo.gov/app/details/GOVPUB-C13-ba43579ec72306f00c01305771ffdf3b
- **Autoridade:** publicação oficial de órgão público dos EUA
- **Acesso:** publicação disponível pelo GovInfo
- **Reutilização:** `link-only` por tratamento conservador
- **Papel:** `comparative`, `adjacent`
- **Usar para:** distinguir modelagem funcional/decomposição de funções de uma representação essencialmente sequencial da experiência.

---

# 4. User flows, jornadas e UX mapping

## REF-UX-NNG-FLOWS — User Journeys vs. User Flows

- **Autora:** Kate Kaplan
- **Organização:** Nielsen Norman Group — NN/g
- **URL:** https://www.nngroup.com/articles/user-journeys-vs-user-flows/
- **Autoridade:** referência profissional de UX
- **Acesso:** artigo público
- **Reutilização:** `link-only`
- **Papel:** `core`
- **Usar para:** diferenciar visão macro e multicanal de uma jornada de um user flow mais granular e concentrado em interações de produto; entender como as duas escalas podem se complementar.

## REF-UX-NNG-MAPPING — UX Mapping Methods Compared

- **Autora:** Sarah Gibbons
- **Organização:** Nielsen Norman Group — NN/g
- **URL:** https://www.nngroup.com/articles/ux-mapping-cheat-sheet/
- **Autoridade:** referência profissional de UX
- **Acesso:** artigo público
- **Reutilização:** `link-only`
- **Papel:** `core`
- **Usar para:** distinguir empathy map, customer journey map, experience map e service blueprint segundo pergunta, escopo e finalidade.

## REF-UX-NNG-TASK — Task Analysis: Support Users in Achieving Their Goals

- **Autora:** Maria Rosala
- **Organização:** Nielsen Norman Group — NN/g
- **URL:** https://www.nngroup.com/articles/task-analysis/
- **Autoridade:** referência profissional de UX
- **Acesso:** artigo público
- **Reutilização:** `link-only`
- **Papel:** `core`
- **Usar para:** separar objetivo de tarefa, analisar tarefas/subtarefas e reconhecer task analysis como método para compreender como pessoas atingem objetivos.

## REF-UX-GOV-EXPERIENCE — Creating an experience map

- **Organização:** GOV.UK Service Manual
- **URL:** https://www.gov.uk/service-manual/user-research/creating-an-experience-map
- **Autoridade:** orientação oficial de serviço público
- **Acesso:** publicação pública
- **Reutilização:** a maior parte do conteúdo GOV.UK é publicada sob Open Government Licence; manter atribuição e verificar exceções antes de reutilizar material literal
- **Papel:** `core`
- **Usar para:** experiência ao longo do tempo, estágios, touchpoints, canais, pensamentos/sentimentos, síntese progressiva e validação colaborativa.

## REF-UX-GOV-WHOLE — Map and understand a user's whole problem

- **Organização:** GOV.UK Service Manual
- **URL:** https://www.gov.uk/service-manual/design/map-a-users-whole-problem
- **Autoridade:** orientação oficial de serviço público
- **Acesso:** publicação pública
- **Reutilização:** Open Government Licence na maior parte do conteúdo GOV.UK; verificar exceções
- **Papel:** `core`
- **Usar para:** distinguir a transação/produto da tarefa maior da pessoa, mapear jornadas entre organizações e separar perspectiva do serviço de perspectiva do usuário.

---

# 5. Service design

## REF-SD-JOURNEY — Journey Map

- **Organização:** Service Design Tools / oblo.design / participação de POLI.design
- **URL:** https://servicedesigntools.org/tools/journey-map
- **Contexto do projeto:** https://servicedesigntools.org/about
- **Autoridade:** recurso profissional com origem e participação acadêmica
- **Acesso:** público
- **Licença indicada pelo site:** CC BY-NC-ND 2.5
- **Reutilização:** `link-only` e síntese original; não adaptar/republicar conteúdo protegido como derivado
- **Papel:** `core`, `adjacent`
- **Usar para:** jornada a partir da perspectiva da pessoa, touchpoints, obstáculos e camadas de experiência.

## REF-SD-BLUEPRINT — Service Blueprint

- **Organização:** Service Design Tools / oblo.design / participação de POLI.design
- **URL:** https://servicedesigntools.org/tools/service-blueprint
- **Autoridade:** recurso profissional com origem e participação acadêmica
- **Acesso:** público
- **Licença indicada pelo site:** CC BY-NC-ND 2.5
- **Reutilização:** `link-only` e síntese original
- **Papel:** `core`, `adjacent`
- **Usar para:** atores, etapas, relações cross-functional, linha de visibilidade e distinção entre frontstage e backstage.

---

# 6. Task analysis e ergonomia

## REF-HTA-BRUNEL — Hierarchical Task Analysis: Developments, Applications and Extensions

- **Autor:** Neville A. Stanton
- **Ano:** 2006
- **Repositório:** Brunel University Research Archive
- **URL:** https://bura.brunel.ac.uk/handle/2438/1733
- **Publicação original:** Applied Ergonomics, 37(1), 55–79
- **Autoridade:** artigo acadêmico preservado em repositório institucional
- **Acesso:** registro público com postprint disponibilizado pela universidade
- **Reutilização:** `link-only`; não assumir licença de redistribuição além do acesso concedido pelo repositório
- **Papel:** `core`, `adjacent`
- **Usar para:** decomposição hierárquica de objetivos, subobjetivos e tarefas; interface design/evaluation e análise de atividade.

---

# 7. Cognição e design de notações visuais

## REF-COG-CD — Cognitive Dimensions of Notations Resource Site

- **Responsável:** Alan Blackwell, University of Cambridge
- **Origem do framework:** Thomas Green
- **URL:** https://www.cl.cam.ac.uk/~afb21/CognitiveDimensions/
- **Tutorial:** https://www.cl.cam.ac.uk/~afb21/CognitiveDimensions/CDtutorial.pdf
- **Autoridade:** recurso acadêmico hospedado pela University of Cambridge
- **Acesso:** público
- **Reutilização:** `link-only`; não foi identificada licença ampla de redistribuição no recurso consultado
- **Papel:** `core`
- **Usar para:** avaliar usabilidade de notações por lentes como visibilidade, dependências ocultas, viscosidade, consistência, papel dos componentes, abstração e notação secundária.

## REF-COG-PON — Visual syntax does matter

- **Autores:** Daniel L. Moody, Patrick Heymans, Raimundas Matulevičius
- **Título:** Visual syntax does matter: improving the cognitive effectiveness of the i* visual notation
- **Periódico:** Requirements Engineering, 15, 141–175 (2010)
- **URL:** https://link.springer.com/article/10.1007/s00766-010-0100-1
- **Autoridade:** artigo acadêmico peer-reviewed
- **Acesso:** open access
- **Licença indicada:** Creative Commons Attribution Noncommercial (CC BY-NC 2.0)
- **Papel:** `core`
- **Usar para:** repertório sobre clareza semiótica, discriminabilidade perceptiva, transparência semântica, gestão de complexidade, integração cognitiva, expressividade visual, dual coding, economia gráfica e adequação ao usuário/tarefa.
- **Não usar para:** transformar os princípios do framework em regras obrigatórias da LINSI.

---

# 8. Acessibilidade de diagramas

## REF-A11Y-COMPLEX — W3C Complex Images

- **Organização:** W3C Web Accessibility Initiative — WAI
- **URL:** https://www.w3.org/WAI/tutorials/images/complex/
- **Autoridade:** orientação oficial W3C/WAI
- **Acesso:** público
- **Licença:** sujeita à W3C Document License; https://www.w3.org/copyright/document-license-2023/
- **Reutilização:** preferir síntese original; seguir condições da licença ao reproduzir conteúdo
- **Papel:** `core`
- **Usar para:** reconhecer flowcharts e diagramas como imagens complexas e considerar representação textual da informação essencial.

## REF-A11Y-COLOR — WCAG 2.2 — Use of Color

- **Organização:** W3C
- **URL:** https://www.w3.org/WAI/WCAG22/Understanding/use-of-color
- **Especificação:** https://www.w3.org/TR/WCAG22/
- **Autoridade:** padrão/orientação oficial de acessibilidade Web
- **Acesso:** público
- **Licença:** W3C Document License aplicável ao documento
- **Reutilização:** preferir síntese original; respeitar condições de atribuição
- **Papel:** `core`
- **Usar para:** não depender exclusivamente de cor para distinguir informação, estado, ação ou significado.

---

# 9. Pensamento sistêmico

## REF-SYSTEM-DESIGNCOUNCIL — Systemic Design Framework

- **Organização:** Design Council
- **URL:** https://www.designcouncil.org.uk/resources/systemic-design-framework/
- **Autoridade:** framework institucional de design
- **Acesso:** público
- **Licença indicada:** CC BY 4.0
- **Papel:** `adjacent`
- **Usar para:** ampliar visão de relações, consequências, contexto e continuidade sem perder a centralidade da experiência humana.

---

# 10. Leituras complementares e amostras oficiais

Estas fontes podem aprofundar o repertório, mas não precisam ser carregadas para tarefas comuns do Assistente.

## REF-BOOK-DESIGNING-INTERFACES — Designing Interfaces, 3rd Edition

- **Autores:** Jenifer Tidwell, Charles Brewer, Aynne Valencia
- **Editora:** O'Reilly Media
- **URL de preview oficial:** https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/ch01.html
- **Acesso:** preview oficial da editora; livro integral exige acesso/licença
- **Reutilização:** `link-only`
- **Papel:** `reading`
- **Usar para:** relação entre objetivos das pessoas, tarefas, contexto, linguagem de domínio e desenho de interfaces.

## REF-BOOK-IA — Information Architecture, 4th Edition

- **Autores:** Louis Rosenfeld, Peter Morville, Jorge Arango
- **Editora:** O'Reilly Media
- **URL de preview oficial:** https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch01.html
- **Acesso:** preview oficial da editora; livro integral exige acesso/licença
- **Reutilização:** `link-only`
- **Papel:** `reading`, `adjacent`
- **Usar para:** organização, coerência, contexto, conteúdo, usuários e pensamento sistêmico aplicado a ambientes de informação.

## REF-BOOK-SERVICE-DESIGN — Service Design, 2nd Edition — sample chapter

- **Autores:** Lavrans Løvlie, Andy Polaine, Ben Reason
- **Editora:** Rosenfeld Media
- **Ano:** 2025
- **URL da amostra oficial:** https://rosenfeldmedia.com/sample-chapter-service-design-2nd-edition/
- **Acesso:** capítulo-amostra disponibilizado oficialmente pela editora
- **Reutilização:** `link-only`
- **Papel:** `reading`, `adjacent`
- **Usar para:** aprofundamento em service design e visão do serviço além de uma interface isolada.

---

# Manutenção

Ao atualizar esta base:

1. preferir a fonte original à fonte que comenta a fonte;
2. verificar se a URL continua legítima e acessível;
3. verificar versão/data quando a fonte for normativa ou evolutiva;
4. registrar mudanças relevantes em `technical-background.md`;
5. não substituir silenciosamente uma fonte por outra com autoridade menor;
6. não adicionar material cuja procedência ou direito de disponibilização seja duvidoso;
7. quando uma licença mudar ou estiver ambígua, rebaixar o tratamento para `link-only` até nova verificação.
