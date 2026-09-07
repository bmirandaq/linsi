import React, {useCallback, useEffect, useRef, useState} from 'react';

let searchBarModulePromise;

function loadSearchBarModule() {
  if (!searchBarModulePromise) {
    searchBarModulePromise = import('@theme-original/SearchBar').then(
      (module) => module.default,
    );
  }

  return searchBarModulePromise;
}

export default function SearchBar(props) {
  const [SearchBarImpl, setSearchBarImpl] = useState(null);
  const openAfterMount = useRef(false);

  const preloadSearch = useCallback(() => {
    void loadSearchBarModule();
  }, []);

  const activateSearch = useCallback(async () => {
    openAfterMount.current = true;
    const component = await loadSearchBarModule();
    setSearchBarImpl(() => component);
  }, []);

  useEffect(() => {
    if (!SearchBarImpl || !openAfterMount.current) return undefined;

    openAfterMount.current = false;
    const frame = window.requestAnimationFrame(() => {
      const trigger = document.querySelector(
        '.navbar .aa-DetachedSearchButton',
      );
      if (trigger instanceof HTMLElement) trigger.click();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [SearchBarImpl]);

  if (SearchBarImpl) {
    return <SearchBarImpl {...props} />;
  }

  return (
    <button
      type="button"
      className="aa-DetachedSearchButton"
      aria-label="Pesquisar"
      onPointerEnter={preloadSearch}
      onClick={activateSearch}>
      <span className="aa-DetachedSearchButtonIcon" aria-hidden="true" />
    </button>
  );
}
