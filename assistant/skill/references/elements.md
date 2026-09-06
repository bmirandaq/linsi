# Elementos — referencia operacional

Fonte primaria: `docs/estrutura-linsi/elementos.md`

Este arquivo operacionaliza os Elementos sem alterar sua semantica.

## Seta

### ELEM-ARROW-001 — Funcao
- **Tipo:** definition
- **Status:** canonical
- **Fonte:** `docs/estrutura-linsi/elementos.md#seta`

Seta conecta Elementos e indica direcao de leitura do fluxo.

### ELEM-ARROW-002 — Tipos
- **Tipo:** rule + canonical-representation
- **Status:** canonical

- **Comum:** continuidade sem significado especifico; cor cinza.
- **Positiva:** sucesso, resultado favoravel ou continuidade bem-sucedida; cor verde.
- **Negativa:** falha, erro, impedimento ou resultado desfavoravel; cor vermelha.
- **Alternativa:** possibilidade secundaria, alternativa ao Caminho principal; cor laranja.

Escolher pelo significado da continuidade, nao por destaque visual.

### ELEM-ARROW-003 — Comum como padrao
- **Tipo:** rule
- **Status:** canonical

Quando a continuidade nao for claramente positiva, negativa ou alternativa, usar Seta Comum.

### ELEM-ARROW-004 — Rotulos
- **Tipo:** rule + good-practice
- **Status:** canonical

Rotulos sao opcionais, exceto em Setas que saem de uma Condicao.

Nas saidas de Condicao, o rotulo deve responder diretamente a pergunta da Condicao.

Como boa pratica, manter rotulos proximos ao Elemento de origem e preferir trechos horizontais quando possivel.

### ELEM-ARROW-005 — "Sim" nao implica Positiva
- **Tipo:** rule
- **Status:** canonical

Nao classificar uma Seta como Positiva apenas porque seu rotulo e `Sim`. Classificar pelo significado do resultado.

## Interface

### ELEM-INT-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa aquilo que esta disponivel para a pessoa usuaria em um ponto de contato: o que ela ve, le ou percebe e as acoes disponiveis.

### ELEM-INT-002 — Conteudo
- **Tipo:** rule
- **Status:** canonical

Uma Interface pode reunir ate tres partes:

- Titulo;
- Conteudo;
- Acoes.

Nao exigir que as tres estejam sempre presentes.

### ELEM-INT-003 — Possibilidade x realizacao
- **Tipo:** rule
- **Status:** canonical

Acoes descritas dentro de Interface representam possibilidades disponiveis.

Para mostrar qual acao foi efetivamente realizada em um Caminho, usar Elemento Acao.

### ELEM-INT-004 — Tela
- **Tipo:** definition + canonical-representation
- **Status:** canonical

Interface do tipo Tela representa o contexto principal naquele momento, como uma pagina ou tela.

Representacao canonica: retangulo com borda cinza.

### ELEM-INT-005 — Janela
- **Tipo:** definition + canonical-representation
- **Status:** canonical

Interface do tipo Janela apresenta conteudo transitorio sobre uma Tela sem substitui-la, como modal, drawer ou popover.

Representacao canonica: retangulo com borda cinza tracejada.

## Processo

### ELEM-PROC-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa algo executado pelo sistema, como consequencia de uma acao da pessoa ou de forma automatica.

### ELEM-PROC-002 — Processo x reflexo percebido
- **Tipo:** rule
- **Status:** canonical

Um Processo pode acontecer sem que a pessoa o perceba.

Quando produzir um resultado visivel, representar esse reflexo com Interface quando ele for relevante para a experiencia.

Nao fundir automaticamente Processo e Interface: um representa execucao do sistema; o outro, aquilo que fica disponivel/perceptivel para a pessoa.

### ELEM-PROC-003 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Retangulo com fundo cinza.

## Acao

### ELEM-ACT-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa uma acao efetivamente realizada pela pessoa durante o fluxo.

### ELEM-ACT-002 — Rotulo
- **Tipo:** good-practice
- **Status:** canonical

Quando aplicavel, usar o mesmo rotulo da interface. Preferir textos diretos no infinitivo.

### ELEM-ACT-003 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Capsula laranja.

## Condicao

### ELEM-COND-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa uma verificacao que pode abrir dois ou mais Caminhos.

### ELEM-COND-002 — Redacao
- **Tipo:** rule
- **Status:** canonical

