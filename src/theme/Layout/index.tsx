import React, {type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import OriginalLayout from '@theme-original/Layout';
import BackToTopButton from '@theme/BackToTopButton';
import type {Props} from '@theme/Layout';

export default function Layout(props: Props): ReactNode {
  const location = useLocation();
  const docsPrefix = useBaseUrl('/docs/');
  const isDocsContentRoute = location.pathname.startsWith(docsPrefix);

  return (
    <OriginalLayout {...props}>
      {props.children}
      {/* DocRoot/Layout already renders the button for documentation pages. */}
      {!isDocsContentRoute && <BackToTopButton />}
    </OriginalLayout>
  );
}
