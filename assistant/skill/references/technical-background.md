# Background técnico para diagramas e fluxos

Este arquivo reúne repertório técnico complementar para o Assistente LINSI.

Use-o para melhorar interpretação, proposição, consulta e revisão quando a tarefa envolver elaboração de fluxogramas, diagramas, jornadas, processos, decisões ou disciplinas relacionadas.

Ele **não define a LINSI**. A documentação oficial e as referências operacionais derivadas de `docs/` têm precedência.

As fontes públicas que sustentam esta síntese estão registradas em `public-references.md` pelos IDs `REF-*`.

## Sumário

1. Papel deste background
2. Fundamentos de representação
3. Escopo e nível de detalhe
4. Fluxogramas e process mapping
5. Perspectiva: experiência, operação e sistema
6. User flows, jornadas e mapas de experiência
7. Service blueprint
8. Task analysis
9. Repertório de notações tradicionais
10. Decisões e complexidade decisória
11. Cognição de notações visuais
12. Legibilidade e composição
13. Acessibilidade de diagramas
14. Pensamento sistêmico
15. Como usar referências externas ao responder
16. Checklist operacional

---

# 1. Papel deste background

O Assistente LINSI deve conhecer práticas e conceitos de diagramas sem tratar a LINSI como versão simplificada de outra notação.

Use o repertório externo para:

- compreender melhor o problema que a pessoa está tentando representar;
- reconhecer diferentes tipos de mapa ou diagrama;
- evitar escolher um nível de abstração inadequado;
- identificar quando o material fornecido mistura experiência, operação e tecnologia;
- avaliar clareza, complexidade e legibilidade;
- explicar diferenças entre LINSI e outras abordagens quando a pessoa pedir comparação ou trouxer explicitamente esse repertório;
- reconhecer quando parte do problema excede o que a LINSI pretende representar, para delimitar o recorte sem deformar a notação.

Não use o repertório externo para:

- criar novos Elementos LINSI;
- redefinir Caminhos, Colunas ou Setas;
- exigir simbologia BPMN, UML, ISO ou de outra linguagem;
- declarar uma prática externa como regra oficial da LINSI;
- aumentar formalismo apenas porque outra notação o possui.

Quando houver conflito, preserve a LINSI e trate o conhecimento externo como contexto comparativo.

---

# 2. Fundamentos de representação

Um diagrama é uma representação seletiva. Ele não precisa mostrar tudo que existe no processo real; precisa mostrar o que é necessário para responder à pergunta do artefato.

Antes de modelar, identifique:

1. **Pergunta:** o que precisamos entender, discutir ou decidir?
2. **Perspectiva:** de quem ou de qual sistema observamos o fluxo?
3. **Escopo:** onde a representação começa e termina?
4. **Granularidade:** qual nível de detalhe é necessário?
5. **Entidades relevantes:** pessoas, interfaces, ações, processos, decisões ou outros objetos realmente necessários.
6. **Relações:** o que vem antes/depois, depende de quê, divide-se em quê e converge onde?
7. **Exceções relevantes:** quais desvios mudam a experiência ou o entendimento do fluxo?

Uma representação pode estar factual e ainda assim ser ruim se:

- mistura níveis de detalhe sem intenção;
- mostra informação que não ajuda a pergunta principal;
- esconde decisões importantes;
- força muitas relações em um único plano visual;
- depende de conhecimento implícito para ser lida;
- usa diferenciações visuais sem significado consistente.

Referências: `REF-FLOW-ASQ`, `REF-FLOW-AHRQ`, `REF-FLOW-ISO5807`.

---

# 3. Escopo e nível de detalhe

Escopo e granularidade são decisões diferentes.

- **Escopo** define a extensão da experiência/processo representado.
- **Granularidade** define quanto detalhe é mostrado dentro desse recorte.

Um fluxo pode ser amplo e pouco detalhado, ou estreito e muito detalhado.

## Orientação operacional

Comece pelo menor nível de detalhe capaz de sustentar a conversa ou decisão desejada. Aumente detalhe quando ele revelar algo importante, como:

- uma decisão que muda continuidade;
- um ponto de fricção;
- uma dependência relevante;
- um estado percebido pela pessoa;
- uma diferença entre cenários;
- uma passagem entre canais ou atores que afeta a experiência.

Evite decompor mecanicamente cada tela, clique, chamada de API ou mudança de estado se isso não melhorar entendimento.

