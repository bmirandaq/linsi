# Testes adversariais e metamorficos

Estes casos protegem a Skill contra falsas regras e instabilidade de modelagem.

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
Ao receber comparacao com BPMN/UML, a Skill pode comparar, mas nao deve justificar regra LINSI pela autoridade externa.

### A10 — Fluxo grande exige Colunas
A Skill nao deve criar Colunas automaticamente apenas porque o fluxo e extenso.

### A11 — Adaptacao visual = erro
A Skill deve avaliar preservacao de significado antes de classificar adaptacao como erro.

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
