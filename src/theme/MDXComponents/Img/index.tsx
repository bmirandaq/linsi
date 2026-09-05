import React, {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import {createPortal} from 'react-dom';

import styles from './styles.module.css';

type Props = ComponentPropsWithoutRef<'img'>;

export default function MDXImg({alt = '', ...props}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const image = imageRef.current;

    if (!trigger || !image) {
      return undefined;
    }

    let animationFrame = 0;
    const syncTriggerWidth = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        trigger.style.removeProperty('width');
        const renderedWidth = image.getBoundingClientRect().width;

        if (renderedWidth > 0) {
          trigger.style.width = `${renderedWidth}px`;
        }
      });
    };

    syncTriggerWidth();
    image.addEventListener('load', syncTriggerWidth);
    window.addEventListener('resize', syncTriggerWidth);

    return () => {
      cancelAnimationFrame(animationFrame);
      image.removeEventListener('load', syncTriggerWidth);
      window.removeEventListener('resize', syncTriggerWidth);
    };
  }, [props.src]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const appRoot = document.getElementById('__docusaurus');
    const previousRootInert = appRoot?.inert ?? false;
    const previousRootAriaHidden = appRoot?.getAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    if (appRoot) {
      appRoot.inert = true;
      appRoot.setAttribute('aria-hidden', 'true');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
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

      if (appRoot) {
        appRoot.inert = previousRootInert;
        if (previousRootAriaHidden === null) {
          appRoot.removeAttribute('aria-hidden');
        } else {
          appRoot.setAttribute('aria-hidden', previousRootAriaHidden);
        }
      }

      triggerRef.current?.focus();
    };
  }, [open]);

  const accessibleName = alt ? `Ampliar imagem: ${alt}` : 'Ampliar imagem';

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={accessibleName}
        onClick={() => setOpen(true)}>
        <img
          ref={imageRef}
          decoding="async"
          loading="lazy"
          alt={alt}
          {...props}
        />
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
            onClick={handleBackdropClick}>
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
            <img className={styles.expandedImage} alt={alt} {...props} />
          </div>,
          document.body,
        )}
    </>
  );
}
