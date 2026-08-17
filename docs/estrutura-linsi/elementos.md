---
sidebar_position: 4
title: Elementos
---
# Elementos

### Seta

---

Conecta os elementos. 

![Setas](/img/uploads/setas.png)

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

![Interface](/img/uploads/interface.png)

Tipos:

**Tela**
É a interface primária: página, painel visível. É representado por um retângulo com borda cinza.

**Janela**
Interface que sobrepõe uma Tela, seja por completo ou parcialmente: modal, drawer, popover, qualquer elemento transitório que não substitui Tela.

É representado por um retângulo com borda cinza tracejada.

**Particularidades**

Este elemento pode ser escrito em 3 partes:

- **Título**: nomenclatura da etapa, estágio, cenário
- **Conteúdo**: o que será visto, lido, percebido
- **Ações**: o que a pessoa usuária pode fazer

[img example]

### Processo

---

[img]

Expõe o comportamento do sistema, seja pós-acionamento (por ação da pessoa usuária) ou autônoma (por determinação do próprio sistema).

Não necessariamente há visibilidade/percepção à pessoa usuária sobre o que for expresso em um elemento Processo. Os reflexos possíveis são comportamentos como carregamento, skeleton, ou feedbacks diretos como toaster etc.

Neste caso, é esperado que o elemento Interface (Tela ou Janela) esteja presente para especificar qual é o reflexo.

[img example]


### Ação

---

[img]

Expõe a interação realizada pela pessoa usuária durante o fluxo. Pode ser o rótulo de um botão/link ou outra mais complexa.



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