if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  (function () {
    function clearSearchInput() {
      var input = document.querySelector('.aa-DetachedContainer .aa-Input');
      if (input && input.value) {
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        nativeInputValueSetter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Espera o DOM estar pronto pra encontrar o overlay
    function observeOverlay() {
      var overlay = document.querySelector('.aa-DetachedOverlay');
      if (!overlay) {
        // Overlay ainda não existe — observar adições ao body
        var bodyObserver = new MutationObserver(function () {
          var el = document.querySelector('.aa-DetachedOverlay');
          if (el) {
            bodyObserver.disconnect();
            watchOverlay(el);
          }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        return;
      }
      watchOverlay(overlay);
    }

    function watchOverlay(el) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          // Quando o overlay fica visível (display não é none), limpar input
          if (mutation.attributeName === 'style') {
            var display = el.style.display;
            if (display && display !== 'none') {
              requestAnimationFrame(clearSearchInput);
            }
          }
        });
      });
      observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeOverlay);
    } else {
      observeOverlay();
    }
  })();
}