Ao revisar um fluxo, pergunte:

- trechos equivalentes estão representados em níveis de detalhe muito diferentes?
- uma parte do fluxo domina visualmente apenas porque está excessivamente detalhada?
- detalhes internos fazem parecer que o processo técnico é mais importante que a experiência?
- a pessoa consegue reconhecer rapidamente o início, os principais desdobramentos e o resultado?

Referências: `REF-FLOW-AHRQ`, `REF-UX-GOV-EXPERIENCE`, `REF-UX-GOV-WHOLE`.

---

# 4. Fluxogramas e process mapping

Fluxogramas normalmente representam sequência e desdobramentos por meio de símbolos conectados. Process maps usam lógica semelhante para tornar um processo observável, discutível e revisável.

Conceitos úteis ao Assistente:

- **início/fim:** limites da representação;
- **atividade/etapa:** algo acontece ou é realizado;
- **decisão:** a continuidade depende de uma condição;
- **fluxo:** relação direcional entre partes;
- **entrada/saída:** informação ou resultado que entra/sai de uma atividade, quando pertinente;
- **subprocesso:** uma atividade pode ocultar complexidade que não precisa ser expandida naquele nível do mapa.

Esses conceitos são genéricos. Não mapear automaticamente um símbolo tradicional para um Elemento LINSI sem consultar a gramática LINSI.

## Boas práticas gerais de processo

- definir limites antes de detalhar;
- representar primeiro o fluxo principal e depois exceções relevantes;
- manter convenções visuais consistentes;
- validar o mapa contra a experiência/processo real, não apenas contra a descrição idealizada;
- decompor quando o diagrama deixa de sustentar leitura útil;
- não confundir ordem espacial com causalidade ou dependência se a relação não estiver expressa.

Referências: `REF-FLOW-ASQ`, `REF-FLOW-AHRQ`, `REF-FLOW-ISO5807`.

---

# 5. Perspectiva: experiência, operação e sistema

Um mesmo serviço pode ser representado por diferentes perspectivas.

## Experiência da pessoa

Perguntas típicas:

- o que a pessoa percebe?
- o que ela tenta realizar?
- com o que interage?
- que decisões ou resultados mudam sua continuidade?
- que canais e pontos de contato fazem parte da experiência?

Esta é a perspectiva prioritária da LINSI.

## Operação

Perguntas típicas:

- que equipes ou papéis sustentam a experiência?
- que processos internos acontecem antes, durante ou depois da interação?
- quais handoffs e dependências operacionais existem?

## Sistema/técnica

Perguntas típicas:

- que serviços, integrações ou componentes executam comportamentos?
- que estados internos existem?
- que eventos ou regras técnicas alteram o funcionamento?

## Regra de interpretação

Não excluir operação ou técnica automaticamente. Incluí-las quando forem necessárias para compreender a experiência ou quando o escopo explicitamente as pedir.

Ao misturar perspectivas, deixar claro o papel de cada uma. O risco não é mostrar backstage ou tecnologia; é permitir que essas camadas apaguem a perspectiva que o artefato deveria priorizar.

Referências: `REF-UX-GOV-WHOLE`, `REF-SD-BLUEPRINT`, `REF-HCD-ISO9241`.

---

# 6. User flows, jornadas e mapas de experiência

Esses termos não são sinônimos.

## User flow

Tende a representar uma sequência relativamente granular de interações necessárias para atingir um objetivo em um produto ou parte dele.

Perguntas úteis:

- quais passos e decisões levam ao objetivo?
- que estados ou alternativas aparecem durante a interação?
- onde o usuário entra e sai desse recorte?

## Journey map

Tende a representar uma experiência mais ampla ao longo do tempo, possivelmente atravessando diferentes canais, momentos e contextos.

Pode incorporar:

- etapas;
- touchpoints;
- ações;
- necessidades;
- pensamentos;
- emoções;
- dores;
- oportunidades.

Nem toda journey precisa conter todas essas camadas.

## Experience map

Pode ampliar ainda mais o recorte, buscando compreender uma experiência ou problema para além de um produto, serviço ou organização específicos.

## Como isso ajuda a LINSI

Não escolher automaticamente a escala da representação porque a pessoa usou a palavra “jornada” ou “flow”. Descobrir qual pergunta ela precisa responder.

A mesma experiência pode ser representada em escalas diferentes sem que uma delas seja “a correta” em absoluto.

