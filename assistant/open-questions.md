# Open questions

Registra lacunas conceituais que impedem ou fragilizam a operacionalização da LINSI para a Assistente.

## Como registrar

Cada questão deve informar:

- questão;
- fonte envolvida;
- motivo da ambiguidade;
- impacto em Consulta, Criação ou Revisão;
- opções identificadas;
- recomendação, se houver;
- status.

## Regras

- Não resolver lacunas silenciosamente na Skill.
- Não transformar interpretações da Assistente em regra oficial.
- Mudanças semânticas da LINSI exigem validação humana antes de serem tratadas como canônicas.
- Não registrar como open question uma pendência operacional, uma ausência de página dedicada ou uma dúvida já resolvida pela documentação existente.

## Questões abertas

Nenhuma questão conceitual aberta no momento.

## Questões encerradas

### OQ-COL-001 — Limite entre Coluna Etapa e Coluna Seção

- **Fonte:** `docs/estrutura-linsi/colunas.md`
- **Resolução:** a documentação já estabelece distinção funcional suficiente. Coluna Etapa organiza uma etapa específica da experiência e pode reunir diferentes Elementos e/ou mais de um Caminho. Coluna Seção agrupa partes relacionadas de forma mais ampla e pode reunir diferentes Etapas ou trechos que não precisem estar organizados como Etapas.
- **Decisão:** não criar limiar numérico, quantidade mínima de Elementos ou outro critério adicional. A classificação deve seguir a função do recorte descrita na documentação.
- **Status:** encerrado em 2026-09-05.

### OQ-VIS-001 — Informação semântica presente apenas em exemplos visuais

- **Fontes:** imagens de Elementos, Caminhos e Colunas.
- **Resolução:** exemplos visuais não criam regras por si só. Se uma auditoria encontrar informação semanticamente relevante presente apenas em imagem, isso deve ser tratado como possível lacuna da documentação e levado à revisão antes de virar regra da Skill.
- **Decisão:** a auditoria visual permanece como pendência operacional de validação, não como questão conceitual aberta.
- **Status:** encerrado como open question em 2026-09-05.

### OQ-SCREEN-001 — Regras específicas de screenflows

- **Fonte:** `docs/estrutura-linsi/elementos.md`.
- **Resolução:** a documentação já estabelece que, em screenflows, o protótipo cumpre a função do Elemento Interface. A ausência de uma página dedicada não cria ambiguidade conceitual sobre essa regra.
- **Decisão:** usar a regra explicitamente documentada. Se surgir futuramente uma dúvida específica de screenflows que a documentação não responda, registrar uma nova questão concreta.
- **Status:** encerrado em 2026-09-05.