Escrever como pergunta direta.

### ELEM-COND-003 — Saidas
- **Tipo:** rule
- **Status:** canonical

Rotular todas as Setas que saem da Condicao com respostas diretas a pergunta ou nomes dos resultados possiveis.

### ELEM-COND-004 — Inferencia operacional
- **Tipo:** derived-guidance
- **Status:** canonical-source / operationalized

Ao identificar uma verificacao que produz continuidades diferentes, considerar Condicao. Nao transformar toda bifurcacao em Condicao sem avaliar se ha de fato uma verificacao representada.

### ELEM-COND-005 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Losango com fundo azul.

## Inicio

### ELEM-START-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa o ponto de partida do fluxo.

### ELEM-START-002 — Opcionalidade
- **Tipo:** rule
- **Status:** canonical

Pode ser dispensado quando o ponto de partida ja estiver claro pelo contexto.

### ELEM-START-003 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Hexagono concavo rosa orientado para a direita.

## Fim

### ELEM-END-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Representa o ponto em que um Caminho ou a jornada apresentada se encerra.

### ELEM-END-002 — Opcionalidade
- **Tipo:** rule
- **Status:** canonical

Pode ser dispensado quando o encerramento ja estiver claro. E especialmente util quando e necessario deixar explicito que nao ha continuidade ou quando Caminhos terminam em pontos distintos.

### ELEM-END-003 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Paralelogramo preto.

## Retomada

### ELEM-RESUME-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Indica que o Caminho continua em outro ponto ja representado sem estender uma conexao direta pelo fluxograma.

### ELEM-RESUME-002 — Quando usar
- **Tipo:** good-practice
- **Status:** canonical

Considerar quando o destino estiver em outro fluxo/jornada ou quando uma conexao distante comprometer a leitura.

### ELEM-RESUME-003 — Identificacao do destino
- **Tipo:** rule
- **Status:** canonical

O texto deve identificar claramente o destino. Quando disponivel em outra pagina ou arquivo, incluir link.

### ELEM-RESUME-004 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Paralelogramo cinza.

## Nota

### ELEM-NOTE-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Acrescenta contexto necessario para compreender o fluxograma, mas nao representa uma etapa da experiencia.

### ELEM-NOTE-002 — Limite
- **Tipo:** rule
- **Status:** canonical

Nota nao deve substituir algo que poderia ser representado por outro Elemento.

### ELEM-NOTE-003 — Conteudos comuns
- **Tipo:** example
- **Status:** canonical

Pode registrar regra de negocio, restricao tecnica, racional, limitacao de integracao ou outro contexto relevante.

### ELEM-NOTE-004 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Retangulo com fundo ciano-claro e borda tracejada.

## Comentario

### ELEM-COMMENT-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Registra duvida ou ponto em aberto.

### ELEM-COMMENT-002 — Comentario x Nota
- **Tipo:** rule
- **Status:** canonical

Nota documenta contexto ja definido. Comentario sinaliza algo ainda a discutir ou resolver.

### ELEM-COMMENT-003 — Ferramenta nativa
- **Tipo:** good-practice
- **Status:** canonical

Pode ser dispensado quando a ferramenta utilizada oferecer comentario nativo adequado.

### ELEM-COMMENT-004 — Representacao
- **Tipo:** canonical-representation
- **Status:** canonical

Quadrado amarelo semelhante a post-it.

## Forma e conteudo

### ELEM-VIS-001 — Diferenciacao
- **Tipo:** rule
- **Status:** canonical

Preservar a diferenciacao das formas propostas pela LINSI. Se houver adaptacao, indicar nas legendas do artefato.

A avaliacao de adaptacoes deve distinguir significado semantico de representacao canonica.

### ELEM-VIS-002 — Alinhamento de texto
- **Tipo:** good-practice
- **Status:** canonical

Textos curtos podem ser centralizados. Conteudos extensos devem preferencialmente ficar alinhados a esquerda para legibilidade.

## Fronteiras semanticas obrigatorias

Ao criar ou revisar, verificar especialmente:

- Interface nao e Acao;
- Processo nao e Interface;
- possibilidade de acao dentro da Interface nao e Acao efetivamente realizada;
- Nota nao e etapa do fluxo;
- Comentario nao e contexto consolidado;
- `Sim` nao significa automaticamente Seta Positiva;
- Seta Alternativa nao deve ser usada apenas para dar destaque visual.
