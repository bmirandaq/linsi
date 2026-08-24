# Documentação LINSI

MVP da plataforma pública de documentação da LINSI — Linguagem Simplificada de Fluxogramas de UX.

## Site publicado

A documentação de produção está disponível em:

https://bmirandaq.github.io/linsi/

O repositório `bmirandaq/linsi` é público. Todo commit enviado para a branch `main` dispara automaticamente o workflow `.github/workflows/deploy.yml`, que gera o site com Docusaurus e o publica no GitHub Pages. O workflow também pode ser executado manualmente pelo GitHub Actions.

## Editar conteúdo sem código

O projeto está preparado para o [Pages CMS](https://app.pagescms.org):

1. entre com a conta do GitHub;
2. selecione o repositório público `bmirandaq/linsi`;
3. edite **Página inicial** ou **Documentação**;
4. salve para criar o commit na `main` e publicar a atualização automaticamente.

Imagens enviadas pelo editor são armazenadas em `static/img/uploads` e podem ser inseridas diretamente no conteúdo das páginas.

## Executar localmente

```bash
npm install
npm start
```

O ambiente local fica disponível em `http://localhost:3000`.

## Gerar o site estático

```bash
npm run build
```

Os arquivos de produção são gerados em `build/`.

## Conteúdo editorial

Os textos da home ficam em `content/home.json`. As páginas da documentação ficam em `docs/` e usam Markdown com frontmatter. A configuração do editor está em `.pages.yml`.

As páginas acompanham somente o material autoral disponível. Seções sem conteúdo consolidado permanecem sinalizadas como em desenvolvimento. A pasta local `source/`, que contém materiais de origem e instruções internas, não é publicada.
