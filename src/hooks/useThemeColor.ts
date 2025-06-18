import { useColorScheme } from 'react-native';

export type ThemeColors = {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  buttonBackground: string;
  buttonText: string;
  buttonDisabled: string;
  textDisabled: string;
};

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    buttonBackground: tintColorLight,
    buttonText: '#fff',
    buttonDisabled: '#ccc',
    textDisabled: '#666',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    buttonBackground: tintColorDark,
    buttonText: '#000',
    buttonDisabled: '#666',
    textDisabled: '#999',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}

// Export theme color names for type safety
export const ThemeColors = {
  background: 'background' as const,
  surface: 'surface' as const,
  primary: 'primary' as const,
  secondary: 'secondary' as const,
  error: 'error' as const,
  onBackground: 'onBackground' as const,
  onSurface: 'onSurface' as const,
  onPrimary: 'onPrimary' as const,
  onSecondary: 'onSecondary' as const,
  onError: 'onError' as const,
  tint: 'primary' as const, // Map 'tint' to primary color for backward compatibility
};
