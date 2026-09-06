# Smoke tests da beta 0.1

Casos de regressao derivados dos primeiros testes reais da Assistente LINSI em ChatGPT.

Eles nao substituem `evaluation.md` nem os testes unitarios por funcao. Servem como baseline de comportamento fim a fim para a beta.

## B01 — Criacao com contexto rico e lacunas de produto

**Cenario:** fluxo de recuperacao de acesso com identificacao da pessoa, verificacoes do sistema, canal de recuperacao, codigo, redefinicao e cenarios de erro. Algumas regras de produto ainda nao estao definidas.

**Esperado:**

- reconhecer a tarefa como Criacao sem exigir que a pessoa modele previamente o fluxo;
- definir perspectiva e Escopo;
- separar fato, Premissa e informacao de produto ainda indefinida;
- nao tratar regra de produto ausente como lacuna da LINSI;
- distinguir Interface, Acao, Processo e Condicao;
- usar Colunas apenas para etapas reais da experiencia, nao para cada tela;
- preservar Caminhos principal, alternativo e negativo de forma reconstruivel;
- nao introduzir campos auxiliares `Origem:` ou `Entrada:`;
- usar `Retomada` somente quando ela evitar uma conexao longa/externa e o destino puder ser identificado sem ambiguidade;
- indicar a documentacao oficial relevante.

## B02 — Criacao com contexto inicial enxuto

**Cenario:** back-office em que se sabe apenas que a pessoa deve consultar registros relacionados a uma entidade e executar uma alteracao de estado. Autenticacao e funcionalidades adjacentes ainda nao fazem parte do recorte.

**Esperado:**

- respeitar explicitamente o que foi colocado fora do Escopo;
- nao inventar login, cadastro, filtros, paginacao, reativacao ou outras funcionalidades plausiveis apenas por serem comuns em back-offices;
- nao criar uma Condicao artificial para representar a escolha entre Acoes disponiveis na Interface;
- formular apenas hipoteses necessarias e identifica-las como Premissas;
- organizar continuidades distintas com Caminhos quando isso ajudar a leitura;
- nao criar Colunas Etapa redundantes apenas para separar tarefas irmas que pertencem ao mesmo momento da experiencia;
- indicar a documentacao oficial relevante.

## B03 — Revisao visual de fluxograma existente

**Cenario:** trecho de fluxo com Interface, Acoes, Processo, Condicoes, Caminhos, Notas, Colunas e Convergencia; parte da semantica precisa ser inferida a partir da imagem.

**Esperado:**

- reconhecer o que ja esta coerente antes de propor mudancas;
- distinguir resultado percebido pela pessoa de Processo do sistema;
- sinalizar quando Nota esta substituindo uma continuidade real da experiencia;
- revisar textos de Acoes que descrevem estado em vez de acao realizada;
- identificar inconsistencias entre possibilidades listadas na Interface e Acoes efetivamente representadas;
- sinalizar ambiguidades logicas sem inventar regra de negocio;
- diferenciar Seta Comum, Positiva, Negativa e Alternativa pelo significado da continuidade;
- preservar Convergencia como relacao entre Caminhos;
- avaliar Colunas por sua funcao de leitura, nao como grade;
- separar erro semantico, divergencia canonica, recomendacao, hipotese e lacuna;
- quando o host suportar links embutidos em texto, preferir nomes de paginas clicaveis em vez de URLs brutas;
- indicar a documentacao oficial relevante.

## Gate da beta 0.1

A beta pode ser considerada funcionalmente validada quando os tres cenarios acima forem executados sem falhas criticas de fidelidade LINSI, contaminacao por outras notacoes, invencao de requisitos, perda de Escopo ou impossibilidade de reconstruir a proposta.

A auditoria visual continua durante a beta como validacao de uso real. Qualquer semantica relevante encontrada apenas em imagem deve virar uma lacuna concreta para revisao humana; nunca uma nova regra automatica da Skill.
