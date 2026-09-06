# Caminhos — referencia operacional

Fonte primaria: `docs/estrutura-linsi/caminhos.md`

## PATH-DEF-001 — Funcao
- **Tipo:** definition
- **Status:** canonical

Caminhos representam as continuidades possiveis da experiencia apresentada pelo fluxograma.

Um fluxograma pode possuir um ou mais Caminhos.

## PATH-NEW-001 — Quando criar novo Caminho
- **Tipo:** rule
- **Status:** canonical

Criar novo Caminho quando uma escolha ou desdobramento passa a seguir uma sequencia propria, separada daquela em que surgiu.

Exemplos documentados:

- Condicao, por via de regra, abre dois ou mais Caminhos;
- Processo pode gerar Caminhos distintos, como sucesso ou falha;
- alternativa ao Caminho principal ou a outro aspecto.

### Orientacao derivada

Nao criar Caminho apenas porque elementos estao horizontalmente alinhados ou visualmente separados. Deve existir uma continuidade propria com funcao real na organizacao do fluxo.

## PATH-ORDER-001 — Ordem dos Caminhos
- **Tipo:** rule
- **Status:** canonical

Quando houver dois ou mais Caminhos, organizar nesta hierarquia:

1. Caminho principal acima de todos;
2. Caminho positivo abaixo, se houver;
3. Caminho alternativo abaixo, se houver;
4. Caminho negativo na posicao inferior, se houver.

O Caminho principal permanece acima independentemente de ser positivo, negativo ou comum, pois funciona como referencia de leitura para os demais.

## PATH-ORDER-002 — Consistencia da hierarquia
- **Tipo:** rationale + good-practice
- **Status:** canonical

Evitar inverter arbitrariamente a ordem dos tipos de Caminho ao longo do mesmo fluxograma. A previsibilidade reduz esforco de leitura.

## PATH-ALIGN-001 — Alinhamento nao cria Caminho
- **Tipo:** rule
- **Status:** canonical

Alinhamento horizontal, por si so, nao constitui Caminho.

Para considerar um Caminho existente, deve haver continuidade proposital e funcao na organizacao do fluxograma.

## PATH-CONV-001 — Convergencia
- **Tipo:** rule
- **Status:** canonical

Caminhos podem voltar a se encontrar quando chegam ao mesmo ponto e passam a compartilhar a mesma continuidade.

Ao convergir, podem ser conectados novamente e seguir como um unico Caminho.

## PATH-COL-001 — Caminhos x Colunas
- **Tipo:** definition
- **Status:** canonical

Caminhos e Colunas organizam dimensoes diferentes:

- Caminhos: continuidade da experiencia na leitura horizontal;
- Colunas: recortes verticais que organizam partes da experiencia.

Nao substituir um conceito pelo outro por conveniencia visual.

## Verificacoes na criacao

Ao propor Caminhos:

1. identificar qual continuidade funciona como principal;
2. identificar desdobramentos que realmente passam a seguir sequencia propria;
3. classificar significado das continuidades sem confundir tipo de Seta com tipo de Caminho;
4. verificar se Caminhos voltam a compartilhar a mesma continuidade;
5. ordenar de forma previsivel.

## Verificacoes na revisao

Checar:

- se separacoes visuais correspondem a Caminhos reais;
- se desdobramentos relevantes foram omitidos;
- se Caminhos foram criados sem necessidade semantica;
- se a hierarquia vertical esta consistente;
- se convergencias foram representadas quando a continuidade passa a ser comum;
- se Caminhos e Colunas estao sendo confundidos.

## Limites

A documentacao atual nao define uma taxonomia formal completa de "tipo de Caminho" independente das Setas. Nao inventar propriedades ou classificacoes adicionais alem das necessarias para aplicar a ordem documentada e descrever a continuidade.
