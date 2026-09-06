# Colunas — referencia operacional

Fonte primaria: `docs/estrutura-linsi/colunas.md`

Colunas sao recortes verticais que ajudam a estruturar a leitura e a evidenciar momentos, agrupamentos e relacoes no fluxograma.

## COL-STAGE-001 — Coluna Etapa
- **Tipo:** definition
- **Status:** canonical

Organiza uma etapa especifica da experiencia.

Pode reunir diferentes Elementos e/ou mais de um Caminho.

Exemplos documentados incluem cadastro, autenticacao, escolha de entrega e pagamento.

### Limite operacional

Nao transformar qualquer agrupamento vertical em Etapa. Deve existir uma etapa identificavel da experiencia.

## COL-SECTION-001 — Coluna Secao
- **Tipo:** definition
- **Status:** canonical

Agrupa partes relacionadas de forma mais ampla.

Pode reunir diferentes Etapas ou trechos que nao precisem estar organizados como Etapas.

E especialmente util em fluxogramas extensos.

### Orientacao derivada

Usar quando o agrupamento macro ajuda a compreender a estrutura geral e uma Coluna Etapa seria estreita demais para a funcao pretendida.

Esta orientacao e derivada; a documentacao nao define um limiar formal entre Etapa e Secao.

## COL-EQUIV-001 — Coluna Equivalencia
- **Tipo:** definition
- **Status:** canonical

Evidencia trechos de dois ou mais Caminhos que cumprem funcao equivalente naquele ponto da experiencia.

A equivalencia nao exige Elementos, conteudos ou comportamentos identicos. O criterio e funcao equivalente dentro de seus respectivos Caminhos.

## COL-EQUIV-002 — Funcao comparativa
- **Tipo:** rationale
- **Status:** canonical

Ajuda a comparar Caminhos e perceber se diferencas representam necessidades reais ou inconsistencias nao intencionais.

## COL-EQUIV-003 — Rotulo
- **Tipo:** rule
- **Status:** canonical

A aplicacao da Coluna Equivalencia e puramente visual; seu rotulo e dispensado.

## COL-ALIGN-001 — Alinhamento nao cria Coluna
- **Tipo:** rule
- **Status:** canonical

Alinhamento vertical, por si so, nao cria uma Coluna.

A composicao visual precisa corresponder a uma relacao real entre os trechos representados.

## Criterios de decisao permitidos

Ao avaliar uma Coluna, perguntar:

1. existe uma relacao semantica real entre os trechos?
2. essa relacao ajuda a organizar ou comparar a experiencia?
3. o agrupamento representa uma Etapa, uma Secao ampla ou Equivalencia?
4. a Coluna acrescenta leitura ou apenas cria grade visual?

## Open question implicita

A documentacao atual nao define criterios objetivos suficientes para distinguir todos os casos-limite entre Etapa e Secao, nem um limiar de complexidade a partir do qual Secao se torna necessaria.

Nao inventar numero de Elementos, quantidade de Caminhos ou tamanho visual como regra.

Quando a classificacao for ambigua:

- escolher apenas se houver contexto suficiente;
- explicitar a interpretacao quando ela afetar a proposta;
- registrar como recomendacao ou hipotese, nao como regra absoluta.

## Verificacoes na revisao

Checar:

- se a Coluna corresponde a uma relacao real;
- se alinhamento esta sendo confundido com Coluna;
- se Colunas estao sendo usadas como grade arbitraria;
- se Etapa e Secao fazem sentido para o nivel de agrupamento;
- se Equivalencia compara funcoes realmente equivalentes;
- se a quantidade de Colunas melhora ou prejudica a leitura.
