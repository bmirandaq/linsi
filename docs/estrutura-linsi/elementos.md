---
sidebar_position: 4
title: Elementos
---
Elementos são as unidades visuais da LINSI. Cada Elemento possui uma função. A forma, cor e conteúdo trabalham em conjunto para tornar a função reconhecível.

Use apenas os Elementos necessários para que a experiência seja compreendida no fluxograma.

## Seta

---

Conecta os elementos e indica a direção de leitura do fluxo.

![Setas Comum, Alternativa, Positiva e Negativa](/img/uploads/Elementos/setas.png)

### Tipos de seta
---

- **Comum:** indica continuidade sem atribuir um significado específico. Usa a cor cinza.
- **Positiva:** sucesso, resultado favorável ou continuidade bem-sucedida. Usa a cor verde.
- **Negativa:** falha, erro, impedimento ou resultado desfavorável. Usa a cor vermelha.
- **Alternativa:** uma possibilidade secundária em relação ao Caminho principal. Usa a cor laranja.

Escolha o tipo de Seta pelo significado da continuidade. Quando não houver um resultado claramente positivo, negativo ou alternativo, use a Seta Comum.

Uma resposta “Sim” não torna a Seta automaticamente Positiva. O tipo depende do que essa resposta significa naquele ponto do fluxo.

### Rótulos nas Setas
---

Os rótulos são opcionais, exceto nas Setas que saem de uma Condição. Nesse caso, devem responder diretamente à pergunta da Condição.

Mantenha os rótulos próximos aos Elementos de origem para facilitar a identificação de cada saída. Sempre que possível, posicione-os em trechos horizontais da linha e evite curvas ou cruzamentos.

### Organização das Setas
---

Evite cruzamentos entre Setas e priorize conexões simples, fáceis de acompanhar.

Quando uma conexão distante comprometer a leitura, use o Elemento Retomada para indicar a continuidade sem estender a Seta pelo fluxograma.


## Interface

---

Representa aquilo que está disponível para a pessoa usuária em um ponto de contato do fluxo: o que ela vê, lê ou percebe e as ações que tem à disposição.

![Estrutura do conteúdo de uma Interface do tipo Tela](/img/uploads/Elementos/interface-tela.png)

### Estrutura do conteúdo

---

O elemento Interface pode reunir até 3 partes:

- **Título:** nomeia a etapa, estado ou cenário representado.
- **Conteúdo:** descreve o que está visível, disponível ou perceptível.
- **Ações:** apresenta o que a pessoa pode fazer naquele momento.

As Ações descritas dentro de uma Interface representam possibilidades disponíveis. Para demonstrar qual delas foi efetivamente realizada em um Caminho, use o elemento Ação.

### Interface do tipo Tela

---

Contexto principal naquele momento, é uma página ou tela. Exemplo exibido mais acima. 

É representada por um retângulo com borda cinza.

### Interface do tipo Janela

---

Apresenta um conteúdo transitório sobre uma Tela sem substituí-la, como modal, drawer ou popover. 

É representada por um retângulo com borda cinza tracejada.

![Estrutura do conteúdo de uma Janela modal](/img/uploads/Elementos/interface-janela-1.png)

![Estrutura do conteúdo de uma Janela de filtros](/img/uploads/Elementos/interface-janela-2.png)

Em screenflows, o protótipo passa a cumprir a função do Elemento **Interface**.

[img-example]



## Processo

---

Representa algo executado pelo sistema, seja como consequência de uma ação da pessoa ou de forma automática.

![Exemplo de Processo](/img/uploads/Elementos/processo.png)

O Processo pode acontecer sem que a pessoa o perceba. Quando oferecer um resultado visível, use uma Interface para representar o reflexo dessa execução na experiência.

![Processo seguido da Interface que apresenta seu reflexo](/img/uploads/Elementos/processo-interface-tela.png)

É representado por um retângulo com fundo cinza.



## Ação

---

Representa uma ação efetivamente realizada pela pessoa durante o fluxo. Geralmente corresponde a uma das possibilidades apresentadas na Interface anterior.

![Exemplo de Ação](/img/uploads/Elementos/acao.png)