Quando um mapa inclui sentimentos, expectativas, oportunidades ou evidências de pesquisa que a gramática LINSI não prevê, tratá-los como contexto, premissa, limite ou material de origem quando relevante. Não criar Elementos LINSI apenas para acomodá-los.

Referências: `REF-UX-NNG-FLOWS`, `REF-UX-NNG-MAPPING`, `REF-UX-GOV-EXPERIENCE`, `REF-UX-GOV-WHOLE`.

---

# 7. Service blueprint

Service blueprint amplia o olhar do fluxo ao relacionar a experiência visível da pessoa com atividades e estruturas que a sustentam.

Conceitos úteis:

- **frontstage:** partes do serviço visíveis ou diretamente experimentadas pela pessoa;
- **backstage:** atividades internas que sustentam a experiência sem serem necessariamente percebidas;
- **linha de visibilidade:** separação conceitual entre o que aparece para a pessoa e o que acontece nos bastidores;
- **atores/áreas:** diferentes participantes responsáveis por partes do serviço;
- **evidências/touchpoints:** manifestações concretas com as quais a pessoa entra em contato.

## Uso pelo Assistente

Quando o contexto fornecido misturar pessoa usuária, atendimento, operação, logística, sistemas e parceiros, o repertório de blueprint ajuda a organizar a análise.

Isso **não significa transformar LINSI em service blueprint**.

Se o contexto exigir representar simultaneamente frontstage, backstage, evidências e estrutura organizacional em profundidade, use esse repertório apenas para separar as camadas e delimitar o que a LINSI consegue representar sem perder a perspectiva da pessoa. Preserve o restante como contexto, premissa, limite ou ponto em aberto quando relevante; não proponha blueprint ou outro artefato como solução alternativa.

Referência: `REF-SD-BLUEPRINT`.

---

# 8. Task analysis

Task analysis procura compreender como uma pessoa alcança um objetivo por meio de tarefas e subtarefas.

Uma distinção importante:

- **objetivo:** resultado que a pessoa deseja atingir;
- **tarefa:** atividade necessária para avançar em direção ao objetivo;
- **interação:** ação específica dentro de uma interface ou sistema.

Hierarchical Task Analysis (HTA) decompõe objetivos em subobjetivos e operações e explicita planos que descrevem como essas partes se relacionam.

## Uso pelo Assistente

Task analysis é especialmente útil quando:

- o contexto está descrito como funcionalidades, não como experiência;
- é preciso descobrir as tarefas reais por trás de telas e requisitos;
- uma ação aparentemente simples esconde subtarefas relevantes;
- o fluxo está detalhando cliques sem deixar claro o objetivo maior.

Não decompor infinitamente. A decomposição deve parar quando o nível atual já sustenta a decisão de design ou a representação desejada.

Referências: `REF-UX-NNG-TASK`, `REF-HTA-BRUNEL`.

---

# 9. Repertório de notações tradicionais

O Assistente deve reconhecer as principais finalidades de outras notações, mas nunca assumir equivalência formal com a LINSI.

## 9.1 BPMN — Business Process Model and Notation

BPMN é uma notação formal voltada à modelagem de processos de negócio.

Conceitos relevantes para repertório:

- eventos representam ocorrências que afetam o processo;
- atividades representam trabalho realizado;
- gateways controlam divergência/convergência de fluxo;
- sequence flows representam ordem dentro de um processo;
- message flows representam comunicação entre participantes distintos;
- pools e lanes ajudam a explicitar participantes e responsabilidades.

### Quando esse repertório ajuda

- contexto com processo operacional complexo;
- múltiplas áreas/atores;
- eventos e exceções de processo;
- comparação entre LINSI e BPMN quando pedida pela pessoa;
- pessoa tentando transpor um BPMN para uma visão de experiência.

### Cuidado

Não converter automaticamente:

- gateway → Condição LINSI;
- lane → Coluna LINSI;
- activity → Processo ou Ação LINSI;
- event → Início/Fim LINSI.

A semelhança visual ou funcional não garante equivalência semântica.

Referência: `REF-BPMN-OMG`.

## 9.2 UML — Unified Modeling Language

UML é uma linguagem de modelagem ampla, composta por diferentes tipos de diagramas para estrutura e comportamento de sistemas.

Repertório mais útil para o Assistente:

