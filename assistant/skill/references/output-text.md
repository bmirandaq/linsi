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
- fiel à relação entre Elementos, Caminhos e Colunas;
- compatível conceitualmente com uma futura serialização estruturada, sem se tornar pseudo-JSON.

## Camadas do output

O output da Assistente possui duas camadas diferentes.

### 1. Metadados da proposta

Informações que ajudam a compreender a proposta, mas não fazem parte da gramática visual da LINSI:

- nome do fluxo;
- escopo;
- premissas;
- pontos em aberto da proposta.

Esses itens não devem ser confundidos com LINSI.

### 2. Estrutura da modelagem LINSI

Transcrição do que precisa ser transformado em fluxograma:

- Elementos;
- Caminhos;
- Colunas;
- demais relações necessárias para reconstruir a estrutura visual.

Princípios, boas práticas, Glossário e demais páginas da documentação podem orientar a proposta e sua explicação, mas não viram blocos estruturais do output-text apenas por fazerem parte da documentação LINSI.

## Escopo e premissas

Sempre incluir Escopo para validação, mesmo em propostas simples.

Incluir Premissas somente quando ajudarem a compreender decisões estruturais ou hipóteses relevantes.

Uma premissa deve registrar algo assumido pela Assistente para viabilizar a proposta. Não apresentar premissas como fatos do contexto.

## Pontos em aberto da proposta

Usar esta seção para dúvidas ou informações ausentes que afetem de forma crítica a construção da proposta e não possam ser inferidas com segurança.

Exemplo:

```text
## Pontos em aberto da proposta
- O contexto cita dois destinos após a reprovação, mas não informa qual condição leva a cada um.
```

Quando a lacuna puder ser tratada por uma hipótese razoável sem distorcer o contexto, registrar essa hipótese em Premissas em vez de abrir um Ponto em aberto.

## Limites

O output textual não deve incluir:

- coordenadas;
- tamanhos exatos;
- hexadecimais;
- Auto Layout;
- propriedades específicas de Figma, FigJam, Miro ou outra ferramenta;
- sintaxe criada para antecipar JSON da Fase 2 da Assistente LINSI.

# Convenções de transcrição da estrutura LINSI

A explicação das convenções segue a sequência conceitual da documentação oficial. Na transcrição de um fluxo concreto, a ordem continua sendo determinada pela experiência representada.

# Elementos

As convenções abaixo seguem a ordem da documentação: Seta, Interface, Processo, Ação, Condição, Início, Fim, Retomada e Nota.

Comentário não é incluído; é recurso de aplicação manual pela pessoa usuária.

## Seta

A Seta conecta Elementos e indica a continuidade do fluxo.

Exemplo:

```text
[Interface - Tela] Checkout
→ [Seta Comum] →
[Ação] Finalizar pedido
```

Quando houver rótulo, escrevê-lo junto da Seta:

```text
→ [Seta Positiva | Autorizado] →
```

Tipos possíveis:

- `[Seta Comum]`
- `[Seta Positiva]`
- `[Seta Negativa]`
- `[Seta Alternativa]`

## Interface

Representar o subtipo sempre:

```text
[Interface - Tela] Checkout
  Conteúdo: Endereço, entrega e pagamento
  Ações: Finalizar pedido; Voltar
```

```text
[Interface - Janela] Filtros
  Conteúdo: Categorias e faixa de preço
  Ações: Aplicar filtros; Fechar
```

`Ações:` registra o que está disponível para a pessoa naquela Interface.

O título da Interface, seja do tipo Tela ou Janela, deve ir ao lado da representação. Exemplo: `[Interface - Tela] Checkout`.

Quando uma dessas possibilidades for efetivamente realizada no fluxo, usar o Elemento Ação, conforme descrito adiante.

## Processo

Representar o comportamento executado pelo sistema:

```text
[Processo] Coletar autorização do pagamento via SDK
```

Se essa execução produzir algo visível ou perceptível para a pessoa, representar o resultado em uma Interface de tipo cabível:

```text
[Processo] Coletar autorização do pagamento via SDK
→ [Seta Comum] → [Interface - Tela] Resultado do pagamento
```

## Ação

Representar a ação efetivamente realizada pela pessoa:

```text
[Ação] Finalizar pedido
```

## Condição

Representar como pergunta direta:

```text
[Condição] Pagamento autorizado?
```

As respostas ficam nos rótulos das Setas que saem da Condição:

```text
[Condição] Pagamento autorizado?
→ [Seta Positiva | Autorizado] → [Interface - Tela] Compra confirmada
```

## Início

Quando fizer parte da modelagem:

```text
[Início] Início da compra
```

Pode ser omitido quando o ponto de partida já estiver claro pelo contexto.

## Fim

Quando fizer parte da modelagem:

```text
[Fim] Compra encerrada
```

Pode ser omitido quando o encerramento já estiver claro pelo contexto.

## Retomada

Se a pessoa usuária frisar que existe redirecionamento para outra jornada existente, representar o destino de forma explícita:

```text
[Retomada] Continuar em: Fluxo de acompanhamento do pedido
```

Quando houver link para o destino, orientar a pessoa a acrescentá-lo no fluxograma. Não é necessário que esse link seja encaminhado à Assistente para que a Retomada seja proposta.

## Nota

A Nota deve aparecer associada ao Elemento ou trecho que contextualiza.

