---
sidebar_position: 1
title: Elementos
---
# Elementos
---

### Seta

Conecta os elementos. 

[img]

Tipos de seta: 
- **Comum**: continuidade, direção genérica. Aplica-se cor cinza/neutra.
- **Positiva**: direção ao sucesso, esperada. Cor verde.
- **Negativa**: direção a uma falha ou erro. Cor vermelha.
- **Alternativa**: direção secundária, alternativa, de exceção. Cor laranja.

**Particularidades** 

1. Setas podem ter rótulos ao decorrer da linha.
2. Dependendo do contexto, há setas que podem vir a significar a mesma coisa. Exemplo: Comuns vs Positivas, Negativas vs Alternativas. Use a que mais fizer sentido e destaque ao cenário.

---

### Interface

Expõe o que é fornecido, visível e/ou o que é possível interagir.

Tipos delemento Interface:

**Tela**

[img]

É a interface primária: página, painel visível. Pode conter título, conteúdo e ações.

**Janela**

[img]

Interface que sobrepõe uma tela, seja por completo ou parcialmente: modal, drawer, popover, qualquer elemento transitório que não substitui Tela.

---

### Processo

Expõe o comportamento do sistema, seja uma reação pós-acionamento ou autônoma.

Não necessariamente há visibilidade/percepção à pessoa usuária sobre o que for expresso em um elemento Processo. Reflexos possíveis: carregamento, skeleton, toaster. 

Neste caso, é esperado apresentar elemento Interface (Tela ou Janela) para especificar qual é o reflexo.

---

### Ação

Expõe a interação ou acionamento realizado pela pessoa usuária durante o fluxo.  
Pode ser uma ação completa ou apenas o rótulo do botão, link ou comando disparado.

---

### Condição

Representa uma verificação que pode abrir dois ou mais caminhos no fluxo.  
O rótulo da Condição deve ser escrito como uma pergunta.  

Use perguntas afirmativas. Evite perguntas negativas porque dificultam a coerência dos rótulos nas setas subsequentes.  

Setas que partem da Condição devem conter rótulo e precisam concordar nominalmente com a pergunta formulada.

---

### Início

Representa o ponto de partida do fluxo.  
Pode ser descartável em fluxos cujo início já esteja escancarado pelo contexto.

---

### Fim
Representa encerramento da jornada exposta.

---

### Retomada
Redirecionamento para outro fluxo ou jornada existente.

---

### Nota
Elemento auxiliar para explicações, regras de negócio e informações adicionais.

---

### Comentário
Elemento temporário para dúvidas, pontos em aberto e observações de trabalho.