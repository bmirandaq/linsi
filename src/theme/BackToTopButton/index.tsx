import React, {type ReactNode, useEffect, useState} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {ThemeClassNames} from '@docusaurus/theme-common';

import styles from './styles.module.css';

const SCROLL_THRESHOLD = 300;

const shouldShowBackToTop = (): boolean => {
  const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
  return window.scrollY > SCROLL_THRESHOLD && scrollableDistance > SCROLL_THRESHOLD;
};

export default function BackToTopButton(): ReactNode {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setShown(shouldShowBackToTop());
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
  };

  return (
    <button
      aria-label={translate({
        id: 'theme.BackToTopButton.buttonAriaLabel',
        message: 'Voltar ao topo',
        description: 'Rótulo acessível do botão de voltar ao topo',
      })}
      className={clsx(
        'clean-btn',
        ThemeClassNames.common.backToTopButton,
        styles.backToTopButton,
        shown && styles.backToTopButtonShow,
      )}
      type="button"
      onClick={scrollToTop}
    />
  );
}
