import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import MaterialSymbol from '@site/src/components/MaterialSymbol';

export default function IconExternalLink({
  width = 14,
  height,
  className,
  ...props
}) {
  return (
    <MaterialSymbol
      {...props}
      name="open_in_new"
      size={width ?? height}
      className={clsx('linsi-icon-external-link', className)}
      label={translate({
        id: 'theme.IconExternalLink.ariaLabel',
        message: '(abre em uma nova aba)',
        description: 'Rótulo acessível do ícone de link externo',
      })}
    />
  );
}
