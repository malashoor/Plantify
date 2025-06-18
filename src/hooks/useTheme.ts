import { useColorScheme } from 'react-native';

interface Colors {
  primary: string;
  background: string;
  text: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

interface Theme {
  colors: Colors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#2196F3',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E0E0E0',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#64B5F6',
    background: '#121212',
    text: '#FFFFFF',
    border: '#424242',
    error: '#FF8A80',
    success: '#69F0AE',
    warning: '#FFE57F',
  },
};

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}; 