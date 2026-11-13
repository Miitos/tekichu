import { useEffect, useState } from 'react';

export function useRoute(): string[] {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

export const nav = (path: string) => {
  location.hash = '/' + path;
};

/** Remplace l'écran courant sans l'ajouter à l'historique. */
export const replace = (path: string) => {
  history.replaceState(null, '', '#/' + path);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

export const back = (fallback = '') => {
  if (history.length > 1) history.back();
  else nav(fallback);
};
