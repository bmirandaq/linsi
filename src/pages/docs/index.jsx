import React, {useEffect} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

export default function ManualIndex() {
  const manualUrl = useBaseUrl('/docs/principios');

  useEffect(() => {
    window.location.replace(manualUrl);
  }, [manualUrl]);

  return (
    <Layout title="Manual" description="Acessar o Manual da LINSI">
      <main>
        <div className="container padding-vert--xl">
          <Heading as="h1">Manual da LINSI</Heading>
          <p>
            Redirecionando para o início do manual. Se isso não acontecer,{' '}
            <Link to={manualUrl}>acesse Princípios</Link>.
          </p>
        </div>
      </main>
    </Layout>
  );
}
