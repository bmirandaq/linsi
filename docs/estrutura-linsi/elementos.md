---
sidebar_position: 4
title: Elementos
---
# Elementos

### Seta

---

Conecta os elementos. 

![Interface](/img/uploads/setas.png)

Tipos de seta: 

- **Comum**: continuidade, direção genérica. Aplica-se cor cinza/neutra.
- **Positiva**: direção ao sucesso, esperada. Cor verde.
- **Negativa**: direção a uma falha ou erro. Cor vermelha.
- **Alternativa**: direção secundária, alternativa, de exceção. Cor laranja.

**Particularidades** 

1. Rótulos não são obrigatórios ao decorrer da linha, exceto quando presente elemento Condicional.
2. Dependendo do contexto, há setas que podem vir a significar a mesma coisa. Exemplo: Comuns vs Positivas, Negativas vs Alternativas. Use a que mais fizer sentido e fornecer mais destaque ao cenário.

### Interface

---

Expõe o que é fornecido, visível e/ou o que é possível interagir.

![Interface](/img/uploads/interface-tela.png)

Este elemento pode ser escrito em até 3 partes:

1. **Título**: nome da etapa, estado ou cenário representado.
2. **Conteúdo**: o que está visível, disponível ou perceptível.
3. **Ações**: o que a pessoa pode fazer.

Tipos de elemento Interface:

1. **Tela:** página primária. É representado por um retângulo com borda cinza.
2. **Janela:** sobrepõe uma Tela, seja por completo ou parcialmente: modal, drawer, popover, qualquer elemento transitório que não substitui Tela. É representado por um retângulo com borda cinza tracejada.

![Interface](/img/uploads/interface-janela-1.png)

![Interface](/img/uploads/interface-janela-2.png)



### Processo
---

Expõe um comportamento do sistema por consequência de uma ação da pessoa usuária ou de forma autônoma.

![Interface](/img/uploads/processo.png)

Não necessariamente há visibilidade/percepção à pessoa usuária sobre o que for expresso em um elemento Processo, no entanto. É esperado que o elemento Interface esteja presente para especificar qual é o reflexo.

![Interface](/img/uploads/processo-interface-tela.png)



### Ação
---

![Interface](/img/uploads/acao.png)

Expõe a ação realizada pela pessoa usuária durante o fluxo. 

Pode ser o rótulo de um botão ou link.



### Condição
---

[img]

Expõe uma verificação que pode abrir dois ou mais Caminhos no fluxo.

Os rótulos sempre devem ser escritos em forma de pergunta. Exemplos: "Houve coleta de status X?", "Pessoa usuária acionou após X dias?"

As setas a partir de Condição devem conter rótulo a fim de fornecer clareza sobre os Caminhos seguintes. Além disso, precisam concordar nominalmente com a pergunta.

[img example]



### Início
---

[img]

Expõe o ponto de partida do fluxo.

É dispensável se início estiver bastante claro ao contexto.



### Fim
---

[img]

Expõe o encerramento da jornada apresentada.



### Retomada
---

[img]

Sinaliza a continuidade da jornada em outro fluxo ou jornada existente.



### Nota
---

[img]

Expõe explicações, racional, regras de negócio e informações adicionais que forem pertinentes para o melhor entendimento do fluxograma.



### Comentário
---

[img]

Expõe dúvidas ou pontos em aberto.

É dispensável se optar pelo uso de função nativa da ferramenta que estiver sendo usada para construção do fluxograma. Exemplo: função comentar do próprio Figma

[img-example]