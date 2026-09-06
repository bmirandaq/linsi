import React, {useEffect, useRef} from 'react';
import styles from './styles.module.css';

type Point = {x: number; y: number; time: number};

// The native cursor stays at the actual click point; only its trail eases away.
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const root = document.documentElement;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lifetime = 180;
    let points: Point[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let color = '';

    const clear = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      points = [];
      context.clearRect(0, 0, width, height);
    };

    const resize = () => {
      clear();
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      points = points.filter((point) => now - point.time < lifetime);
      context.strokeStyle = color;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      for (let index = 1; index < points.length; index += 1) {
        const before = points[Math.max(0, index - 2)];
        const previous = points[index - 1];
        const point = points[index];
        const freshness = Math.max(0, 1 - (now - previous.time) / lifetime);
        context.globalAlpha = freshness * 0.22;
        context.lineWidth = 0.75 + freshness * 1.5;
        context.beginPath();
        context.moveTo((before.x + previous.x) / 2, (before.y + previous.y) / 2);
        context.quadraticCurveTo(
          previous.x, previous.y,
          (previous.x + point.x) / 2, (previous.y + point.y) / 2,
        );
        context.stroke();
      }

      context.globalAlpha = 1;
      frame = points.length > 1 ? window.requestAnimationFrame(draw) : 0;
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        clear();
        root.classList.remove('linsi-custom-cursor');
        return;
      }
      if (!pointer.matches) return;
      root.classList.add('linsi-custom-cursor');
      if (reducedMotion.matches) return;

      // Preserve text, resize, zoom and disabled cursors without a trailing effect.
      if (!(event.target instanceof Element) ||
          !window.getComputedStyle(event.target).cursor.startsWith('url(')) {
        clear();
        return;
      }

      if (!frame) {
        color = window.getComputedStyle(root).getPropertyValue('--linsi-brand-01-base').trim();
      }
      points.push({x: event.clientX, y: event.clientY, time: performance.now()});
      points = points.slice(-32);
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const updatePreference = () => {
      root.classList.toggle('linsi-custom-cursor', pointer.matches);
      clear();
    };

    resize();
    updatePreference();
    window.addEventListener('pointermove', move, {passive: true});
    window.addEventListener('resize', resize);
    window.addEventListener('blur', clear);
    window.addEventListener('pointercancel', clear);
    document.addEventListener('pointerleave', clear);
    document.addEventListener('visibilitychange', clear);
    pointer.addEventListener('change', updatePreference);
    reducedMotion.addEventListener('change', updatePreference);

    return () => {
      clear();
      root.classList.remove('linsi-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', clear);
      window.removeEventListener('pointercancel', clear);
      document.removeEventListener('pointerleave', clear);
      document.removeEventListener('visibilitychange', clear);
      pointer.removeEventListener('change', updatePreference);
      reducedMotion.removeEventListener('change', updatePreference);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.trail} aria-hidden="true" />;
}
