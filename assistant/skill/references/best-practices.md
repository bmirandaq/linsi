# Boas praticas — referencia operacional

Fonte primaria: `docs/boas-praticas.md`

Boas praticas orientam solucoes preferenciais. Nao sao automaticamente regras da notacao.

## BP-SCOPE-001 — Definir escopo
- **Tipo:** good-practice
- **Status:** canonical

Antes de modelar, definir o que a representacao precisa mostrar, onde comeca e onde termina.

A LINSI pode representar desde um trecho especifico ate uma experiencia ampla. O nivel de abrangencia deve responder ao problema analisado, nao a uma premissa de completude.

## BP-SCOPE-002 — Camadas da jornada
- **Tipo:** good-practice
- **Status:** canonical

Distinguir quando relevante:

- experiencia da pessoa;
- processos operacionais/logisticos;
- processos tecnicos;
- outros papeis.

A experiencia da pessoa e a referencia principal, mas outras camadas podem entrar quando forem necessarias para compreensao.

## BP-SCOPE-003 — Limite de conhecimento
- **Tipo:** good-practice
- **Status:** canonical

Nao detalhar ou presumir comportamentos de outras areas quando o contexto nao for conhecido. Representar apenas o necessario e sinalizar necessidade de validacao quando aplicavel.

## BP-TERMS-001 — Mesmas coisas, mesmos termos
- **Tipo:** good-practice
- **Status:** canonical

Usar terminologia consistente para o mesmo conceito ao longo do fluxo.

Nao alternar sinonimos se isso puder sugerir diferencas inexistentes.

## BP-SPACE-001 — Respiracao
- **Tipo:** good-practice
- **Status:** canonical

Evitar densidade excessiva entre Elementos, Setas, rotulos e desdobramentos.

A documentacao sugere, como dica, um gap proximo ao tamanho do Elemento vizinho e ajuste conforme contexto.

Nao transformar essa dica em valor numerico obrigatorio.

## BP-LEG-001 — Contraste e legibilidade
- **Tipo:** good-practice
- **Status:** canonical

Texto, fundo, bordas e conexoes devem permanecer distinguiveis.

Se houver adaptacao de cores, manter contraste suficiente e evitar depender apenas de cor para comunicar diferenca importante.

## BP-LEG-002 — Revisar fora do zoom de criacao
- **Tipo:** good-practice
- **Status:** canonical

Considerar leitura em apresentacao, compartilhamento de tela e exportacao, nao apenas no zoom de edicao.

## BP-REVIEW-001 — Revisar como leitor
- **Tipo:** good-practice
- **Status:** canonical

Fazer leitura do inicio ao fim e verificar se e possivel identificar:

- quando e por que o fluxo se divide;
- continuidades possiveis;
- onde Caminhos convergem ou terminam;
- partes agrupadas/relacionadas;
- o que esta definido e o que permanece pendente.

## BP-VERSION-001 — Versionamento
- **Tipo:** good-practice
- **Status:** canonical

Quando for importante acompanhar evolucao ou consultar estados anteriores, considerar versionar o fluxograma.

## Regra para a Skill

Na revisao, nao rotular descumprimento de boa pratica como erro de LINSI salvo quando outra regra explicita tambem estiver sendo violada.

Preferir linguagem como:

- `recomendacao`;
- `melhoria de leitura`;
- `vale considerar`;
- `pode ajudar`.
