import {useEffect} from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

const WORKSHOP_CHECKOUT_URL =
  'https://pay.herospark.com/workshop-mapeando-experiencias-com-linsi-545805';

export default function WorkshopRedirect() {
  useEffect(() => {
    window.location.replace(WORKSHOP_CHECKOUT_URL);
  }, []);

  return (
    <Layout
      title="Workshop"
      description="Inscrições para o workshop Mapeando experiências com LINSI">
      <Head>
        <meta httpEquiv="refresh" content={`0;url=${WORKSHOP_CHECKOUT_URL}`} />
      </Head>
      <main className="container margin-vert--xl">
        <h1>Inscrições do workshop</h1>
        <p>As inscrições agora são feitas pela HeroSpark.</p>
        <p>
          <a href={WORKSHOP_CHECKOUT_URL}>Ir para o checkout do workshop</a>
        </p>
      </main>
    </Layout>
  );
}
