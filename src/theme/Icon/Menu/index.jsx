import React from 'react';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

export default function IconMenu({width = 30, height, ...props}) {
  return <MaterialSymbol {...props} name="menu" size={width ?? height} />;
}
