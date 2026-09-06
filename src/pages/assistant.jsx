import React, {useEffect} from 'react';
import Layout from '@theme/Layout';

const SKILL_SOURCE_URL =
  'https://github.com/bmirandaq/linsi/tree/assistant-phase-1/assistant/skill';

export default function AssistantSkillSource() {
  useEffect(() => {
    window.location.replace(SKILL_SOURCE_URL);
  }, []);

  return (
    <Layout title="Assistente LINSI — Skill" description="Fonte oficial da Skill Assistente LINSI.">
      <main className="container margin-vert--lg">
        <h1>Assistente LINSI</h1>
        <p>Redirecionando para a fonte oficial da Skill.</p>
        <p>
          <a href={SKILL_SOURCE_URL}>Abrir Skill no GitHub</a>
        </p>
      </main>
    </Layout>
  );
}
