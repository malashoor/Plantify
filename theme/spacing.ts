export const Spacing = {
  // Base spacing units (8-point grid)
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  
  // Common combinations
  Button: {
    Vertical: 16,
    Horizontal: 32,
  },
  
  // Layout
  Screen: {
    Padding: 24,
  },
  
  // Component specific
  Slide: {
    ImageTop: 48,
    TextTop: 32,
  },
  
  // Navigation
  SkipButton: {
    Top: 48,
    Right: 24,
  },
} as const; 