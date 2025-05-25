import { createTheme, lightColors, darkColors } from '@rneui/themed';

export const lightTheme = createTheme({
  lightColors: {
    ...lightColors,
    primary: '#2E7D32',
    secondary: '#757575',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#D32F2F',
    success: '#43A047',
    warning: '#FFA000',
    text: '#212121',
    disabled: '#BDBDBD',
    divider: '#E0E0E0',
  },
  mode: 'light',
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  components: {
    Button: (props, theme) => ({
      raised: true,
      buttonStyle: {
        borderRadius: 8,
        paddingVertical: 12,
      },
    }),
    Input: (props, theme) => ({
      containerStyle: {
        paddingHorizontal: 0,
      },
    }),
  },
});

export const darkTheme = createTheme({
  darkColors: {
    ...darkColors,
    primary: '#4CAF50',
    secondary: '#9E9E9E',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFB74D',
    text: '#FFFFFF',
    disabled: '#757575',
    divider: '#424242',
  },
  mode: 'dark',
  spacing: lightTheme.spacing,
  components: lightTheme.components,
}); 