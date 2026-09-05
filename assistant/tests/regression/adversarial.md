# Testes adversariais e metamorficos

Estes casos protegem a Skill contra falsas regras, contaminacao por repertorio externo e instabilidade de modelagem.

## Falsas regras obrigatorias

### A01 — Sim = Positiva
A Skill deve rejeitar a inferencia de que toda Seta rotulada `Sim` e Positiva.

### A02 — Alinhamento horizontal = Caminho
A Skill nao deve reconhecer Caminho apenas por alinhamento horizontal.

### A03 — Alinhamento vertical = Coluna
A Skill nao deve reconhecer Coluna apenas por alinhamento vertical.

### A04 — Opcao = Acao realizada
A Skill deve distinguir Acao disponivel dentro da Interface de Elemento Acao efetivamente realizado.

### A05 — Processo = reflexo percebido
A Skill deve distinguir execucao do sistema de seu resultado perceptivel.

### A06 — Nota substitui Elemento
A Skill deve rejeitar Nota como substituto de acontecimento que pertence ao fluxo.

### A07 — Comentario = Nota
A Skill deve distinguir contexto definido de ponto ainda em aberto.

### A08 — Exemplo = regra
Variar exemplos visuais/textuais nao pode criar obrigatoriedade inexistente.

### A09 — BPMN define LINSI
Ao receber comparacao com BPMN/UML, a Skill pode comparar se isso tiver sido explicitamente pedido, mas nao deve justificar regra LINSI pela autoridade externa.

### A10 — Fluxo grande exige Colunas
A Skill nao deve criar Colunas automaticamente apenas porque o fluxo e extenso.

### A11 — Adaptacao visual = erro
A Skill deve avaliar preservacao de significado antes de classificar adaptacao como erro.

### A12 — Lane = Coluna
Ao receber um BPMN com lanes, a Skill nao deve converter lanes automaticamente em Colunas. Deve analisar a funcao concreta dos agrupamentos segundo a LINSI.

### A13 — Gateway = Condicao
Ao receber gateway BPMN ou decisao UML, a Skill nao deve converte-lo automaticamente em Condicao. Deve verificar se o caso concreto representa uma verificacao que abre continuidades relevantes.

### A14 — Activity = Processo
Uma activity externa nao deve virar Processo por nome ou shape. Pode corresponder a Acao, Processo, Interface ou sequer precisar ser representada, conforme seu papel na experiencia.

### A15 — Heuristica externa = regra LINSI
Cognitive Dimensions, principios de efetividade cognitiva, WCAG, service design e outras referencias podem gerar recomendacoes ou apoiar analise, mas nao devem ser apresentadas como regras LINSI sem suporte da documentacao oficial.

### A16 — Assistente recomenda outro artefato
Mesmo quando reconhecer que o contexto se parece com journey map, blueprint, BPMN, UML, DMN ou outro metodo, a Skill nao deve recomendar, encaminhar ou propor outro artefato como solucao. Deve trabalhar apenas com LINSI e delimitar o recorte que pode representar responsavelmente.

### A17 — Termo externo vira sinonimo oficial
O uso repetido de `lane`, `gateway`, `state`, `activity`, `frontstage` ou outro termo externo nao deve incorpora-lo como sinonimo oficial de conceito LINSI.

## Testes metamorficos

### M01 — Reformulacao
Fornecer o mesmo contexto em duas redacoes diferentes. A estrutura central proposta deve permanecer semanticamente equivalente.

### M02 — Ruido
Adicionar informacao irrelevante ao briefing. A estrutura central nao deve mudar sem necessidade.

### M03 — Ordem dos fatos
Reordenar os fatos do briefing. O Assistente nao deve confundir ordem da descricao com ordem da experiencia.

### M04 — Detalhamento secundario
Adicionar detalhes secundarios. O Assistente nao deve expandir escopo automaticamente.

### M05 — Sinonimos
Trocar termos informais por equivalentes. A Skill deve manter o mesmo conceito e responder com terminologia LINSI quando apropriado.

### M06 — Boa pratica removida
Apresentar duas versoes semanticamente equivalentes, uma menos elegante visualmente. A segunda pode receber recomendacao, mas nao deve ser classificada como semanticamente incorreta sem regra correspondente.

### M07 — Mesma experiencia em notacoes diferentes
Fornecer a mesma experiencia em texto e em uma descricao BPMN/UML equivalente. A modelagem LINSI resultante deve ser guiada pelo significado da experiencia, nao pela simbologia de origem.

### M08 — Background ausente x presente
Para caso simples integralmente coberto pela LINSI, carregar ou nao o background tecnico nao deve mudar a regra aplicada nem introduzir formalismo adicional.
