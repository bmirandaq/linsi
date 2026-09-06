import React, {useEffect, useRef, useState} from 'react';
import styles from './styles.module.css';

const SCROLL_THRESHOLD = 300;

type ScrollTarget = HTMLElement | null;

const isScrollable = (element: HTMLElement): boolean =>
  element.scrollHeight - element.clientHeight > SCROLL_THRESHOLD;

const getDocumentScroller = (): HTMLElement =>
  (document.scrollingElement as HTMLElement | null) ?? document.documentElement;

export default function GlobalBackToTopButton() {
  const [shown, setShown] = useState(false);
  const activeScrollerRef = useRef<ScrollTarget>(null);

  useEffect(() => {
    let frame = 0;

    const getMetrics = () => {
      const documentScroller = getDocumentScroller();
      const activeScroller = activeScrollerRef.current;

      if (activeScroller && isScrollable(activeScroller)) {
        return {
          scrollTop: activeScroller.scrollTop,
          scrollableDistance: activeScroller.scrollHeight - activeScroller.clientHeight,
        };
      }

      return {
        scrollTop: Math.max(window.scrollY, documentScroller.scrollTop),
        scrollableDistance: documentScroller.scrollHeight - window.innerHeight,
      };
    };

    const update = () => {
      frame = 0;
      const {scrollTop, scrollableDistance} = getMetrics();
      setShown(scrollTop > SCROLL_THRESHOLD && scrollableDistance > SCROLL_THRESHOLD);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleScroll = (event: Event) => {
      const target = event.target;

      if (target instanceof HTMLElement && target !== document.documentElement && isScrollable(target)) {
        activeScrollerRef.current = target;
      } else if (target === document) {
        activeScrollerRef.current = null;
      }

      scheduleUpdate();
    };

    scheduleUpdate();
    window.addEventListener('scroll', handleScroll, {passive: true});
    document.addEventListener('scroll', handleScroll, {passive: true, capture: true});
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    const activeScroller = activeScrollerRef.current;

    if (activeScroller && isScrollable(activeScroller)) {
      activeScroller.scrollTo({top: 0, behavior});
      return;
    }

    window.scrollTo({top: 0, behavior});
  };

  return (
    <button
      aria-label="Voltar ao topo"
      className={`${styles.button} ${shown ? styles.buttonShown : ''}`}
      type="button"
      onClick={scrollToTop}
    >
      <span className="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
    </button>
  );
}
