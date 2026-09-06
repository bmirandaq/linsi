# Decisions

Registro de decisoes consolidadas sobre a operacionalizacao e implementacao do Assistente LINSI.

## Formato

Para cada decisao, registrar:

- data;
- decisao;
- racional;
- fontes afetadas;
- arquivos operacionais afetados;
- testes afetados;
- status.

## Decisoes iniciais

### Faseamento do Assistente

**Status:** consolidado

- Fase 1: Skill textual para Consulta, Criacao e Revisao.
- Fase 2: output estruturado + plugin Figma.
- Fase 3: adaptacao para Miro usando o mesmo modelo estruturado.

### Fonte de verdade

**Status:** consolidado

A documentacao em `docs/` define a LINSI. A camada `assistant/` operacionaliza esse modelo e nao cria regras independentes.

### Background tecnico complementar

**Data:** 2026-09-05

**Status:** consolidado como arquitetura da Fase 1

O Assistente pode consumir repertorio externo sobre diagramas, process mapping, UX mapping, notacoes tradicionais, cognicao visual, acessibilidade e disciplinas adjacentes.

Esse repertorio existe para melhorar interpretacao, comparacao, criacao e revisao, mas nao possui autoridade normativa sobre a LINSI.

Regras de governanca:

- `technical-background.md` guarda sintese offline e nao normativa;
- `public-references.md` guarda procedencia e manutencao das fontes externas;
- termos e simbolos externos nao possuem mapeamento automatico 1:1 para conceitos LINSI;
- quando houver conflito, prevalece a documentacao LINSI;
- mudancas no background tecnico devem ser cobertas por testes de contaminacao semantica.

### Escopo exclusivo da Assistente

**Data:** 2026-09-05

**Status:** consolidado

A Assistente LINSI trabalha com LINSI e somente LINSI.

O background tecnico pode ajudar a interpretar um problema, mas a Assistente nao deve recomendar, encaminhar ou propor outros artefatos, metodos ou notacoes como solucao alternativa. Comparacoes externas so entram quando forem explicitamente pedidas ou necessarias para interpretar material trazido pela pessoa.

Quando parte do problema exceder o que a LINSI documenta ou pretende representar, a Assistente deve delimitar o recorte que consegue tratar responsavelmente, preservar limites/premissas quando necessario e nao deformar a notacao para acomodar o restante.

### Navegacao e lacunas

**Data:** 2026-09-05

**Status:** consolidado

A interacao com a Assistente nao substitui nem oculta a documentacao oficial. Toda resposta deve manter acessivel a fonte correspondente ao que esta sendo tratado, quando ela existir.

Quando o ambiente suportar links embutidos no texto, preferir nomes de paginas/conceitos clicaveis em vez de URLs brutas, mantendo a mesma obrigacao de tornar a documentacao acessivel.

Quando a Assistente identificar uma lacuna da LINSI, deve:

- deixa-la explicita;
- ajudar a pessoa a desdobrar o caso e trabalhar possiveis solucoes sem apresenta-las como regra consolidada;
- indicar a pagina `https://linsi.beamiranda.com.br/contribuir`.

A pagina Contribuir pode ser usada para propor melhorias, tirar duvidas ou pedir ajuda. A Assistente tambem pode apoiar a pessoa a preparar o conteudo do formulario.

### Output textual

**Data:** 2026-09-05

**Status:** consolidado

A Fase 1 tera um padrao textual proprio da Assistente para comunicar fluxogramas. Esse padrao nao deve ser apresentado como uma nova notacao LINSI.

Decisoes consolidadas para o formato:

- as convencoes de Elementos seguem a ordem conceitual da documentacao oficial;
- a transcricao de um fluxo concreto segue a continuidade real da experiencia, nao a ordem da documentacao;
- Setas permanecem associadas aos Elementos que conectam e seus rotulos permanecem junto das proprias Setas;
- Caminhos e Colunas devem ser apresentados juntos quando ambos existirem;
- nesse caso, o texto percorre Colunas da esquerda para a direita e apresenta dentro de cada Coluna os Caminhos de cima para baixo;
- Convergencias devem aparecer no ponto em que acontecem e permanecem subordinadas a Caminhos;
- `Comentario` nao e gerado pela Assistente no output textual; seu uso pertence a pessoa usuaria;
- `Pontos em aberto da proposta` sao usados somente para informacao critica que nao possa ser inferida com seguranca;
- hipoteses responsaveis adotadas pela Assistente sao registradas em `Premissas`;
- o formato nao usa campos auxiliares `Origem:` ou `Entrada:` como convencao default;
- `Retomada` deve preservar sua funcao de continuidade para outro ponto ja representado quando uma conexao direta longa prejudicaria a leitura ou quando a continuidade estiver em outro fluxo/jornada;
- o formato deve ser proporcional e nao antecipar propriedades especificas de ferramentas ou do JSON da Fase 2.

### Distribuicao

**Data:** 2026-09-05

**Status:** consolidado para a primeira beta

O usuario final nao deve precisar clonar o repositorio inteiro.

A primeira release sera identificada como versao `0.1-beta`.

Suporte oficial da beta:

- ChatGPT;
- Codex CLI.

Outros hosts nao entram no suporte oficial enquanto nao puderem ser testados.

Na pagina publica, `Beta` deve aparecer como tag ao lado do titulo. A numeracao da versao deve aparecer apenas como texto de apoio, sem destaque. A evolucao visual e de conteudo dessa pagina sera tratada separadamente do fechamento tecnico da Skill.

### Fechamento da 0.1-beta

**Data:** 2026-09-06

**Status:** fechado para uso beta

A Fase 1 foi validada em smoke tests reais no ChatGPT cobrindo Criacao com contexto relativamente completo, Criacao com contexto inicial enxuto e Revisao visual de fluxograma existente.

A rodada confirmou o nucleo funcional esperado e gerou apenas ajustes de robustez no comportamento da Skill, sem mudanca conceitual da LINSI.

Os casos foram registrados em `assistant/tests/beta-smoke-0.1.md` para regressao futura.

A auditoria visual continua durante a beta como validacao de uso real. Qualquer semantica relevante observada apenas em imagem deve ser tratada como lacuna concreta e submetida a revisao humana antes de virar regra.
