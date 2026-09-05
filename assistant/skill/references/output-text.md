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

Esses itens não devem ser confundidos com LINSI.

### 2. Estrutura da modelagem LINSI

Transcrição do que precisa ser transformado em fluxograma:

- Elementos;
- Setas;
- Caminhos;
- Colunas;
- convergências e demais relações necessárias para reconstruir a estrutura visual.

Princípios, boas práticas, Glossário e demais páginas da documentação podem orientar a proposta e sua explicação, mas não viram blocos estruturais do fluxograma apenas por fazerem parte da documentação LINSI.

## Escopo e premissas

Não sobrecarregar propostas simples. Incluir Escopo e Premissas somente quando ajudarem a compreender decisões estruturais ou hipóteses relevantes.

Uma premissa deve registrar algo assumido pela Assistente para viabilizar a proposta. Não apresentar premissas como fatos do contexto.

## Pontos em aberto da proposta

Usar esta seção para dúvidas ou informações ausentes que afetam a proposta da Assistente.

Exemplo:

```text
## Pontos em aberto da proposta
- O contexto não informa se a pessoa pode tentar outro cartão após uma recusa.
```

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

## Seta

A Seta conecta Elementos e indica a continuidade do fluxo.

Forma preferencial:

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

Representar o subtipo quando relevante:

```text
[Interface - Tela] Checkout
  Título: Checkout
  Conteúdo: Endereço, entrega e pagamento
  Ações: Finalizar pedido; Voltar
```

```text
[Interface - Janela] Filtros
  Conteúdo: Categorias e faixa de preço
  Ações: Aplicar filtros; Fechar
```

`Ações:` registra o que está disponível para a pessoa naquela Interface.

Quando uma dessas possibilidades for efetivamente realizada no fluxo, usar o Elemento Ação:

```text
[Interface - Tela] Checkout
  Ações: Finalizar pedido; Voltar

→ [Seta Comum] →
[Ação] Finalizar pedido
```

## Processo

Representar o comportamento executado pelo sistema:

```text
[Processo] Coletar autorização do pagamento via SDK
```

Se essa execução produzir algo visível ou perceptível para a pessoa, representar esse resultado em uma Interface:

```text
[Processo] Coletar autorização do pagamento via SDK
→ [Seta Comum] →
[Interface - Tela] Resultado do pagamento
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
→ [Seta Positiva | Autorizado] →
[Interface - Tela] Compra confirmada
```

Quando uma saída abrir outro Caminho, registrar a origem e a Seta de entrada no ponto em que esse Caminho for apresentado.

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

Representar o destino de forma explícita:

```text
[Retomada] Continuar em: Fluxo de acompanhamento do pedido
```

Quando houver link para o destino, orientar a pessoa a acrescentá-lo no fluxograma. Não é necessário que esse link tenha sido encaminhado à Assistente para que a Retomada seja proposta.

## Nota

A Nota deve aparecer associada ao Elemento ou trecho que contextualiza.

Usar recuo e não inserir Setas para conectá-la:

```text
[Processo] Autorizar pagamento
  [Nota] O pagamento é processado por um SDK externo.

→ [Seta Comum] →
[Interface - Tela] Resultado do pagamento
```

# Caminhos e Colunas

Caminhos e Colunas organizam dimensões diferentes do mesmo fluxograma:

- Caminhos mostram as continuidades na leitura horizontal;
- Colunas organizam recortes verticais.

Quando os dois existirem, o output deve apresentá-los juntos. Separar toda a descrição de Caminhos da descrição de Colunas dificulta a reconstrução visual.

## Quando não houver Colunas

Transcrever diretamente os Caminhos.

Se houver apenas um Caminho, não é necessário criar um título para ele.

Com dois ou mais Caminhos, seguir a hierarquia da documentação:

1. Caminho principal;
2. Caminho positivo, se houver;
3. Caminho alternativo, se houver;
4. Caminho negativo, se houver.

Exemplo:

```text
### Caminho principal

[Interface - Tela] Checkout
→ [Seta Comum] →
[Ação] Finalizar pedido

### Caminho negativo — Pagamento recusado
Origem: [Condição] Pagamento autorizado?
Entrada: [Seta Negativa | Recusado]

[Interface - Tela] Pagamento recusado
```

### Origem de novos Caminhos

Quando um Caminho surgir de um desdobramento anterior, indicar:

```text
Origem: [Elemento de origem]
Entrada: [Seta Tipo | Rótulo, quando houver]
```

`Origem` e `Entrada` pertencem ao formato textual da Assistente. Servem apenas para deixar a relação reconstruível.

## Quando houver Colunas

Percorrer as Colunas da esquerda para a direita, como aparecem no fluxograma.

Dentro de cada Coluna, apresentar os Caminhos de cima para baixo, preservando a hierarquia da LINSI.

Assim, cada bloco textual mostra ao mesmo tempo:

- em qual Coluna o trecho está;
- a qual Caminho ele pertence;
- quais Elementos e Setas existem naquele trecho.

Exemplo:

```text
### [Coluna Etapa] Pagamento

#### Caminho principal

[Interface - Tela] Checkout
  Ações: Finalizar pedido

→ [Seta Comum] →
[Ação] Finalizar pedido

→ [Seta Comum] →
[Processo] Autorizar pagamento

→ [Seta Comum] →
[Condição] Pagamento autorizado?

#### Caminho negativo — Pagamento recusado
Origem: [Condição] Pagamento autorizado?
Entrada: [Seta Negativa | Recusado]

[Interface - Tela] Pagamento recusado
```

Se o mesmo Caminho continuar na Coluna seguinte, usar o mesmo nome e continuar apenas com os Elementos daquele novo trecho.

## Coluna Etapa

Identificar pelo nome da Etapa:

```text
### [Coluna Etapa] Pagamento
```

Os Caminhos que atravessam essa Etapa aparecem dentro do mesmo bloco.

## Coluna Seção

Quando uma Seção reunir Etapas, manter essa relação no próprio bloco:

```text
### [Coluna Seção] Checkout

#### [Coluna Etapa] Endereço

##### Caminho principal
...

#### [Coluna Etapa] Entrega

##### Caminho principal
...

#### [Coluna Etapa] Pagamento

##### Caminho principal
...
```

Se a Seção reunir trechos que não estejam organizados como Etapas, não criar Etapas apenas para preencher a estrutura textual.

## Coluna Equivalência

Usar a própria Coluna para colocar lado a lado, no texto, os trechos equivalentes dos Caminhos:

```text
### [Coluna Equivalência]

#### Caminho principal
[Interface - Tela] Compra confirmada

#### Caminho alternativo — PIX
[Interface - Tela] Compra confirmada via PIX
```

`[Coluna Equivalência]` identifica a estrutura no output textual. Isso não torna obrigatório um rótulo no fluxograma visual.

## Convergência

Indicar a Convergência no ponto da estrutura em que os Caminhos passam a compartilhar a mesma continuidade.

Quando houver Colunas, registrar a Convergência dentro da Coluna em que ela acontece.

Exemplo:

```text
### [Coluna Etapa] Entrega

Convergência: Caminho principal; Caminho negativo — Cadastrar endereço
Destino compartilhado: [Interface - Tela] Opções de entrega

[Interface - Tela] Opções de entrega
→ [Seta Comum] →
...
```

Depois da Convergência, escrever a continuidade compartilhada uma única vez.

# Estrutura default

Usar apenas as seções necessárias ao caso.

## Exemplo sem Colunas

```text
# Reset de senha

## Estrutura LINSI

[Interface - Tela] Recuperar senha
  Ações: Enviar código

→ [Seta Comum] →
[Ação] Enviar código

→ [Seta Comum] →
[Processo] Enviar código de recuperação

→ [Seta Comum] →
[Interface - Tela] Inserir código
```

## Exemplo com Caminhos e Colunas

```text
# Checkout

## Escopo
Do preenchimento do endereço à escolha da entrega.

## Estrutura LINSI

### [Coluna Etapa] Endereço

#### Caminho principal

[Interface - Tela] Checkout
→ [Seta Comum] →
[Condição] Endereço de entrega cadastrado?

→ [Seta Positiva | Sim] →

#### Caminho negativo — Cadastrar endereço
Origem: [Condição] Endereço de entrega cadastrado?
Entrada: [Seta Negativa | Não]

[Interface - Tela] Cadastrar endereço
  Ações: Salvar endereço

→ [Seta Comum] →
[Ação] Salvar endereço

→ [Seta Comum] →
[Processo] Salvar endereço

### [Coluna Etapa] Entrega

Convergência: Caminho principal; Caminho negativo — Cadastrar endereço
Destino compartilhado: [Interface - Tela] Opções de entrega

[Interface - Tela] Opções de entrega
  Ações: Selecionar entrega
```

A estrutura acima é um formato de saída da Assistente, não sintaxe normativa da LINSI.

# Regras de proporcionalidade

Não preencher seções vazias apenas para cumprir o template.

Em fluxos simples:

- omitir Escopo se estiver evidente;
- omitir Premissas se nenhuma hipótese relevante tiver sido adotada;
- omitir título de Caminho quando houver apenas uma continuidade;
- omitir Colunas quando não forem utilizadas;
- omitir Pontos em aberto da proposta quando não existirem.

Em fluxos maiores:

- preservar a origem de novos Caminhos;
- apresentar Caminhos e Colunas juntos quando ambos existirem;
- indicar Convergências no ponto em que acontecem;
- preferir clareza estrutural a compactação excessiva.

# Quality check do output

Antes de entregar uma proposta textual, verificar:

1. cada Seta conecta uma origem e um destino compreensíveis;
2. rótulos de Setas de uma Condição permanecem junto das respectivas Setas;
3. possibilidades disponíveis em Interface não foram confundidas com Elemento Ação;
4. resultados perceptíveis de Processos aparecem como Interface quando fizerem parte da experiência representada;
5. Notas estão associadas ao contexto correto e não entram na sequência;
6. novos Caminhos registram origem e entrada quando necessário;
7. quando houver Colunas, Caminhos e Colunas aparecem juntos na estrutura;
8. Convergências aparecem no ponto em que os Caminhos passam a compartilhar a continuidade;
9. seções desnecessárias foram omitidas;
10. a estrutura fornece informação suficiente para ser transformada em fluxograma sem exigir novas decisões de modelagem.
