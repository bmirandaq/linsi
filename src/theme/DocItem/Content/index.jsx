import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import OriginalDocItemContent from '@theme-original/DocItem/Content';

export default function DocItemContent(props) {
  const {metadata} = useDoc();

  return <OriginalDocItemContent key={metadata.id} {...props} />;
}
