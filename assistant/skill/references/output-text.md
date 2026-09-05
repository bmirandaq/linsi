# Output textual da Assistente LINSI

Este formato pertence à Assistente LINSI. Ele não é uma nova notação LINSI, não substitui o fluxograma visual e não redefine a gramática da LINSI.

A função deste arquivo é estabelecer como a Assistente descreve, em texto, uma modelagem LINSI sem perder relações importantes da estrutura visual.

> A estrutura textual deve preservar as relações da LINSI, não apenas mencionar seus conceitos.

## Objetivo

Comunicar uma proposta de forma humana, previsível e reconstruível em ferramentas de diagramação.

## Requisitos

O formato deve ser:

- legível por pessoas;
- consistente entre respostas;
- suficientemente estruturado para preservar decisões da modelagem;
- proporcional ao tamanho do fluxo;
- fiel à relação entre Elementos, Setas, Caminhos e Colunas;
- compatível conceitualmente com uma futura serialização estruturada, sem se tornar pseudo-JSON.

## Duas camadas do output

O output da Assistente possui duas camadas diferentes.

### 1. Metadados da proposta

Informações que ajudam a compreender a proposta, mas não fazem parte da gramática visual da LINSI:

- nome do fluxo;
- escopo;
- premissas;
- pontos em aberto da proposta.

Esses itens não devem ser confundidos com Elementos LINSI.

### 2. Estrutura LINSI

Transcrição da modelagem propriamente dita:

- Elementos e Setas;
- Caminhos e suas continuidades;
- Convergências;
- Colunas, quando existirem.

## Escopo e premissas

Não sobrecarregar propostas simples. Incluir Escopo e Premissas somente quando ajudarem a compreender decisões estruturais ou hipóteses relevantes.

Uma premissa deve registrar algo assumido pela Assistente para viabilizar a proposta. Não apresentar premissas como fatos do contexto.

## Pontos em aberto da proposta

Usar esta seção apenas para dúvidas da própria proposta da Assistente que não precisam necessariamente aparecer no fluxograma.

Exemplo:

```text
## Pontos em aberto da proposta
- O contexto não informa se a pessoa pode tentar outro cartão após uma recusa.
```

Isso é diferente do Elemento `Comentário`, que representa no próprio fluxograma uma dúvida ou ponto em aberto relevante para o artefato.

## Limites

O output textual não deve incluir:

- coordenadas;
- tamanhos exatos;
- hexadecimais;
- Auto Layout;
- propriedades específicas de Figma, Miro ou outra ferramenta;
- sintaxe criada apenas para antecipar o JSON da Fase 2.

## Teste de reconstruibilidade

O formato só deve ser considerado estável quando uma pessoa familiarizada com LINSI conseguir reconstruir o fluxo sem reinventar:

- sequência;
- bifurcações;
- tipo e rótulo das Setas;
- origem de novos Caminhos;
- hierarquia dos Caminhos;
- convergências;
- Colunas relevantes e os trechos que abrangem;
- função dos Elementos.

# Convenções de transcrição da estrutura LINSI

A ordem das seções abaixo acompanha a ordem conceitual da documentação oficial: primeiro Elementos, depois Caminhos e então Colunas.

# Elementos

Os Elementos devem ser descritos na mesma ordem conceitual usada pela documentação oficial quando esta referência explicar suas convenções: Seta, Interface, Processo, Ação, Condição, Início, Fim, Retomada, Nota e Comentário.

Na transcrição de um fluxo concreto, porém, os Elementos aparecem na ordem real da continuidade da experiência.

## Seta

A Seta é uma relação entre Elementos. Não deve aparecer no output como um item autônomo sem origem e destino identificáveis.

Forma preferencial para uma continuidade linear:

```text
[Interface - Tela] Checkout
→ [Seta Comum] →
[Ação] Finalizar pedido
```

Quando houver rótulo, mantê-lo associado à Seta:

