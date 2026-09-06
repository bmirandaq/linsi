import React, {useEffect} from 'react';
import styles from './styles.module.css';

export default function CustomCursor() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const update = () => {
      root.classList.toggle('linsi-custom-cursor', pointer.matches);
    };

    update();
    pointer.addEventListener('change', update);

    return () => {
      root.classList.remove('linsi-custom-cursor');
      pointer.removeEventListener('change', update);
    };
  }, []);

  return <span className={styles.marker} aria-hidden="true" />;
}
