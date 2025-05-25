import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ColorSchemeResult = {
  colorScheme: ColorSchemeName;
  isDark: boolean;
  isLight: boolean;
};

/**
 * A custom hook to get and observe the device color scheme (light/dark mode)
 * with additional utility properties
 */
export function useColorScheme(): ColorSchemeResult {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
} 