```text
→ [Seta Positiva | Autorizado] →
```

Tipos possíveis:

- `[Seta Comum]`
- `[Seta Positiva]`
- `[Seta Negativa]`
- `[Seta Alternativa]`

Não transformar rótulo em atributo separado da continuidade quando ele pertence à Seta.

## Interface

Representar o subtipo quando relevante:

```text
[Interface - Tela] Checkout
  Título: Checkout
  Conteúdo: Endereço, entrega e pagamento
  Ações: Finalizar pedido; Voltar
```

ou:

```text
[Interface - Janela] Filtros
  Conteúdo: Categorias e faixa de preço
  Ações: Aplicar filtros; Fechar
```

As `Ações:` descritas dentro de Interface são possibilidades disponíveis naquele ponto.

Quando uma delas for efetivamente realizada no Caminho, representar separadamente o Elemento Ação:

```text
[Interface - Tela] Checkout
  Ações: Finalizar pedido; Voltar

→ [Seta Comum] →
[Ação] Finalizar pedido
```

Não fundir possibilidade disponível e Ação realizada.

## Processo

Representar o comportamento executado pelo sistema como Elemento próprio:

```text
[Processo] Autorizar pagamento
```

Quando houver um reflexo perceptível relevante para a experiência, representá-lo em Interface, mantendo a relação entre os dois conceitos:

```text
[Processo] Autorizar pagamento
→ [Seta Comum] →
[Interface - Tela] Resultado do pagamento
```

Não registrar o resultado percebido apenas como atributo interno do Processo quando ele precisa existir como Interface na experiência.

## Ação

Representar uma ação efetivamente realizada pela pessoa:

```text
[Ação] Finalizar pedido
```

Quando ela corresponder a uma possibilidade apresentada anteriormente em Interface, manter essa relação por meio da continuidade do Caminho, sem repetir o conteúdo da Interface como se fosse a própria Ação.

## Condição

Representar a Condição como pergunta direta:

```text
[Condição] Pagamento autorizado?
```

As respostas devem permanecer associadas às Setas que saem da Condição.

Quando uma saída continua no mesmo Caminho, representá-la diretamente na sequência:

```text
[Condição] Pagamento autorizado?
→ [Seta Positiva | Autorizado] →
[Interface - Tela] Compra confirmada
```

Quando uma saída abre outro Caminho, registrar essa Seta na origem do Caminho correspondente:

```text
### Caminho negativo — Pagamento recusado
Origem: [Condição] Pagamento autorizado?
Entrada: [Seta Negativa | Recusado]
```

Cada Seta de saída de uma Condição deve aparecer uma única vez no output: na continuidade do Caminho atual ou como entrada do Caminho que ela abre.

Não criar uma lista de resultados desacoplada das Setas.

## Início

Quando fizer parte da modelagem:

```text
[Início] Início da compra
```

Não incluir automaticamente. O Elemento pode ser dispensado quando o ponto de partida estiver claro pelo contexto.

## Fim

Quando fizer parte da modelagem:

```text
[Fim] Compra encerrada
```

Não incluir automaticamente. O Elemento pode ser dispensado quando o encerramento estiver claro pelo contexto.

## Retomada

Representar o destino de forma explícita:

```text
[Retomada] Continuar em: Fluxo de acompanhamento do pedido
```

Quando houver link disponível e ele fizer parte do material fornecido ou da documentação relacionada, acrescentá-lo sem inventar destino.

A Retomada representa continuidade em outro ponto; não é sinônimo de convergência entre Caminhos.

## Nota

A Nota contextualiza o fluxo e não participa da sequência como etapa.

Quando estiver associada a um Elemento ou trecho específico, colocá-la logo após esse contexto e usar indentação para indicar associação, sem inserir Setas para a Nota:

```text
[Processo] Autorizar pagamento
  [Nota] O pagamento é processado por um SDK externo.

→ [Seta Comum] →
[Interface - Tela] Resultado do pagamento
```

