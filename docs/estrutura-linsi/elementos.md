---
sidebar_position: 1
title: Elementos
description: Camada de elementos da estrutura LINSI.
---

# Camada 1 - Elementos

**1\. Seta**  
A seta conecta os elementos. Tipos de seta: 

* Comum (genérica, esperada),   
* positiva (caminho de sucesso),   
* negativa (caminho de falha, erro, exceção) e   
* alternativa (caminho alternativo, secundário).

Setas podem ter rótulos na linha, principalmente quando partem de uma condição.

Setas comuns e positivas podem significar a mesma coisa, dependendo do contexto. Para maior destaque, usa-se a positiva.

**2\. Interface**  
Expõe o que é fornecido, visível e/ou o que é possível interagir.

**2.1 Tela**  
Interface primária: página, painel visível. Pode conter título, conteúdo e ações. 

**2.2 Janela**  
Interface que sobrepõe uma tela, por completo ou parcialmente: modal, drawer, popover, qualquer elemento transitório que não substitui a tela.

**3\. Processo**  
Expõe o comportamento do sistema, seja uma reação pós-acionamento da pessoa usuária ou autônoma.

A pessoa usuária não necessariamente tem visibilidade do que for expresso em um elemento de Processo. Reflexos possíveis em interface seriam carregamento, skeleton, toaster ou outras sinalizações. 

Neste caso, utilizar em conjunto de elemento Interface: Tela ou Janela.

**4\. Ação**  
Expõe a interação ou acionamento realizado pela pessoa usuária durante o fluxo.  
Pode ser uma ação completa ou apenas o rótulo do botão, link ou comando disparado.

**5\. Condição**  
Representa uma verificação que pode abrir dois ou mais caminhos no fluxo.  
O rótulo da Condição deve ser escrito como uma pergunta.  
Use perguntas afirmativas. Evite perguntas negativas porque dificultam a coerência dos rótulos nas setas subsequentes.  
Setas que partem da Condição devem conter rótulo e precisam concordar nominalmente com a pergunta formulada.

**6\. Início**  
Representa o ponto de partida do fluxo.  
Pode ser descartável em fluxos cujo início já esteja escancarado pelo contexto.

**7\. Fim**  
Representa encerramento da jornada exposta.

**8\. Retomada**  
Redirecionamento para outro fluxo ou jornada existente.

**9\. Nota**  
Elemento auxiliar para explicações, regras de negócio e informações adicionais.

**10\. Comentário**  
Elemento temporário para dúvidas, pontos em aberto e observações de trabalho.