- **Activity diagrams:** atividades, controles e fluxo de comportamento;
- **State Machine diagrams:** estados de uma entidade/sistema e transições entre estados;
- **Use Case diagrams:** atores e capacidades/objetivos oferecidos pelo sistema;
- **Interaction/Sequence diagrams:** interação temporal entre participantes/componentes.

### Quando esse repertório ajuda

- distinguir fluxo de interação de mudança de estado;
- reconhecer quando o usuário está apresentando uma visão técnica do sistema;
- explicar por que um diagrama UML pode responder a pergunta diferente de um fluxograma de UX quando a pessoa pedir essa comparação.

### Cuidado

Não falar de “UML” como se fosse um único tipo de fluxograma.

Referência: `REF-UML-OMG`.

## 9.3 DMN — Decision Model and Notation

DMN é voltada à modelagem explícita de decisões e regras de negócio.

Ajuda a reconhecer que uma bifurcação simples e uma lógica decisória complexa são problemas diferentes.

Se uma decisão exige muitas regras, tabelas, dependências e critérios, não tente comprimir toda essa lógica numa Condição LINSI apenas para manter tudo em um único diagrama. A LINSI pode representar o efeito relevante da decisão na experiência. Preserve a lógica interna não representada como contexto, regra de negócio ou limite do recorte, sem tentar comprimi-la numa Condição.

Referência: `REF-DMN-OMG`.

## 9.4 CMMN — Case Management Model and Notation

CMMN aborda cenários menos previsíveis e mais adaptativos, nos quais atividades podem depender do desenvolvimento de um caso e do julgamento de pessoas em vez de uma sequência totalmente prescrita.

Esse repertório é útil para reconhecer que alguns serviços não possuem um único caminho determinístico “correto”.

Ao modelar esse tipo de contexto em LINSI, não invente previsibilidade que o serviço real não possui. Explicite hipóteses, variações e limites do recorte.

Referência: `REF-CMMN-OMG`.

## 9.5 IDEF0

IDEF0 é uma abordagem de modelagem funcional. Em vez de priorizar sequência, foca funções e suas relações com entradas, controles, saídas e mecanismos.

Ajuda o Assistente a reconhecer pedidos que na verdade buscam:

- decomposição funcional;
- entendimento de responsabilidades e controles;
- arquitetura de funcionamento;
- relação entre recursos e resultados.

Esse repertório ajuda a identificar quando parte do contexto excede o recorte que a LINSI consegue representar responsavelmente.

Referência: `REF-IDEF0-NIST`.

---

# 10. Decisões e complexidade decisória

Ao identificar uma decisão, distinguir:

## Decisão de continuidade

Exemplo abstrato:

- condição atendida → continuidade A;
- condição não atendida → continuidade B.

É compatível com representação direta em um fluxo quando o resultado relevante é claro.

## Regra de negócio complexa

Pode envolver:

- vários critérios;
- precedência entre regras;
- exceções;
- tabelas;
- cálculos;
- dependências externas;
- políticas que mudam ao longo do tempo.

O fluxograma não precisa carregar toda a lógica se a experiência só depende do resultado.

## Orientação operacional

Pergunte:

1. a pessoa precisa entender **como** a decisão é calculada ou apenas **o que acontece depois**?
2. as regras são parte da experiência percebida?
3. detalhar a decisão melhora o fluxo ou apenas transfere complexidade externa para ele?

Referência comparativa: `REF-DMN-OMG`.

---

# 11. Cognição de notações visuais

Uma notação não é boa apenas porque suas formas são visualmente agradáveis. Ela precisa permitir que pessoas reconheçam significado, relações e estrutura com esforço proporcional à tarefa.

Dois repertórios são especialmente úteis.

## 11.1 Cognitive Dimensions of Notations

Use estas dimensões como lentes heurísticas, não como regras formais da LINSI:

### Visibilidade

Quão fácil é encontrar e comparar as partes necessárias?

Pergunte:

- relações importantes estão imediatamente disponíveis?
- a pessoa precisa navegar demais para reconstruir uma decisão?

### Dependências ocultas

Uma mudança em uma parte afeta outra sem que essa relação seja visível?

Em diagramas, conexões, agrupamentos e continuidade devem tornar dependências relevantes observáveis.

### Viscosidade

Quanto esforço é necessário para fazer uma alteração coerente?

Estruturas excessivamente rígidas ou repetitivas podem tornar manutenção difícil.