Essa organização textual não significa `Processo → Nota → Interface`.

Se a associação não ficar clara apenas pela proximidade, explicá-la textualmente.

## Comentário

O Comentário registra uma dúvida ou ponto ainda em aberto no próprio fluxograma e também não participa da sequência como etapa.

Exemplo:

```text
[Interface - Tela] Pagamento recusado
  [Comentário] Confirmar se a pessoa pode trocar o cartão antes de tentar novamente.
```

Não usar `Comentário` para dúvidas que pertencem apenas à elaboração da proposta da Assistente. Para essas, usar `Pontos em aberto da proposta`.

# Caminhos

Caminhos são o eixo principal para transcrever continuidade no output textual.

O texto é linear, mas a LINSI organiza Caminhos horizontalmente. O output deve preservar essa lógica sem transformar Colunas em sequência.

## Representação de um Caminho

Usar uma seção para cada Caminho quando houver mais de uma continuidade relevante.

Exemplo:

```text
### Caminho principal

[Interface - Tela] Checkout
→ [Seta Comum] →
[Ação] Finalizar pedido
```

Fluxos simples com um único Caminho não precisam receber o título `Caminho principal` se isso só adicionar ruído.

## Origem de novos Caminhos

Todo Caminho secundário deve indicar de onde surgiu quando essa origem não estiver imediatamente evidente.

Usar:

```text
Origem: [Elemento de origem]
Entrada: [Seta Tipo | Rótulo, quando houver]
```

Exemplo:

```text
### Caminho negativo — Pagamento recusado
Origem: [Condição] Pagamento autorizado?
Entrada: [Seta Negativa | Recusado]

[Interface - Tela] Pagamento recusado
```

`Origem` identifica o Elemento onde ocorreu o desdobramento.

`Entrada` identifica a Seta que conecta esse desdobramento ao novo Caminho.

Esses campos pertencem ao formato textual da Assistente e não são novos conceitos LINSI.

## Ordem dos Caminhos

Quando houver dois ou mais Caminhos, seguir no output a mesma hierarquia da documentação:

1. Caminho principal;
2. Caminho positivo, se houver;
3. Caminho alternativo, se houver;
4. Caminho negativo, se houver.

Não ordenar Caminhos apenas pela ordem em que foram mencionados no briefing.

## Convergência

Convergência pertence à estrutura de Caminhos.

Quando dois ou mais Caminhos voltarem a compartilhar a mesma continuidade, indicar explicitamente:

```text
### Convergência — Retorno ao resumo do pedido
Caminhos envolvidos: Caminho principal; Caminho negativo — Nova tentativa
Destino compartilhado: [Interface - Tela] Resumo do pedido
```

Depois da convergência, não duplicar toda a continuidade comum em cada Caminho.

A forma textual acima descreve a relação para reconstrução. `Convergência` não é um novo Elemento LINSI.

# Colunas

Colunas são uma camada de organização vertical sobre a estrutura dos Caminhos.

No output textual, descrever Colunas depois dos Caminhos para não confundir agrupamento vertical com continuidade.

Não usar Colunas como eixo principal da sequência.

Só incluir a seção `Colunas` quando a proposta realmente utilizar Colunas.

## Coluna Etapa

Exemplo:

```text
### [Coluna Etapa] Pagamento
Abrange:
- Caminho principal: de [Interface - Tela] Checkout até [Interface - Tela] Compra confirmada
- Caminho negativo — Pagamento recusado: de [Interface - Tela] Pagamento recusado até [Ação] Tentar novamente
```

A descrição deve indicar quais trechos do fluxo pertencem à Coluna sem reescrever toda a sequência.

## Coluna Seção

Exemplo:

```text
### [Coluna Seção] Checkout
Abrange:
- Coluna Etapa: Endereço
- Coluna Etapa: Entrega
- Coluna Etapa: Pagamento
```

