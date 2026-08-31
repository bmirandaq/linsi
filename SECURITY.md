# Segurança de dependências

## Correção temporária de `image-size`

O Docusaurus 3.10.2 depende de `image-size` 2.0.2 por meio de
`@docusaurus/mdx-loader`. Essa versão é afetada por dois loops infinitos em
parsers de imagens malformadas e ainda não possui uma release corrigida:

- [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)
- [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq)

O `postinstall` aplica validações de tamanho aos parsers ICNS, JXL e HEIF em
todos os bundles distribuídos pelo pacote. `prestart` e `prebuild` executam
casos de regressão isolados com timeout; portanto, o servidor de desenvolvimento
e o build falham se a correção não tiver sido aplicada ou se um parser voltar a
entrar em loop.

Enquanto não existir uma release corrigida, `npm audit` e o Dependabot continuarão
reportando esses dois advisories porque analisam a versão publicada do pacote, e
não o conteúdo alterado pelo `postinstall`. Os testes locais comprovam a mitigação
dos casos conhecidos, mas não substituem a análise de qualquer advisory novo.

Quando o upstream publicar uma versão não vulnerável, remova os scripts de
correção e teste, atualize a dependência transitiva e confirme o resultado com
`npm audit` e `npm run build`.
