# Testes de regressao — output textual

Estes casos protegem o formato textual contra distorcoes da estrutura LINSI.

Avaliar em conjunto com `../evaluation.md` e `../../skill/references/output-text.md`.

## OT01 — Seta nao e item autonomo

**Entrada:** continuidade `Interface -> Acao`.

**Esperado:**
- representar origem, Seta e destino de forma associada;
- nao listar `[Seta Comum]` como bloco sem relacao identificavel.

## OT02 — Rotulo permanece na Seta

**Entrada:** Condicao `Pagamento autorizado?` com saidas `Autorizado` e `Recusado`.

**Esperado:**
- associar `Autorizado` e `Recusado` as respectivas Setas;
- nao criar lista de resultados independente das Setas.

## OT03 — Saida de Condicao que abre Caminho

**Entrada:** `Recusado` abre Caminho negativo.

**Esperado:**
- o Caminho secundario informa `Origem` e `Entrada` quando necessario;
- a Seta de saida nao aparece duplicada no Caminho de origem e no Caminho novo.

## OT04 — Interface x Acao

**Entrada:** Interface oferece `Finalizar pedido` e a pessoa realiza essa acao.

**Esperado:**
- `Acoes:` dentro da Interface registra possibilidade;
- `[Acao] Finalizar pedido` aparece separadamente na continuidade;
- nao fundir os dois conceitos.

## OT05 — Processo x reflexo percebido

**Entrada:** sistema autoriza pagamento e depois a pessoa ve confirmacao.

**Esperado:**
- `[Processo]` representa execucao do sistema;
- `[Interface]` representa o reflexo percebido;
- nao usar `Resultado:` dentro do Processo como substituto da Interface quando ela for relevante.

## OT06 — Nota nao entra na sequencia

**Entrada:** Nota contextualiza um Processo.

**Esperado:**
- Nota aparece associada ao contexto sem Setas de entrada/saida;
- leitura textual nao implica `Processo -> Nota -> Interface`.

## OT07 — Comentario x ponto em aberto da proposta

**Entrada A:** duvida que precisa aparecer no fluxograma.

**Esperado A:** usar `[Comentario]` associado ao trecho relevante.

**Entrada B:** informacao que a Assistente nao recebeu e que afeta apenas a proposta atual.

**Esperado B:** usar `Pontos em aberto da proposta`, sem transformar a duvida em Elemento LINSI automaticamente.

## OT08 — Caminho e eixo de continuidade

**Entrada:** fluxo com Caminho principal e negativo.

**Esperado:**
- estruturar continuidades por Caminho;
- nao organizar a sequencia primariamente por Colunas.

## OT09 — Convergencia pertence a Caminhos

**Entrada:** dois Caminhos passam a compartilhar a mesma continuidade.

**Esperado:**
- descrever Convergencia dentro da logica de Caminhos;
- nao apresenta-la como Elemento ou como conceito paralelo a Colunas;
- nao duplicar toda a continuidade comum apos convergir.

## OT10 — Coluna e camada ortogonal

**Entrada:** uma Coluna Etapa abrange trechos de dois Caminhos.

**Esperado:**
- a secao de Colunas referencia os trechos dos Caminhos;
- nao reescreve o fluxo como sequencia da Coluna;
- preserva a dimensao vertical de agrupamento.

## OT11 — Equivalencia sem rotulo visual obrigatorio

**Entrada:** Coluna Equivalencia entre dois trechos.

**Esperado:**
- o output pode usar `[Coluna Equivalencia]` para identificar a estrutura textual;
- deixa claro que isso nao obriga rotulo no fluxograma visual.

## OT12 — Ordem conceitual da referencia

**Esperado:**
- as convencoes de Elementos aparecem na ordem oficial: Seta, Interface, Processo, Acao, Condicao, Inicio, Fim, Retomada, Nota, Comentario;
- Caminhos vem depois de Elementos;
- Colunas vem depois de Caminhos.

## OT13 — Ordem real do fluxo nao e ordem da documentacao

**Entrada:** fluxo cuja primeira ocorrencia e uma Interface, seguida de Acao, Processo e Condicao.

**Esperado:**
- a transcricao concreta segue a continuidade real;
- nao reorganiza ocorrencias para imitar a ordem da documentacao.

## OT14 — Metadados nao viram LINSI

**Entrada:** proposta com Escopo, Premissa e ponto em aberto.

**Esperado:**
- esses itens ficam fora de `Estrutura LINSI`;
- nao sao representados como Nota, Comentario ou outro Elemento sem motivo semantico.

## OT15 — Proporcionalidade

**Entrada:** fluxo linear simples, sem hipoteses, Colunas ou pontos em aberto.

**Esperado:**
- omitir secoes desnecessarias;
- nao preencher template vazio apenas por consistencia formal.

## OT16 — Reconstrucao

**Entrada:** output com bifurcacao, dois Caminhos, convergencia e uma Coluna.

**Esperado:**
Uma pessoa familiarizada com LINSI deve conseguir reconstruir:
- sequencia;
- origem dos Caminhos;
- Setas e rotulos;
- convergencia;
- trechos abrangidos pela Coluna;
sem inferir relacoes estruturais ausentes do texto.