Quando a Seção abranger trechos que não estejam organizados como Etapas, identificá-los diretamente.

Não inventar uma estrutura de Etapas apenas para facilitar a descrição da Seção.

## Coluna Equivalência

Representar a relação entre trechos equivalentes dos Caminhos:

```text
### [Coluna Equivalência]
Relaciona:
- Caminho principal: [Interface - Tela] Compra confirmada
- Caminho alternativo — PIX: [Interface - Tela] Compra confirmada via PIX
```

O marcador `[Coluna Equivalência]` existe somente para identificar a estrutura no output textual.

Não significa que o fluxograma visual deva receber esse rótulo. Na LINSI, o rótulo da Coluna Equivalência é dispensado.

# Estrutura default

Usar apenas as seções necessárias ao caso.

Exemplo completo de referência:

```text
# Compra de produto

## Escopo
Do checkout à confirmação do pedido.

## Premissas
- Considerei que a pessoa já adicionou um produto ao carrinho.

## Estrutura LINSI

### Caminho principal

[Interface - Tela] Checkout
  Conteúdo: Endereço, entrega e pagamento
  Ações: Finalizar pedido

→ [Seta Comum] →
[Ação] Finalizar pedido

→ [Seta Comum] →
[Processo] Autorizar pagamento
  [Nota] A autorização é realizada por um SDK externo.

→ [Seta Comum] →
[Condição] Pagamento autorizado?

→ [Seta Positiva | Autorizado] →
[Interface - Tela] Compra confirmada

### Caminho negativo — Pagamento recusado
Origem: [Condição] Pagamento autorizado?
Entrada: [Seta Negativa | Recusado]

[Interface - Tela] Pagamento recusado
  Conteúdo: O pagamento não foi autorizado.
  Ações: Tentar novamente

→ [Seta Comum] →
[Ação] Tentar novamente

### Convergência — Nova tentativa
Caminhos envolvidos: Caminho negativo — Pagamento recusado; Caminho principal
Destino compartilhado: [Interface - Tela] Checkout

## Colunas

### [Coluna Etapa] Pagamento
Abrange:
- Caminho principal: de [Ação] Finalizar pedido até [Interface - Tela] Compra confirmada
- Caminho negativo — Pagamento recusado: de [Interface - Tela] Pagamento recusado até [Ação] Tentar novamente

## Pontos em aberto da proposta
- O contexto não informa se existe limite de tentativas.
```

A estrutura acima é um template de output da Assistente, não sintaxe normativa da LINSI.

# Regras de proporcionalidade

Não preencher seções vazias apenas para cumprir o template.

Em fluxos simples:

- omitir Escopo se estiver evidente;
- omitir Premissas se nenhuma hipótese relevante tiver sido adotada;
- omitir o título de Caminho quando houver apenas uma continuidade e ele não agregar leitura;
- omitir Colunas quando não forem utilizadas;
- omitir Pontos em aberto da proposta quando não existirem.

Em fluxos complexos:

- explicitar origens de Caminhos;
- explicitar convergências;
- manter hierarquia de Caminhos;
- descrever Colunas sem duplicar a sequência;
- preferir clareza estrutural a compactação excessiva.

# Quality check do output

Antes de entregar uma proposta textual, verificar:

1. cada Seta possui origem e destino compreensíveis;
2. rótulos de Condição permanecem associados às Setas;
3. possibilidades em Interface não foram confundidas com Ações realizadas;
4. Processos e reflexos perceptíveis não foram fundidos indevidamente;
5. Nota e Comentário não foram inseridos como etapas da sequência;
6. novos Caminhos registram sua origem e entrada quando necessário;
7. Convergência permanece dentro da lógica de Caminhos;
8. Colunas descrevem agrupamento vertical e não substituem Caminhos;
9. metadados da proposta não foram apresentados como conceitos LINSI;
10. uma pessoa familiarizada com LINSI consegue reconstruir a modelagem sem inventar relações ausentes.
