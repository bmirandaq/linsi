# Casos de teste — Revisao

Avaliar cada caso com `../evaluation.md`.

Os fixtures visuais correspondentes podem ser adicionados depois em `../fixtures/`.

## RV01 — Fluxo correto

**Entrada:** fluxograma simples aderente a LINSI.

**Esperado:**
- nao inventar problemas;
- reconhecer que esta coerente;
- limitar recomendacoes a melhorias realmente uteis.

## RV02 — Elemento semanticamente errado

**Entrada:** uma acao efetivamente realizada representada apenas dentro da Interface, sem Elemento Acao no Caminho onde essa distincao e necessaria.

**Esperado:**
- explicar possibilidade disponivel x realizacao;
- localizar o problema concretamente.

## RV03 — Seta incorreta

**Entrada:** saida `Sim` marcada Positiva apesar de representar continuidade neutra.

**Esperado:**
- classificar pelo significado;
- nao associar `Sim` automaticamente a positivo.

## RV04 — Ordem de Caminhos

**Entrada:** Caminho negativo acima do principal.

**Esperado:**
- apontar divergencia da hierarquia documentada;
- explicar impacto na previsibilidade da leitura.

## RV05 — Colunas como grade

**Entrada:** Coluna criada para cada alinhamento vertical sem relacao semantica clara.

**Esperado:**
- apontar que alinhamento nao cria Coluna;
- distinguir problema estrutural de simples preferencia visual.

## RV06 — Problema apenas de legibilidade

**Entrada:** semantica correta, mas Setas cruzam muitas vezes e rotulos ficam em curvas.

**Esperado:**
- classificar como recomendacao/legibilidade quando nao houver regra semantica violada;
- nao dizer que o fluxo e "invalido".

## RV07 — Adaptacao visual

**Entrada:** cores adaptadas, formas continuam distinguiveis e legenda informa a adaptacao.

**Esperado:**
- nao classificar automaticamente como erro;
- avaliar preservacao de significado e contraste.

## RV08 — Nota usada como etapa

**Entrada:** Nota descreve um acontecimento que deveria fazer parte da continuidade.

**Esperado:**
- explicar que Nota contextualiza e nao substitui Elemento representavel;
- sugerir correcao adequada ao acontecimento.

## RV09 — Comentario x Nota

**Entrada:** contexto ainda indefinido apresentado como Nota consolidada.

**Esperado:**
- sugerir Comentario/ponto em aberto;
- explicar diferenca.

## RV10 — Imagem ambigua

**Entrada:** qualidade/estrutura visual nao permite confirmar se uma linha pertence a determinado Caminho.

**Esperado:**
- marcar como hipotese;
- nao afirmar estrutura como fato;
- pedir esclarecimento apenas se necessario para a correcao solicitada.

## RV11 — Contexto x imagem divergentes

**Entrada:** descricao informa tres resultados, imagem mostra dois.

**Esperado:**
- relatar a divergencia;
- nao reconciliar silenciosamente.
