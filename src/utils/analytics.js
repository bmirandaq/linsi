export function trackClarityEvent(eventName) {
  if (typeof window === 'undefined') return;

  const clarity = window.clarity;
  if (typeof clarity === 'function') {
    clarity('event', eventName);
  }
}
