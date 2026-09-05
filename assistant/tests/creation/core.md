# Casos de teste — Criacao

Avaliar cada caso com `../evaluation.md`.

Em todos os casos, indicar os links oficiais correspondentes aos conceitos LINSI usados na proposta quando essas fontes existirem.

## CR01 — Fluxo simples

**Prompt:** `Preciso representar um reset de senha: a pessoa informa o e-mail, recebe um codigo, valida e cria uma nova senha.`

**Esperado:**
- propor sequencia coerente sem interrogatorio;
- usar Interfaces/Acoes/Condicoes apenas quando fizer sentido;
- nao adicionar Caminhos de erro inexistentes sem marcar como hipotese;
- entregar output textual reconstruivel.

## CR02 — Contexto incompleto

**Prompt:** `Temos um checkout com cartao e PIX. A pessoa pode comprar logada ou sem login. No cartao usamos um SDK externo e nao recebemos todos os estados de erro.`

**Esperado:**
- interpretar e propor sem exigir detalhamento completo;
- explicitar premissas estruturais relevantes;
- distinguir o que a pessoa percebe do que acontece internamente no SDK;
- considerar Caminhos diferentes quando sustentados pelo contexto;
- nao inventar estados tecnicos.

## CR03 — Ruido tecnico

**Prompt:** incluir descricao longa de APIs, filas e integracoes, mas pedir `quero mapear a experiencia de acompanhar um pedido`.

**Esperado:**
- manter foco na experiencia;
- incluir processo tecnico apenas quando necessario para explicar reflexos percebidos;
- evitar transformar arquitetura em fluxograma principal.

## CR04 — Multiplos papeis

**Prompt:** `A cliente solicita reembolso, atendimento analisa, financeiro aprova e a cliente recebe o dinheiro.`

**Esperado:**
- manter cliente como referencia principal;
- representar outros papeis/processos quando necessarios;
- nao presumir detalhes internos nao fornecidos.

## CR05 — Alternativa e falha

**Prompt:** `A pessoa tenta pagar. Se o cartao for aprovado, conclui. Se for recusado, pode tentar outro cartao. Tambem pode escolher PIX.`

**Esperado:**
- diferenciar continuidade positiva, negativa e alternativa pelo significado;
- nao classificar PIX como negativo;
- representar retorno/tentativa de forma legivel.

## CR06 — Sem necessidade de Colunas

**Prompt:** fornecer fluxo curto de 3 a 4 acontecimentos lineares.

**Esperado:**
- nao criar Colunas apenas para parecer organizado;
- manter representacao simples.

## CR07 — Coluna Secao plausivel

**Prompt:** fornecer jornada longa com `Descoberta`, `Checkout` e `Pos-compra`, e dentro de Checkout cadastro, entrega e pagamento.

**Esperado:**
- considerar Secoes macro e Etapas internas somente se ajudarem a leitura e corresponderem a relacoes reais do fluxo;
- nao transformar Interfaces ou estados internos em Etapas apenas para preencher uma hierarquia;
- nao transformar tudo em grade;
- explicar interpretacoes que nao sejam regra fechada.

## CR08 — Requisitos conflitantes

**Prompt:** texto diz que pagamento recusado encerra a compra; outra parte diz que a pessoa pode tentar novamente.

**Esperado:**
- sinalizar contradicao;
- nao escolher silenciosamente uma das versoes;
- propor modelagem provisoria apenas se deixar a premissa clara.

## CR09 — Escopo amplo demais

**Prompt:** `Quero mapear a jornada completa do cliente desde campanha ate suporte, mas meu problema agora e abandono no pagamento.`

**Esperado:**
- sugerir recorte focado no problema;
- nao assumir end-to-end como padrao;
- explicar por que um recorte menor pode ser mais util.

## CR10 — Convergencia

**Prompt:** dois Caminhos diferentes levam ao mesmo resumo final e seguem juntos.

**Esperado:**
- reconhecer convergencia como relacao entre Caminhos;
- evitar duplicar toda a continuidade comum sem necessidade;
- nao tratar Convergencia como Elemento ou conceito independente da estrutura de Caminhos.
