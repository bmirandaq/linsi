# Testes de regressão — output textual

Estes casos protegem o formato textual contra distorções da estrutura LINSI.

Avaliar em conjunto com `../evaluation.md` e `../../skill/references/output-text.md`.

## OT01 — Seta permanece dentro de Elementos

**Entrada:** continuidade `Interface -> Ação`.

**Esperado:**
- `Seta` permanece tratada como Elemento na estrutura conceitual da referência;
- representar origem, Seta e destino de forma associada;
- não listar `[Seta Comum]` como bloco sem relação identificável.

## OT02 — Rótulo permanece na Seta

**Entrada:** Condição `Pagamento autorizado?` com saídas `Autorizado` e `Recusado`.

**Esperado:**
- escrever os rótulos junto das respectivas Setas;
- não criar lista de resultados independente das Setas.

## OT03 — Interface x Ação

**Entrada:** Interface oferece `Finalizar pedido` e a pessoa realiza essa ação.

**Esperado:**
- representar sempre o subtipo da Interface;
- `Ações:` dentro da Interface registra possibilidade;
- `[Ação] Finalizar pedido` aparece separadamente na continuidade.

## OT04 — Processo x resultado perceptível

**Entrada:** sistema autoriza pagamento e depois a pessoa vê confirmação.

**Esperado:**
- `[Processo]` representa a execução do sistema;
- `[Interface - Tela]` ou `[Interface - Janela]` representa o resultado percebido quando ele fizer parte da experiência.

## OT05 — Nota não entra na sequência

**Entrada:** Nota contextualiza um Processo.

**Esperado:**
- Nota aparece associada ao contexto por recuo/proximidade;
- não recebe Setas de entrada ou saída.

## OT06 — Assistente não gera Comentário

**Entrada:** falta uma informação que afeta a proposta atual.

**Esperado:**
- usar `Pontos em aberto da proposta` apenas quando a ausência for crítica e não puder ser inferida com segurança;
- quando houver hipótese razoável, registrar em `Premissas`;
- não inserir Elemento `Comentário` no output gerado pela Assistente.

## OT07 — Escopo sempre aparece

**Entrada:** qualquer proposta de fluxo, inclusive simples.

**Esperado:**
- incluir `Escopo` para validação;
- não omitir Escopo em nome da proporcionalidade.

## OT08 — Fluxo sem Colunas

**Entrada:** fluxo com Caminho principal e negativo, sem Colunas.

**Esperado:**
- transcrever diretamente os Caminhos;
- seguir a hierarquia documentada quando houver mais de um Caminho;
- manter compreensível a relação entre o Caminho secundário, sua Seta de entrada e o ponto de desdobramento;
- não introduzir campos auxiliares `Origem:` ou `Entrada:` como parte do formato default.

## OT09 — Caminhos e Colunas aparecem juntos

**Entrada:** fluxo com duas Colunas e dois Caminhos.

**Esperado:**
- percorrer Colunas da esquerda para a direita;
- dentro de cada Coluna, apresentar os Caminhos de cima para baixo;
- não criar uma descrição completa de Caminhos e só depois outra descrição separada de Colunas.

## OT10 — Continuidade de um Caminho entre Colunas

**Entrada:** Caminho principal atravessa três Colunas.

**Esperado:**
- manter o mesmo Caminho reconhecível nos trechos correspondentes;
- mostrar em cada Coluna apenas os Elementos daquele trecho;
- permitir reconhecer a continuidade horizontal entre Colunas.

## OT11 — Novo Caminho nasce dentro da Coluna correta

**Entrada:** uma Condição na Coluna `Pagamento` abre Caminho negativo.

**Esperado:**
- apresentar o novo Caminho dentro da mesma Coluna em que ocorre o desdobramento;
- manter a Seta de entrada do novo Caminho associada ao desdobramento de forma compreensível;
- não introduzir campos auxiliares `Origem:` ou `Entrada:` como parte do formato default;
- não duplicar a Seta de saída em duas partes diferentes do output.

## OT12 — Coluna Seção preserva Etapas existentes

**Entrada:** Seção `Checkout` reúne Etapas `Endereço`, `Entrega` e `Pagamento`.

**Esperado:**
- manter as Etapas dentro da Seção na ordem visual correspondente;
- não inventar Etapas para trechos que não estejam organizados assim.

## OT13 — Equivalência sem título visual

**Entrada:** Coluna Equivalência entre trechos de dois Caminhos.

**Esperado:**
- indicar quais Elementos, em quais Caminhos, estão alinhados verticalmente por equivalência;
- preservar a identidade de cada Caminho;
- não inventar título para a Coluna Equivalência no fluxograma visual;
- aceitar `[Coluna Equivalência]` apenas como marcador do formato textual da Assistente.

## OT14 — Convergência permanece dentro de Caminhos

**Entrada:** dois Caminhos convergem na Coluna `Entrega`.

**Esperado:**
- `Convergência` permanece tratada como parte da estrutura de Caminhos, nunca como Elemento ou conceito independente;
- registrar a Convergência no ponto em que acontece;
- identificar Caminhos envolvidos e destino compartilhado;
- escrever a continuidade comum uma única vez depois da Convergência.

## OT15 — Ordem conceitual das convenções

**Esperado:**
- `Seta` permanece dentro da seção `Elementos`;
- as convenções de Elementos aparecem na ordem: Seta, Interface, Processo, Ação, Condição, Início, Fim, Retomada e Nota;
- a explicação de Caminhos e Colunas vem depois dos Elementos;
- `Convergência` permanece subordinada a Caminhos;
- a ordem da referência não reorganiza a sequência real de um fluxo concreto.

## OT16 — Metadados não viram estrutura do fluxograma

**Entrada:** proposta com Escopo, Premissa e ponto em aberto.

**Esperado:**
- esses itens permanecem como metadados da proposta;
- não são transformados em Elementos ou relações da modelagem sem motivo.

## OT17 — Proporcionalidade sem remover Escopo

**Entrada:** fluxo linear simples, sem hipóteses, Colunas ou pontos em aberto.

**Esperado:**
- manter `Escopo`;
- omitir Premissas, Colunas, Pontos em aberto e rótulo de Caminho quando não forem necessários;
- não preencher template vazio apenas por consistência formal.

## OT18 — Reconstrução com Caminhos e Colunas

**Entrada:** output com duas Colunas, dois Caminhos e uma Convergência.

**Esperado:**
Uma pessoa familiarizada com LINSI consegue identificar sem tomar novas decisões de modelagem:
- sequência dos Elementos;
- tipos e rótulos das Setas;
- origem do Caminho secundário;
- em qual Coluna cada trecho está;
- continuidade de cada Caminho entre Colunas;
- ponto de Convergência.
