import React from 'react';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

export default function IconLanguage({width = 20, height, ...props}) {
  return <MaterialSymbol {...props} name="language" size={width ?? height} />;
}
