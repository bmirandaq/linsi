# Open questions

Registra lacunas conceituais que impedem ou fragilizam a operacionalizacao da LINSI para o Assistente.

## Como registrar

Cada questao deve informar:

- questao;
- fonte envolvida;
- motivo da ambiguidade;
- impacto em Consulta, Criacao ou Revisao;
- opcoes identificadas;
- recomendacao, se houver;
- status.

## Regras

- Nao resolver lacunas silenciosamente na Skill.
- Nao transformar interpretacoes do agente em regra oficial.
- Mudancas semanticas da LINSI exigem validacao humana antes de serem tratadas como canonicas.

## OQ-COL-001 — Limite entre Coluna Etapa e Coluna Secao

- **Fonte:** `docs/estrutura-linsi/colunas.md`
- **Ambiguidade:** a documentacao define Etapa como agrupamento de uma etapa especifica e Secao como agrupamento mais amplo, mas nao estabelece criterios para todos os casos-limite.
- **Impacto:** Criacao e Revisao podem produzir classificacoes diferentes para estruturas intermediarias.
- **Opcao atual:** tratar a escolha como interpretacao contextual quando nao houver diferenca clara.
- **Recomendacao:** nao criar limiar numerico ou regra automatica. Avaliar futuramente se a documentacao precisa de exemplos comparativos Etapa x Secao.
- **Status:** aberto; nao bloqueia MVP se tratado como interpretacao.

## OQ-VIS-001 — Informacao semantica presente apenas em exemplos visuais

- **Fontes:** imagens de Elementos, Caminhos e Colunas.
- **Ambiguidade:** a primeira operacionalizacao foi baseada no texto explicito e nas representacoes descritas. Ainda e necessario auditar se algum exemplo visual comunica relacao importante que nao esta descrita em prosa.
- **Impacto:** pode afetar Criacao e Revisao visual.
- **Recomendacao:** auditar imagens; se houver semantica nao documentada, levar a documentacao publica antes de transformar em regra da Skill.
- **Status:** aberto; auditoria visual pendente.

## OQ-SCREEN-001 — Regras especificas de screenflows

- **Fonte:** `docs/estrutura-linsi/elementos.md` menciona que, em screenflows, o prototipo passa a cumprir a funcao do Elemento Interface.
- **Ambiguidade:** a documentacao atual consultada nao possui uma pagina consolidada de screenflows no indice principal usado nesta rodada.
- **Impacto:** Consultas e Criacao relacionadas a screenflows podem exigir orientacao complementar.
- **Recomendacao:** nao expandir a regra alem do que esta explicitamente documentado ate a pagina/contexto correspondente estar consolidado.
- **Status:** aberto; nao bloqueia uso geral.
