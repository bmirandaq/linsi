import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

function clearDetachedSearchInput() {
  if (typeof window === 'undefined') return;

  const input = document.querySelector('.aa-DetachedContainer .aa-Input');
  if (!(input instanceof HTMLInputElement) || !input.value) return;

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set;

  if (!nativeInputValueSetter) return;

  nativeInputValueSetter.call(input, '');
  input.dispatchEvent(new Event('input', {bubbles: true}));
}

export default function NavbarSearch({children, className}) {
  const handleClickCapture = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('.aa-DetachedSearchButton')) {
      clearDetachedSearchInput();
    }
  };

  return (
    <div
      className={clsx(className, styles.navbarSearchContainer)}
      onClickCapture={handleClickCapture}>
      {children}
    </div>
  );
}