### Consistência

Elementos equivalentes são representados de maneira previsível?

Consistência reduz reaprendizado, mas não exige identidade quando o significado é diferente.

### Expressividade do papel

É possível inferir rapidamente para que serve uma parte da representação?

Uma pessoa deve conseguir distinguir função dos principais tipos sem precisar reinterpretar a legenda a cada ocorrência.

### Compromisso prematuro

A notação força decisões antes de existir informação suficiente?

Esse cuidado é relevante quando o Assistente cria um fluxo a partir de contexto incompleto: não formalizar cedo demais uma hipótese frágil.

### Notação secundária

Espaço, alinhamento, proximidade e outras pistas visuais podem comunicar estrutura mesmo quando não são símbolos formais.

Na LINSI, nunca permitir que uma pista visual informal contradiga o significado formal documentado.

Referência: `REF-COG-CD`.

## 11.2 Princípios de efetividade cognitiva de notações visuais

Use como lentes de avaliação:

### Clareza semiótica

Evitar que um mesmo símbolo represente significados incompatíveis ou que conceitos importantes não tenham representação quando realmente necessária.

### Discriminabilidade perceptiva

Representações com significados diferentes precisam ser distinguíveis com esforço razoável.

### Transparência semântica

Quando possível, a aparência deve ajudar a sugerir o significado em vez de depender exclusivamente de memorização.

### Gestão de complexidade

Quando um diagrama cresce, usar organização, decomposição e abstração para preservar leitura.

### Integração cognitiva

Quando a informação está distribuída em múltiplos diagramas/partes, deve ser possível entender como eles se relacionam.

### Expressividade visual

Usar variáveis visuais com intenção. Diferenças de cor, forma, tamanho, posição ou linha devem carregar significado consistente ou apoiar hierarquia.

### Dual coding

Texto e representação visual podem se complementar quando isso reduz ambiguidade.

### Economia gráfica

Não criar um vocabulário visual maior que o necessário para a tarefa.

### Adequação cognitiva

A representação deve considerar público, finalidade e contexto de uso. Um diagrama para alinhamento executivo e um para implementação detalhada podem exigir níveis diferentes de densidade.

Referência: `REF-COG-PON`.

---

# 12. Legibilidade e composição

Use estes critérios ao revisar qualquer diagrama, inclusive quando não houver uma regra LINSI violada.

## Direção

O fluxo precisa permitir identificar continuidade sem rastreamento excessivo.

Evite mudanças arbitrárias de direção. Uma mudança pode ser legítima quando ajuda a organizar uma bifurcação, retorno ou estrutura maior.

## Cruzamentos

Muitos cruzamentos aumentam esforço de rastreamento e risco de interpretação incorreta.

Antes de aceitar cruzamentos complexos, considerar:

- reorganizar elementos;
- mudar ordem dos Caminhos;
- usar Retomada quando a própria LINSI permitir e isso melhorar leitura;
- decompor o fluxo.

## Proximidade e agrupamento

Proximidade sugere relação. Não colocar visualmente juntos objetos semanticamente independentes sem motivo.

Da mesma forma, não separar tanto objetos relacionados que a continuidade deixe de ser evidente.

## Alinhamento

Alinhamento ajuda leitura e comparação, mas alinhamento por si só não cria relação semântica.

Na LINSI, isso é especialmente importante para Colunas: organização espacial não deve ser interpretada automaticamente como Coluna.

## Densidade

Densidade alta não é erro por si só. Torna-se problema quando prejudica:

- reconhecimento de caminhos;
- leitura de rótulos;
- identificação de relações;
- manutenção;
- comparação entre trechos.

## Hierarquia

A composição deve ajudar a reconhecer:

- o que é principal;
- o que é alternativo/excepcional;
- onde há agrupamento;
- onde há transição significativa;
- onde o fluxo começa e termina.

## Consistência

Use tratamentos equivalentes para funções equivalentes, salvo quando a diferença visual comunica diferença semântica real.

Referências: `REF-COG-CD`, `REF-COG-PON`, `REF-FLOW-AHRQ`.

---

# 13. Acessibilidade de diagramas

Diagramas podem transmitir informação difícil de recuperar por pessoas que não percebem todas as características visuais.

## Não depender apenas de cor

Se a cor diferencia estados, tipos ou resultados, deve existir outra pista suficiente, como:

