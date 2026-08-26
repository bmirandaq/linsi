import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './styles.module.css';

export default function MDXImg({alt = '', ...props}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  const accessibleName = alt ? `Ampliar imagem: ${alt}` : 'Ampliar imagem';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={accessibleName}
        onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img decoding="async" loading="lazy" alt={alt} {...props} />
        <span className={styles.affordance} aria-hidden="true">
          <span>Ampliar</span>
          <span className="material-symbols-outlined">search</span>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={styles.backdrop}
            role="dialog"
            aria-modal="true"
            aria-label={alt ? `Imagem ampliada: ${alt}` : 'Imagem ampliada'}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false);
              }
            }}>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              aria-label="Fechar imagem ampliada"
              onClick={() => setOpen(false)}>
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img className={styles.expandedImage} alt={alt} {...props} />
          </div>,
          document.body,
        )}
    </>
  );
}
