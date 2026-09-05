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
- antes de recomendar outro artefato, verificar se os recursos atuais da LINSI resolvem a necessidade sem distorcao ou sobrecarga;
- mudancas no background tecnico devem ser cobertas por testes de contaminacao semantica.

### Output textual

**Status:** consolidado como requisito; formato ainda pendente

A Fase 1 tera um padrao textual proprio do Assistente para comunicar fluxogramas. Esse padrao nao deve ser apresentado como uma nova notacao LINSI.

### Distribuicao

**Status:** consolidado como premissa

O usuario final nao deve precisar clonar o repositorio inteiro. A Skill deve ser distribuida como pacote portatil e por instalacao simplificada nas CLIs mais relevantes.
