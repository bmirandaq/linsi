# TESTING.md — contrato de implementação e QA

> **Status:** contrato operacional da plataforma LINSI.
>
> Este arquivo define como alterações no repositório devem ser implementadas, testadas e apresentadas para revisão da Bea. A documentação em `docs/` continua sendo a fonte de verdade conceitual da LINSI; este arquivo define apenas o processo de implementação e QA.

## 1. Regra de branch

- **Nunca desenvolver diretamente na `main`.**
- Antes de qualquer alteração material, partir da referência mais recente da `main` e abrir uma branch própria para o trabalho.
- A `main` só recebe mudanças após validação e autorização explícita da Bea.
- Não fazer merge, deploy ou publicação sem autorização explícita.
- Como commits na `main` podem disparar publicação da plataforma, não usar a `main` como ambiente de experimentação.

## 2. Antes de implementar

Antes de alterar código, conteúdo ou UI:

1. ler `README.md`;
2. ler este `TESTING.md`;
3. consultar a documentação relevante em `docs/` quando a tarefa envolver conceitos, regras, exemplos ou terminologia da LINSI;
4. consultar `content/home.json` quando a tarefa envolver a Home;
5. inspecionar a implementação atual antes de propor ou aplicar correção;
6. identificar componentes, tokens e estilos compartilhados que possam ampliar o impacto da mudança;
7. cumprir integralmente o prompt/instruções de implementação fornecidos pela Bea para a tarefa atual.

Não tratar pedidos como uma lista de remendos. Quando houver bug, regressão ou comportamento inesperado, investigar a causa antes de alterar a solução.

Não transformar uma mudança de interface em mudança conceitual da LINSI sem escopo explícito para isso.

## 3. Preservação de escopo e visual

Quando Bea pedir uma alteração limitada:

- o escopo aprovado é contrato;
- não alterar spacing, tipografia, tamanho, crop, posição, cor, hierarquia, motion, conteúdo ou comportamento fora do que foi solicitado;
- não fazer refactor oportunístico;
- não usar uma mudança visual para mascarar bug técnico;
- revisar o diff inteiro antes de enviar para garantir que toda diferença seja explicável pelo pedido.

Quando a tarefa for uma correção de comportamento sem mudança visual, comparar antes e depois para provar equivalência visual.

Quando a tarefa for visual, validar que a alteração desejada ocorreu sem criar drift nas áreas vizinhas ou nos componentes que compartilham tokens.

## 4. Testes obrigatórios

Toda mudança deve passar pelas camadas aplicáveis.

### 4.1 Código

Executar os checks relevantes disponíveis no repositório, incluindo quando aplicável:

- `npm run typecheck`;
- `npm run test:security`;
- `npm run test:worker`;
- `npm run test:ui`;
- `npm run test:colors`;
- `npm run test:spacing`;
- `npm run test:icons`;
- `npm run test:assets`;
- `npm run build`;
- testes específicos relacionados à área alterada.

O `npm run build` executa checks adicionais por `prebuild` e `postbuild`, mas isso não substitui testes específicos quando a mudança os exigir.

Um teste verde não substitui inspeção visual.

### 4.2 Testes de browser e responsividade

Para alterações de interface, executar os scripts de browser aplicáveis, especialmente:

- `node scripts/test-responsive-smoke.mjs`;
- `node scripts/test-mobile-docs-layout.mjs`;
- testes específicos de Workshop quando a mudança atingir essa superfície.

O responsive smoke atual cobre, entre outras referências:

- 1440 × 1000 — desktop amplo;
- 1200 × 900 — desktop;
- 997 × 900 — breakpoint de Docs;
- 768 × 900 — tablet;
- 390 × 844 — mobile;
- 360 × 800 — mobile pequeno.

O teste dedicado de Docs mobile usa também 440 × 956.

Quando a mudança afetar um breakpoint não coberto por esses scripts, adicionar validação manual ou automatizada adequada em vez de presumir que a cobertura existente é suficiente.

### 4.3 Teste visual

