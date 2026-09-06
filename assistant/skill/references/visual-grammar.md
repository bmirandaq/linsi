# Gramatica visual — referencia operacional

A LINSI e uma notacao visual. Forma, cor, direcao, agrupamento e composicao podem carregar significado.

Este arquivo separa o que ja esta explicitamente documentado do que ainda precisa de auditoria visual mais profunda.

## Principio de leitura

Para cada aspecto visual, distinguir:

1. **invariante semantico** — se perdido, altera significado;
2. **representacao canonica** — forma visual proposta pela LINSI;
3. **adaptacao permitida** — mudanca que preserva significado e diferenciacao;
4. **boa pratica visual** — preferencia voltada a leitura/manutencao.

Nao tratar toda divergencia visual como erro semantico.

## Representacoes canonicas explicitadas em texto

### Setas
- Comum: cinza;
- Positiva: verde;
- Negativa: vermelha;
- Alternativa: laranja.

A classificacao depende do significado da continuidade, nao da cor usada isoladamente.

### Interface Tela
Retangulo com borda cinza.

### Interface Janela
Retangulo com borda cinza tracejada.

### Processo
Retangulo com fundo cinza.

### Acao
Capsula laranja.

### Condicao
Losango com fundo azul.

### Inicio
Hexagono concavo rosa orientado para a direita.

### Fim
Paralelogramo preto.

### Retomada
Paralelogramo cinza.

### Nota
Retangulo com fundo ciano-claro e borda tracejada.

### Comentario
Quadrado amarelo semelhante a post-it.

## Direcao e organizacao

- Caminhos representam continuidade na leitura horizontal.
- Colunas sao recortes verticais.
- Alinhamento horizontal sozinho nao cria Caminho.
- Alinhamento vertical sozinho nao cria Coluna.
- A ordem vertical dos Caminhos segue a hierarquia definida em `paths.md`.

## Texto

- textos curtos podem ser centralizados;
- conteudos extensos devem preferencialmente ficar alinhados a esquerda;
- rotulos de Setas devem permanecer localizaveis e legiveis;
- quando possivel, preferir rotulos em trechos horizontais.

## Adaptacoes

A documentacao orienta preservar a diferenciacao das formas propostas. Quando houver adaptacoes, indica-las nas legendas do artefato.

Na revisao, distinguir:

- perda de diferenciacao que compromete significado;
- divergencia da representacao canonica;
- adaptacao ainda compreensivel;
- melhoria opcional de leitura.

## Auditoria visual pendente

As imagens e exemplos da documentacao devem ser auditados para identificar informacoes semanticamente relevantes que estejam visiveis, mas nao suficientemente descritas em texto.

Ao encontrar esse caso:

- nao transformar o padrao visual observado em regra automaticamente;
- registrar a lacuna em `assistant/open-questions.md`;
- apontar a imagem/fonte;
- explicar qual decisao da Skill depende dela.

Exemplos visuais servem para demonstrar aplicacao; nao criam convencao so por repeticao.
