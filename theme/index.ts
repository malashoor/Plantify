export * from './colors';
export * from './spacing';
export * from './text';

export const Spacing = {
  XS: 4,
  S: 8,
  M: 16,
  L: 24,
  XL: 32,
  XXL: 48,
} as const;

export const Colors = {
  primary: '#2E7D32',
  secondary: '#81C784',
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
  },
} as const; 