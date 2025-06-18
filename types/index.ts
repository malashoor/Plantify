// Simple stub for smoke test
export interface User {
  id: string;
  email: string;
}

export interface Plant {
  id: string;
  name: string;
}

// Export nutrient calculator types
export * from './nutrient-calculator';

// Export lighting calculator types
export * from './lighting-calculator';

// Export DIY builder types
export * from './diy-builder';

// Export learning center types
export * from './learn';

// Export crop advisor types
export * from './crop-advisor'; 