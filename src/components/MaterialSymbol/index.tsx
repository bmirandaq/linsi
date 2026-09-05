import React, {type CSSProperties, type ComponentPropsWithoutRef} from 'react';
import clsx from 'clsx';

type CssSize = number | string;

type MaterialSymbolProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  'children' | 'color'
> & {
  name: string;
  size?: CssSize;
  width?: CssSize;
  height?: CssSize;
  fill?: number;
  weight?: number;
  grade?: number;
  opticalSize?: number;
  color?: CSSProperties['color'];
  label?: string;
};

function toCssSize(value: CssSize): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export default function MaterialSymbol({
  name,
  className,
  size,
  width,
  height,
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  color,
  style,
  label,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...restProps
}: MaterialSymbolProps) {
  const accessibleLabel = label ?? ariaLabel;
  const resolvedSize = toCssSize(size ?? width ?? height ?? 24);

  return (
    <span
      {...restProps}
      className={clsx('material-symbols-outlined', className)}
      role={accessibleLabel ? 'img' : undefined}
      aria-label={accessibleLabel}
      aria-hidden={accessibleLabel ? undefined : (ariaHidden ?? true)}
      style={{
        color,
        fontSize: resolvedSize,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        ...style,
      }}>
      {name}
    </span>
  );
}