- forma;
- texto/rótulo;
- posição/contexto;
- padrão de linha, quando adequado.

Isso é especialmente relevante ao revisar sistemas visuais em que verde/vermelho, por exemplo, carregam semântica.

## Diagramas como imagens complexas

Um fluxograma exportado como imagem pode exigir equivalente textual quando publicado em contexto acessível.

O equivalente textual não precisa reproduzir cada pixel. Deve comunicar:

- propósito;
- estrutura essencial;
- principais relações;
- decisões e resultados necessários para compreensão.

O padrão textual da Fase 1 do Assistente pode ajudar a cumprir esse papel, mas não assumir automaticamente que ele satisfaz todos os requisitos de acessibilidade de qualquer contexto de publicação.

## Legibilidade textual

Ao revisar diagramas, considerar também:

- contraste;
- tamanho e legibilidade de rótulos;
- excesso de texto dentro de shapes;
- significado que depende apenas de legenda distante;
- abreviações não explicadas.

Referências: `REF-A11Y-COMPLEX`, `REF-A11Y-COLOR`.

---

# 14. Pensamento sistêmico

Experiências acontecem dentro de sistemas com múltiplos atores, incentivos, restrições e efeitos indiretos.

Esse repertório ajuda o Assistente a não reduzir toda situação a uma sequência linear.

Perguntas úteis:

- quais partes do sistema influenciam a experiência sem aparecer diretamente nela?
- existem dependências externas relevantes?
- há feedback loops ou consequências posteriores ao “fim” aparente do fluxo?
- o problema atravessa diferentes organizações ou serviços?
- uma otimização local pode piorar outra parte da jornada?

## Limite

Pensamento sistêmico não é justificativa para mostrar tudo no mesmo fluxograma.

Use-o para escolher melhor o recorte e identificar relações importantes. Quando parte do sistema exceder o que a LINSI consegue representar responsavelmente, delimite esse limite em vez de sobrecarregar ou estender a notação.

Referências: `REF-SYSTEM-DESIGNCOUNCIL`, `REF-UX-GOV-WHOLE`.

---

# 15. Como usar referências externas ao responder

## Quando o usuário pergunta sobre LINSI

Responder primeiro segundo a documentação oficial da LINSI.

Comparações com outras notações ou métodos só devem entrar quando a pessoa pedir comparação ou trouxer explicitamente esse repertório para a conversa.

Quando houver comparação, usar o repertório externo apenas para esclarecer diferenças. Por exemplo:

- “Em BPMN existe um recurso com função parecida, mas isso não implica equivalência com a LINSI.”

Nunca usar uma fonte externa para corrigir uma regra consolidada da LINSI nem apresentar outra abordagem como solução alternativa.

## Quando o usuário traz repertório geral de diagramas para uma tarefa LINSI

Usar este background para interpretar o material e distinguir linguagem de origem de conceitos LINSI. Depois, voltar às referências oficiais da LINSI para decidir como representar.

## Quando o usuário pede fonte

Consultar `public-references.md` e indicar a fonte legítima correspondente.

Preferir:

1. especificação/organização original;
2. órgão público ou universidade;
3. publicação profissional reconhecida;
4. fonte secundária apenas quando acrescentar algo necessário.

## Quando fontes divergem

Não criar falso consenso. Explique a divergência apenas quando ela for relevante para compreender o material ou a comparação pedida, mantendo a LINSI como referência de solução da Assistente.

---

# 16. Checklist operacional

Ao usar este background para criação ou revisão, confirmar:

1. Qual pergunta o diagrama precisa responder?
2. Qual é a perspectiva principal?
3. O escopo está explícito ou inferível?
4. O nível de detalhe é proporcional?
5. A representação mistura experiência, operação e tecnologia? Se sim, isso é intencional e legível?
6. O material é realmente um user flow, journey, blueprint, processo técnico ou combinação?
7. Decisões complexas estão sendo comprimidas demais em bifurcações simples?
8. A estrutura visual torna dependências e continuidade perceptíveis?
9. Há complexidade gráfica sem ganho de informação?
10. Cor está carregando significado sozinha?
11. Algum conhecimento externo está sendo usado como se fosse regra LINSI?
12. Se o problema excede a LINSI, o recorte foi delimitado sem deformar a notação nem recomendar outro artefato, método ou notação?

Se a resposta a 11 for “sim”, corrija a análise antes de responder.
