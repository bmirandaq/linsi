# Analytics MVP — LINSI

## Escopo

O MVP usa apenas:

- **Cloudflare Web Analytics** para tráfego e pageviews;
- **Microsoft Clarity** para comportamento, heatmaps, gravações de sessão e eventos de intenção;
- **UTMs** nos links externos de divulgação.

Não há GA4, PostHog, banco próprio ou dashboard customizado.

## Variáveis de produção

Configurar no GitHub Actions / ambiente de produção:

```txt
CLOUDFLARE_WEB_ANALYTICS_TOKEN=
CLARITY_PROJECT_ID=
```

Se uma variável estiver ausente, a integração correspondente não é carregada e o build continua funcionando.

Analytics fica desabilitado fora de build de produção.

Os valores vêm dos secrets do repositório no passo de build de `.github/workflows/deploy.yml`; não devem ser commitados. O plugin local `linsi-analytics` usa `injectHtmlTags` do Docusaurus para inserir os snippets somente no HTML estático. Não usar `headTags` da configuração para esses snippets: o Docusaurus também serializa essa configuração no bundle JavaScript. Os IDs de coleta ficam públicos no HTML por necessidade das ferramentas; não são credenciais de administração.

### Estratégia Cloudflare: snippet manual

Manter apenas o snippet manual condicionado ao secret, com `https://static.cloudflareinsights.com/beacon.min.js`. Ao configurar `linsi.beamiranda.com.br` em Web Analytics, desabilitar a injeção automática para esse hostname, caso esteja habilitada. Não combinar as duas estratégias. A leitura do HTML público em 24/09/2026 não encontrou Cloudflare nem Clarity; isso não substitui a conferência da configuração no painel.

O snippet de inicialização do Clarity permanece o oficial. Não há tracking manual de rotas: a navegação SPA é tratada pelos SDKs. Requisições de métricas/encerramento de sessão não devem ser confundidas com pageviews adicionais. A validação de contagens reais depende dos painéis.

## Eventos customizados

Eventos mínimos enviados ao Clarity:

- `workshop_view`: clique na âncora “Participar do workshop” na Home;
- `workshop_signup_click`: clique no CTA da seção do workshop que leva à página de inscrição.

A rota `/workshop` já é observável por pageview; por isso não há evento redundante de pageview manual.

## UTMs

