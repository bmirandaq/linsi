# Documentação LINSI

MVP da plataforma pública de documentação da LINSI — Linguagem Simplificada de Fluxogramas de UX.

## Editar conteúdo sem código

O projeto está preparado para o [Pages CMS](https://app.pagescms.org):

1. entre com a conta do GitHub;
2. autorize o repositório privado `bmirandaq/linsi`;
3. edite **Página inicial** ou **Documentação**;
4. salve para criar o commit e gerar uma nova prévia automaticamente.

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

## Prévia privada temporária

Enquanto a documentação estiver em construção, o repositório permanece privado e o Netlify gera a prévia a partir da branch principal. A configuração está em `netlify.toml` e usa:

- endereço temporário: `https://preview--linsi-359.netlify.app`;
- comando de build: `npm run build`;
- diretório publicado: `build`;
- Node.js 24;
- site servido na raiz (`BASE_URL=/`).

O acesso à prévia exige login no Netlify e está restrito à proprietária do projeto.

O workflow do GitHub Pages permanece disponível apenas para execução manual. Quando a documentação estiver pronta, torne o repositório público, habilite novamente o disparo por push e publique em `https://bmirandaq.github.io/linsi/`.

## Conteúdo editorial

Os textos da home ficam em `content/home.json`. As páginas da documentação ficam em `docs/` e usam Markdown com frontmatter. A configuração do editor está em `.pages.yml`.

As páginas acompanham somente o material autoral disponível. Seções sem conteúdo consolidado permanecem sinalizadas como em desenvolvimento. A pasta local `source/`, que contém materiais de origem e instruções internas, não é publicada.