Alterações de interface precisam ser verificadas visualmente no browser, em light e dark mode quando a superfície suportar ambos.

Validar pelo menos:

- composição;
- spacing;
- alinhamento;
- overflow horizontal e vertical indevido;
- quebras de texto;
- comportamento responsivo;
- estados hover, focus-visible, active e disabled quando aplicáveis;
- imagens e crop quando afetados;
- comportamento durante scroll quando relevante;
- ausência de layout shift inesperado;
- consistência entre Home, documentação e páginas auxiliares quando compartilham foundations.

### 4.4 Regressão

Não testar apenas o elemento alterado.

Verificar também:

- section anterior e posterior;
- breakpoints relacionados;
- navegação e âncoras afetadas;
- componentes reutilizados;
- light/dark mode;
- busca quando tokens globais de UI forem alterados;
- sidebar e menus quando estilos globais ou tokens compartilhados forem alterados;
- páginas auxiliares que consumam a mesma foundation.

Quando a alteração atingir tokens globais, o QA precisa considerar todos os consumidores relevantes do token, mesmo que o pedido tenha partido de uma única tela.

## 5. Superfícies críticas da plataforma

Conforme o tipo de alteração, considerar no mínimo:

- Home `/`;
- documentação em `/docs/*`;
- busca;
- navegação desktop e mobile;
- Workshop `/workshop`;
- Contribuir `/contribuir-ajuda`;
- Café pra Bea `/cafe-bea`;
- Templates e componentes inseridos na documentação;
- footer e controles globais quando foundations compartilhadas forem alteradas.

Não é necessário testar todas as superfícies em toda mudança. É obrigatório testar todas as superfícies plausivelmente afetadas pelo código compartilhado alterado.

## 6. Bugs reportados por vídeo, screenshot ou dispositivo real

Quando Bea fornecer vídeo, screenshot ou relato reproduzível:

1. usar o material como evidência do comportamento real;
2. identificar a causa antes de editar;
3. criar ou adaptar regressão automatizada quando tecnicamente possível;
4. testar visualmente o comportamento corrigido;
5. não considerar o problema resolvido apenas porque um cenário sintético passa.

Se a automação não conseguir reproduzir uma característica do browser ou dispositivo real, registrar explicitamente essa limitação.

## 7. Acessibilidade e interação

Preservar e validar, quando aplicável:

- navegação por teclado;
- focus-visible;
- touch targets;
- semântica de links e buttons;
- estados disabled;
- contraste já aprovado;
- `prefers-reduced-motion`;
- conteúdo essencial independente de hover;
- ausência de clipping causado por aumento de fonte, radius ou tamanho de controles.

Não remover comportamento acessível existente para acomodar refinamento visual.

## 8. Critério de pronto

Uma mudança só pode ser enviada para revisão da Bea quando:

- o pedido foi implementado integralmente;
- o diff respeita o escopo aprovado;
- os testes de código aplicáveis passaram;
- os testes de browser aplicáveis passaram;
- o teste visual foi executado;
- as regressões relevantes foram verificadas;
- não há console errors conhecidos relacionados à mudança;
- não há regressão visual conhecida;
- não há item do pedido pendente;
- não há diferença não explicada em relação ao comportamento ou visual aprovado.

**Não enviar “para a Bea testar” como substituto de QA do agente.**

A revisão da Bea é validação final de produto/design, não a primeira rodada de teste.

## 9. Quando algo não puder ser validado

Se alguma validação obrigatória estiver bloqueada por ambiente, permissão, ferramenta ou limitação técnica:

- não declarar a tarefa como 100% concluída;
- informar exatamente o que foi validado;
- informar exatamente o que ficou sem validação;
- não mascarar incerteza com linguagem de conclusão.

## 10. Relato antes da revisão

Ao terminar, reportar de forma objetiva:

- branch;
- causa ou objetivo da mudança;
- solução aplicada;
- arquivos/áreas alterados;
- testes de código executados e resultado;
- testes visuais executados e viewports;
- regressões verificadas;
- qualquer diferença intencional ou limitação restante;
- link do PR.

Só então pedir revisão.
