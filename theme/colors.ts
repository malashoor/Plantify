export const Colors = {
  // Primary colors
  Primary: '#2E7D32',
  PrimaryDark: '#4CAF50',
  
  // Text colors
  Text: {
    Primary: '#2E7D32',
    Secondary: '#666666',
    Light: '#ffffff',
    Dark: '#000000',
  },
  
  // Background colors
  Background: {
    Light: '#ffffff',
    Dark: '#121212',
    Secondary: '#f5f5f5',
  },
  
  // UI colors
  Button: {
    Primary: '#2E7D32',
    Secondary: '#4CAF50',
    Disabled: '#CCCCCC',
  },
  
  // Indicator colors
  Indicator: {
    Active: '#2E7D32',
    ActiveDark: '#4CAF50',
    Inactive: '#E0E0E0',
    InactiveDark: '#424242',
    Success: '#4CAF50',
    Warning: '#FF9800',
    Error: '#F44336',
  },
  
  Border: '#E0E0E0',
  Error: '#F44336',
  White: '#FFFFFF',
  Secondary: '#4CAF50',
  Success: '#4CAF50',
  Warning: '#FF9800',
  Info: '#2196F3',
} as const;

export type ColorToken = typeof Colors; 