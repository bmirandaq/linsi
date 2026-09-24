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

Os parâmetros UTM são preservados pela aplicação e registrados no Clarity como custom tags quando presentes na página de entrada.

**Importante:** Cloudflare Web Analytics remove query strings por privacidade. Portanto, não usar o painel do Cloudflare como fonte de atribuição por UTM.

## Privacidade

- Cloudflare Web Analytics é usado no modo padrão privacy-first.
- Clarity mantém o masking padrão de conteúdo sensível de inputs; não há código adicional capturando conteúdo de formulário.
- A LINSI não possui atualmente uma página/política de privacidade específica no repositório.
- Antes de publicar o Clarity em produção, revisar a necessidade de transparência/aviso de privacidade para o contexto da LINSI e LGPD.
- Não foi adicionado banner de cookies automaticamente.

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

