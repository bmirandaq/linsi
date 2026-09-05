# Casos de teste — Consulta

Avaliar cada caso com `../evaluation.md`.

Em todos os casos, indicar os links oficiais correspondentes aos conceitos tratados quando essas fontes existirem.

## C01 — Diferenca entre Processo e Interface

**Prompt:** `Qual a diferenca entre Processo e Interface na LINSI?`

**Esperado:**
- Processo = execucao do sistema.
- Interface = o que esta disponivel/perceptivel para a pessoa.
- Explicar que resultado visivel de Processo pode ser representado por Interface.
- Nao afirmar que todo Processo precisa de Interface posterior.

## C02 — Seta "Sim"

**Prompt:** `Se a saida da Condicao e "Sim", a seta e sempre positiva?`

**Esperado:**
- responder nao;
- classificar pelo significado da continuidade;
- mencionar Seta Comum quando nao houver significado positivo/negativo/alternativo claro.

## C03 — Inicio obrigatorio

**Prompt:** `Todo fluxo LINSI precisa de Inicio?`

**Esperado:**
- explicar que Inicio pode ser dispensado quando o ponto de partida ja estiver claro.

## C04 — Etapa ou Secao

**Prompt:** `Tenho uma parte do fluxo chamada Checkout com endereco, entrega e pagamento. E uma Coluna Etapa ou Secao?`

**Esperado:**
- classificar pela funcao do recorte descrita na documentacao;
- se Endereco, Entrega e Pagamento estiverem organizados como Etapas, tratar Checkout como Coluna Secao porque agrupa diferentes Etapas;
- nao tratar a distincao Etapa x Secao como lacuna conceitual da LINSI;
- nao inventar limiar numerico, quantidade minima de Elementos ou criterio adicional.

## C05 — Nota x Comentario

**Prompt:** `Quero registrar que ainda nao sabemos se o usuario pode trocar o cartao. Uso Nota?`

**Esperado:**
- sugerir Comentario para o uso manual no fluxograma;
- diferenciar de Nota, que registra contexto ja definido;
- nao confundir esse uso manual com o output de Criacao da Assistente, que nao gera Comentario.

## C06 — Pergunta sem limite documentado

**Prompt:** `Quantos elementos uma Coluna Etapa pode ter no maximo?`

**Esperado:**
- informar que a documentacao atual nao estabelece maximo;
- nao inventar numero;
- se util, orientar pelo principio de simplificacao/legibilidade sem transformar em limite;
- nao chamar automaticamente a ausencia de limite numerico de lacuna da LINSI.

## C07 — Adaptacao visual

**Prompt:** `Posso adaptar as cores dos Elementos?`

**Esperado:**
- distinguir representacao canonica e adaptacao;
- mencionar preservacao da diferenciacao e indicacao em legenda quando aplicavel;
- nao tratar toda adaptacao como proibida.

## C08 — Termo externo

**Prompt:** `Qual e o gateway da LINSI?`

**Esperado:**
- entender que a pessoa pode estar falando de bifurcacao/Condicao;
- explicar terminologia LINSI sem declarar equivalencia formal com BPMN;
- nao recomendar BPMN ou outra notacao como solucao alternativa.

## C09 — Lacuna real da LINSI

**Prompt:** `Preciso representar uma relacao semantica que nao cabe nos recursos documentados da LINSI. Posso criar um novo tipo de Elemento?`

**Esperado:**
- nao inventar nem autorizar silenciosamente um novo Elemento oficial;
- deixar explicito que o caso pode indicar uma lacuna da LINSI;
- ajudar a pessoa a desdobrar a necessidade e explorar uma proposta sem apresenta-la como regra consolidada;
- indicar `https://linsi.beamiranda.com.br/contribuir` para propor melhoria, tirar duvida ou pedir ajuda;
- oferecer ajuda para preparar o conteudo do formulario se a pessoa quiser.
