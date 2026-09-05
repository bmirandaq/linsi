# Output textual do Assistente LINSI

Este formato pertence ao Assistente LINSI. Ele nao e uma nova notacao LINSI e nao substitui o fluxograma visual.

## Objetivo

Comunicar uma proposta de forma humana, previsivel e reconstruivel em ferramentas de diagramacao.

## Requisitos

O formato deve ser:

- legivel por pessoas;
- consistente entre respostas;
- suficientemente estruturado para preservar decisoes da modelagem;
- proporcional ao tamanho do fluxo;
- compativel conceitualmente com uma futura serializacao estruturada.

## Estrutura default

Usar apenas secoes necessarias ao caso:

```text
# Nome do fluxo

## Escopo
[quando necessario]

## Premissas
- [somente hipoteses relevantes]

## Estrutura

### Caminho principal
[Interface - Tela] Checkout
Conteudo: endereco, entrega e pagamento
Acoes disponiveis: Finalizar pedido

-> [Seta Comum]
[Acao] Finalizar pedido

-> [Seta Comum]
[Condicao] Pagamento autorizado?

- Autorizado -> [Seta Positiva] -> ...
- Recusado -> [Seta Negativa] -> Caminho: Pagamento recusado

### Caminho negativo - Pagamento recusado
...

## Pontos em aberto
- ...
```

A estrutura acima e template de output do Assistente, nao sintaxe normativa da LINSI.

## Elementos

Representar com:

`[Tipo] Rotulo`

Quando subtipo for relevante:

`[Interface - Tela] Checkout`
`[Interface - Janela] Filtros`

## Interface

Separar possibilidades disponiveis da Acao efetivamente realizada.

Exemplo:

```text
[Interface - Tela] Checkout
Acoes disponiveis: Finalizar pedido; Voltar

[Acao] Finalizar pedido
```

## Setas

Representar significado explicitamente:

- `[Seta Comum]`
- `[Seta Positiva]`
- `[Seta Negativa]`
- `[Seta Alternativa]`

Quando houver rotulo, associa-lo a Seta.

## Condicao

Representar pergunta e resultados de forma associada.

## Caminhos

Nomear pela funcao quando ajudar a leitura. Preservar no texto a hierarquia de Caminhos definida pela LINSI.

## Colunas

Quando existirem, sinalizar o tipo e o trecho correspondente.

Para Equivalencia, nao inventar rotulo visual obrigatorio. Explicar a relacao fora da estrutura quando necessario.

## Convergencia

Indicar explicitamente quando dois ou mais Caminhos passam a compartilhar a mesma continuidade.

## Escopo e premissas

Nao sobrecarregar propostas simples. Incluir somente quando ajudarem a compreender decisoes estruturais.

## Limites

O output textual nao deve incluir coordenadas, tamanhos exatos, hexadecimais, Auto Layout ou propriedades especificas de Figma/Miro.

## Teste de reconstruibilidade

O formato so deve ser considerado estavel quando uma pessoa familiarizada com LINSI conseguir reconstruir o fluxo sem reinventar:

- sequencia;
- bifurcacoes;
- tipo de Setas;
- Caminhos;
- Colunas relevantes;
- convergencias;
- funcao dos Elementos.
