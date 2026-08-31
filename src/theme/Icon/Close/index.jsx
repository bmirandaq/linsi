import React from 'react';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

export default function IconClose({width = 21, height, ...props}) {
  return <MaterialSymbol {...props} name="close" size={width ?? height} />;
}
