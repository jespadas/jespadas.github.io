import { useCallback, useMemo, useState } from 'react';

import {
  canToggleTheme,
  getBackgroundMode,
  getBackgroundStyle,
  getInitialTheme,
  getNextTheme,
} from '../utils/theme';

export function useThemeMode(background) {
  const [theme, setTheme] = useState(() => getInitialTheme(background));

  const backgroundStyle = useMemo(
    () => getBackgroundStyle(background),
    [background]
  );

  const isThemeToggleVisible = canToggleTheme(background);
  const backgroundMode = getBackgroundMode(theme);

  const toggleTheme = useCallback(() => {
    if (!isThemeToggleVisible) {
      return;
    }

    setTheme((currentTheme) => getNextTheme(currentTheme));
  }, [isThemeToggleVisible]);

  return {
    backgroundMode,
    backgroundStyle,
    isThemeToggleVisible,
    theme,
    toggleTheme,
  };
}
