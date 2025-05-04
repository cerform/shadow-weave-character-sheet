
import { useEffect, useState } from 'react';

/**
 * Хук для отслеживания соответствия медиазапросу
 * @param query CSS медиазапрос, например "(min-width: 768px)"
 * @returns Булево значение, которое показывает, соответствует ли текущее состояние окна медиазапросу
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Современный метод подписки на изменения (Chrome, Firefox, Safari)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Поддержка для старых браузеров
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

export default useMediaQuery;