Quando aplicável, use o mesmo rótulo apresentado no botão, link ou controle da interface. Prefira textos diretos e no infinitivo como 'Finalizar pedido', 'Editar cadastro' ou 'Acessar detalhes'.

É representada por uma cápsula laranja.



## Condição

---

Representa uma verificação que pode abrir 2 ou mais Caminhos.

![Condição com setas rotuladas como Sim e Não](/img/uploads/Elementos/condicao.png)

O texto da Condição deve ser escrito como uma pergunta direta. Exemplos:

- 'Endereço de entrega cadastrado?'
- 'Pagamento autorizado?'
- 'Qual perfil foi identificado?'

As setas que saem da Condição devem sempre receber rótulos que respondam diretamente à pergunta, como `Sim` e `Não`, `Autorizado` e `Recusado` ou os nomes dos diferentes resultados possíveis.

É representada por um losango com fundo azul.



## Início

---

Representa o ponto de partida do fluxo.

![Exemplo de Início](/img/uploads/Elementos/inicio.png)

Pode ser dispensado quando o ponto de partida já estiver claro pelo contexto, como quando a primeira Interface do tipo Tela já cumpre essa função.

É representado por um hexágono côncavo rosa, orientado para a direita.



## Fim

---

Representa o ponto em que um Caminho ou a jornada apresentada se encerra.

![Exemplo de Fim](/img/uploads/Elementos/fim.png)

É especialmente útil quando for necessário deixar explícito que não há outra continuidade ou quando Caminhos terminarem em pontos distintos.

Pode ser dispensado quando o encerramento já estiver claro pelo contexto.

É representado por um paralelogramo preto.



## Retomada

---

Indica que o Caminho continua em outro ponto já representado, sem estender uma conexão direta pelo fluxograma.

![Exemplo de Retomada](/img/uploads/Elementos/retomada.png)

Pode ser usada quando a continuidade estiver em outro fluxo, jornada ou quando inserir uma conexão distante pode comprometer a leitura do fluxograma.

O texto deve identificar claramente o destino. Quando ele estiver disponível em outra página ou arquivo, insira o link.

![Retomada com link para outro fluxo](/img/uploads/Elementos/retomada-link.png)

É representada por um paralelogramo cinza.



## Nota

---

Acrescenta um contexto necessário para compreender o fluxograma, mas não representa uma etapa da experiência.

![Exemplo de Nota longa](/img/uploads/Elementos/nota.png)

Pode registrar regras de negócio, restrições técnicas, racionais de decisão, limitações de integração ou outras informações relevantes para a leitura.

![Exemplo de Nota curta](/img/uploads/Elementos/nota-curta.png)

A Nota deve contextualizar o fluxo, **não substituir algo que poderia ser representado por outro elemento.**

É representada por um retângulo com fundo ciano-claro e borda tracejada.



## Comentário

---

Registra uma dúvida ou um ponto em aberto do fluxograma.

![Exemplo de Comentário](/img/uploads/Elementos/comentario.png)

Diferente da Nota, que documenta um contexto já definido, o Comentário sinaliza algo que ainda precisa ser discutido ou resolvido.

É representado por um quadrado amarelo como um post-it.

Pode ser dispensado quando a ferramenta utilizada oferecer função nativa de comentários, como o próprio Figma.

![Comentário feito com o recurso nativo do Figma](/img/uploads/Elementos/comentario-nativo.png)



## Forma e conteúdo dos Elementos
---

### Diferenciação visual

Preserve a diferenciação entre as formas dos Elementos propostas pela LINSI. Essas diferenças ajudam a reconhecer a função de cada Elemento no fluxograma.

Se fizer adaptações, indique-as na legenda do fluxograma.

### Alinhamento do texto

Textos curtos podem ser centralizados dentro do Elemento. Conteúdos mais extensos devem ser alinhados à esquerda para facilitar a leitura.



## Relação entre Elementos e Caminhos

---

Até aqui, você entendeu como os Elementos pontuam e explicam acontecimentos ao longo do fluxograma. Os Caminhos mostram como esses Elementos se conectam em sequência, formando as diferentes continuidades possíveis.

Aprenda sobre Caminhos na próxima página.