Usar recuo e não inserir Setas para conectá-la:

```text
[Processo] Autorizar pagamento
  [Nota] O pagamento é processado por um SDK externo.

→ [Seta Comum] → [Interface - Tela] Resultado do pagamento
```

# Caminhos e Colunas

Caminhos e Colunas organizam dimensões diferentes do mesmo fluxograma:

- Caminhos mostram as continuidades na leitura horizontal;
- Colunas organizam recortes verticais.

Quando os dois existirem, o output deve apresentá-los juntos. Separar a descrição de Caminhos da descrição de Colunas dificulta a reconstrução visual.

## Caminhos

Se não houver Colunas, transcrever diretamente os Caminhos.

Se houver apenas um Caminho, não é necessário criar um título para ele.

Com dois ou mais Caminhos, seguir a hierarquia da documentação:

1. Caminho principal;
2. Caminho positivo, se houver;
3. Caminho alternativo, se houver;
4. Caminho negativo, se houver.

### Convergência

Quando dois ou mais Caminhos voltarem a compartilhar a mesma continuidade, indicar a Convergência no ponto da estrutura em que isso acontece.

Exemplo:

```text
[Convergência]
- Caminho principal
- Caminho negativo — Cadastrar endereço

Destino: [Interface - Tela] Opções de entrega
```

Depois da Convergência, seguir com a continuidade compartilhada sem duplicá-la em cada Caminho.

## Colunas

Quando houver Colunas, percorrê-las da esquerda para a direita, como aparecem no fluxograma.

Dentro de cada Coluna, apresentar os Caminhos de cima para baixo, preservando a hierarquia da LINSI.

Assim, cada bloco textual mostra ao mesmo tempo:

- em qual Coluna o trecho está;
- a qual Caminho ele pertence;
- quais Elementos existem naquele trecho.

Exemplo:

```text
### [Coluna Etapa] Pagamento

#### Caminho principal

[Interface - Tela] Checkout
  Ações: Finalizar pedido

→ [Seta Comum] → [Ação] Finalizar pedido

→ [Seta Comum] → [Processo] Autorizar pagamento

→ [Seta Comum] → [Condição] Pagamento autorizado?

#### Caminho negativo — Pagamento recusado
→ [Seta Negativa | Recusado]
[Interface - Tela] Pagamento recusado
```

### Uso dos tipos de Coluna

Identificar a estrutura de Colunas preservando a relação entre Seção, Etapa e Equivalência quando elas existirem na representação.

Exemplo de Seção com Etapa:

```text
### [Coluna Seção] Checkout
#### [Coluna Etapa] Pagamento
...
```

Quando houver apenas uma Etapa:

```text
### [Coluna Etapa] Pagamento
...
```

Na Coluna Equivalência, não inventar título. Indicar apenas quais Elementos, em quais Caminhos, estão alinhados verticalmente por equivalência.

Exemplo:

```text
#### [Coluna Equivalência]
- Caminho principal: [Interface - Tela] Compra confirmada
- Caminho alternativo — PIX: [Interface - Tela] Compra confirmada via PIX
```

O marcador `[Coluna Equivalência]` identifica a estrutura no output textual; não corresponde a um rótulo que deva ser inserido no fluxograma visual.

# Estrutura default

```text
# Checkout

## Escopo
Do preenchimento do endereço à escolha da entrega.

## Estrutura LINSI

### [Coluna Etapa] Endereço

#### Caminho principal

[Interface - Tela] Checkout
  Conteúdo: Endereço de entrega

→ [Seta Comum] →
[Condição] Endereço de entrega cadastrado?

→ [Seta Positiva | Sim] →

#### Caminho negativo — Cadastrar endereço
→ [Seta Negativa | Não]
[Interface - Tela] Cadastrar endereço
  Ações: Salvar endereço

### [Coluna Etapa] Entrega

[Convergência]
- Caminho principal
- Caminho negativo — Cadastrar endereço

Destino: [Interface - Tela] Opções de entrega
  Ações: Selecionar entrega
```

Usar apenas as seções necessárias ao caso. Evite repetir informações que já estão claras na leitura.

A estrutura acima é um formato de saída da Assistente, não sintaxe normativa da LINSI.

# Regras de proporcionalidade

Não preencher seções vazias apenas para cumprir o template.

Em fluxos simples:

- omitir Premissas se nenhuma hipótese relevante tiver sido adotada;
- omitir rótulo de Caminho quando houver apenas uma continuidade;
- omitir Colunas quando não forem utilizadas;
- omitir Pontos em aberto da proposta quando não existirem.

Em fluxos maiores:

- apresentar Caminhos e Colunas juntos quando ambos existirem;
- preferir clareza estrutural a compactação excessiva.

# Quality check do output

Antes de entregar uma proposta textual, verificar se:

1. cada Seta conecta uma origem e um destino compreensíveis;
2. rótulos de Setas de uma Condição permanecem compreensíveis e associados à respectiva Condição;
3. possibilidades disponíveis em Interface não foram confundidas com Elemento Ação;
4. Notas estão associadas ao contexto correto e não entram na sequência;
5. Convergência permanece tratada como relação entre Caminhos;
6. Caminhos e Colunas são apresentados em conjunto quando ambos existirem;
7. seções e trechos desnecessários forem omitidas;
8. a estrutura fornece informação suficiente para ser transformada em fluxograma sem exigir novas decisões de modelagem.
