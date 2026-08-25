---
sidebar_position: 4
title: Elementos
---
# Elementos

Elementos são as unidades visuais da LINSI. Cada Elemento possui uma função. A forma, cor e conteúdo trabalham em conjunto para tornar a função reconhecível.

Use apenas os Elementos necessários para que a experiência seja compreendida no fluxograma.

## Seta
---

Conecta os elementos e indica a direção de leitura do fluxo.

![Setas Comum, Alternativa, Positiva e Negativa](/img/uploads/setas.png)

### Tipos de seta

- **Comum:** representa uma continuidade sem atribuir a ela um significado específico. Usa a cor cinza.
- **Positiva:** representa o sucesso, resultado favorável ou uma continuidade bem-sucedida. Usa a cor verde.
- **Negativa:** falha, erro, impedimento ou resultado desfavorável. Usa a cor vermelha.
- **Alternativa:** possibilidade secundária, alternativa ao Caminho principal. Usa a cor laranja.

Escolha o tipo de seta pelo significado da continuidade, não apenas pelo destaque visual. Uma resposta 'Sim', por exemplo, não torna uma seta automaticamente Positiva. Depende do significado daquele resultado no fluxo.

Quando não houver um resultado claramente positivo, negativo ou alternativo, use a seta Comum.

Os rótulos nas linhas das setas são opcionais, exceto nas setas que saem de uma Condição.

## Interface
---

Representa aquilo que está disponível para a pessoa usuária em um ponto de contato do fluxo: o que ela vê, lê ou percebe e as ações que tem à disposição.

![Estrutura do conteúdo de uma Interface do tipo Tela](/img/uploads/interface-tela.png)

### Estrutura do conteúdo

O elemento Interface pode reunir até 3 partes:

- **Título:** nomeia a etapa, estado ou cenário representado.
- **Conteúdo:** descreve o que está visível, disponível ou perceptível.
- **Ações:** apresenta o que a pessoa pode fazer naquele momento.

As Ações descritas dentro de uma Interface representam possibilidades disponíveis. Para demonstrar qual delas foi efetivamente realizada em um Caminho, use o elemento Ação.

### Tipos de Interface

Em fluxos digitais, a Interface pode assumir 2 tipos:

- **Tela:** ocupa o contexto principal naquele momento, é uma página ou tela. É representada por um retângulo com borda cinza.
- **Janela:** apresenta um conteúdo transitório sobre uma Tela sem substituí-la, como modal, drawer ou popover. É representada por um retângulo com borda cinza tracejada.

![Estrutura do conteúdo de uma Janela modal](/img/uploads/interface-janela-1.png)

![Estrutura do conteúdo de uma Janela de filtros](/img/uploads/interface-janela-2.png)



## Processo

---

Representa algo executado pelo sistema, seja como consequência de uma ação da pessoa ou de forma automática.

![Exemplo de Processo](/img/uploads/processo.png)

O Processo pode acontecer sem que a pessoa o perceba. Quando oferecer um resultado visível, use uma Interface para representar o reflexo dessa execução na experiência.

![Processo seguido da Interface que apresenta seu reflexo](/img/uploads/processo-interface-tela.png)

É representado por um retângulo com fundo cinza.



## Ação

---

Representa uma ação efetivamente realizada pela pessoa durante o fluxo. Geralmente corresponde a uma das possibilidades apresentadas na Interface anterior.

![Exemplo de Ação](/img/uploads/acao.png)

Quando aplicável, use o mesmo rótulo apresentado no botão, link ou controle da interface. Prefira textos diretos e no infinitivo como 'Finalizar pedido', 'Editar cadastro' ou 'Acessar detalhes'.

É representada por uma cápsula laranja.



## Condição

---

Representa uma verificação que pode abrir 2 ou mais Caminhos.

![Condição com setas rotuladas como Sim e Não](/img/uploads/condicao.png)

O texto da Condição deve ser escrito como uma pergunta direta. Exemplos:

- 'Endereço de entrega cadastrado?'
- 'Pagamento autorizado?'
- 'Qual perfil foi identificado?'

As setas que saem da Condição devem sempre receber rótulos que respondam diretamente à pergunta, como `Sim` e `Não`, `Autorizado` e `Recusado` ou os nomes dos diferentes resultados possíveis.

É representada por um losango com fundo azul.



## Início

---

Representa o ponto de partida do fluxo.

![Exemplo de Início](/img/uploads/inicio.png)

Pode ser dispensado quando o ponto de partida já estiver claro pelo contexto, como quando a primeira Interface do tipo Tela já cumpre essa função.

É representado por um hexágono côncavo rosa, orientado para a direita.



## Fim

---

Representa o ponto em que um Caminho ou a jornada apresentada se encerra.

![Exemplo de Fim](/img/uploads/fim.png)

É especialmente útil quando for necessário deixar explícito que não há outra continuidade ou quando Caminhos terminarem em pontos distintos.

Pode ser dispensado quando o encerramento já estiver claro pelo contexto.

É representado por um paralelogramo preto.



## Retomada

---

Indica que o Caminho continua em outro ponto já representado, sem estender uma conexão direta pelo fluxograma.

![Exemplo de Retomada](/img/uploads/retomada.png)

Pode ser usada quando a continuidade estiver em outro fluxo, jornada ou quando inserir uma conexão distante pode comprometer a leitura do fluxograma.

O texto deve identificar claramente o destino. Quando ele estiver disponível em outra página ou arquivo, insira o link.

![Retomada com link para outro fluxo](/img/uploads/retomada-link.png)

É representada por um paralelogramo cinza.



## Nota

---

Acrescenta um contexto necessário para compreender o fluxograma, mas não representa uma etapa da experiência.

![Exemplo de Nota longa](/img/uploads/nota.png)

Pode registrar regras de negócio, restrições técnicas, racionais de decisão, limitações de integração ou outras informações relevantes para a leitura.

Alinhe o texto de notas mais extensas à esquerda para facilitar a leitura. Notas curtas podem ter o texto centralizado.

![Exemplo de Nota curta](/img/uploads/nota-curta.png)

A Nota deve contextualizar o fluxo, **não substituir algo que poderia ser representado por outro elemento.**

É representada por um retângulo com fundo ciano-claro e borda tracejada.



## Comentário

---

Registra uma dúvida ou um ponto em aberto do fluxograma.

![Exemplo de Comentário](/img/uploads/comentario.png)

Diferente da Nota, que documenta um contexto já definido, o Comentário sinaliza algo que ainda precisa ser discutido ou resolvido.

É representado por um quadrado amarelo como um post-it.

Pode ser dispensado quando a ferramenta utilizada oferecer função nativa de comentários, como o próprio Figma.

![Comentário feito com o recurso nativo do Figma](/img/uploads/comentario-nativo.png)



## Relação entre Elementos e Caminhos
---

Até aqui, você entendeu como os Elementos pontuam e explicam acontecimentos ao longo do fluxograma. Os Caminhos mostram como esses Elementos se conectam em sequência, formando as diferentes continuidades possíveis.

Aprenda sobre Caminhos na próxima página.