Padrão recomendado:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content` quando necessário

Campanha inicial:

```txt
utm_campaign=workshop_linsi
```

Exemplos:

### LinkedIn

```txt
https://linsi.beamiranda.com.br/?utm_source=linkedin&utm_medium=social&utm_campaign=workshop_linsi
```

### VagasUX

```txt
https://linsi.beamiranda.com.br/?utm_source=vagasux&utm_medium=community&utm_campaign=workshop_linsi
```

### Croq

```txt
https://linsi.beamiranda.com.br/?utm_source=croq&utm_medium=community&utm_campaign=workshop_linsi
```

### GUIA

```txt
https://linsi.beamiranda.com.br/?utm_source=guia&utm_medium=community&utm_campaign=workshop_linsi
```

Na entrada do documento, o snippet lê exclusivamente os quatro parâmetros acima e os enfileira como custom tags no Clarity, limitados a 120 caracteres. A navegação interna pode remover a query da URL; ela não reenfileira as tags nem injeta novamente os scripts. Não incluir dados pessoais em URLs de campanha.

**Importante:** Cloudflare Web Analytics remove query strings por privacidade. Portanto, não usar o painel do Cloudflare como fonte de atribuição por UTM.

## Privacidade

- Cloudflare Web Analytics é usado no modo padrão privacy-first.
- O código não muda masking, não declara `data-clarity-unmask` e não envia campos de formulário, custom IDs, session IDs ou friendly names. Os eventos enviam somente seus nomes.
- No projeto Clarity, Bea confirmou **Settings > Masking > Balanced (Equilibrado)** e **cookies desligados**. O código não concede consentimento automaticamente nem altera essas configurações. Confirmar em produção a ausência de regras Unmask para o formulário e validar Nome, E-mail, Cargo, Empresa, LinkedIn, WhatsApp e Cupom em uma gravação nova com dados fictícios. A documentação da Microsoft informa que inputs são mascarados em todos os modos, mas a gravação real ainda precisa ser inspecionada.
- A LINSI não possui atualmente uma página/política de privacidade específica no repositório.
- Antes de publicar o Clarity em produção, revisar a necessidade de transparência/aviso de privacidade para o contexto da LINSI e LGPD.
- Não foi adicionado banner de cookies automaticamente.

### Recomendação separada para decisão da Bea

Publicar informação acessível sobre finalidade da coleta, fornecedores, gravações de sessão, dados mascarados, configuração de cookies e canal de contato. A decisão informada por Bea é manter os cookies do Clarity desligados; eventual mudança de consentimento deve ser explícita. O masking e a ausência de cookies não substituem essa transparência. Nenhuma página, banner ou concessão automática de consentimento foi implementada neste PR; esta é uma recomendação técnica, não parecer jurídico.

Referências oficiais: [masking do Clarity](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), [Consent Mode](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode), [SPA e UTMs no Cloudflare](https://developers.cloudflare.com/web-analytics/faq/).

## QA automatizado

- `npm run test:analytics` (também em `prebuild`): configuração ausente/inválida, produção/desenvolvimento, endpoints, UTMs permitidas, payload mínimo e chamadas seguras sem Clarity/SSR.
- `node scripts/test-analytics-build.cjs build`: ausência dos scripts e IDs no build sem configuração.
- `node scripts/test-analytics-browser.mjs`: cliques reais, navegação SPA, campos sem envio ao helper, console e ausência/carregamento único dos scripts.
- O CI gera um segundo build em `build-analytics`, com IDs **fictícios**, e executa os testes de build/browser com `ANALYTICS_TEST_ENABLED=1`. Os fornecedores são interceptados; nenhuma coleta real é alegada por esses testes.
- `node scripts/test-analytics-visual.mjs`: compara a Home entre `ANALYTICS_BASELINE_URL` e `SMOKE_BASE_URL`, com screenshots desktop 1440×1000 e mobile 390×844, light/dark, em `artifacts/analytics-qa`. No CI a comparação é entre builds sem/com analytics; no QA local também foi comparada à `main`.
- Os testes de build com IDs fictícios verificam que cada HTML gerado pelo Docusaurus contém um único snippet por fornecedor e que os IDs não aparecem em JS, JSON ou sourcemaps. O HTML independente `static/share-linsi/index.html` é apenas copiado e permanece sem analytics, como no PR original.

## Estado da validação externa (24/09/2026)

- Presença de `CLOUDFLARE_WEB_ANALYTICS_TOKEN` e `CLARITY_PROJECT_ID` confirmada pela lista de secrets do GitHub, sem acesso/exposição dos valores. O workflow de produção já fornece ambos ao build.
- Masking Equilibrado e cookies desligados confirmados por Bea no Clarity; a gravação real ainda não foi inspecionada pelo agente.
- A branch foi atualizada com a `main` `1c950a1` (PR #71), preservando os refinamentos de radius, navegação, feedback do Workshop e `TESTING.md`.
- Nova leitura do HTML público após o cadastro dos secrets encontrou zero snippets Cloudflare e zero snippets Clarity. Não há injeção automática observada nessa resposta; conferir novamente após o deploy.
- Os testes com IDs fictícios validam a integração local, não os valores reais dos secrets nem o recebimento pelos fornecedores. Recebimento das quatro UTMs, eventos, pageviews SPA sem duplicação, comportamento sem cookies e gravação mascarada são verificações pós-deploy.
- O PR #72 permanece aberto. Não foi feito merge do PR nem deploy.

## Validação esperada em produção

Após configurar os IDs e publicar:

1. abrir a Home em produção;
2. confirmar carregamento único dos scripts Cloudflare e Clarity;
3. navegar entre Home, Docs e Workshop;
4. confirmar pageviews no painel;
5. testar uma URL com UTM;
6. verificar no Clarity as tags `utm_*`;
7. clicar em “Participar do workshop” e no CTA de inscrição;
8. confirmar os eventos `workshop_view` e `workshop_signup_click`;
9. verificar uma gravação de sessão e confirmar que campos pessoais do workshop continuam mascarados.

